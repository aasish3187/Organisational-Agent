from enum import Enum
from typing import Any

from app.core.config import settings


class ModelTier(str, Enum):
    FAST = "fast"
    REASONING = "reasoning"
    DEEPSEEK_R1 = "deepseek-r1"
    GLM_5_2 = "glm-5.2"
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
        if tier == ModelTier.DEEPSEEK_R1:
            return "deepseek-reasoner"
        if tier == ModelTier.GLM_5_2:
            return "glm-5.2"
        if tier == ModelTier.QWEN and self.qwen_enabled:
            return "qwen-3.8-max"
        if tier == ModelTier.REASONING:
            if self.primary_provider == "deepseek":
                return "deepseek-reasoner"
            elif self.primary_provider == "glm":
                return "glm-5.2"
            elif self.primary_provider == "anthropic":
                return "claude-3-7-sonnet"
            return "gemini-2.5-pro"
        return (
            "deepseek-chat" if self.primary_provider == "deepseek"
            else "glm-4-flash" if self.primary_provider == "glm"
            else "gemini-2.5-flash"
        )


model_router = ModelRouter()
