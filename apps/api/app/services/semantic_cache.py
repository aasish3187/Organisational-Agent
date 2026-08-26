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
    def __init__(self, similarity_threshold: float = 0.96, default_ttl_seconds: int = 3600):
        self.similarity_threshold = similarity_threshold
        self.default_ttl = default_ttl_seconds
        self._exact_store: dict[str, dict[str, Any]] = {}
        self._vector_store: list[dict[str, Any]] = []

    def _hash_key(self, prompt: str, schema_name: str) -> str:
        clean = prompt.strip()
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
        if len(self._vector_store) > 1000:
            self._vector_store = [x for x in self._vector_store if x["expires_at"] > now]

    def clear(self) -> None:
        self._exact_store.clear()
        self._vector_store.clear()


semantic_cache = SemanticCache()
