"""
HuggingFace provider for NyayMitra LLM Orchestrator.

This provider is EMBEDDINGS ONLY. It generates 384-dimensional sentence vectors
using sentence-transformers/all-MiniLM-L6-v2 via the HF Inference API.

These embeddings power the RAG pipeline:
    Document → embed → store in vector DB → query → embed query → nearest neighbor search

Primary methods:
    generate_embeddings(texts: list[str]) → list[list[float]]
    embed_single(text: str)               → list[float]

Note: The free HF Inference API works even without an API key for popular public
models, but key is recommended to avoid strict cold-start limits.
"""

from typing import Optional, AsyncGenerator
from .base_provider import BaseProvider, LLMResponse


class HuggingFaceProvider(BaseProvider):
    """HuggingFace Inference API wrapper — sentence embeddings only."""

    EMBEDDING_DIM   = 384   # all-MiniLM-L6-v2 output dimension
    BATCH_SIZE      = 16    # Max texts per API request

    def __init__(self, api_key: Optional[str] = None):
        self.api_key        = api_key
        self.embedding_model = "sentence-transformers/all-MiniLM-L6-v2"
        self.base_url       = "https://api-inference.huggingface.co/pipeline/feature-extraction"
        self._client        = None

        try:
            import httpx
            self._client = httpx.AsyncClient(timeout=60)  # HF can be slow on cold start
        except ImportError:
            print("⚠️  httpx package not installed. Run: pip install httpx")

    # ------------------------------------------------------------------
    # Primary methods: embeddings (custom, not from BaseProvider)
    # ------------------------------------------------------------------

    async def generate_embeddings(self, texts: list[str]) -> list[list[float]]:
        """
        Generate sentence embeddings for a list of texts.

        Processes in batches of BATCH_SIZE to stay within API limits.

        Args:
            texts: List of strings to embed

        Returns:
            List of embedding vectors (each is a list of 384 floats).
            Returns empty list on failure.
        """
        if not self._client:
            return []
        if not texts:
            return []

        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        all_embeddings: list[list[float]] = []

        for i in range(0, len(texts), self.BATCH_SIZE):
            batch = texts[i : i + self.BATCH_SIZE]
            try:
                response = await self._client.post(
                    f"{self.base_url}/{self.embedding_model}",
                    headers=headers,
                    json={
                        "inputs":  batch,
                        "options": {"wait_for_model": True},
                    },
                )
                response.raise_for_status()
                data = response.json()

                # API returns list of embedding vectors
                if isinstance(data, list):
                    all_embeddings.extend(data)
                else:
                    # Unexpected shape — skip batch
                    all_embeddings.extend([[] for _ in batch])

            except Exception as e:
                print(f"⚠️  HuggingFace embedding batch failed: {e}")
                # Return empty vectors for this batch rather than crashing
                all_embeddings.extend([[] for _ in batch])

        return all_embeddings

    async def embed_single(self, text: str) -> list[float]:
        """
        Embed a single piece of text.

        Args:
            text: String to embed

        Returns:
            List of 384 floats, or empty list on failure.
        """
        results = await self.generate_embeddings([text])
        return results[0] if results else []

    # ------------------------------------------------------------------
    # BaseProvider stubs — HuggingFace is NOT a text-generation LLM here
    # ------------------------------------------------------------------

    async def generate(self, prompt: str, model=None, temperature: float = 0.3, max_tokens: int = 4096) -> LLMResponse:
        return LLMResponse(
            success=False,
            provider="huggingface",
            error="HuggingFace provider is embeddings-only in this system",
        )

    async def generate_json(self, prompt: str, model=None, temperature: float = 0.3, max_tokens: int = 4096) -> LLMResponse:
        return LLMResponse(
            success=False,
            provider="huggingface",
            error="HuggingFace provider is embeddings-only in this system",
        )

    async def stream(self, prompt: str, model=None, temperature: float = 0.4, max_tokens: int = 2048) -> AsyncGenerator[str, None]:
        return
        yield  # Make this a generator

    def is_available(self) -> bool:
        # HF Inference API works without a key for many public models
        return self._client is not None

    def get_provider_name(self) -> str:
        return "huggingface"
