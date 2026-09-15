import time
import secrets
import hashlib
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Securely hashes a plaintext password using PBKDF2-SHA256 / Bcrypt."""
    if not password:
        return ""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against a stored password string.
    Supports both modern hashed passwords and transparent backwards compatibility for legacy plain text passwords.
    """
    if not plain_password or not hashed_password:
        return False
    if hashed_password.startswith("$pbkdf2") or hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$"):
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return False
    # Legacy fallback: constant-time string comparison
    return secrets.compare_digest(plain_password, hashed_password)

def generate_invitation_token() -> Tuple[str, str]:
    """
    Generates a cryptographically random invitation token and its SHA-256 hash.
    Returns:
        (raw_token, token_hash)
    """
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    return raw_token, token_hash

def hash_token(raw_token: str) -> str:
    """Returns SHA-256 hash of a token for secure database lookup."""
    return hashlib.sha256(raw_token.strip().encode("utf-8")).hexdigest()

def generate_otp() -> str:
    """Generate cryptographically random 6-digit OTP code"""
    return f"{secrets.randbelow(900000) + 100000}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid authentication token")

def generate_qr_ticket_token(event_id: str, alumni_id: str, school_id: str) -> str:
    """Generates an encrypted, signed secure QR token containing event, alumni, and school references"""
    payload = {
        "event_id": str(event_id),
        "alumni_id": str(alumni_id),
        "school_id": str(school_id),
        "iat": int(time.time()),
        "type": "event_qr_ticket"
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def decode_qr_ticket_token(qr_token: str) -> Dict[str, Any]:
    """Decodes and validates an event QR token"""
    try:
        payload = jwt.decode(qr_token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "event_qr_ticket":
            raise ValueError("Invalid QR ticket token type")
        return payload
    except Exception as e:
        raise ValueError(f"Invalid or tampered QR ticket: {str(e)}")
