from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    env: str = "development"
    cors_origins_raw: str = "http://localhost:5173,http://127.0.0.1:5173"
    ai_enabled: bool = True
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-2.5-flash"
    ai_timeout_seconds: int = 12
    enable_image_input: bool = False
    max_text_chars: int = 4000
    max_image_bytes: int = 1500000
    max_body_bytes: int = 3000000
    rate_limit_per_min: int = 20
    trust_proxy: bool = False
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
