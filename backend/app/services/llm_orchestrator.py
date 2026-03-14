"""
LLM Orchestrator for NyayMitra.

The single point of truth for all AI calls in the backend.
Person B's FastAPI routes NEVER import provider classes directly — they only use:

    from app.services.llm_orchestrator import orchestrator

    text     = await orchestrator.generate(prompt, task="analysis")
    data     = await orchestrator.generate_json(prompt, task="analysis")
    chat_res = await orchestrator.generate_chat(prompt, task="chat")
    # async for token in orchestrator.stream(prompt): ...
    label    = await orchestrator.classify(prompt)
    hindi    = await orchestrator.translate(text, "en", "hi")
    vectors  = await orchestrator.get_embeddings(["doc1", "doc2"])

Routing logic:
    Each 'task' has a priority-ordered fallback chain of providers+models.
    The orchestrator tries each in order, skipping rate-limited or unavailable ones.
    If everything fails, it raises an exception (routes should return 503).

Tasks supported:
    analysis  — Contract/dispute analysis (high reasoning, JSON output)
    chat      — Legal chatbot responses (conversational, JSON output)
    document  — Document generation (long-form text)
    classify  — Fast intent classification (tiny model/low latency)
    stream    — Streaming chat tokens via SSE
"""

import json
import logging
import os
from typing import AsyncGenerator, Optional

from dotenv import load_dotenv

from .providers import (
    GeminiProvider,
    GroqProvider,
    HuggingFaceProvider,
    LLMResponse,
    RateLimiter,
    SarvamProvider,
)

load_dotenv()

logger = logging.getLogger(__name__)


class LLMOrchestrator:
    """
    Multi-provider LLM router with automatic fallback and rate limiting.

    Internally manages all AI providers and exposes a clean, task-oriented API
    so the rest of the codebase never has to think about which model to use.
    """

    def __init__(self):
        # ── Load API keys ──────────────────────────────────────────────
        groq_key   = os.getenv("GROQ_API_KEY",   "")
        gemini_key = os.getenv("GEMINI_API_KEY",  "")
        sarvam_key = os.getenv("SARVAM_API_KEY",  "")
        hf_key     = os.getenv("HF_API_KEY",      "")

        # ── Initialize providers ───────────────────────────────────────
        self.groq   = GroqProvider(api_key=groq_key   or None)
        self.gemini = GeminiProvider(api_key=gemini_key or None)
        self.sarvam = SarvamProvider(api_key=sarvam_key or None)
        self.hf     = HuggingFaceProvider(api_key=hf_key or None)

        # ── Rate limiter ───────────────────────────────────────────────
        self.rate_limiter = RateLimiter()

        # ── Task → fallback chain ──────────────────────────────────────
        # Each entry is tried in order; first success wins.
        self.task_routing: dict[str, list[dict]] = {
            "analysis": [
                {"provider": self.groq,   "model": "llama-3.3-70b-versatile"},
                {"provider": self.gemini, "model": "gemini-2.0-flash"},
                {"provider": self.groq,   "model": "llama-3.1-8b-instant"},
            ],
            "chat": [
                {"provider": self.groq,   "model": "llama-3.3-70b-versatile"},
                {"provider": self.gemini, "model": "gemini-2.0-flash"},
                {"provider": self.groq,   "model": "llama-3.1-8b-instant"},
            ],
            "document": [
                {"provider": self.gemini, "model": "gemini-2.0-flash"},
                {"provider": self.groq,   "model": "llama-3.3-70b-versatile"},
            ],
            "classify": [
                {"provider": self.gemini, "model": "gemini-2.0-flash"},
                {"provider": self.groq,   "model": "llama-3.1-8b-instant"},
                {"provider": self.groq,   "model": "gemma2-9b-it"},
            ],
            "stream": [
                {"provider": self.groq,   "model": "llama-3.3-70b-versatile"},
                {"provider": self.gemini, "model": "gemini-2.0-flash"},
            ],
        }

        self.max_retries = 2

        # ── Startup diagnostics ────────────────────────────────────────
        self._log_startup()

    # ──────────────────────────────────────────────────────────────────
    # Public API — what Person B's routes call
    # ──────────────────────────────────────────────────────────────────

    async def generate(self, prompt: str, task: str = "analysis") -> str:
        """
        Generate plain text from an AI model.

        Args:
            prompt: Full prompt string
            task:   Routing key ("analysis", "document", "classify", ...)

        Returns:
            Response text as a string

        Raises:
            Exception: If all providers fail
        """
        response = await self._try_with_fallback(task, "generate", prompt)
        if response.success:
            return response.content
        raise Exception(f"LLM generation failed: {response.error}")

    async def generate_json(self, prompt: str, task: str = "analysis") -> dict:
        """
        Generate a structured JSON response.

        Args:
            prompt: Full prompt (should describe expected JSON schema)
            task:   Routing key

        Returns:
            Parsed dict

        Raises:
            Exception: If all providers fail or JSON is unparseable
        """
        response = await self._try_with_fallback(task, "generate_json", prompt)
        if not response.success:
            raise Exception(f"LLM JSON generation failed: {response.error}")
        return self._parse_json_safe(response.content)

    async def generate_chat(self, prompt: str, task: str = "chat") -> dict:
        """
        Generate a chat response, returning a structured dict even if JSON fails.

        Guaranteed to return a dict — never raises on JSON parse errors.
        Falls back to {"content": raw_text, "citations": [], "suggested_followups": []}.

        Args:
            prompt: Chat prompt (include conversation history in prompt)
            task:   Routing key (default "chat")

        Returns:
            dict with at minimum {"content": str}
        """
        response = await self._try_with_fallback(task, "generate_json", prompt)

        if not response.success:
            raise Exception(f"LLM chat failed: {response.error}")

        try:
            return self._parse_json_safe(response.content)
        except Exception:
            # Graceful degradation: wrap raw text in expected shape
            return {
                "content":             response.content,
                "citations":           [],
                "suggested_followups": [],
            }

    async def stream(self, prompt: str, task: str = "stream") -> AsyncGenerator[str, None]:
        """
        Stream tokens from an AI model, falling back across providers.

        Yields:
            String tokens/chunks as they arrive

        On total failure, yields a single error message string.
        """
        chain = self._get_chain(task)

        for entry in chain:
            provider = entry["provider"]
            model    = entry["model"]
            name     = provider.get_provider_name()

            if not self.rate_limiter.can_use(name) or not provider.is_available():
                continue

            try:
                had_output = False
                async for token in provider.stream(prompt, model=model):
                    had_output = True
                    yield token

                if had_output:
                    self.rate_limiter.record_use(name)
                    logger.info("stream via %s / %s", name, model)
                    return

            except Exception as e:
                logger.warning("stream failed on %s: %s", name, e)
                continue

        yield "Error: All AI providers are currently unavailable. Please try again in a moment."

    async def classify(self, prompt: str) -> str:
        """
        Classify intent/type from a short prompt.

        Uses fast small models. Returns a short lowercase label.
        Falls back to "standard" on failure.

        Args:
            prompt: Classification prompt

        Returns:
            Short lowercase string label
        """
        try:
            response = await self._try_with_fallback(
                "classify", "generate", prompt, temperature=0.1, max_tokens=20
            )
            if response.success:
                return response.content.strip().lower()
        except Exception:
            pass
        return "standard"

    async def translate(
        self,
        text: str,
        source_lang: str = "en",
        target_lang: str = "hi",
    ) -> str:
        """
        Translate text, preferring SarvamAI for Indian languages.

        Falls back to Gemini with a translation prompt if SarvamAI is unavailable.

        Args:
            text:        Text to translate
            source_lang: BCP-47 language code (e.g., "en")
            target_lang: BCP-47 language code (e.g., "hi")

        Returns:
            Translated text string
        """
        # ── Try SarvamAI first (specialized for Indian langs) ──────────
        if self.sarvam.is_available() and self.rate_limiter.can_use("sarvam"):
            result = await self.sarvam.translate(text, source_lang, target_lang)
            if result.get("success"):
                self.rate_limiter.record_use("sarvam")
                logger.info("translate via sarvam (%s→%s)", source_lang, target_lang)
                return result["translated_text"]

        # ── Fallback: Gemini translation prompt ────────────────────────
        logger.info("translate falling back to Gemini (%s→%s)", source_lang, target_lang)
        fallback_prompt = (
            f"Translate the following text from {source_lang} to {target_lang}. "
            f"Return ONLY the translated text, nothing else.\n\nText: {text}"
        )
        return await self.generate(fallback_prompt, task="document")

    async def get_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Generate sentence embeddings for a list of texts (for RAG).

        Tries HuggingFace (all-MiniLM-L6-v2, 384-dim) first.
        Falls back to Gemini embedding-001 if HF fails.

        Args:
            texts: List of text strings to embed

        Returns:
            List of embedding vectors. Each vector is a list of floats.
        """
        # ── Try HuggingFace first ──────────────────────────────────────
        if self.hf.is_available():
            embeddings = await self.hf.generate_embeddings(texts)
            if embeddings and all(isinstance(e, list) and len(e) > 0 for e in embeddings):
                logger.info("embeddings via huggingface (n=%d)", len(texts))
                return embeddings

        # ── Fallback: Gemini embeddings ────────────────────────────────
        logger.info("embeddings falling back to Gemini")
        if not self.gemini.is_available():
            logger.error("No embedding provider available")
            return [[] for _ in texts]

        try:
            import google.generativeai as genai
            result = genai.embed_content(
                model="models/embedding-001",
                content=texts,
                task_type="retrieval_document",
            )
            return result["embedding"]
        except Exception as e:
            logger.error("Gemini embedding fallback failed: %s", e)
            return [[] for _ in texts]

    # ──────────────────────────────────────────────────────────────────
    # Internal: fallback routing engine
    # ──────────────────────────────────────────────────────────────────

    async def _try_with_fallback(
        self,
        task: str,
        method_name: str,
        prompt: str,
        **kwargs,
    ) -> LLMResponse:
        """
        Try each provider in the task's fallback chain.

        For each provider:
          1. Skip if rate-limited or unavailable.
          2. Try up to max_retries times.
          3. On rate_limit error → break retries, move to next provider.
          4. On timeout/other error → retry.

        Returns the first successful LLMResponse, or a failure response
        with error="All providers exhausted" if everything fails.
        """
        chain = self._get_chain(task)

        for entry in chain:
            provider = entry["provider"]
            model    = entry["model"]
            name     = provider.get_provider_name()

            if not self.rate_limiter.can_use(name):
                logger.debug("skip %s (rate limited)", name)
                continue

            if not provider.is_available():
                logger.debug("skip %s (not available)", name)
                continue

            method = getattr(provider, method_name)

            for attempt in range(1, self.max_retries + 1):
                response: LLMResponse = await method(prompt, model=model, **kwargs)

                if response.success:
                    self.rate_limiter.record_use(name)
                    logger.info(
                        "[OK] %s/%s [%s, attempt %d, %.0f ms]",
                        name, model, task, attempt, response.latency_ms,
                    )
                    return response

                logger.warning(
                    "[FAIL] %s/%s attempt %d failed: %s", name, model, attempt, response.error
                )

                if response.error == "rate_limit":
                    break  # no point retrying this provider — move to next

            # All retries for this provider exhausted
            continue

        return LLMResponse(
            success=False,
            error="All providers exhausted",
            provider="orchestrator",
        )

    def _get_chain(self, task: str) -> list[dict]:
        """Return fallback chain for a task, defaulting to 'analysis'."""
        return self.task_routing.get(task, self.task_routing["analysis"])

    # ──────────────────────────────────────────────────────────────────
    # Internal: JSON parsing helpers
    # ──────────────────────────────────────────────────────────────────

    def _parse_json_safe(self, content: str) -> dict:
        """
        Parse JSON from LLM output. Tries direct parse first, then boundary extraction.
        Supports both single objects {} and arrays [].
        """
        content = content.strip()

        # Direct parse
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        # Try to find the first and last JSON boundary characters
        # Could be an object {} or an array []
        start_brace = content.find("{")
        start_bracket = content.find("[")
        
        # Determine the earliest starting character
        if start_brace == -1: 
            start = start_bracket
        elif start_bracket == -1:
            start = start_brace
        else:
            start = min(start_brace, start_bracket)

        end_brace = content.rfind("}")
        end_bracket = content.rfind("]")
        
        # Determine the latest ending character
        if end_brace == -1:
            end = end_bracket
        elif end_bracket == -1:
            end = end_brace
        else:
            end = max(end_brace, end_bracket)

        if start != -1 and end != -1 and end > start:
            try:
                json_str = content[start : end + 1]
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass

        raise ValueError(f"Could not parse JSON from response: {content[:200]}")

    # ──────────────────────────────────────────────────────────────────
    # Startup diagnostics
    # ──────────────────────────────────────────────────────────────────

    def _log_startup(self):
        """Print which providers are ready at startup."""
        providers = [
            (self.groq,   "Groq",        "llama-3.3-70b-versatile"),
            (self.gemini, "Gemini",       "gemini-2.0-flash"),
            (self.sarvam, "SarvamAI",     "translate API"),
            (self.hf,     "HuggingFace",  "all-MiniLM-L6-v2 embeddings"),
        ]
        print("\n-- NyayMitra LLM Orchestrator ----------------------------")
        for provider, label, info in providers:
            if provider.is_available():
                print(f"  [OK] {label} initialized ({info})")
            else:
                print(f"  [FAIL] {label} not configured (missing API key)")
        print("----------------------------------------------------------\n")


# ── Singleton instance ─────────────────────────────────────────────────────────
# Person B imports this directly:
#   from app.services.llm_orchestrator import orchestrator
orchestrator = LLMOrchestrator()
