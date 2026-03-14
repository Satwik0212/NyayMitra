"""
Groq provider for NyayMitra LLM Orchestrator.

Wraps the official Groq Python SDK for ultra-fast LLaMA/Mixtral inference.
Groq's free tier is generous (14,400 req/day) and very low latency, making it
the preferred first-choice provider for most tasks.

Models available on free tier:
    llama-3.3-70b-versatile  → Best quality, used for analysis + chat
    llama-3.1-8b-instant     → Fastest, used for classification
    mixtral-8x7b-32768       → Large context window (32k), used as fallback
    gemma2-9b-it             → Google Gemma via Groq, classify fallback

Note: Groq SDK is synchronous. We call it inside async methods directly — this is
fine for hackathon scale. Wrap in asyncio.to_thread() if needed for production.
"""

from typing import Optional, AsyncGenerator
from .base_provider import BaseProvider, LLMResponse


class GroqProvider(BaseProvider):
    """Wraps the Groq SDK for LLaMA and Mixtral text generation."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.client  = None

        if api_key:
            try:
                from groq import Groq
                self.client = Groq(api_key=api_key)
            except ImportError:
                print("⚠️  groq package not installed. Run: pip install groq")
            except Exception as e:
                print(f"⚠️  Groq init failed: {e}")

        # Available models (free tier)
        self.models = {
            "large":   "llama-3.3-70b-versatile",
            "small":   "llama-3.1-8b-instant",
            "mixtral": "mixtral-8x7b-32768",
            "gemma":   "gemma2-9b-it",
        }

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
        """Generate plain text response via Groq chat completions."""
        if not self.client:
            return LLMResponse(success=False, provider="groq", error="Groq client not initialized")

        model = model or self.models["large"]
        start = self._start_timer()

        try:
            completion = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            content    = completion.choices[0].message.content or ""
            tokens     = completion.usage.total_tokens if completion.usage else None
            latency_ms = self._end_timer(start)

            return LLMResponse(
                content=content,
                model_used=model,
                provider="groq",
                tokens_used=tokens,
                latency_ms=latency_ms,
                success=True,
            )

        except Exception as e:
            return self._handle_error(e, model)

    async def generate_json(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> LLMResponse:
        """Generate a JSON response using Groq's native JSON mode."""
        if not self.client:
            return LLMResponse(success=False, provider="groq", error="Groq client not initialized")

        model  = model or self.models["large"]
        start  = self._start_timer()
        prompt = "You must respond with valid JSON only. No markdown, no extra text.\n\n" + prompt

        try:
            completion = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
                response_format={"type": "json_object"},
            )
            content    = completion.choices[0].message.content or ""
            tokens     = completion.usage.total_tokens if completion.usage else None
            latency_ms = self._end_timer(start)

            return LLMResponse(
                content=content,
                model_used=model,
                provider="groq",
                tokens_used=tokens,
                latency_ms=latency_ms,
                success=True,
            )

        except Exception as e:
            return self._handle_error(e, model)

    async def stream(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.4,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        """Stream tokens one by one from Groq."""
        if not self.client:
            yield "[Error: Groq client not initialized]"
            return

        model = model or self.models["large"]

        try:
            completion = self.client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )
            for chunk in completion:
                token = chunk.choices[0].delta.content if chunk.choices else None
                if token:
                    yield token
        except Exception as e:
            yield f"[Error: {str(e)}]"

    def is_available(self) -> bool:
        return self.client is not None

    def get_provider_name(self) -> str:
        return "groq"

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _handle_error(self, e: Exception, model: str) -> LLMResponse:
        """Map Groq SDK exceptions to standardized LLMResponse errors."""
        error_str = str(e)
        error_type = type(e).__name__

        if "RateLimitError" in error_type or "rate_limit" in error_str.lower():
            error_msg = "rate_limit"
        elif "APITimeoutError" in error_type or "timeout" in error_str.lower():
            error_msg = "timeout"
        else:
            error_msg = error_str

        return LLMResponse(
            success=False,
            provider="groq",
            model_used=model,
            error=error_msg,
        )
