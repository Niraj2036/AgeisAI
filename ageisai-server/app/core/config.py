from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AegisAI Backend"
    environment: str = "development"
    debug: bool = True

    mongo_uri: str = "mongodb://localhost:27017"
    mongo_db_name: str = "aegisai"

    jwt_secret_key: str = "CHANGE_ME"  # override in env
    jwt_algorithm: str = "HS256"
    jwt_access_token_expires_minutes: int = 60

    drift_latency_threshold_ms: float = 2000.0
    health_min_score: float = 0.0
    health_max_score: float = 100.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()

