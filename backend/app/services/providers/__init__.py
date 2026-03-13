"""
Providers package for NyayMitra LLM Orchestrator.

All LLM/AI provider wrappers live here. Each provider implements BaseProvider
so the orchestrator can treat all providers uniformly.

Providers:
    GroqProvider        — Text generation (LLaMA, Mixtral via Groq fast inference)
    GeminiProvider      — Text generation + embeddings (Google Gemini)
    SarvamProvider      — Translation ONLY (Indian language support)
    HuggingFaceProvider — Embeddings ONLY (sentence-transformers for RAG)

Utilities:
    RateLimiter         — In-memory rate limit tracker
    BaseProvider        — Abstract base class all providers implement
    LLMResponse         — Standardized response dataclass
"""

from .base_provider import BaseProvider, LLMResponse
from .groq_provider import GroqProvider
from .gemini_provider import GeminiProvider
from .sarvam_provider import SarvamProvider
from .hf_provider import HuggingFaceProvider
from .rate_limiter import RateLimiter

__all__ = [
    "BaseProvider",
    "LLMResponse",
    "GroqProvider",
    "GeminiProvider",
    "SarvamProvider",
    "HuggingFaceProvider",
    "RateLimiter",
]
