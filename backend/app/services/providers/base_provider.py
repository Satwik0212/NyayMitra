from dataclasses import dataclass, asdict
from typing import Optional
import time

@dataclass
class LLMResponse:
    content: str = ""
    model_used: str = ""
    provider: str = ""
    tokens_used: Optional[int] = None
    latency_ms: float = 0.0
    success: bool = True
    error: Optional[str] = None

    def to_dict(self):
        return asdict(self)

class BaseProvider:
    def _start_timer(self) -> float:
        """Start timing a request."""
        return time.time()

    def _end_timer(self, start: float) -> float:
        """End timing, return milliseconds elapsed."""
        return round((time.time() - start) * 1000, 2)
