"""
In-memory rate limit tracker for NyayMitra LLM providers.

Tracks requests-per-minute (RPM) and requests-per-day (RPD) for each provider
against their free-tier limits. The orchestrator checks this before making any
API call to avoid 429 errors and gracefully skip to the next provider.

Free-tier limits (approximate, as of 2025):
    Groq:         30 RPM, 14,400 RPD
    Gemini:       15 RPM, 1,500 RPD
    SarvamAI:     50 RPM, 5,000 RPD
    HuggingFace:  30 RPM, 3,000 RPD

Note: Single-process uvicorn only, so no threading locks needed for hackathon scale.
"""

import time


class RateLimiter:
    """Tracks request counts per provider against free-tier limits."""

    def __init__(self):
        # Free-tier limits per provider
        self.limits = {
            "groq":         {"rpm": 30,  "rpd": 14400},
            "gemini":       {"rpm": 15,  "rpd": 1500},
            "sarvam":       {"rpm": 50,  "rpd": 5000},
            "huggingface":  {"rpm": 30,  "rpd": 3000},
        }

        # Live tracking state — reset automatically on window expiry
        now = time.time()
        self._state = {
            provider: {
                "minute_count": 0,
                "day_count":    0,
                "minute_reset": now,
                "day_reset":    now,
            }
            for provider in self.limits
        }

    def _refresh(self, provider: str) -> None:
        """Reset counters if their time windows have elapsed."""
        now = time.time()
        state = self._state[provider]

        if now - state["minute_reset"] >= 60:
            state["minute_count"] = 0
            state["minute_reset"] = now

        if now - state["day_reset"] >= 86400:
            state["day_count"] = 0
            state["day_reset"] = now

    def can_use(self, provider: str) -> bool:
        """
        Check if a provider can be called right now.

        Returns False if either the per-minute or per-day limit has been hit.
        Returns True if the provider is unknown (fail open rather than block).
        """
        if provider not in self._state:
            return True  # Unknown provider — don't block it

        self._refresh(provider)
        state  = self._state[provider]
        limits = self.limits[provider]

        return (
            state["minute_count"] < limits["rpm"]
            and state["day_count"]    < limits["rpd"]
        )

    def record_use(self, provider: str) -> None:
        """Increment counters after a successful (or attempted) API call."""
        if provider not in self._state:
            return
        self._refresh(provider)
        self._state[provider]["minute_count"] += 1
        self._state[provider]["day_count"]    += 1

    def get_wait_time(self, provider: str) -> float:
        """
        Return seconds to wait before the per-minute window resets.
        Returns 0 if not rate-limited.
        """
        if provider not in self._state:
            return 0.0

        self._refresh(provider)
        state  = self._state[provider]
        limits = self.limits[provider]

        if state["minute_count"] >= limits["rpm"]:
            elapsed = time.time() - state["minute_reset"]
            return max(0.0, 60.0 - elapsed)

        return 0.0

    def get_usage_stats(self) -> dict:
        """Return current counts and limits for all providers (useful for debugging)."""
        stats = {}
        for provider in self._state:
            self._refresh(provider)
            state  = self._state[provider]
            limits = self.limits[provider]
            stats[provider] = {
                "minute_used":  state["minute_count"],
                "minute_limit": limits["rpm"],
                "day_used":     state["day_count"],
                "day_limit":    limits["rpd"],
                "minute_reset_in": round(max(0.0, 60.0   - (time.time() - state["minute_reset"])), 1),
                "day_reset_in":    round(max(0.0, 86400.0 - (time.time() - state["day_reset"])),    1),
            }
        return stats
