"""
Gemini provider for NyayMitra LLM Orchestrator.

Wraps the Google Generative AI SDK (google-generativeai) for Gemini 2.0 Flash.
Gemini serves as the primary fallback when Groq hits rate limits, and is also
used for generating vector embeddings (embedding-001 model).

Free tier limits:
    gemini-2.0-flash  → 15 RPM, 1,500 RPD, 1M TPM
    embedding-001     → 100 RPM

Note: The SDK is synchronous. Called inside async methods — fine at hackathon scale.
"""

import re
from typing import Optional, AsyncGenerator
from .base_provider import BaseProvider, LLMResponse


class GeminiProvider(BaseProvider):
    """Wraps Google Generative AI SDK for Gemini 2.0 Flash text generation."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key       = api_key
        self.model         = None
        self._model_name   = "gemini-2.0-flash"

        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self.model  = genai.GenerativeModel(self._model_name)
                self._genai = genai
            except ImportError:
                print("⚠️  google-generativeai package not installed. Run: pip install google-generativeai")
            except Exception as e:
                print(f"⚠️  Gemini init failed: {e}")

    # ------------------------------------------------------------------
    # BaseProvider implementation
    # ------------------------------------------------------------------

    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> LLMResponse:
        """Generate plain text response via Gemini."""
        if not self.model:
            return LLMResponse(success=False, provider="gemini", error="Gemini client not initialized")

        start = self._start_timer()
        try:
            config   = self._genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            response   = self.model.generate_content(prompt, generation_config=config)
            content    = response.text or ""
            latency_ms = self._end_timer(start)

            return LLMResponse(
                content=content,
                model_used=self._model_name,
                provider="gemini",
                latency_ms=latency_ms,
                success=True,
            )

        except Exception as e:
            return self._handle_error(e)

    async def generate_json(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> LLMResponse:
        """Generate a JSON response from Gemini (manual JSON mode via prompt)."""
        if not self.model:
            return LLMResponse(success=False, provider="gemini", error="Gemini client not initialized")

        json_prompt = (
            "You must respond with valid JSON only. "
            "No markdown code blocks, no extra text, just raw JSON.\n\n"
            + prompt
        )
        start = self._start_timer()
        try:
            config   = self._genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            response   = self.model.generate_content(json_prompt, generation_config=config)
            content    = response.text or ""

            # Strip any markdown code block wrappers Gemini sometimes adds
            content    = self._strip_markdown_json(content)
            latency_ms = self._end_timer(start)

            return LLMResponse(
                content=content,
                model_used=self._model_name,
                provider="gemini",
                latency_ms=latency_ms,
                success=True,
            )

        except Exception as e:
            return self._handle_error(e)

    async def stream(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.4,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        """Stream tokens from Gemini."""
        if not self.model:
            yield "[Error: Gemini client not initialized]"
            return

        try:
            config   = self._genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            response = self.model.generate_content(prompt, generation_config=config, stream=True)
            for chunk in response:
                try:
                    token = chunk.text
                    if token:
                        yield token
                except Exception:
                    continue  # Skip malformed chunks

        except Exception as e:
            yield f"[Error: {str(e)}]"

    def is_available(self) -> bool:
        return self.model is not None

    def get_provider_name(self) -> str:
        return "gemini"

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _strip_markdown_json(self, text: str) -> str:
        """Remove ```json ... ``` or ``` ... ``` wrappers if present."""
        text = text.strip()
        # Match ```json\n...\n``` or ```\n...\n```
        match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
        if match:
            return match.group(1).strip()
        return text

    def _handle_error(self, e: Exception) -> LLMResponse:
        """Map Gemini SDK exceptions to standardized LLMResponse errors."""
        error_str  = str(e).lower()

        if "resource_exhausted" in error_str or "rate" in error_str or "429" in error_str:
            error_msg = "rate_limit"
        elif "timeout" in error_str or "deadline" in error_str:
            error_msg = "timeout"
        else:
            error_msg = str(e)

        return LLMResponse(
            success=False,
            provider="gemini",
            model_used=self._model_name,
            error=error_msg,
        )
