import pytest
from app.services.semantic_cache import SemanticCache, simple_embedding, cosine_similarity

def test_simple_embedding():
    v1 = simple_embedding("design edtech platform")
    v2 = simple_embedding("design edtech platform")
    v3 = simple_embedding("quantum physics simulation")
    assert len(v1) == 64
    assert cosine_similarity(v1, v2) > 0.99
    assert cosine_similarity(v1, v3) < 0.70

def test_semantic_cache_exact_and_fuzzy():
    cache = SemanticCache(similarity_threshold=0.90)
    prompt = "Build a student exam prep portal"
    payload = {"status": "ok", "plan": "edtech"}

    cache.set(prompt, payload, schema_name="TestPlan")
    
    # Exact hit
    assert cache.get(prompt, schema_name="TestPlan") == payload
    
    # Fuzzy hit with near identical prompt
    fuzzy_prompt = "Build a student exam prep portal "
    assert cache.get(fuzzy_prompt, schema_name="TestPlan") == payload

    # Miss on different schema
    assert cache.get(prompt, schema_name="DifferentSchema") is None

    # Miss on totally different prompt
    assert cache.get("Healthcare clinical patient records", schema_name="TestPlan") is None
