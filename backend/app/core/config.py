import os
import json
import logging
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger("app.config")

# Calculate paths to potential .env files
APP_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.dirname(APP_DIR)
ROOT_DIR = os.path.dirname(BACKEND_DIR)

env_files = [
    os.path.join(ROOT_DIR, ".env"),
    os.path.join(ROOT_DIR, ".env.development"),
    os.path.join(BACKEND_DIR, ".env"),
]

existing_env_files = [f for f in env_files if os.path.isfile(f)]

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=tuple(existing_env_files) if existing_env_files else None,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    APP_NAME: str = "School Alumni & Batch Get-Together Platform"
    APP_ENV: str = "development" # development | qa | production
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "https://nhssalumni.com",
        "https://www.nhssalumni.com",
        "https://nhss-alumni-backend-b7a8a8dffcrp6abha.southindia-01.azurewebsites.net",
        "https://nhss-alumni-backend-b7a8a8dfcrg6abha.southindia-01.azurewebsites.net",
        "https://nhss-alumni-hucjandcaedncnhj.southindia-01.azurewebsites.net",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    # Database Settings
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "school_alumni_db"

    # JWT & Auth Settings
    JWT_SECRET: str = "justgathernow-super-secret-key-32-chars-minimum-length-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    DEFAULT_DEV_OTP: str = "123456"

    # Azure Storage Settings
    AZURE_STORAGE_CONNECTION_STRING: str = ""
    AZURE_STORAGE_CONTAINER: str = "alumni-memories"
    AZURE_CDN_URL: str = ""

    # Firebase Settings
    FIREBASE_PROJECT_ID: str = ""

    # Google OAuth Settings
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"
    FRONTEND_URL: str = "http://localhost:5173"

    # Primary Developer & Platform Configuration
    INITIAL_SCHOOL_NAME: str = "NHSS SCHOOL"
    INITIAL_SCHOOL_CODE: str = "NHSS"
    INITIAL_ADMIN_MOBILE: str = "+917550375037"

    # SMTP Email Configuration
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASS: str = ""
    EMAILS_FROM_NAME: str = "NHSS_ALUMNI-team"
    EMAILS_FROM_EMAIL: str = "devopstrioglobal@gmail.com"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return [
            "https://nhssalumni.com",
            "https://www.nhssalumni.com",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173"
        ]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"

    @property
    def is_dev(self) -> bool:
        return self.APP_ENV.lower() in ["development", "dev", "test"]

    def validate_production_secrets(self):
        """Validates that required production secrets are configured before startup."""
        if self.is_production:
            logger.info("Validating production configuration secrets...")
            if not self.JWT_SECRET or "justgathernow-super-secret" in self.JWT_SECRET or len(self.JWT_SECRET) < 32:
                import secrets as py_secrets
                self.JWT_SECRET = py_secrets.token_urlsafe(48)
                logger.warning("JWT_SECRET was unconfigured or weak. Automatically generated a secure runtime JWT secret key.")
            if not self.MONGODB_URI or "localhost" in self.MONGODB_URI:
                raise RuntimeError("FATAL: MONGODB_URI must be configured for a production database instance!")
            if "*" in self.CORS_ORIGINS:
                raise RuntimeError("FATAL: Wildcard '*' CORS origin is strictly forbidden in production!")

settings = Settings()

