from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from datetime import datetime, timezone
from typing import Optional, Tuple
from pydantic import BaseModel
from bson import ObjectId
import json
import re
import urllib.parse
import urllib.request

import asyncio
import secrets
import hashlib
from datetime import timedelta
from app.core.database import get_db
from app.core.security import (
    generate_otp, create_access_token, create_refresh_token,
    get_password_hash, verify_password, hash_token, generate_invitation_token
)
from app.core.config import settings

# =============================================================================
# LEGACY SMTP OTP - TEMPORARILY DISABLED
# PRESERVED FOR FUTURE USE
# =============================================================================
from app.services.email import send_otp_email

from app.services.sms import (
    send_sms_otp, normalize_indian_mobile, is_valid_indian_mobile, send_invitation_sms,
    get_mobile_query_variants, build_mobile_query_filter
)
from app.services.whatsapp import send_whatsapp_otp

from app.schemas.models import (
    SendOTPRequest, SendOTPResponse, VerifyOTPRequest, TokenResponse,
    UserRegistrationRequest, UserProfileResponse, UpdatePasswordRequest,
    SetPasswordWithOTPRequest, LoginRequest,
    ValidateInvitationResponse, SendInvitationOTPRequest, VerifyInvitationOTPRequest,
    ActivateAccountWithInvitationRequest, BulkSendInvitationRequest, SendInvitationResponse
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

import logging

logger = logging.getLogger("app.auth")

# In-memory and MongoDB synchronized OTP storage for multi-worker Azure instance compatibility
OTP_STORE = {}

async def _store_otp_record_db(keys: list, otp_entry: dict):
    for k in keys:
        if k:
            OTP_STORE[k] = otp_entry
    try:
        db = get_db()
        now_ts = datetime.now(timezone.utc).timestamp()
        for k in keys:
            if k:
                doc = dict(otp_entry)
                doc["key"] = k
                await db.otp_store.update_one({"key": k}, {"$set": doc}, upsert=True)
    except Exception as e:
        logger.warning(f"Failed to sync OTP store to MongoDB: {e}")

async def _lookup_otp_record_db(keys: list) -> Optional[dict]:
    # 1. Check local in-memory dict first
    for key in keys:
        if key and key in OTP_STORE:
            return OTP_STORE[key]
    # 2. Check MongoDB for multi-worker Azure deployment sync
    try:
        db = get_db()
        clean_keys = [k for k in keys if k]
        if clean_keys:
            doc = await db.otp_store.find_one({"key": {"$in": clean_keys}})
            if doc:
                doc.pop("_id", None)
                # Cache locally
                for k in clean_keys:
                    OTP_STORE[k] = doc
                return doc
    except Exception as e:
        logger.warning(f"Failed to lookup OTP from MongoDB: {e}")
    return None

async def _clear_otp_record_db(keys: list):
    for key in keys:
        if key:
            OTP_STORE.pop(key, None)
    try:
        db = get_db()
        clean_keys = [k for k in keys if k]
        if clean_keys:
            await db.otp_store.delete_many({"key": {"$in": clean_keys}})
    except Exception as e:
        logger.warning(f"Failed to clear OTP from MongoDB: {e}")

async def _validate_and_consume_otp(email: Optional[str], mobile: Optional[str], otp: str) -> dict:
    """
    Validates OTP for mobile or email:
    - Normalizes input parameters
    - Synchronizes across workers via MongoDB
    - Checks expiry (10 minutes)
    - Checks rate limit on attempts (max 5 attempts)
    - Validates OTP code securely (secrets.compare_digest)
    - Supports single-use invalidation
    """
    clean_email = email.strip().lower() if email else None
    clean_mobile = mobile.strip() if mobile else None
    clean_otp = otp.strip()

    keys = []
    if clean_mobile:
        keys.extend(get_mobile_query_variants(clean_mobile))
    if clean_email:
        keys.append(clean_email)

    stored_data = await _lookup_otp_record_db(keys)
    now_ts = datetime.now(timezone.utc).timestamp()

    if not stored_data:
        raise HTTPException(status_code=400, detail="No active OTP found. Please request a new OTP.")

    if stored_data.get("expires_at", 0) < now_ts:
        await _clear_otp_record_db(keys)
        if stored_data.get("mobile"):
            await _clear_otp_record_db(get_mobile_query_variants(stored_data["mobile"]))
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new OTP.")

    # Track verification attempts
    stored_data["attempts"] = stored_data.get("attempts", 0) + 1
    if stored_data["attempts"] > stored_data.get("max_attempts", 5):
        await _clear_otp_record_db(keys)
        if stored_data.get("mobile"):
            await _clear_otp_record_db(get_mobile_query_variants(stored_data["mobile"]))
        raise HTTPException(status_code=429, detail="Maximum verification attempts exceeded. Please request a new OTP.")

    # Constant-time comparison
    is_valid = secrets.compare_digest(stored_data["otp"], clean_otp) or (settings.is_dev and clean_otp == settings.DEFAULT_DEV_OTP)
    if not is_valid:
        await _store_otp_record_db(keys, stored_data)
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    # Invalidate OTP on successful verification
    await _clear_otp_record_db(keys)
    if stored_data.get("mobile"):
        await _clear_otp_record_db(get_mobile_query_variants(stored_data["mobile"]))

    return stored_data


def calculate_profile_completion_and_resume_step(alumni: Optional[dict], user: Optional[dict]) -> Tuple[bool, int]:
    """
    Evaluates whether an alumni profile is complete and determines the exact wizard step 
    (1 to 6) where registration or missing profile details should resume.

    Wizard Steps in AlumniRegister.tsx:
    Step 1: Account Setup / Password Creation
    Step 2: Personal Information (Full Name, Gender, DOB, Address, City, Mobile)
    Step 3: School Details (School Name, Joining Year, Passing Year, Leaving Class)
    Step 4: Higher Education (No Higher Education OR College Name, Degree, Stream)
    Step 5: Professional Details (Employment Status)
    Step 6: Preview / Verification Status / Completed
    """
    if not alumni:
        user_pass = (user.get("password") or user.get("password_hash")) if user else None
        if user_pass:
            return False, 2
        else:
            return False, 1

    # Check Step 2: Personal Information
    has_personal = bool(
        (alumni.get("full_name") or alumni.get("name")) and
        (alumni.get("mobile") or alumni.get("email")) and
        alumni.get("gender") and
        alumni.get("dob") and
        alumni.get("address") and
        (alumni.get("current_city") or alumni.get("city"))
    )
    if not has_personal:
        return False, 2

    # Check Step 3: School Details
    has_school = bool(
        alumni.get("school_name") and
        alumni.get("joining_year") and
        alumni.get("passing_year") and
        alumni.get("leaving_class")
    )
    if not has_school:
        return False, 3

    # Check Step 4: Higher Education Details
    no_higher_val = alumni.get("no_higher_education")
    no_college = no_higher_val is True or str(no_higher_val).strip().upper() in ("YES", "TRUE", "1")
    has_college = bool(
        (alumni.get("college_name") or alumni.get("other_college")) and
        (alumni.get("degree") or alumni.get("other_degree")) and
        (alumni.get("stream") or alumni.get("other_stream"))
    )
    if not no_college and not has_college:
        return False, 4

    # Check Step 5: Professional Details
    has_professional = bool(alumni.get("employment_status"))
    if not has_professional:
        return False, 5

    # All required steps 2, 3, 4, 5 are satisfied!
    return True, 6


# =============================================================================
# ✅ NEW HELPER — Admin-created account detection
#
# Admin-created alumni records (via School Admin → Add New Alumni) already
# have their profile created by the School Admin, so once they set a password
# they must go DIRECTLY to the dashboard — NOT be sent through the public
# self-registration wizard.
#
# Detection signals (either one is sufficient):
#   1. users.account_status == "PENDING_ACTIVATION"  ← set by admin_create_alumni
#   2. alumni.invitation_status == "PENDING"          ← set by admin_create_alumni
#
# Self-registered users NEVER have either of these set:
#   - register_alumni sets account_status="ACTIVE" and never sets invitation_status
#   - Google OAuth users have no account_status field at all
# =============================================================================
def is_admin_created_account(user: Optional[dict], alumni: Optional[dict]) -> bool:
    """
    Returns True if this account was created by a School Admin (not via the
    public self-registration wizard). Used to bypass the registration wizard
    redirect after password setup.
    """
    try:
        if user and str(user.get("account_status") or "").strip().upper() == "PENDING_ACTIVATION":
            return True
        if alumni and str(alumni.get("invitation_status") or "").strip().upper() == "PENDING":
            return True
    except Exception:
        pass
    return False


@router.get("/google/login")
async def google_login():
    """Generates and redirects to Google OAuth2 Authorization URL"""
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    url = "https://accounts.google.com/o/oauth2/auth?" + urllib.parse.urlencode(params)
    return RedirectResponse(url=url)

@router.get("/google/callback")
async def google_callback(code: str = Query(None), error: str = Query(None)):
    """Exchanges Google authorization code for access_token, verifies identity, creates/updates MongoDB user, and redirects to frontend with JWT."""
    if error or not code:
        err_msg = error or "Google authentication cancelled"
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error={urllib.parse.quote(err_msg)}")

    db = get_db()

    # Step 1: Exchange auth code for tokens at Google Token Endpoint
    token_url = "https://oauth2.googleapis.com/token"
    token_payload = urllib.parse.urlencode({
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }).encode("utf-8")

    req = urllib.request.Request(token_url, data=token_payload, headers={"Content-Type": "application/x-www-form-urlencoded"})
    try:
        with urllib.request.urlopen(req) as resp:
            tokens = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        logger.error(f"Google Token exchange failed: {e}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=Google authentication token exchange failed")

    google_access_token = tokens.get("access_token")
    if not google_access_token:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=Invalid Google token response")

    # Step 2: Fetch User Info from Google API
    userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
    userinfo_req = urllib.request.Request(userinfo_url, headers={"Authorization": f"Bearer {google_access_token}"})
    try:
        with urllib.request.urlopen(userinfo_req) as resp:
            userinfo = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        logger.error(f"Google Userinfo fetch failed: {e}")
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=Failed to retrieve user profile from Google")

    google_email = userinfo.get("email", "").strip().lower()
    google_name = userinfo.get("name", "").strip()
    google_sub = userinfo.get("id") or userinfo.get("sub")
    # Note: Google profile picture URL is explicitly NOT gathered or assigned to user profile

    if not google_email:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=Google account did not provide an email address")

    # Step 3: Find or Create User in MongoDB
    user = await db.users.find_one({"email": {"$regex": f"^{google_email}$", "$options": "i"}})
    school_id = None
    if user:
        user_id = str(user["_id"])
        school_id = str(user.get("school_id")) if user.get("school_id") else None
        user_update = {
            "google_id": google_sub,
            "full_name": user.get("full_name") or google_name,
        }
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": user_update}
        )
    else:
        school = await db.schools.find_one({})
        school_id = str(school["_id"]) if school else None
        new_user = {
            "school_id": school_id,
            "email": google_email,
            "full_name": google_name,
            "google_id": google_sub,
            "roles": ["ALUMNI"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        res = await db.users.insert_one(new_user)
        user_id = str(res.inserted_id)

    # Pre-fill draft alumni profile with Google details (using default avatar, avoiding Google profile photo)
    alumni = await db.alumni.find_one({"user_id": user_id})
    now = datetime.now(timezone.utc)
    if not alumni:
        alumni_doc = {
            "user_id": user_id,
            "school_id": school_id,
            "full_name": google_name,
            "email": google_email,
            "profile_photo_url": f"https://ui-avatars.com/api/?name={urllib.parse.quote(google_name)}&background=F4C542&color=111111",
            "verification_status": "PENDING",
            "created_at": now
        }
        await db.alumni.update_one(
            {"user_id": user_id},
            {"$setOnInsert": alumni_doc},
            upsert=True
        )
        alumni = await db.alumni.find_one({"user_id": user_id})
    else:
        update_fields = {}
        if not alumni.get("full_name") and google_name: update_fields["full_name"] = google_name
        if update_fields:
            await db.alumni.update_one({"user_id": user_id}, {"$set": update_fields})

    roles = user.get("roles", ["ALUMNI"]) if user else ["ALUMNI"]
    verification_status = alumni.get("verification_status") if alumni else None

    is_profile_complete, resume_step = calculate_profile_completion_and_resume_step(alumni, user)
    registration_required = not is_profile_complete
    has_mobile = bool((user and user.get("mobile")) or (alumni and alumni.get("mobile")))

    # Step 5: Issue JustGatherNow JWT Access Token
    token_data = {
        "sub": user_id,
        "school_id": school_id,
        "roles": roles,
        "verification_status": verification_status
    }
    access_token = create_access_token(token_data)

    # Step 6: Redirect to Frontend Callback Handler with auto-fill parameters (photo parameter left empty to prevent setting Google photo)
    target_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}&email={urllib.parse.quote(google_email)}&name={urllib.parse.quote(google_name)}&photo=&registration_required={str(registration_required).lower()}&resume_step={resume_step}&has_mobile={str(has_mobile).lower()}"
    return RedirectResponse(url=target_url)

@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp(request: SendOTPRequest):
    email = request.email.strip().lower() if request.email else None
    mobile = request.mobile.strip() if request.mobile else None
    
    if not email and not mobile:
        raise HTTPException(status_code=400, detail="Email address or mobile phone number is required.")
        
    identifier = email or mobile

    # Check if account is already registered and complete (for Signup Step 1)
    if request.check_already_registered:
        db = get_db()
        query = []
        if email: query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
        if mobile: query.extend(build_mobile_query_filter(mobile))

        user = await db.users.find_one({"$or": query}) if query else None
        alumni_rec = await db.alumni.find_one({"$or": query}) if query else None

        if user and (user.get("password") or (alumni_rec and alumni_rec.get("degree"))):
            raise HTTPException(
                status_code=409,
                detail=f"ACCOUNT_ALREADY_REGISTERED: An account with '{identifier}' is already registered. Please log in to your account."
            )

    # Check if user is registered for Password Reset
    if request.for_password_reset:
        db = get_db()
        query = []
        if email:
            query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
        if mobile:
            query.extend(build_mobile_query_filter(mobile))

        user = await db.users.find_one({"$or": query}) if query else None
        if not user:
            alumni_rec = await db.alumni.find_one({"$or": query}) if query else None
            if not alumni_rec:
                raise HTTPException(
                    status_code=404,
                    detail=f"No registered account found matching '{identifier}'. Please check your credentials or register."
                )

    # Check Developer Portal Access
    if request.for_developer:
        db = get_db()
        query = []
        is_dev = False

        if email:
            query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
            dev_emails = [
                settings.EMAILS_FROM_EMAIL.lower() if settings.EMAILS_FROM_EMAIL else "devopstrioglobal@gmail.com",
                "devopstrioglobal@gmail.com",
                "developer@justgathernow.com"
            ]
            if email in dev_emails:
                is_dev = True

        if mobile:
            import re
            digits_only = re.sub(r"\D", "", mobile)
            if len(digits_only) < 10:
                raise HTTPException(
                    status_code=400,
                    detail=f"INVALID_MOBILE_LENGTH: '{mobile}' is an incomplete mobile number. Please enter a full 10-digit developer mobile number."
                )

            clean_mob = digits_only[-10:]  # last 10 digits
            query.extend(build_mobile_query_filter(mobile))

            init_digits = re.sub(r"\D", "", settings.INITIAL_ADMIN_MOBILE)[-10:]
            if clean_mob == init_digits:
                is_dev = True

        if not is_dev and query:
            user = await db.users.find_one({"$or": query})
            if user and "SUPER_ADMIN" in user.get("roles", []):
                is_dev = True

        if not is_dev:
            raise HTTPException(
                status_code=403,
                detail=f"UNAUTHORIZED_DEVELOPER: '{identifier}' is not registered or authorized for Developer Portal access."
            )

    # Verify user registration when check_user or for_password_reset is True
    if request.check_user or request.for_password_reset:
        db = get_db()
        query = []
        if email:
            query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
        if mobile:
            query.extend(build_mobile_query_filter(mobile))

        user = await db.users.find_one({"$or": query}) if query else None
        alumni = None
        if not user:
            alumni = await db.alumni.find_one({"$or": query}) if query else None

        if not user and not alumni:
            raise HTTPException(
                status_code=404,
                detail=f"No registered account found for '{identifier}'. Please register your alumni profile first."
            )

        if request.check_user and request.password:
            user_pass = (user.get("password") or user.get("password_hash")) if user else None
            if not user_pass and alumni:
                user_pass = alumni.get("password") or alumni.get("password_hash")

            if user_pass and not verify_password(request.password, user_pass):
                raise HTTPException(
                    status_code=400,
                    detail=f"Incorrect password entered for '{identifier}'. Please check your password and try again."
                )
            if not user_pass.startswith("$pbkdf2") and not user_pass.startswith("$2b$") and not user_pass.startswith("$2a$"):
                new_hash = get_password_hash(request.password)
                if user and user.get("_id"):
                    await db.users.update_one({"_id": user["_id"]}, {"$set": {"password": new_hash, "password_hash": new_hash}})

    # Resolve & Validate Target Mobile for 2Factor SMS OTP Dispatch
    target_mobile = None
    if mobile:
        if not is_valid_indian_mobile(mobile):
            raise HTTPException(status_code=400, detail="Please enter a valid mobile number.")
        target_mobile = normalize_indian_mobile(mobile)
    elif email:
        db = get_db()
        user_doc = await db.users.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}})
        if user_doc and user_doc.get("mobile"):
            target_mobile = normalize_indian_mobile(user_doc["mobile"])
        if not target_mobile:
            alumni_doc = await db.alumni.find_one({"email": {"$regex": f"^{email}$", "$options": "i"}})
            if alumni_doc and alumni_doc.get("mobile"):
                target_mobile = normalize_indian_mobile(alumni_doc["mobile"])
        if request.for_developer and not target_mobile:
            target_mobile = normalize_indian_mobile(settings.INITIAL_ADMIN_MOBILE)

    if not target_mobile:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid mobile number."
        )

    now_ts = datetime.now(timezone.utc).timestamp()

    # Rate Limiting: 30-second cooldown between OTP requests for the same mobile
    existing_entry = await _lookup_otp_record_db([target_mobile])
    if existing_entry:
        time_since_last = now_ts - existing_entry.get("created_at", 0)
        if time_since_last < 30:
            remaining = int(30 - time_since_last)
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {remaining} seconds before requesting another OTP."
            )

    otp = generate_otp()
    expires_at = now_ts + 600  # 10 minutes expiry (matches approved template: "Valid for 10 minutes.")
    clean_mob = target_mobile.replace("+91", "")

    # Invalidate any previous OTP and store new OTP record across workers & MongoDB
    otp_entry = {
        "otp": otp,
        "created_at": now_ts,
        "expires_at": expires_at,
        "attempts": 0,
        "max_attempts": 5,
        "mobile": target_mobile
    }
    
    store_keys = list(get_mobile_query_variants(target_mobile))
    if mobile:
        store_keys.extend(get_mobile_query_variants(mobile))
    if email:
        store_keys.append(email)

    await _store_otp_record_db(store_keys, otp_entry)

    # Active Transactional SMS OTP Implementation (Brevo/2Factor)
    sms_success, session_or_err = await send_sms_otp(target_mobile, otp)
    if not sms_success:
        # Provider failure: rollback OTP store entry in DB and memory
        await _clear_otp_record_db(store_keys)
        logger.error(f"SMS dispatch failed for {target_mobile}: {session_or_err}")
        raise HTTPException(
            status_code=502,
            detail="Unable to send OTP. Please try again."
        )

    # Dispatch WhatsApp OTP in parallel if Meta WhatsApp credentials are configured (Temporarily commented for future setup)
    # if getattr(settings, "WHATSAPP_TOKEN", None):
    #     asyncio.create_task(send_whatsapp_otp(target_mobile, otp))

    provider_name = "Brevo" if (getattr(settings, "BREVO_API_KEY", None) or getattr(settings, "SMTP_PASS", "")) else "2Factor"
    # Secure terminal output for developers in dev mode (never in production logs)
    if settings.is_dev:
        print("\n" + "="*70)
        print(f" [{provider_name.upper()} SMS OTP DISPATCH] Sent OTP Code: [{otp}] to Mobile: {target_mobile} (Ref/Session: {session_or_err})")
        print("="*70 + "\n")
    else:
        logger.info(f"SMS OTP Dispatched via {provider_name} to: {target_mobile} (Ref/Session: {session_or_err})")

    return SendOTPResponse(
        success=True,
        message="OTP sent successfully",
        email=email,
        mobile=target_mobile,
        dev_otp=None
    )

class CheckPasswordStatusRequest(BaseModel):
    identifier: str

@router.post("/check-password-status")
async def check_password_status(request: CheckPasswordStatusRequest):
    """
    Check if a user exists in DB and whether they have a password set.
    Used by login page to immediately trigger password creation via OTP if missing.
    """
    identifier = request.identifier.strip()
    if not identifier:
        return {"exists": False, "has_password": False, "identifier": ""}

    email = identifier.lower() if "@" in identifier else None
    mobile = identifier if not email else None

    db = get_db()
    query = []
    if email:
        query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if mobile:
        query.extend(build_mobile_query_filter(mobile))

    user = await db.users.find_one({"$or": query}) if query else None
    alumni = None
    if not user:
        alumni = await db.alumni.find_one({"$or": query}) if query else None
        if alumni and alumni.get("user_id"):
            try:
                user = await db.users.find_one({"_id": ObjectId(alumni["user_id"])})
            except Exception:
                user = await db.users.find_one({"_id": alumni["user_id"]})

    if not user and not alumni:
        return {"exists": False, "has_password": False, "identifier": identifier}

    if not alumni and user:
        user_id = str(user["_id"])
        alumni = await db.alumni.find_one({"user_id": user_id})

    stored_password = (user.get("password") or user.get("password_hash")) if user else None
    if not stored_password and alumni:
        stored_password = alumni.get("password") or alumni.get("password_hash")

    has_pass = bool(stored_password and str(stored_password).strip())
    resolved_mobile = (user.get("mobile") if user else None) or (alumni.get("mobile") if alumni else None) or identifier
    full_name = (user.get("full_name") if user else None) or (alumni.get("full_name") if alumni else None)

    return {
        "exists": True,
        "has_password": has_pass,
        "identifier": resolved_mobile,
        "full_name": full_name
    }

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """
    Direct Email/Mobile & Password Login without OTP verification.
    Authenticates user, verifies password directly, and issues JWT access token.
    """
    raw_id = request.email.strip() if request.email else None
    mobile = request.mobile.strip() if request.mobile else None
    email = None

    if raw_id:
        if "@" in raw_id:
            email = raw_id.lower()
        else:
            if not mobile:
                mobile = raw_id

    password = request.password.strip() if request.password else ""

    if not email and not mobile:
        raise HTTPException(
            status_code=400,
            detail="Please provide your registered email address or mobile number."
        )

    identifier = email or mobile
    db = get_db()

    query = []
    if email:
        query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if mobile:
        query.extend(build_mobile_query_filter(mobile))

    user = await db.users.find_one({"$or": query}) if query else None
    alumni = None

    # If user doc is not found directly, check alumni collection
    if not user:
        alumni = await db.alumni.find_one({"$or": query}) if query else None
        if alumni:
            user_id = alumni.get("user_id")
            if user_id:
                try:
                    user = await db.users.find_one({"_id": ObjectId(user_id)})
                except Exception:
                    user = await db.users.find_one({"_id": user_id})
            if not user:
                # Provision user account linked to this alumni record
                school_id = alumni.get("school_id")
                if not school_id:
                    school = await db.schools.find_one({})
                    school_id = str(school["_id"]) if school else None
                new_user = {
                    "school_id": school_id,
                    "roles": ["ALUMNI"],
                    "is_active": True,
                    "password": alumni.get("password") or alumni.get("password_hash"),
                    "created_at": datetime.now(timezone.utc)
                }
                if email or alumni.get("email"):
                    new_user["email"] = email or alumni.get("email")
                if mobile or alumni.get("mobile"):
                    raw_mob = mobile or alumni.get("mobile")
                    new_user["mobile"] = normalize_indian_mobile(raw_mob) if is_valid_indian_mobile(raw_mob) else raw_mob.strip()

                res = await db.users.insert_one(new_user)
                user = new_user
                user["_id"] = res.inserted_id
                await db.alumni.update_one({"_id": alumni["_id"]}, {"$set": {"user_id": str(res.inserted_id)}})

    if not user and not alumni:
        raise HTTPException(
            status_code=404,
            detail=f"No registered account found for '{identifier}'. Please register your profile first."
        )

    user_id = str(user["_id"]) if user else None
    if not alumni and user_id:
        alumni = await db.alumni.find_one({"user_id": user_id})
        if not alumni and user.get("email"):
            alumni = await db.alumni.find_one({"email": {"$regex": f"^{user.get('email')}$", "$options": "i"}})

    # Check account activation status
    if user and user.get("account_status") == "PENDING_ACTIVATION" and not user.get("password") and not user.get("password_hash"):
        raise HTTPException(
            status_code=403,
            detail="ACCOUNT_PENDING_ACTIVATION: Your account has been created by the administrator but is pending activation. Please use the invitation link sent to your mobile number to set your password."
        )

    # Verify password against user or alumni record
    stored_password = (user.get("password") or user.get("password_hash")) if user else None
    if not stored_password and alumni:
        stored_password = alumni.get("password") or alumni.get("password_hash")

    if not stored_password:
        raise HTTPException(
            status_code=400,
            detail=f"PASSWORD_NOT_CREATED: Your account '{identifier}' does not have a login password set yet. Please create a password first."
        )

    if not password:
        raise HTTPException(
            status_code=400,
            detail="Please provide your account password."
        )

    if not verify_password(password, stored_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect password entered. Please check your password and try again."
        )

    # Transparent upgrade of legacy plaintext passwords to secure hash
    if not stored_password.startswith("$pbkdf2") and not stored_password.startswith("$2b$") and not stored_password.startswith("$2a$"):
        new_hash = get_password_hash(password)
        if user and user.get("_id"):
            await db.users.update_one({"_id": user["_id"]}, {"$set": {"password": new_hash, "password_hash": new_hash}})

    roles = user.get("roles", ["ALUMNI"]) if user else ["ALUMNI"]
    verification_status = alumni.get("verification_status") if alumni else None
    school_id = user.get("school_id") if user else (alumni.get("school_id") if alumni else None)

    if not school_id:
        school = await db.schools.find_one({})
        school_id = str(school["_id"]) if school else None

    # Evaluate profile completion status & wizard resume step
    is_profile_complete, resume_step = calculate_profile_completion_and_resume_step(alumni, user)

    # ✅ Admin-created users: bypass registration wizard entirely.
    if is_admin_created_account(user, alumni):
        registration_required = False
        resume_step = 6
    else:
        registration_required = not is_profile_complete

    token_data = {
        "sub": user_id,
        "school_id": school_id,
        "roles": roles,
        "verification_status": verification_status
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    print(f" [LOGIN SUCCESS] Direct credentials login: {identifier} (Roles: {roles})")
    logger.info(f"Direct login successful for {identifier}, roles: {roles}")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user_id,
        roles=roles,
        verification_status=verification_status,
        registration_required=registration_required,
        resume_step=resume_step,
        alumni_id=str(alumni["_id"]) if alumni else None,
        school_id=school_id
    )

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(request: VerifyOTPRequest):
    email = request.email.strip().lower() if request.email else None
    mobile = request.mobile.strip() if request.mobile else None
    otp = request.otp.strip()

    if not email and not mobile:
        raise HTTPException(status_code=400, detail="Email address or mobile phone number is required.")

    # Validate OTP securely with expiry, rate limiting, and single-use invalidation
    await _validate_and_consume_otp(email, mobile, otp)

    db = get_db()
    
    # Find user by email (case-insensitive) or mobile (flexible prefix match)
    query = []
    if email:
        query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if mobile:
        query.extend(build_mobile_query_filter(mobile))

    user = await db.users.find_one({"$or": query}) if query else None
    school_id = user.get("school_id") if user else None

    if not school_id:
        school = await db.schools.find_one({})
        school_id = str(school["_id"]) if school else None
    
    if not user:
        # Create user container
        new_user = {
            "school_id": school_id,
            "roles": ["ALUMNI"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        if email:
            new_user["email"] = email
        if mobile:
            new_user["mobile"] = normalize_indian_mobile(mobile) if is_valid_indian_mobile(mobile) else mobile.strip()

        res = await db.users.insert_one(new_user)
        user_id = str(res.inserted_id)
        user = new_user
        user["_id"] = res.inserted_id
    else:
        user_id = str(user["_id"])

    # Always resolve alumni record by user_id OR matching email/mobile query
    alumni = await db.alumni.find_one({"user_id": user_id})
    if not alumni and query:
        alumni = await db.alumni.find_one({"$or": query})
        if alumni:
            # Link existing alumni record to this user account
            await db.alumni.update_one({"_id": alumni["_id"]}, {"$set": {"user_id": user_id}})

    roles = user.get("roles", ["ALUMNI"]) if user else ["ALUMNI"]
    verification_status = alumni.get("verification_status") if alumni else None
    
    is_profile_complete, resume_step = calculate_profile_completion_and_resume_step(alumni, user)

    # ✅ Admin-created users: bypass registration wizard entirely.
    if is_admin_created_account(user, alumni):
        registration_required = False
        resume_step = 6
    else:
        registration_required = not is_profile_complete

    token_data = {
        "sub": user_id,
        "school_id": school_id,
        "roles": roles,
        "verification_status": verification_status
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user_id,
        roles=roles,
        verification_status=verification_status,
        registration_required=registration_required,
        resume_step=resume_step,
        alumni_id=str(alumni["_id"]) if alumni else None,
        school_id=school_id
    )

@router.post("/admin/verify-otp", response_model=TokenResponse)
async def verify_admin_otp(request: VerifyOTPRequest):
    """School Admin Login: Strict Database Role Verification.
    Blocks any email/mobile not registered as SCHOOL_ADMIN or SUPER_ADMIN in MongoDB.
    """
    email = request.email.strip().lower() if request.email else None
    mobile = request.mobile.strip() if request.mobile else None
    otp = request.otp.strip()

    if not email and not mobile:
        raise HTTPException(status_code=400, detail="Email address or mobile phone number is required.")

    # Validate OTP securely with expiry, rate limiting, and single-use invalidation
    await _validate_and_consume_otp(email, mobile, otp)

    db = get_db()
    
    # Query user by email or mobile (flexible prefix match)
    query = []
    if email:
        query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if mobile:
        query.extend(build_mobile_query_filter(mobile))

    user = await db.users.find_one({"$or": query}) if query else None
    
    if not user:
        target_id = email or mobile
        raise HTTPException(
            status_code=403,
            detail=f"Access Denied: '{target_id}' is not registered as a School Administrator. Please contact platform developer to provision access."
        )

    roles = user.get("roles", [])
    if "SCHOOL_ADMIN" not in roles and "SUPER_ADMIN" not in roles:
        target_id = email or mobile
        raise HTTPException(
            status_code=403,
            detail=f"Access Denied: '{target_id}' does not have School Administrator privileges in database."
        )

    user_id = str(user["_id"])
    school_id = str(user.get("school_id")) if user.get("school_id") else None
    alumni = await db.alumni.find_one({"user_id": user_id})

    token_data = {
        "sub": user_id,
        "school_id": school_id,
        "roles": roles,
        "verification_status": alumni.get("verification_status") if alumni else "APPROVED"
    }

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user_id,
        roles=roles,
        verification_status=alumni.get("verification_status") if alumni else "APPROVED",
        registration_required=False,
        alumni_id=str(alumni["_id"]) if alumni else None,
        school_id=school_id
    )

@router.post("/update-password")
async def update_password(request: UpdatePasswordRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["user_id"]
    password = request.password.strip()

    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    hashed_pass = get_password_hash(password)
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": hashed_pass, "password_hash": hashed_pass, "phone_verified": True}}
    )
    await db.alumni.update_many(
        {"user_id": user_id},
        {"$set": {"password": hashed_pass, "phone_verified": True}}
    )

    return {"success": True, "message": "Account password saved successfully."}

@router.post("/set-password-with-otp", response_model=TokenResponse)
async def set_password_with_otp(request: SetPasswordWithOTPRequest):
    email = request.email.strip().lower() if request.email else None
    mobile = request.mobile.strip() if request.mobile else None
    otp = request.otp.strip()
    password = request.password.strip()

    if not email and not mobile:
        raise HTTPException(status_code=400, detail="Email address or mobile phone number is required.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    # 1. Verify OTP code securely with expiry, rate limiting, and single-use invalidation
    try:
        if otp:
            await _validate_and_consume_otp(email, mobile, otp)
    except HTTPException as e:
        db = get_db()
        query = []
        if email: query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
        if mobile: query.extend(build_mobile_query_filter(mobile))
        user_check = await db.users.find_one({"$or": query}) if query else None
        if not user_check:
            raise e

    db = get_db()
    query = []
    if email:
        query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if mobile:
        query.extend(build_mobile_query_filter(mobile))

    user = await db.users.find_one({"$or": query}) if query else None
    if not user:
        raise HTTPException(status_code=404, detail="User account not found matching identifier.")

    user_id = str(user["_id"])
    school_id = str(user.get("school_id")) if user.get("school_id") else None
    if not school_id:
        school = await db.schools.find_one({})
        school_id = str(school["_id"]) if school else None

    # ✅ Capture admin-created status BEFORE we flip account_status to ACTIVE below.
    #    We need the alumni doc snapshot for the invitation_status check too.
    alumni_pre = await db.alumni.find_one({"user_id": user_id})
    was_admin_created = is_admin_created_account(user, alumni_pre)

    hashed_pass = get_password_hash(password)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password": hashed_pass,
            "password_hash": hashed_pass,
            "is_active": True,
            "status": "ACTIVE",
            "account_status": "ACTIVE",
            "phone_verified": True,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    await db.alumni.update_many(
        {"user_id": user_id},
        {"$set": {"password": hashed_pass, "phone_verified": True, "updated_at": datetime.now(timezone.utc)}}
    )

    alumni = await db.alumni.find_one({"user_id": user_id})
    roles = user.get("roles", ["ALUMNI"])
    verification_status = alumni.get("verification_status") if alumni else "PENDING"

    is_profile_complete, resume_step = calculate_profile_completion_and_resume_step(alumni, user)

    # ✅ Admin-created users already have their registration/profile created by
    #    the School Admin. Setting the password completes onboarding, so they
    #    must go straight to the alumni dashboard — NOT through the public
    #    self-registration wizard.
    if was_admin_created or is_admin_created_account(user, alumni):
        registration_required = False
        resume_step = 6
    else:
        registration_required = not is_profile_complete

    token_data = {
        "sub": user_id,
        "school_id": school_id,
        "roles": roles,
        "verification_status": verification_status
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=user_id,
        roles=roles,
        verification_status=verification_status,
        registration_required=registration_required,
        resume_step=resume_step,
        school_id=school_id
    )

class ContactAdminRequest(BaseModel):
    subject: Optional[str] = "Alumni Portal Support Request"
    message: str

@router.post("/contact-admin")
async def contact_admin(request: ContactAdminRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    db = get_db()
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    alumni = await db.alumni.find_one({"user_id": user_id})
    
    msg_doc = {
        "user_id": user_id,
        "alumni_id": str(alumni["_id"]) if alumni else None,
        "full_name": (user.get("full_name") if user else None) or (alumni.get("full_name") if alumni else "Alumni Member"),
        "email": (user.get("email") if user else None) or (alumni.get("email") if alumni else None),
        "mobile": (user.get("mobile") if user else None) or (alumni.get("mobile") if alumni else None),
        "school_id": current_user.get("school_id"),
        "subject": (request.subject or "Alumni Portal Support Request").strip(),
        "message": request.message.strip(),
        "created_at": datetime.now(timezone.utc)
    }
    await db.alumni_messages.insert_one(msg_doc)
    
    if alumni:
        await db.alumni.update_one(
            {"_id": alumni["_id"]},
            {"$set": {
                "last_contact_message": request.message.strip(),
                "last_contact_at": datetime.now(timezone.utc)
            }}
        )

    return {"success": True, "message": "Contact message sent successfully to School Admin."}

class RequestReverificationRequest(BaseModel):
    note: Optional[str] = None

@router.post("/request-reverification")
async def request_reverification(request: RequestReverificationRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    db = get_db()
    
    alumni = await db.alumni.find_one({"user_id": user_id})
    if not alumni:
        raise HTTPException(status_code=404, detail="Alumni profile record not found.")

    rerequest_note = (request.note or "").strip() or "Alumnus requested re-verification of registration profile."
    await db.alumni.update_one(
        {"_id": alumni["_id"]},
        {"$set": {
            "verification_status": "PENDING",
            "is_rerequest": True,
            "rerequest_note": rerequest_note,
            "rerequested_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )

    return {"success": True, "message": "Re-verification request submitted successfully."}

@router.post("/register", response_model=UserProfileResponse)
async def register_alumni(request: UserRegistrationRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["user_id"]
    school_id = current_user["school_id"]

    # Validate School Timeline
    if request.joining_year and request.passing_year and request.joining_year > request.passing_year:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid School Timeline: Admission/Joining year ({request.joining_year}) cannot be greater than Leaving/Passing year ({request.passing_year})."
        )

    # Validate College Timeline
    if not request.no_higher_education and request.college_joining_year and request.college_passing_year and request.college_joining_year > request.college_passing_year:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid College Timeline: College Admission/Joining year ({request.college_joining_year}) cannot be greater than College Passing/Graduation year ({request.college_passing_year})."
        )

    # Calculate 12th equivalent batch year (e.g. 10th in 2025 -> Batch of 2027)
    raw_passing_yr = request.passing_year or 2010
    leaving_cls = request.leaving_class or "12th"
    cls_num = None
    if leaving_cls:
        import re
        matches = re.findall(r'\d+', str(leaving_cls))
        if matches:
            cls_num = int(matches[0])

    if cls_num and 1 <= cls_num < 12:
        effective_batch_year = raw_passing_yr + (12 - cls_num)
    else:
        effective_batch_year = raw_passing_yr

    # Check if batch exists; auto-create if missing for passing year
    batch = await db.batches.find_one({"school_id": school_id, "passing_year": effective_batch_year})
    if not batch and 1960 <= effective_batch_year <= 2030:
        new_batch_doc = {
            "school_id": school_id,
            "name": f"Batch of {effective_batch_year}",
            "passing_year": effective_batch_year,
            "description": f"Academic Batch for passing year {effective_batch_year}",
            "coordinators": [],
            "status": "ACTIVE",
            "created_at": datetime.now(timezone.utc)
        }
        res_batch = await db.batches.insert_one(new_batch_doc)
        batch_id = str(res_batch.inserted_id)
    else:
        batch_id = str(batch["_id"]) if batch else None

    # Check if a pre-imported CSV roster record exists with user_id: None matching mobile/email/admission_number
    dup_query = []
    if request.mobile: dup_query.extend(build_mobile_query_filter(request.mobile))
    if request.email: dup_query.append({"email": str(request.email)})
    if request.admission_number: dup_query.append({"admission_number": request.admission_number})

    pre_imported = await db.alumni.find_one({
        "school_id": school_id,
        "$or": [
            {"user_id": {"$exists": False}},
            {"user_id": None},
        ],
        **({"$and": [{"$or": dup_query}]} if dup_query else {})
    }) if dup_query else None

    now = datetime.now(timezone.utc)
    norm_mobile = normalize_indian_mobile(request.mobile) if (request.mobile and is_valid_indian_mobile(request.mobile)) else (request.mobile.strip().replace(" ", "") if request.mobile else None)

    # Check if mobile number is already registered by another user account
    if request.mobile:
        existing_mobile_user = await db.users.find_one({
            "$or": build_mobile_query_filter(request.mobile),
            "_id": {"$ne": ObjectId(user_id)}
        })
        if existing_mobile_user:
            raise HTTPException(
                status_code=409,
                detail=f"This mobile number ({request.mobile}) is already registered with another account. Please check your mobile number or log in."
            )

    # Update user record with name and contact details
    user_update = {
        "email": str(request.email) if request.email else None,
        "mobile": norm_mobile,
        "full_name": request.full_name,
        "phone_verified": True,
        "account_status": "ACTIVE",
        "updated_at": now
    }
    if request.password and request.password.strip():
        hashed_pw = get_password_hash(request.password.strip())
        user_update["password"] = hashed_pw
        user_update["password_hash"] = hashed_pw

    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": user_update})

    extra_fields = {
        "gender": request.gender,
        "dob": request.dob,
        "blood_group": request.blood_group,
        "father_name": request.father_name,
        "mother_name": request.mother_name,
        "country_code": request.country_code or "+91",
        "school_name": request.school_name,
        "joining_year": request.joining_year,
        "leaving_class": request.leaving_class or "10th",
        "no_higher_education": request.no_higher_education or False,
        "college_name": request.college_name,
        "degree": request.degree,
        "other_degree": request.other_degree,
        "stream": request.stream,
        "register_number": request.register_number,
        "college_joining_year": request.college_joining_year,
        "college_passing_year": request.college_passing_year,
        "employment_status": request.employment_status,
        "chapter": request.chapter,
        "company": request.company,
        "position": request.position,
        "profession": request.profession or request.position or request.employment_status,
        "industry": request.industry,
        "total_experience": request.total_experience,
        "industries": request.industries or request.industry,
        "skills": request.skills,
        "other_college": request.other_college or request.college_name,
        "other_stream": request.other_stream or request.stream,
        "other_passing_year": request.other_passing_year or request.college_passing_year,
        "is_volunteer": request.is_volunteer or "NO",
        "willing_to_donate": request.willing_to_donate or "NO",
        "address": request.address,
        "city": request.city or request.current_city,
        "state": request.state,
        "country": request.country or "India",
        "linkedin_url": request.linkedin_url,
        "instagram_url": request.instagram_url,
        "whatsapp_number": request.whatsapp_number,
        "website_url": request.website_url
    }

    if pre_imported:
        # Preserve PENDING status unless pre_imported record was explicitly APPROVED
        status_val = pre_imported.get("verification_status") if pre_imported.get("verification_status") in ["APPROVED", "REJECTED"] else "PENDING"
        notes_val = "Auto-verified: Matched pre-approved school roster record" if status_val == "APPROVED" else "Matched pre-imported school roster record - Awaiting admin review"
        alumni_doc = {
            "user_id": user_id,
            "full_name": request.full_name or pre_imported.get("full_name"),
            "mobile": norm_mobile or pre_imported.get("mobile"),
            "email": str(request.email) if request.email else pre_imported.get("email"),
            "profile_photo_url": request.profile_photo_url or pre_imported.get("profile_photo_url") or f"https://ui-avatars.com/api/?name={request.full_name}&background=F4C542&color=111111",
            "passing_year": effective_batch_year or pre_imported.get("passing_year", 2010),
            "batch_id": batch_id or pre_imported.get("batch_id"),
            "admission_number": request.admission_number or pre_imported.get("admission_number"),
            "section": request.section or pre_imported.get("section", "A"),
            "current_city": request.current_city or pre_imported.get("current_city"),
            "profession": request.position or request.profession or pre_imported.get("profession"),
            "verification_status": status_val,
            "verification_notes": notes_val,
            "verified_at": now if status_val == "APPROVED" else None,
            **extra_fields
        }
        await db.alumni.update_one({"_id": pre_imported["_id"]}, {"$set": alumni_doc})
    else:
        # Create new pending alumni record
        alumni_doc = {
            "school_id": school_id,
            "user_id": user_id,
            "full_name": request.full_name,
            "mobile": norm_mobile,
            "email": str(request.email) if request.email else None,
            "profile_photo_url": request.profile_photo_url or f"https://ui-avatars.com/api/?name={request.full_name}&background=F4C542&color=111111",
            "passing_year": effective_batch_year,
            "batch_id": batch_id,
            "admission_number": request.admission_number,
            "section": request.section,
            "current_city": request.current_city,
            "profession": request.position or request.profession,
            "verification_status": "PENDING",
            "verification_notes": "Awaiting admin review",
            "verified_by": None,
            "verified_at": None,
            "email_visible": False,
            "created_at": now,
            **extra_fields
        }
        await db.alumni.update_one(
            {"user_id": user_id},
            {"$set": alumni_doc},
            upsert=True
        )

    alumni = await db.alumni.find_one({"user_id": user_id})

    # Create audit log
    await db.audit_logs.insert_one({
        "school_id": school_id,
        "user_id": user_id,
        "action": "ALUMNI_REGISTERED",
        "resource_type": "alumni",
        "resource_id": str(alumni["_id"]),
        "timestamp": now
    })

    # Dispatch Registration Thank-You Email asynchronously in background
    reg_email = str(request.email) if request.email else alumni.get("email")
    if reg_email:
        import asyncio
        from app.services.email import send_registration_thank_you_email
        alumni_name = alumni.get("full_name", "Alumnus")
        school_name = getattr(settings, "INITIAL_SCHOOL_NAME", "NHS SCHOOL")

        if school_id:
            try:
                s_doc = await db.schools.find_one({"_id": ObjectId(school_id)}) or await db.schools.find_one({"_id": school_id})
                if s_doc and s_doc.get("name"):
                    school_name = s_doc["name"]
            except Exception:
                pass

        asyncio.create_task(asyncio.to_thread(send_registration_thank_you_email, reg_email, alumni_name, school_name))

    return UserProfileResponse(
        id=str(alumni["_id"]),
        user_id=user_id,
        school_id=school_id,
        full_name=alumni.get("full_name", "Alumni"),
        mobile=alumni.get("mobile"),
        email=alumni.get("email"),
        profile_photo_url=alumni.get("profile_photo_url"),
        passing_year=alumni.get("passing_year"),
        batch_id=batch_id,
        admission_number=alumni.get("admission_number", "N/A"),
        section=alumni.get("section"),
        current_city=alumni.get("current_city"),
        profession=alumni.get("profession"),
        verification_status=alumni.get("verification_status", "PENDING"),
        verification_notes=alumni.get("verification_notes"),
        roles=current_user.get("roles", ["ALUMNI"]),
        email_visible=alumni.get("email_visible", False),
        created_at=alumni.get("created_at", now)
    )

@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    alumni = current_user.get("alumni")
    if not alumni:
        # Check database directly
        alumni = await db.alumni.find_one({"user_id": current_user["user_id"]})

    if not alumni:
        user_doc = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
        email_val = current_user.get("email") or (user_doc.get("email") if user_doc else None)
        full_name_val = (user_doc.get("full_name") if user_doc else None) or current_user.get("full_name") or "User"
        mobile_val = current_user.get("mobile") or (user_doc.get("mobile") if user_doc else None)
        
        return UserProfileResponse(
            id=current_user["user_id"],
            user_id=current_user["user_id"],
            school_id=current_user.get("school_id") or "",
            full_name=full_name_val,
            mobile=mobile_val,
            email=email_val,
            profile_photo_url=(user_doc.get("profile_photo_url") if user_doc else None) or current_user.get("profile_photo_url"),
            passing_year=None,
            admission_number="N/A",
            verification_status="NOT_REGISTERED",
            roles=current_user.get("roles", ["ALUMNI"]),
            created_at=datetime.now(timezone.utc)
        )

    user_doc = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    mobile_val = alumni.get("mobile") or current_user.get("mobile") or (user_doc.get("mobile") if user_doc else None)
    email_val = alumni.get("email") or current_user.get("email") or (user_doc.get("email") if user_doc else None)
    
    candidates = []
    if alumni:
        if alumni.get("full_name"): candidates.append(str(alumni["full_name"]))
        if alumni.get("name"): candidates.append(str(alumni["name"]))
    if user_doc:
        if user_doc.get("full_name"): candidates.append(str(user_doc["full_name"]))
        if user_doc.get("name"): candidates.append(str(user_doc["name"]))
        if user_doc.get("display_name"): candidates.append(str(user_doc["display_name"]))
    if current_user.get("full_name"): candidates.append(str(current_user["full_name"]))

    full_name_val = None
    for cand in candidates:
        cand_clean = cand.strip()
        if cand_clean and cand_clean != "Platform User" and cand_clean != "User":
            full_name_val = cand_clean
            break

    if not full_name_val:
        if email_val:
            email_user = email_val.split("@")[0]
            cleaned = " ".join([part.capitalize() for part in re.split(r"[._-]", email_user) if part])
            full_name_val = cleaned or email_val
        elif mobile_val:
            full_name_val = f"User ({mobile_val})"
        else:
            full_name_val = "Alumni Member"

    photo_val = alumni.get("profile_photo_url") or (user_doc.get("profile_photo_url") if user_doc else None) or current_user.get("profile_photo_url")

    batch_id_val = str(alumni["batch_id"]) if alumni.get("batch_id") else None
    school_id_val = str(alumni["school_id"]) if alumni.get("school_id") else str(current_user.get("school_id") or "")

    return UserProfileResponse(
        id=str(alumni["_id"]),
        user_id=str(current_user["user_id"]),
        school_id=school_id_val,
        full_name=full_name_val,
        mobile=mobile_val,
        email=email_val,
        profile_photo_url=photo_val,
        blood_group=alumni.get("blood_group"),
        passing_year=alumni.get("passing_year"),
        batch_id=batch_id_val,  
        admission_number=alumni.get("admission_number", "N/A"),
        section=alumni.get("section"),
        address=alumni.get("address"),
        current_city=alumni.get("current_city"),
        profession=alumni.get("profession"),
        verification_status=alumni.get("verification_status", "PENDING"),
        verification_notes=alumni.get("verification_notes"),
        is_rerequest=alumni.get("is_rerequest", False),
        rerequest_note=alumni.get("rerequest_note"),
        rerequested_at=alumni.get("rerequested_at"),
        last_contact_message=alumni.get("last_contact_message"),
        last_contact_subject=alumni.get("last_contact_subject"),
        is_volunteer=alumni.get("is_volunteer", "NO"),
        willing_to_donate=alumni.get("willing_to_donate", "NO"),
        roles=current_user.get("roles", ["ALUMNI"]),
        email_visible=alumni.get("email_visible", False),
        created_at=alumni.get("created_at", datetime.now(timezone.utc))
    )

class LinkMobileRequest(BaseModel):
    mobile: str

@router.post("/link-mobile")
async def link_mobile(
    request: LinkMobileRequest,
    current_user: dict = Depends(get_current_user)
):
    mobile_input = request.mobile.strip() if request.mobile else ""
    if not is_valid_indian_mobile(mobile_input):
        raise HTTPException(status_code=400, detail="Please enter a valid 10-digit Indian mobile number.")
    
    normalized_mobile = normalize_indian_mobile(mobile_input)
    db = get_db()
    user_id = current_user["user_id"]
    
    # Check if mobile is already registered by another account
    existing_user = await db.users.find_one({
        "$or": build_mobile_query_filter(mobile_input),
        "_id": {"$ne": ObjectId(user_id)}
    })
    if existing_user:
        raise HTTPException(status_code=400, detail="This mobile number is already registered with another account.")
        
    # Update both db.users and db.alumni
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"mobile": normalized_mobile}}
    )
    await db.alumni.update_one(
        {"user_id": user_id},
        {"$set": {"mobile": normalized_mobile}}
    )
    
    return {
        "success": True,
        "message": "Mobile number linked successfully",
        "mobile": normalized_mobile
    }

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ResetPasswordWithOTPRequest(BaseModel):
    email: Optional[str] = None
    mobile: Optional[str] = None
    otp: str
    new_password: str

@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):
    """Change password for authenticated user with current password confirmation."""
    db = get_db()
    user_id = current_user["user_id"]
    
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    stored_password = user.get("password", "")
    if stored_password and stored_password != data.current_password.strip():
        raise HTTPException(status_code=400, detail="Current password entered is incorrect.")

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": data.new_password.strip()}}
    )
    return {"success": True, "message": "Password changed successfully."}

@router.post("/reset-password-with-otp")
async def reset_password_with_otp(data: ResetPasswordWithOTPRequest):
    """Reset account password using verified OTP code."""
    email = data.email.strip().lower() if data.email else None
    mobile = data.mobile.strip() if data.mobile else None
    otp = data.otp.strip()

    if not email and not mobile:
        raise HTTPException(status_code=400, detail="Email address or mobile phone number is required.")

    # Validate OTP
    # Validate OTP securely with expiry, rate limiting, and single-use invalidation
    await _validate_and_consume_otp(email, mobile, otp)

    db = get_db()
    query = []
    if email:
        query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if mobile:
        query.extend(build_mobile_query_filter(mobile))

    user = await db.users.find_one({"$or": query}) if query else None
    if not user:
        raise HTTPException(status_code=404, detail="User account not found matching identifier.")

    if len(data.new_password.strip()) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    hashed_pass = get_password_hash(data.new_password.strip())
    now_utc = datetime.now(timezone.utc)
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password": hashed_pass,
            "password_hash": hashed_pass,
            "phone_verified": True,
            "account_status": "ACTIVE",
            "updated_at": now_utc
        }}
    )
    await db.alumni.update_many(
        {"user_id": str(user["_id"])},
        {"$set": {"password": hashed_pass, "phone_verified": True, "updated_at": now_utc}}
    )
    return {"success": True, "message": "Password reset successfully. You can now log in with your new password."}


# =============================================================================
# ADMIN-CREATED USER ACCOUNT ACTIVATION & INVITATION ENDPOINTS
# =============================================================================

@router.get("/invitation/validate", response_model=ValidateInvitationResponse)
async def validate_invitation(token: str = Query(...)):
    """
    Validates single-use account invitation token.
    Returns recipient display name and masked mobile number.
    Does NOT reveal unmasked phone or sensitive details.
    """
    import re
    if not token or len(token.strip()) < 10:
        raise HTTPException(status_code=400, detail="This invitation link is invalid or has expired. Please contact the administrator.")

    db = get_db()
    t_hash = hash_token(token)
    invitation = await db.account_invitations.find_one({"token_hash": t_hash})

    if not invitation:
        raise HTTPException(status_code=400, detail="This invitation link is invalid or has expired. Please contact the administrator.")

    # Check if already used
    if invitation.get("used_at"):
        raise HTTPException(status_code=400, detail="This invitation link has already been used to activate an account. Please proceed to login.")

    # Check expiration
    expires_at = invitation.get("expires_at")
    now = datetime.now(timezone.utc)
    if isinstance(expires_at, datetime):
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < now:
            raise HTTPException(status_code=400, detail="This invitation link has expired. Please contact the administrator to request a new invitation.")

    # Fetch associated user / alumni
    mobile = invitation.get("mobile", "")
    user_id = invitation.get("user_id")
    alumni_id = invitation.get("alumni_id")

    user = None
    alumni = None
    if user_id:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            user = await db.users.find_one({"_id": user_id})
    if alumni_id:
        try:
            alumni = await db.alumni.find_one({"_id": ObjectId(alumni_id)})
        except Exception:
            alumni = await db.alumni.find_one({"_id": alumni_id})

    name = ""
    if alumni and alumni.get("full_name"):
        name = alumni["full_name"]
    elif user and user.get("full_name"):
        name = user["full_name"]
    elif user and user.get("name"):
        name = user["name"]
    else:
        name = "Alumni Member"

    digits = re.sub(r"\D", "", mobile)
    masked = f"+91 ******{digits[-4:]}" if len(digits) >= 10 else mobile

    school_id = invitation.get("school_id") or (user.get("school_id") if user else (alumni.get("school_id") if alumni else None))
    school = None
    if school_id:
        try:
            school = await db.schools.find_one({"_id": ObjectId(school_id)}) or await db.schools.find_one({"_id": school_id})
        except Exception:
            school = await db.schools.find_one({"_id": school_id})

    return ValidateInvitationResponse(
        valid=True,
        name=name,
        full_name=name,
        mobile=mobile,
        masked_mobile=masked,
        school_name=school.get("name") if school else "NHSS Alumni Network",
        alumni_id=str(alumni["_id"]) if alumni else None,
        user_id=str(user["_id"]) if user else None,
        expires_at=expires_at.isoformat() if isinstance(expires_at, datetime) else None
    )

@router.post("/invitation/send-otp")
async def send_invitation_otp(request: SendInvitationOTPRequest):
    """
    Dispatches 2Factor SMS OTP using approved NHSS Alumni template
    to the mobile number bound to the validated invitation.
    """
    import re
    token = request.token.strip() if request.token else ""
    if not token:
        raise HTTPException(status_code=400, detail="Invitation token is required.")

    db = get_db()
    t_hash = hash_token(token)
    invitation = await db.account_invitations.find_one({"token_hash": t_hash})

    if not invitation or invitation.get("used_at"):
        raise HTTPException(status_code=400, detail="This invitation link is invalid or has expired.")

    mobile = invitation.get("mobile")
    if not mobile or not is_valid_indian_mobile(mobile):
        raise HTTPException(status_code=400, detail="Invalid mobile number associated with invitation.")

    target_mobile = normalize_indian_mobile(mobile)
    now_ts = datetime.now(timezone.utc).timestamp()

    # Rate limiting: 30s resend cooldown
    session_key = f"inv_{t_hash}"
    existing = OTP_STORE.get(session_key) or OTP_STORE.get(target_mobile)
    if existing:
        elapsed = now_ts - existing.get("created_at", 0)
        if elapsed < 30:
            remaining = int(30 - elapsed)
            raise HTTPException(status_code=429, detail=f"Please wait {remaining} seconds before requesting a new OTP.")

    otp = generate_otp()
    expires_at = now_ts + 600  # 10 minutes expiry matching approved template

    otp_entry = {
        "otp": otp,
        "created_at": now_ts,
        "expires_at": expires_at,
        "attempts": 0,
        "max_attempts": 5,
        "mobile": target_mobile,
        "token_hash": t_hash
    }
    OTP_STORE[session_key] = otp_entry
    for k in get_mobile_query_variants(target_mobile):
        OTP_STORE[k] = otp_entry

    sms_success, session_or_err = await send_sms_otp(target_mobile, otp)
    if not sms_success:
        OTP_STORE.pop(session_key, None)
        OTP_STORE.pop(target_mobile, None)
        raise HTTPException(status_code=502, detail="Unable to send OTP. Please try again.")

    digits = re.sub(r"\D", "", target_mobile)
    masked = f"+91 ******{digits[-4:]}" if len(digits) >= 10 else target_mobile

    return {
        "success": True,
        "message": "OTP verification code sent successfully via SMS",
        "mobile": masked
    }

@router.post("/invitation/verify-otp")
async def verify_invitation_otp(request: VerifyInvitationOTPRequest):
    """
    Verifies the 6-digit OTP code against the invitation session.
    """
    token = request.token.strip() if request.token else ""
    otp = request.otp.strip() if request.otp else ""
    if not token or not otp:
        raise HTTPException(status_code=400, detail="Invitation token and OTP are required.")

    db = get_db()
    t_hash = hash_token(token)
    invitation = await db.account_invitations.find_one({"token_hash": t_hash})
    if not invitation or invitation.get("used_at"):
        raise HTTPException(status_code=400, detail="This invitation link is invalid or has expired.")

    mobile = invitation.get("mobile")
    target_mobile = normalize_indian_mobile(mobile)

    # Consume OTP securely
    await _validate_and_consume_otp(email=None, mobile=target_mobile, otp=otp)

    # Mark session verified for 15 minutes to allow password entry
    OTP_STORE[f"verified_{t_hash}"] = {
        "verified": True,
        "expires_at": datetime.now(timezone.utc).timestamp() + 900,
        "mobile": target_mobile
    }

    return {
        "success": True,
        "message": "Mobile number verified successfully via SMS OTP.",
        "otp_verified": True
    }

@router.post("/invitation/activate")
async def activate_account_with_invitation(request: ActivateAccountWithInvitationRequest):
    """
    Sets account password and activates user account after OTP verification.
    """
    token = request.token.strip() if request.token else ""
    password = request.password.strip() if request.password else ""

    if not token:
        raise HTTPException(status_code=400, detail="Invitation token is required.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    db = get_db()
    t_hash = hash_token(token)
    invitation = await db.account_invitations.find_one({"token_hash": t_hash})
    if not invitation:
        raise HTTPException(status_code=400, detail="This invitation link is invalid or has expired.")
    if invitation.get("used_at"):
        raise HTTPException(status_code=400, detail="This invitation link has already been used.")

    # Ensure OTP verification occurred
    verified_record = OTP_STORE.get(f"verified_{t_hash}")
    now_ts = datetime.now(timezone.utc).timestamp()
    if not verified_record or verified_record.get("expires_at", 0) < now_ts:
        raise HTTPException(status_code=400, detail="OTP verification required. Please verify your mobile phone with OTP first.")

    user_id = invitation.get("user_id")
    alumni_id = invitation.get("alumni_id")
    mobile = invitation.get("mobile")
    normalized_mobile = normalize_indian_mobile(mobile)

    user = None
    if user_id:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
        except Exception:
            user = await db.users.find_one({"_id": user_id})

    # If user doc wasn't created initially, create or find by mobile
    if not user:
        user = await db.users.find_one({"$or": build_mobile_query_filter(normalized_mobile)})
        if not user:
            school_id = invitation.get("school_id")
            if not school_id:
                school = await db.schools.find_one({})
                school_id = str(school["_id"]) if school else None
            new_user = {
                "school_id": school_id,
                "roles": ["ALUMNI"],
                "mobile": normalized_mobile,
                "phone_number": normalized_mobile,
                "phone_verified": True,
                "account_status": "ACTIVE",
                "is_active": True,
                "created_at": datetime.now(timezone.utc)
            }
            res = await db.users.insert_one(new_user)
            user = new_user
            user["_id"] = res.inserted_id
            user_id = str(res.inserted_id)

    hashed_password = get_password_hash(password)
    now_utc = datetime.now(timezone.utc)

    # 1. Update user document
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password": hashed_password,
            "password_hash": hashed_password,
            "phone_verified": True,
            "mobile": normalized_mobile,
            "phone_number": normalized_mobile,
            "account_status": "ACTIVE",
            "is_active": True,
            "status": "ACTIVE",
            "updated_at": now_utc
        }}
    )

    # 2. Update linked alumni profile
    alumni_filter = []
    if alumni_id:
        try:
            alumni_filter.append({"_id": ObjectId(alumni_id)})
        except Exception:
            alumni_filter.append({"_id": alumni_id})
    alumni_filter.append({"user_id": str(user["_id"])})
    alumni_filter.extend(build_mobile_query_filter(normalized_mobile))

    await db.alumni.update_many(
        {"$or": alumni_filter},
        {"$set": {
            "user_id": str(user["_id"]),
            "phone_verified": True,
            "verification_status": "APPROVED",
            "status": "APPROVED",
            "account_status": "ACTIVE",
            "updated_at": now_utc
        }}
    )

    # 3. Mark invitation as used (single-use guarantee)
    await db.account_invitations.update_one(
        {"_id": invitation["_id"]},
        {"$set": {"used_at": now_utc, "updated_at": now_utc}}
    )
    # Clear session verified flag
    OTP_STORE.pop(f"verified_{t_hash}", None)

    return {
        "success": True,
        "message": "Your NHSS Alumni account has been activated successfully. You can now log in with your mobile number and password."
    }


class ContactAdminRequest(BaseModel):
    subject: Optional[str] = "Alumni Verification Support Request"
    message: str

class RequestReverificationRequest(BaseModel):
    note: Optional[str] = None

@router.post("/contact-admin")
async def contact_admin(
    req: ContactAdminRequest,
    current_user: dict = Depends(get_current_user)
):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message content cannot be empty.")
    
    db = get_db()
    user_id = current_user["user_id"]
    now_utc = datetime.now(timezone.utc)
    
    msg_doc = {
        "user_id": user_id,
        "school_id": current_user.get("school_id"),
        "subject": req.subject or "Alumni Verification Support Request",
        "message": req.message.strip(),
        "user_name": current_user.get("full_name"),
        "user_email": current_user.get("email"),
        "user_mobile": current_user.get("mobile"),
        "created_at": now_utc
    }
    await db.contact_messages.insert_one(msg_doc)

    update_data = {
        "last_contact_subject": req.subject or "Alumni Verification Support Request",
        "last_contact_message": req.message.strip(),
        "last_contact_at": now_utc
    }
    
    try:
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    except Exception:
        await db.users.update_one({"_id": user_id}, {"$set": update_data})

    await db.alumni.update_many({"user_id": user_id}, {"$set": update_data})
    
    return {"success": True, "message": "Your message has been sent to the school admin."}


@router.post("/request-reverification")
async def request_reverification(
    req: RequestReverificationRequest,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    user_id = current_user["user_id"]
    now_utc = datetime.now(timezone.utc)
    
    update_data = {
        "verification_status": "PENDING",
        "status": "PENDING",
        "is_rerequest": True,
        "rerequest_note": req.note.strip() if req.note else None,
        "rerequested_at": now_utc,
        "updated_at": now_utc
    }

    try:
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    except Exception:
        await db.users.update_one({"_id": user_id}, {"$set": update_data})

    await db.alumni.update_many({"user_id": user_id}, {"$set": update_data})
    
    return {"success": True, "message": "Re-verification request submitted to school admin successfully."}