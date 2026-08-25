
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./nexus.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Demo mode
    DEMO_REPLAY: bool = True

    # Model Router / Providers
    PRIMARY_PROVIDER: str = "anthropic"  # anthropic | openai
    MODEL_POLICY: str = "AUTO"           # STRICT | BALANCE | NOCAP | AUTO
    QWEN_ENABLED: bool = False
    QWEN_BASE_URL: str | None = "http://localhost:8000/v1"

    # API Keys
    ANTHROPIC_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None
    QWEN_API_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
