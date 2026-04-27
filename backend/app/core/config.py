"""AI Career Copilot — Backend Configuration"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "AI Career Copilot"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me-in-production-use-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./career_copilot.db"

    # AI — provide at least one key to enable LLM-powered analysis
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    AI_MODEL: str = "gemini-2.0-flash"  # or "gpt-4o-mini"
    AI_PROVIDER: str = "gemini"  # "gemini" or "openai"

    # Storage
    UPLOAD_DIR: str = "uploads"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"

    # Google Auth
    GOOGLE_CLIENT_ID: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
