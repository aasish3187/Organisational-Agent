import re
import pytest
from app.core.llm_gateway import llm_gateway
from app.services.model_router import ModelRouter, ModelTier


def test_model_router_tier_mappings():
    router = ModelRouter()
    # In test environment demo_mode defaults to True
    assert router.get_tier_name(ModelTier.DEEPSEEK_R1) == "mock-deterministic"
    
    # In live mode (demo_mode=False)
    router.demo_mode = False
    assert router.get_tier_name(ModelTier.DEEPSEEK_R1) == "deepseek-reasoner"
    assert router.get_tier_name(ModelTier.GLM_5_2) == "glm-5.2"
    
    tier_name = router.get_tier_name(ModelTier.REASONING)
    assert tier_name in ["deepseek-reasoner", "glm-5.2", "gemini-2.5-pro", "claude-3-7-sonnet"]


def test_deepseek_r1_think_tag_stripping():
    sample_deepseek_output = """<think>
1. Analyze user request for fraud detection pipeline.
2. Extract required Pydantic fields.
3. Ensure zero latency regression.
</think>
{
  "title": "Payment Risk Engine",
  "status": "APPROVED"
}"""
    cleaned = re.sub(r"<think>[\s\S]*?</think>", "", sample_deepseek_output).strip()
    assert "<think>" not in cleaned
    assert "</think>" not in cleaned
    assert '"title": "Payment Risk Engine"' in cleaned


def test_cost_estimation_for_all_models():
    # DeepSeek reasoning
    cost_ds = llm_gateway.estimate_cost("deepseek-reasoner", 1000, 1000)
    assert cost_ds > 0.0

    # GLM 5.2
    cost_glm = llm_gateway.estimate_cost("glm-5.2", 1000, 1000)
    assert cost_glm > 0.0

    # Gemini 2.5 Pro
    cost_gemini = llm_gateway.estimate_cost("gemini-2.5-pro", 1000, 1000)
    assert cost_gemini > 0.0

    # Groq LLaMA
    cost_groq = llm_gateway.estimate_cost("llama-3.3-70b-versatile", 1000, 1000)
    assert cost_groq > 0.0
