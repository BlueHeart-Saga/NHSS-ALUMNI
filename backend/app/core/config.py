import os
import logging
from typing import List
from pydantic_settings import BaseSettings

logger = logging.getLogger("app.config")

# Calculate absolute path to backend/.env
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_FILE_PATH = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):
    APP_NAME: str = "School Alumni & Batch Get-Together Platform"
    APP_ENV: str = "development" # development | qa | production
    PORT: int = 8000
    CORS_ORIGINS: List[str] = [
        "https://nhssalumni.com",
        "https://www.nhssalumni.com",
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

    class Config:
        env_file = ENV_FILE_PATH if os.path.exists(ENV_FILE_PATH) else None
        env_file_encoding = "utf-8"
        extra = "ignore"

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
