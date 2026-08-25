from enum import Enum
from typing import Any

from app.core.config import settings


class ModelTier(str, Enum):
    FAST = "fast"
    REASONING = "reasoning"
    LOCAL = "local"
    QWEN = "qwen"
    MOCK = "mock"

class MockClient:
    """Deterministic, mock client for DEMO_REPLAY mode."""
    def __init__(self, model_name: str = "mock-reasoning-v1"):
        self.model_name = model_name

    async def generate_json(self, prompt: str, schema: type) -> dict[str, Any]:
        return {}

class ModelRouter:
    def __init__(self):
        self.demo_mode = settings.DEMO_REPLAY
        self.primary_provider = settings.PRIMARY_PROVIDER.lower()
        self.qwen_enabled = settings.QWEN_ENABLED

    def get_tier_name(self, tier: ModelTier) -> str:
        if self.demo_mode:
            return "mock-deterministic"
        if tier == ModelTier.QWEN and self.qwen_enabled:
            return "qwen-3.8-max"
        if tier == ModelTier.REASONING:
            return "claude-sonnet-4-6" if self.primary_provider == "anthropic" else "gpt-4.1"
        return "claude-haiku-4-5-20251001" if self.primary_provider == "anthropic" else "gpt-4o-mini"

model_router = ModelRouter()
