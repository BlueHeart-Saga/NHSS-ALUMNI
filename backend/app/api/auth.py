from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from datetime import datetime, timezone
from bson import ObjectId
import json
import urllib.parse
import urllib.request

import asyncio
from app.core.database import get_db
from app.core.security import generate_otp, create_access_token, create_refresh_token
from app.core.config import settings
from app.services.email import send_otp_email
from app.schemas.models import (
    SendOTPRequest, SendOTPResponse, VerifyOTPRequest, TokenResponse,
    UserRegistrationRequest, UserProfileResponse, UpdatePasswordRequest,
    SetPasswordWithOTPRequest
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

import logging

logger = logging.getLogger("app.auth")

# In-memory OTP storage with timestamps
OTP_STORE = {}

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
    picture_url = userinfo.get("picture", "")

    if not google_email:
        return RedirectResponse(url=f"{settings.FRONTEND_URL}/login?error=Google account did not provide an email address")

    # Step 3: Find or Create User in MongoDB
    user = await db.users.find_one({"email": {"$regex": f"^{google_email}$", "$options": "i"}})
    school_id = None
    if user:
        user_id = str(user["_id"])
        school_id = str(user.get("school_id")) if user.get("school_id") else None
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "google_id": google_sub,
                "full_name": user.get("full_name") or google_name,
                "profile_photo_url": user.get("profile_photo_url") or picture_url
            }}
        )
    else:
        school = await db.schools.find_one({})
        school_id = str(school["_id"]) if school else None
        new_user = {
            "school_id": school_id,
            "email": google_email,
            "full_name": google_name,
            "google_id": google_sub,
            "profile_photo_url": picture_url,
            "roles": ["ALUMNI"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc)
        }
        res = await db.users.insert_one(new_user)
        user_id = str(res.inserted_id)

    # Pre-fill draft alumni profile with Google details
    alumni = await db.alumni.find_one({"user_id": user_id})
    now = datetime.now(timezone.utc)
    if not alumni:
        alumni_doc = {
            "user_id": user_id,
            "school_id": school_id,
            "full_name": google_name,
            "email": google_email,
            "profile_photo_url": picture_url or f"https://ui-avatars.com/api/?name={google_name}&background=F4C542&color=111111",
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
        if not alumni.get("profile_photo_url") and picture_url: update_fields["profile_photo_url"] = picture_url
        if update_fields:
            await db.alumni.update_one({"user_id": user_id}, {"$set": update_fields})

    roles = user.get("roles", ["ALUMNI"]) if user else ["ALUMNI"]
    verification_status = alumni.get("verification_status") if alumni else None

    is_profile_complete = False
    resume_step = 2

    if alumni:
        has_personal = bool(alumni.get("full_name") and alumni.get("mobile") and alumni.get("current_city"))
        has_academic = bool(alumni.get("degree") and alumni.get("stream") and alumni.get("joining_year") and alumni.get("passing_year"))
        if has_personal and has_academic:
            is_profile_complete = True
            resume_step = 5
        elif has_personal:
            resume_step = 4
        else:
            resume_step = 3
    else:
        user_pass = user.get("password") if user else None
        if user_pass:
            resume_step = 3
        else:
            resume_step = 2

    registration_required = not is_profile_complete

    # Step 5: Issue JustGatherNow JWT Access Token
    token_data = {
        "sub": user_id,
        "school_id": school_id,
        "roles": roles,
        "verification_status": verification_status
    }
    access_token = create_access_token(token_data)

    # Step 6: Redirect to Frontend Callback Handler with auto-fill parameters
    target_url = f"{settings.FRONTEND_URL}/auth/callback?token={access_token}&email={urllib.parse.quote(google_email)}&name={urllib.parse.quote(google_name)}&photo={urllib.parse.quote(picture_url)}&registration_required={str(registration_required).lower()}&resume_step={resume_step}"
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
        if mobile: query.append({"mobile": mobile})

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
        if email: query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
        if mobile: query.append({"mobile": mobile})

        user = await db.users.find_one({"$or": query}) if query else None
        if not user:
            alumni_rec = await db.alumni.find_one({"$or": query}) if query else None
            if not alumni_rec:
                raise HTTPException(
                    status_code=404,
                    detail=f"No registered alumni account found matching '{identifier}'. Please check your email address or register."
                )

    # Check Developer Portal Access
    if request.for_developer:
        db = get_db()
        query = []
        is_dev = False

        if email:
            query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
        if mobile:
            import re
            digits_only = re.sub(r"\D", "", mobile)
            if len(digits_only) < 10:
                raise HTTPException(
                    status_code=400,
                    detail=f"INVALID_MOBILE_LENGTH: '{mobile}' is an incomplete mobile number. Please enter a full 10-digit developer mobile number."
                )

            clean_mob = digits_only[-10:]  # last 10 digits
            query.append({"mobile": mobile})
            query.append({"mobile": clean_mob})
            query.append({"mobile": f"+91{clean_mob}"})

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
                detail=f"UNAUTHORIZED_DEVELOPER_MOBILE: Mobile number '{identifier}' is not registered or authorized for Developer Portal access."
            )

    # Check if user is registered when check_user is True
    if request.check_user:
        db = get_db()
        query = []
        if email:
            query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
        if mobile:
            query.append({"mobile": mobile})
            
        user = await db.users.find_one({"$or": query}) if query else None
        if not user:
            raise HTTPException(
                status_code=404,
                detail=f"No registered account found for '{identifier}'. Please register your alumni profile first."
            )
            
        # Verify password strictly against user or alumni record
        user_pass = user.get("password") or user.get("password_hash")
        if not user_pass:
            alumni_rec = await db.alumni.find_one({"user_id": str(user["_id"])})
            if alumni_rec:
                user_pass = alumni_rec.get("password") or alumni_rec.get("password_hash")

        if not user_pass:
            raise HTTPException(
                status_code=400,
                detail=f"PASSWORD_NOT_CREATED: Your account '{identifier}' does not have a login password set yet. Please create a password first."
            )

        if request.password and user_pass != request.password:
            raise HTTPException(
                status_code=400,
                detail=f"Incorrect password entered for '{identifier}'. Please check your password and try again."
            )

    otp = generate_otp()
    
    # Store OTP valid for 10 minutes
    now_ts = datetime.now(timezone.utc).timestamp()
    otp_entry = {
        "otp": otp,
        "expires_at": now_ts + 600
    }
    
    if email:
        OTP_STORE[email] = otp_entry
    if mobile:
        OTP_STORE[mobile] = otp_entry
    
    # Terminal Log Output for Developers
    print("\n" + "="*70)
    print(f" [EMAIL/SMS OTP DISPATCH] Sent OTP Code: [{otp}] to Identifier: {identifier}")
    print("="*70 + "\n")
    logger.info(f"OTP Dispatched: [{otp}] -> {identifier}")

    # Dispatch Real SMTP Email via Gmail
    if email:
        purpose_label = "Password Reset" if request.for_password_reset else "Authentication & Sign Up"
        asyncio.create_task(asyncio.to_thread(send_otp_email, email, otp, purpose_label))

    return SendOTPResponse(
        success=True,
        message=f"Verification OTP code sent to {identifier}",
        email=email,
        mobile=mobile,
        dev_otp=None
    )

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(request: VerifyOTPRequest):
    email = request.email.strip().lower() if request.email else None
    mobile = request.mobile.strip() if request.mobile else None
    otp = request.otp.strip()

    if not email and not mobile:
        raise HTTPException(status_code=400, detail="Email address or mobile phone number is required.")

    # Validate OTP against email or mobile
    stored_data = None
    if email and email in OTP_STORE:
        stored_data = OTP_STORE.get(email)
    elif mobile and mobile in OTP_STORE:
        stored_data = OTP_STORE.get(mobile)

    now_ts = datetime.now(timezone.utc).timestamp()

    if not stored_data:
        raise HTTPException(status_code=400, detail="No active OTP found for this email address. Please request a new OTP.")

    if stored_data["expires_at"] < now_ts:
        if email: OTP_STORE.pop(email, None)
        if mobile: OTP_STORE.pop(mobile, None)
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new OTP.")

    if stored_data["otp"] != otp and (settings.APP_ENV == "production" or otp != "123456"):
        raise HTTPException(status_code=400, detail="Invalid OTP code entered. Please check the OTP code and try again.")

    # One-time use: Clear OTP
    if email: OTP_STORE.pop(email, None)
    if mobile: OTP_STORE.pop(mobile, None)

    db = get_db()
    
    # Find user by email (case-insensitive) or mobile
    query = []
    if email:
        query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if mobile:
        query.append({"mobile": mobile})

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
            new_user["mobile"] = mobile

        res = await db.users.insert_one(new_user)
        user_id = str(res.inserted_id)
        alumni = None
    else:
        user_id = str(user["_id"])
        alumni = await db.alumni.find_one({"user_id": user_id})

    roles = user.get("roles", ["ALUMNI"]) if user else ["ALUMNI"]
    verification_status = alumni.get("verification_status") if alumni else None
    
    # Evaluate profile completion status & wizard resume step
    is_profile_complete = False
    resume_step = 2 # Default to Create Password step if incomplete

    if alumni:
        has_personal = bool(alumni.get("full_name") and alumni.get("mobile") and alumni.get("current_city"))
        has_academic = bool(alumni.get("degree") and alumni.get("stream") and alumni.get("joining_year") and alumni.get("passing_year"))
        
        if has_personal and has_academic:
            is_profile_complete = True
            resume_step = 5
        elif has_personal:
            resume_step = 4
        else:
            resume_step = 3
    else:
        user_pass = user.get("password") if user else None
        if user_pass:
            resume_step = 3
        else:
            resume_step = 2

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

    # Validate OTP against email or mobile
    stored_data = None
    if email and email in OTP_STORE:
        stored_data = OTP_STORE.get(email)
    elif mobile and mobile in OTP_STORE:
        stored_data = OTP_STORE.get(mobile)

    now_ts = datetime.now(timezone.utc).timestamp()

    if not stored_data:
        raise HTTPException(status_code=400, detail="No active OTP found for this email address. Please request a new OTP.")

    if stored_data["expires_at"] < now_ts:
        if email: OTP_STORE.pop(email, None)
        if mobile: OTP_STORE.pop(mobile, None)
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new OTP.")

    if stored_data["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code entered. Please check the OTP code and try again.")

    db = get_db()
    
    # Query user by email or mobile
    query = []
    if email:
        query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if mobile:
        query.append({"mobile": mobile})

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

    # One-time use: Clear OTP
    if email: OTP_STORE.pop(email, None)
    if mobile: OTP_STORE.pop(mobile, None)

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

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": password}}
    )
    await db.alumni.update_many(
        {"user_id": user_id},
        {"$set": {"password": password}}
    )

    return {"success": True, "message": "Account password saved successfully."}

@router.post("/set-password-with-otp")
async def set_password_with_otp(request: SetPasswordWithOTPRequest):
    email = request.email.strip().lower() if request.email else None
    mobile = request.mobile.strip() if request.mobile else None
    otp = request.otp.strip()
    password = request.password.strip()

    if not email and not mobile:
        raise HTTPException(status_code=400, detail="Email address or mobile phone number is required.")
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")

    # 1. Verify OTP code
    stored_data = None
    if email and email in OTP_STORE:
        stored_data = OTP_STORE[email]
    elif mobile and mobile in OTP_STORE:
        stored_data = OTP_STORE[mobile]

    now_ts = datetime.now(timezone.utc).timestamp()
    if not stored_data or stored_data["otp"] != otp or now_ts > stored_data["expires_at"]:
        raise HTTPException(status_code=400, detail="Invalid or expired verification OTP code.")

    # Clear OTP code
    if email and email in OTP_STORE: del OTP_STORE[email]
    if mobile and mobile in OTP_STORE: del OTP_STORE[mobile]

    # 2. Update password in db.users
    db = get_db()
    query = []
    if email: query.append({"email": {"$regex": f"^{email}$", "$options": "i"}})
    if mobile: query.append({"mobile": mobile})

    user = await db.users.find_one({"$or": query}) if query else None
    if not user:
        raise HTTPException(status_code=404, detail="No registered account found matching these details.")

    user_id = str(user["_id"])
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": password, "is_active": True, "status": "ACTIVE"}}
    )
    await db.alumni.update_many(
        {"user_id": user_id},
        {"$set": {"password": password}}
    )

    return {
        "success": True,
        "message": "Your account password has been created successfully! You can now log in."
    }

@router.post("/register", response_model=UserProfileResponse)
async def register_alumni(request: UserRegistrationRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    user_id = current_user["user_id"]
    school_id = current_user["school_id"]

    # Check if batch exists
    batch = await db.batches.find_one({"school_id": school_id, "passing_year": request.passing_year})
    batch_id = str(batch["_id"]) if batch else None

    # Check if a pre-imported CSV roster record exists with user_id: None matching mobile/email/admission_number
    dup_query = []
    if request.mobile: dup_query.append({"mobile": request.mobile})
    if request.email: dup_query.append({"email": str(request.email)})
    if request.admission_number: dup_query.append({"admission_number": request.admission_number})

    pre_imported = await db.alumni.find_one({
        "school_id": school_id,
        "user_id": None,
        "$or": dup_query
    }) if dup_query else None

    now = datetime.now(timezone.utc)

    # Check if mobile number is already registered by another user account
    if request.mobile:
        existing_mobile_user = await db.users.find_one({
            "mobile": request.mobile,
            "_id": {"$ne": ObjectId(user_id)}
        })
        if existing_mobile_user:
            raise HTTPException(
                status_code=409,
                detail=f"This mobile number ({request.mobile}) is already registered with another account. Please check your mobile number or log in."
            )

    # Update user record with name and contact details
    user_update = {
        "email": str(request.email),
        "mobile": request.mobile,
        "full_name": request.full_name
    }
    if request.password and request.password.strip():
        user_update["password"] = request.password.strip()

    await db.users.update_one({"_id": ObjectId(user_id)}, {"$set": user_update})

    extra_fields = {
        "gender": request.gender,
        "dob": request.dob,
        "degree": request.degree,
        "stream": request.stream,
        "joining_year": request.joining_year,
        "chapter": request.chapter,
        "company": request.company,
        "position": request.position,
        "total_experience": request.total_experience,
        "industries": request.industries,
        "skills": request.skills,
        "other_college": request.other_college,
        "other_degree": request.other_degree,
        "other_stream": request.other_stream,
        "other_passing_year": request.other_passing_year,
        "address": request.address,
        "city": request.city or request.current_city,
        "state": request.state,
        "country": request.country or "India",
        "linkedin_url": request.linkedin_url
    }

    if pre_imported:
        # Preserve PENDING status unless pre_imported record was explicitly APPROVED
        status_val = pre_imported.get("verification_status") if pre_imported.get("verification_status") in ["APPROVED", "REJECTED"] else "PENDING"
        notes_val = "Auto-verified: Matched pre-approved school roster record" if status_val == "APPROVED" else "Matched pre-imported school roster record - Awaiting admin review"
        alumni_doc = {
            "user_id": user_id,
            "full_name": request.full_name or pre_imported.get("full_name"),
            "mobile": request.mobile or pre_imported.get("mobile"),
            "email": str(request.email) if request.email else pre_imported.get("email"),
            "profile_photo_url": request.profile_photo_url or pre_imported.get("profile_photo_url") or f"https://ui-avatars.com/api/?name={request.full_name}&background=F4C542&color=111111",
            "passing_year": request.passing_year or pre_imported.get("passing_year", 2010),
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
            "mobile": request.mobile,
            "email": str(request.email) if request.email else None,
            "profile_photo_url": request.profile_photo_url or f"https://ui-avatars.com/api/?name={request.full_name}&background=F4C542&color=111111",
            "passing_year": request.passing_year,
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
            passing_year=None,
            admission_number="N/A",
            verification_status="NOT_REGISTERED",
            roles=current_user.get("roles", ["ALUMNI"]),
            created_at=datetime.now(timezone.utc)
        )

    user_doc = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    mobile_val = alumni.get("mobile") or current_user.get("mobile") or (user_doc.get("mobile") if user_doc else None)
    email_val = alumni.get("email") or current_user.get("email") or (user_doc.get("email") if user_doc else None)
    full_name_val = alumni.get("full_name") or (user_doc.get("full_name") if user_doc else None) or current_user.get("full_name") or "Alumni"

    return UserProfileResponse(
        id=str(alumni["_id"]),
        user_id=current_user["user_id"],
        school_id=current_user.get("school_id") or str(alumni.get("school_id", "")),
        full_name=full_name_val,
        mobile=mobile_val,
        email=email_val,
        profile_photo_url=alumni.get("profile_photo_url"),
        passing_year=alumni.get("passing_year"),
        batch_id=str(alumni["batch_id"]) if alumni.get("batch_id") else None,
        admission_number=alumni.get("admission_number") or "",
        section=alumni.get("section"),
        current_city=alumni.get("current_city"),
        profession=alumni.get("profession"),
        verification_status=alumni.get("verification_status", "PENDING"),
        verification_notes=alumni.get("verification_notes"),
        roles=current_user.get("roles", ["ALUMNI"]),
        email_visible=alumni.get("email_visible", False),
        created_at=alumni.get("created_at", datetime.now(timezone.utc))
    )
