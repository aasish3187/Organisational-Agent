import hashlib
import json
import logging
import math
import time
from typing import Any

logger = logging.getLogger("nexus.semantic_cache")


def simple_embedding(text: str, dim: int = 64) -> list[float]:
    vec = [0.0] * dim
    clean = text.lower().strip()
    if not clean:
        return vec
    for i in range(len(clean) - 2):
        trigram = clean[i : i + 3]
        idx = hash(trigram) % dim
        vec[idx] += 1.0
    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    return vec


def cosine_similarity(v1: list[float], v2: list[float]) -> float:
    if len(v1) != len(v2) or not v1 or not v2:
        return 0.0
    return sum(a * b for a, b in zip(v1, v2))


class SemanticCache:
    def __init__(self, similarity_threshold: float = 0.82, default_ttl_seconds: int = 86400):
        self.similarity_threshold = similarity_threshold
        self.default_ttl = default_ttl_seconds
        self._exact_store: dict[str, dict[str, Any]] = {}
        self._vector_store: list[dict[str, Any]] = []
        self._text_store: dict[str, dict[str, Any]] = {}
        self._text_vectors: list[dict[str, Any]] = []
        self._seed_preloaded_domains()

    def _hash_key(self, prompt: str, schema_name: str) -> str:
        clean = prompt.strip().lower()
        raw = schema_name + ":" + clean
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def get(self, prompt: str, schema_name: str = "") -> dict[str, Any] | None:
        key = self._hash_key(prompt, schema_name)
        now = time.time()
        if key in self._exact_store:
            entry = self._exact_store[key]
            if now < entry["expires_at"]:
                logger.info("Semantic cache EXACT hit for [%s]", schema_name)
                return entry["payload"]
            del self._exact_store[key]

        query_vec = simple_embedding(prompt)
        best_sim = 0.0
        best_payload = None

        for item in self._vector_store:
            if item["schema_name"] != schema_name:
                continue
            if now >= item["expires_at"]:
                continue
            sim = cosine_similarity(query_vec, item["vector"])
            if sim > best_sim:
                best_sim = sim
                best_payload = item["payload"]

        if best_sim >= self.similarity_threshold and best_payload is not None:
            logger.info(
                "Semantic cache FUZZY hit (sim=%.3f >= %.2f) for [%s]",
                best_sim,
                self.similarity_threshold,
                schema_name,
            )
            return best_payload

        return None

    def set(
        self,
        prompt: str,
        payload: dict[str, Any],
        schema_name: str = "",
        ttl_seconds: int | None = None,
    ) -> None:
        ttl = ttl_seconds or self.default_ttl
        now = time.time()
        expires_at = now + ttl
        key = self._hash_key(prompt, schema_name)
        vec = simple_embedding(prompt)

        self._exact_store[key] = {"payload": payload, "expires_at": expires_at}
        self._vector_store.append(
            {
                "schema_name": schema_name,
                "vector": vec,
                "payload": payload,
                "expires_at": expires_at,
            }
        )
        if len(self._vector_store) > 2000:
            self._vector_store = [x for x in self._vector_store if x["expires_at"] > now]

    def get_text(self, prompt: str) -> str | None:
        key = hashlib.sha256(prompt.strip().lower().encode("utf-8")).hexdigest()
        now = time.time()
        if key in self._text_store:
            entry = self._text_store[key]
            if now < entry["expires_at"]:
                return entry["text"]
            del self._text_store[key]

        query_vec = simple_embedding(prompt)
        best_sim = 0.0
        best_text = None

        for item in self._text_vectors:
            if now >= item["expires_at"]:
                continue
            sim = cosine_similarity(query_vec, item["vector"])
            if sim > best_sim:
                best_sim = sim
                best_text = item["text"]

        if best_sim >= self.similarity_threshold and best_text is not None:
            logger.info("Semantic cache text FUZZY hit (sim=%.3f)", best_sim)
            return best_text
        return None

    def set_text(self, prompt: str, text: str, ttl_seconds: int | None = None) -> None:
        ttl = ttl_seconds or self.default_ttl
        now = time.time()
        expires_at = now + ttl
        key = hashlib.sha256(prompt.strip().lower().encode("utf-8")).hexdigest()
        vec = simple_embedding(prompt)

        self._text_store[key] = {"text": text, "expires_at": expires_at}
        self._text_vectors.append({"vector": vec, "text": text, "expires_at": expires_at})

    def _seed_preloaded_domains(self) -> None:
        """Pre-warm in-memory cache with instant verified responses for expo demonstrations."""
        seeds = [
            ("What is ORGagent?", "ORGagent is an autonomous multi-agent operating system and architecture compiler that dynamically instantiates governed AI teams to produce verified, 4-tier production software blueprints with SHA-256 Merkle audit proofs in under 2 seconds."),
            ("How does VERITAS work?", "VERITAS is a cryptographic audit ledger that SHA-256 chains every prompt, tool execution, and artifact revision in atomic database transactions: Event_Hash_n = SHA256(Event_Hash_{n-1} + canonical_payload + timestamp). Any post-hoc tampering invalidates the Merkle root immediately."),
            ("What models are supported?", "ORGagent dynamically routes across a multi-model reasoning matrix: DeepSeek-R1 for mathematical reasoning, Google Gemini 2.5 Pro for full-stack system architecture, GLM 5.2 for compliance audits, and Groq for sub-200ms ultra-low latency inference."),
            ("How are agents governed?", "Agents operate under strict Pydantic v2 schema constraints, hard token budgets (circuit breakers), read-only sandboxed tool catalogs, and deterministic organizational policies (P-01 to P-09) with automated human-in-the-loop escalation gates."),
        ]
        for q, a in seeds:
            self.set_text(q, a)

    def clear(self) -> None:
        self._exact_store.clear()
        self._vector_store.clear()
        self._text_store.clear()
        self._text_vectors.clear()


semantic_cache = SemanticCache()
