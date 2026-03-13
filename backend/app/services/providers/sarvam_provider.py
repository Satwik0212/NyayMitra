"""
SarvamAI provider for NyayMitra LLM Orchestrator.

SarvamAI is specialized for Indian language processing. This provider is
TRANSLATION ONLY — it does NOT do general text generation.

Primary method: translate(text, source_lang, target_lang) → dict

Supported language codes:
    en  English        hi  Hindi         ta  Tamil
    te  Telugu         bn  Bengali        mr  Marathi
    kn  Kannada        gu  Gujarati       ml  Malayalam
    pa  Punjabi        od  Odia

The orchestrator calls translate() directly. generate() and generate_json() are
intentionally not implemented — they return failure LLMResponses.
"""

from typing import Optional, AsyncGenerator
from .base_provider import BaseProvider, LLMResponse


class SarvamProvider(BaseProvider):
    """SarvamAI REST API wrapper — translation between Indian languages only."""

    SUPPORTED_LANGUAGES = {"en", "hi", "ta", "te", "bn", "mr", "kn", "gu", "ml", "pa", "od"}

    def __init__(self, api_key: Optional[str] = None):
        self.api_key  = api_key
        self.base_url = "https://api.sarvam.ai"
        self._client  = None

        if api_key:
            try:
                import httpx
                self._client = httpx.AsyncClient(timeout=30)
            except ImportError:
                print("⚠️  httpx package not installed. Run: pip install httpx")

    # ------------------------------------------------------------------
    # Primary method: translate (custom, not from BaseProvider)
    # ------------------------------------------------------------------

    async def translate(
        self,
        text: str,
        source_lang: str = "en",
        target_lang: str = "hi",
    ) -> dict:
        """
        Translate text between Indian languages using SarvamAI.

        Args:
            text:        Text to translate
            source_lang: Source language code (e.g., "en")
            target_lang: Target language code (e.g., "hi")

        Returns:
            {"translated_text": str, "success": bool, "error": str | None}
        """
        if not self._client or not self.api_key:
            return {"translated_text": "", "success": False, "error": "SarvamAI not configured"}

        try:
            response = await self._client.post(
                f"{self.base_url}/translate",
                headers={
                    "api-subscription-key": self.api_key,
                    "Content-Type":         "application/json",
                },
                json={
                    "input":                text,
                    "source_language_code": source_lang,
                    "target_language_code": target_lang,
                    "mode":                 "formal",
                    "model":                "mayura:v1",
                },
            )
            response.raise_for_status()
            data = response.json()
            return {
                "translated_text": data.get("translated_text", ""),
                "success":         True,
                "error":           None,
            }

        except Exception as e:
            return {
                "translated_text": "",
                "success":         False,
                "error":           str(e),
            }

    # ------------------------------------------------------------------
    # BaseProvider stubs — SarvamAI is NOT a general LLM
    # ------------------------------------------------------------------

    async def generate(self, prompt: str, model=None, temperature: float = 0.3, max_tokens: int = 4096) -> LLMResponse:
        return LLMResponse(
            success=False,
            provider="sarvam",
            error="SarvamAI is translation-only, not a general LLM",
        )

    async def generate_json(self, prompt: str, model=None, temperature: float = 0.3, max_tokens: int = 4096) -> LLMResponse:
        return LLMResponse(
            success=False,
            provider="sarvam",
            error="SarvamAI is translation-only, not a general LLM",
        )

    async def stream(self, prompt: str, model=None, temperature: float = 0.4, max_tokens: int = 2048) -> AsyncGenerator[str, None]:
        return
        yield  # Make this a generator

    def is_available(self) -> bool:
        return bool(self.api_key) and self._client is not None

    def get_provider_name(self) -> str:
        return "sarvam"
