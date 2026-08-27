from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Environment & Logging
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    APP_NAME: str = "ORGagent Organization OS"
    VERSION: str = "1.0.0"

    # Security & Auth
    SECRET_KEY: str = "nexus-production-secret-key-replace-in-env"
    AUTH_ENABLED: bool = False
    ALLOWED_ORIGINS: list[str] | str = ["*"]

    # Database & Pool
    DATABASE_URL: str = "sqlite+aiosqlite:///./nexus.db"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # Redis & Event Bus
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_POOL_SIZE: int = 50
    REDIS_RETRY_ON_TIMEOUT: bool = True

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 120
    RATE_LIMIT_ENABLED: bool = True

    # Multi-Agent DAG & Worker
    TASK_TIMEOUT_SEC: int = 120
    WORKER_CONCURRENCY: int = 4
    DAG_MAX_CONCURRENT_TASKS: int = 5

    # Demo Mode & Fallback
    DEMO_REPLAY: bool = True

    # LLM Gateway & Multi-Model Routing
    PRIMARY_PROVIDER: str = "gemini"  # gemini | anthropic | openai | qwen
    FALLBACK_PROVIDER: str = "anthropic"
    MODEL_POLICY: str = "AUTO"  # STRICT | BALANCE | NOCAP | AUTO

    # LLM Resilience
    LLM_MAX_RETRIES: int = 3
    LLM_RETRY_BACKOFF_FACTOR: float = 1.5
    LLM_REQUEST_TIMEOUT_SEC: int = 60
    CIRCUIT_BREAKER_FAILURE_THRESHOLD: int = 3
    CIRCUIT_BREAKER_RESET_TIMEOUT_SEC: int = 30

    # API Keys & Endpoints
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL_PRO: str = "gemini-3.6-flash"
    GEMINI_MODEL_FLASH: str = "gemini-3.5-flash"

    ANTHROPIC_API_KEY: str | None = None
    ANTHROPIC_MODEL_PRO: str = "claude-3-7-sonnet-latest"
    ANTHROPIC_MODEL_FLASH: str = "claude-3-5-haiku-latest"

    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL_PRO: str = "gpt-4o"
    OPENAI_MODEL_FLASH: str = "gpt-4o-mini"

    QWEN_ENABLED: bool = False
    QWEN_BASE_URL: str = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    QWEN_API_KEY: str | None = None
    QWEN_MODEL: str = "qwen-max"

    # Groq (Ultra-low latency inference)
    GROQ_API_KEY: str | None = None
    GROQ_MODEL: str = "qwen/qwen3.6-27b"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # OpenRouter (Universal Multi-Model Gateway)
    OPENROUTER_API_KEY: str | None = None
    OPENROUTER_MODEL: str = "qwen/qwen-2.5-72b-instruct"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # Ollama (Local Privacy-Preserving Execution)
    OLLAMA_BASE_URL: str = "http://localhost:11434/v1"
    OLLAMA_MODEL: str = "qwen2.5:14b"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return ["*"]

    model_config = SettingsConfigDict(env_file=(".env", "../../.env"), env_file_encoding="utf-8", extra="ignore")


settings = Settings()
