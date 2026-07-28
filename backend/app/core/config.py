import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

load_dotenv()

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    PRIMARY_MODEL: str = "llama-3.1-8b-instant"
    REASONING_MODEL: str = "llama-3.3-70b-versatile"
    DATABASE_URL: str = "sqlite:///./pharma_complaints.db"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    JWT_SECRET_KEY: str = "pharma_qms_super_secret_jwt_key_2026_demo"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 8
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://ai-powered-customer-complaint-manag-seven.vercel.app"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origin_list(self) -> List[str]:
        if not self.CORS_ORIGINS:
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

settings = Settings()
