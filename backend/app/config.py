from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "NyayMitra API"
    VERSION: str = "1.0"
    CORS_ORIGINS: List[str] = ["*"]
    CHROMA_PERSIST_DIR: str = "./chroma_db"
    LEXCHAIN_URL: str = "http://localhost:8000"

    class Config:
        env_file = ".env"

settings = Settings()
