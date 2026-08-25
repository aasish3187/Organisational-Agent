import asyncio
import json
import logging
import random
import re
import time
from typing import Any

import httpx
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger("nexus.llm_gateway")

# Pricing per million tokens (Prompt, Completion in USD)
PROVIDER_PRICING: dict[str, tuple[float, float]] = {
    # Gemini
    "gemini-2.5-pro": (1.25, 5.00),
    "gemini-2.5-flash": (0.075, 0.30),
    # Anthropic
    "claude-3-7-sonnet-latest": (3.00, 15.00),
    "claude-3-5-haiku-latest": (0.80, 4.00),
    # OpenAI
    "gpt-4o": (2.50, 10.00),
    "gpt-4o-mini": (0.15, 0.60),
    # Self-hosted
    "qwen-2.5-coder": (0.10, 0.20),
    "demo": (0.00, 0.00),
}


class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, reset_timeout: int = 30):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.failure_count = 0
        self.state = "CLOSED"  # CLOSED | OPEN | HALF_OPEN
        self.last_state_change = 0.0

    def record_success(self) -> None:
        self.failure_count = 0
        self.state = "CLOSED"

    def record_failure(self) -> None:
        self.failure_count += 1
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            self.last_state_change = time.time()
            logger.warning("Circuit breaker TRIPPED to OPEN. Failures: %d", self.failure_count)

    def can_attempt(self) -> bool:
        if self.state == "CLOSED":
            return True
        if self.state == "OPEN":
            if time.time() - self.last_state_change > self.reset_timeout:
                self.state = "HALF_OPEN"
                logger.info("Circuit breaker transitioned to HALF_OPEN (testing recovery)")
                return True
            return False
        if self.state == "HALF_OPEN":
            return True
        return False


class LLMGateway:
    """
    Enterprise-grade Multi-Provider LLM Gateway with Circuit Breaker,
    Exponential Backoff, Pydantic Schema Repair, and Seeded Demo Fallback.
    """

    def __init__(self):
        self.circuit_breakers: dict[str, CircuitBreaker] = {
            "gemini": CircuitBreaker(
                settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
                settings.CIRCUIT_BREAKER_RESET_TIMEOUT_SEC,
            ),
            "anthropic": CircuitBreaker(
                settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
                settings.CIRCUIT_BREAKER_RESET_TIMEOUT_SEC,
            ),
            "openai": CircuitBreaker(
                settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
                settings.CIRCUIT_BREAKER_RESET_TIMEOUT_SEC,
            ),
            "qwen": CircuitBreaker(
                settings.CIRCUIT_BREAKER_FAILURE_THRESHOLD,
                settings.CIRCUIT_BREAKER_RESET_TIMEOUT_SEC,
            ),
        }
        self.demo_mode = settings.DEMO_REPLAY

    def resolve_model(self, provider: str, tier: str = "PRO") -> str:
        """Resolve exact model identifier by provider and tier (PRO vs FLASH/CHEAP)."""
        if provider == "gemini":
            return settings.GEMINI_MODEL_PRO if tier == "PRO" else settings.GEMINI_MODEL_FLASH
        elif provider == "anthropic":
            return settings.ANTHROPIC_MODEL_PRO if tier == "PRO" else settings.ANTHROPIC_MODEL_FLASH
        elif provider == "openai":
            return settings.OPENAI_MODEL_PRO if tier == "PRO" else settings.OPENAI_MODEL_FLASH
        elif provider == "qwen":
            return settings.QWEN_MODEL
        return "demo-replay-model"

    def estimate_cost(self, model: str, prompt_tokens: int, completion_tokens: int) -> float:
        """Calculate USD cost for token usage."""
        pricing = PROVIDER_PRICING.get(model, (0.50, 1.50))
        prompt_cost = (prompt_tokens / 1_000_000.0) * pricing[0]
        completion_cost = (completion_tokens / 1_000_000.0) * pricing[1]
        return round(prompt_cost + completion_cost, 6)

    def clean_json_string(self, text: str) -> str:
        """Extract and repair JSON strings from LLM output (removes markdown backticks, trailing commas)."""
        cleaned = text.strip()
        # Extract markdown code block if present
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
        if match:
            cleaned = match.group(1).strip()

        # Remove trailing commas before close braces/brackets
        cleaned = re.sub(r",\s*([\]}])", r"\1", cleaned)
        return cleaned

    def parse_schema(self, raw_text: str, schema: type[BaseModel]) -> dict[str, Any]:
        """Strictly parse and validate JSON against Pydantic schema model."""
        cleaned = self.clean_json_string(raw_text)
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as err:
            logger.error("JSON decode error: %s. Raw: %s", err, raw_text[:200])
            # Fallback regex extraction of key fields if needed
            raise ValueError(f"Invalid JSON from LLM: {err}") from err

        validated = schema.model_validate(data)
        return validated.model_dump()

    async def execute_provider_request(
        self,
        provider: str,
        model: str,
        system_prompt: str,
        user_prompt: str,
        schema: type[BaseModel],
    ) -> tuple[dict[str, Any], int, str]:
        """Execute request against live provider endpoint with timeout."""
        timeout = httpx.Timeout(timeout=10.0, connect=4.0)

        if provider == "gemini":
            if not settings.GEMINI_API_KEY:
                raise ValueError("GEMINI_API_KEY not configured")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "system_instruction": {"parts": [{"text": system_prompt}]},
                "contents": [{"parts": [{"text": user_prompt}]}],
                "generationConfig": {
                    "response_mime_type": "application/json",
                    "temperature": 0.2,
                },
            }
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                res_data = res.json()
                text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                tokens = res_data.get("usageMetadata", {}).get("totalTokenCount", 1200)
                parsed = self.parse_schema(text, schema)
                return parsed, tokens, model

        elif provider == "anthropic":
            if not settings.ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY not configured")
            url = "https://api.anthropic.com/v1/messages"
            headers = {
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }
            payload = {
                "model": model,
                "max_tokens": 4096,
                "system": system_prompt,
                "messages": [{"role": "user", "content": user_prompt}],
                "temperature": 0.2,
            }
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(url, headers=headers, json=payload)
                res.raise_for_status()
                res_data = res.json()
                text = res_data["content"][0]["text"]
                usage = res_data.get("usage", {})
                tokens = usage.get("input_tokens", 500) + usage.get("output_tokens", 700)
                parsed = self.parse_schema(text, schema)
                return parsed, tokens, model

        elif provider == "openai":
            if not settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not configured")
            url = "https://api.openai.com/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": model,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.2,
            }
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(url, headers=headers, json=payload)
                res.raise_for_status()
                res_data = res.json()
                text = res_data["choices"][0]["message"]["content"]
                tokens = res_data.get("usage", {}).get("total_tokens", 1100)
                parsed = self.parse_schema(text, schema)
                return parsed, tokens, model

        elif provider == "qwen":
            url = f"{settings.QWEN_BASE_URL.rstrip('/')}/chat/completions"
            headers = {"Content-Type": "application/json"}
            if settings.QWEN_API_KEY:
                headers["Authorization"] = f"Bearer {settings.QWEN_API_KEY}"
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.2,
            }
            async with httpx.AsyncClient(timeout=timeout) as client:
                res = await client.post(url, headers=headers, json=payload)
                res.raise_for_status()
                res_data = res.json()
                text = res_data["choices"][0]["message"]["content"]
                tokens = res_data.get("usage", {}).get("total_tokens", 900)
                parsed = self.parse_schema(text, schema)
                return parsed, tokens, model

        raise ValueError(f"Unsupported provider: {provider}")

    async def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        schema: type[BaseModel],
        tier: str = "PRO",
        demo_fallback_data: dict[str, Any] | None = None,
    ) -> tuple[dict[str, Any], int, str, float]:
        """
        Execute request with Multi-Provider Fallback Cascade, Exponential Backoff,
        and Circuit Breaker protection. Returns (content_dict, tokens_used, model_used, cost_usd).
        """
        providers_to_try = [
            settings.PRIMARY_PROVIDER,
            settings.FALLBACK_PROVIDER,
            "openai" if settings.PRIMARY_PROVIDER != "openai" else "gemini",
        ]

        # Filter unique providers
        unique_providers = []
        for p in providers_to_try:
            if p not in unique_providers:
                unique_providers.append(p)

        last_error: Exception | None = None

        for provider in unique_providers:
            cb = self.circuit_breakers.get(provider)
            if cb and not cb.can_attempt():
                logger.warning("Skipping provider %s (circuit breaker OPEN)", provider)
                continue

            model = self.resolve_model(provider, tier)

            for attempt in range(1, settings.LLM_MAX_RETRIES + 1):
                try:
                    content, tokens, used_model = await self.execute_provider_request(
                        provider=provider,
                        model=model,
                        system_prompt=system_prompt,
                        user_prompt=user_prompt,
                        schema=schema,
                    )
                    if cb:
                        cb.record_success()
                    cost = self.estimate_cost(used_model, tokens // 2, tokens // 2)
                    return content, tokens, used_model, cost

                except Exception as exc:
                    last_error = exc
                    logger.warning(
                        "Provider %s attempt %d/%d failed: %s",
                        provider,
                        attempt,
                        settings.LLM_MAX_RETRIES,
                        exc,
                    )
                    if attempt < settings.LLM_MAX_RETRIES:
                        backoff = (settings.LLM_RETRY_BACKOFF_FACTOR**attempt) + random.uniform(
                            0.1, 0.5
                        )
                        await asyncio.sleep(backoff)
                    else:
                        if cb:
                            cb.record_failure()

        # If all live providers fail or are unconfigured, fallback gracefully to demo replay
        logger.info(
            "Falling back to deterministic verified demo replay data. Reason: %s", last_error
        )
        if demo_fallback_data is not None:
            validated = schema.model_validate(demo_fallback_data)
            return validated.model_dump(), 850, "demo-replay-engine", 0.0012

        raise RuntimeError(f"All LLM providers and fallbacks failed: {last_error}")


# Singleton instance for application-wide routing
llm_gateway = LLMGateway()
