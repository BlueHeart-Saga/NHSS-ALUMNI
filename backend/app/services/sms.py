import re
import logging
import time
from typing import Tuple, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("app.sms")

def normalize_indian_mobile(mobile: str) -> str:
    """
    Normalizes an Indian mobile number to E.164 standard format (+91XXXXXXXXXX).
    Accepts formats such as:
      - "9876543210"
      - "+91 98765 43210"
      - "09876543210"
      - "919876543210"
    Returns:
      "+91XXXXXXXXXX"
    """
    if not mobile:
        return ""
    digits = re.sub(r"\D", "", mobile)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    elif len(digits) > 10:
        digits = digits[-10:]

    return f"+91{digits}" if digits else ""

def is_valid_indian_mobile(mobile: str) -> bool:
    """
    Validates whether the given string is a valid 10-digit Indian mobile number.
    Indian mobile numbers must be 10 digits and start with 6, 7, 8, or 9.
    """
    if not mobile:
        return False
    digits = re.sub(r"\D", "", mobile)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]
    elif len(digits) > 10:
        digits = digits[-10:]

    if len(digits) != 10:
        return False

    return digits[0] in ("6", "7", "8", "9")

def get_mobile_query_variants(mobile: Optional[str]) -> list[str]:
    """
    Returns all possible variations of a mobile number to ensure bulletproof database lookups.
    Handles spaces, dashes, country code prefix (+91, 91), leading zero, etc.
    For '7639191119' or '+91 7639191119' or '+917639191119' or '917639191119':
    Includes:
      - '+917639191119'
      - '7639191119'
      - '+91 7639191119'
      - '917639191119'
      - '07639191119'
      - '+91-7639191119'
      - raw input
    """
    if not mobile:
        return []

    raw = str(mobile).strip()
    if not raw:
        return []

    variants = set()
    variants.add(raw)
    variants.add(raw.replace(" ", ""))
    variants.add(raw.replace("-", ""))

    digits = re.sub(r"\D", "", raw)
    if digits:
        variants.add(digits)
        if len(digits) >= 10:
            last10 = digits[-10:]
            variants.add(last10)
            variants.add(f"+91{last10}")
            variants.add(f"+91 {last10}")
            variants.add(f"91{last10}")
            variants.add(f"0{last10}")
            variants.add(f"+91-{last10}")
        if not raw.startswith("+"):
            variants.add(f"+{digits}")

    return [v for v in variants if v]

def build_mobile_query_filter(mobile: Optional[str], field_name: str = "mobile") -> list[dict]:
    """Returns a list of dicts suitable for appending to an $or query: [{field_name: v}, ...]"""
    variants = get_mobile_query_variants(mobile)
    return [{field_name: v} for v in variants]

async def send_brevo_sms_otp(mobile: str, otp_code: str) -> Tuple[bool, Optional[str]]:
    """
    Sends SMS OTP via Brevo (Sendinblue) Transactional SMS API:
    POST https://api.brevo.com/v3/transactionalSMS/sms
    """
    if not is_valid_indian_mobile(mobile):
        logger.warning(f"send_brevo_sms_otp rejected invalid mobile format: {mobile}")
        return False, "Invalid mobile number format"

    api_key = (getattr(settings, "BREVO_API_KEY", None) or getattr(settings, "SMTP_PASS", "") or "").strip()
    if not api_key:
        return False, "Brevo API key not configured"

    digits = re.sub(r"\D", "", mobile)
    if len(digits) == 12 and digits.startswith("91"):
        recipient = digits
    elif len(digits) >= 10:
        recipient = f"91{digits[-10:]}"
    else:
        recipient = digits

    sender = (getattr(settings, "BREVO_SMS_SENDER", "") or getattr(settings, "EMAILS_FROM_NAME", "") or "NHSSALUMNI")[:11]
    content = f"Your NHSS Alumni OTP is {otp_code}. Valid for 5 minutes."

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }
    payload = {
        "sender": sender,
        "recipient": recipient,
        "content": content,
        "type": "transactional"
    }

    start_time = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post("https://api.brevo.com/v3/transactionalSMS/sms", json=payload, headers=headers)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

            if resp.status_code in (200, 201):
                data = resp.json()
                ref = str(data.get("messageId") or data.get("reference") or "SUCCESS")
                logger.info(f"operation=brevo_sms_send status=success duration_ms={duration_ms} to={recipient} ref={ref}")
                print(f" [BREVO SUCCESS] SMS OTP successfully sent to {recipient} (Message ID: {ref})")
                return True, ref
            else:
                resp_text = resp.text
                if resp.status_code == 401 and "unrecognised IP address" in resp_text:
                    logger.error(
                        f"⚠️ [BREVO IP RESTRICTION] Brevo blocked SMS dispatch from unrecognised IP address! "
                        f"Please authorize this IP at: https://app.brevo.com/security/authorised_ips | Details: {resp_text}"
                    )
                    print(
                        f"\n [BREVO IP RESTRICTION] Brevo blocked SMS dispatch! "
                        f"Please authorize your IP at: https://app.brevo.com/security/authorised_ips\n"
                    )
                else:
                    logger.warning(f"operation=brevo_sms_send status=error http_status={resp.status_code} to={recipient} body={resp_text}")
                    print(f" [BREVO ERROR] Brevo SMS API returned HTTP {resp.status_code}: {resp_text}")
                return False, resp_text
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.error(f"operation=brevo_sms_exception duration_ms={duration_ms} to={recipient} error={str(exc)}")
        print(f" [BREVO EXCEPTION] Brevo SMS API error: {exc}")
        return False, str(exc)

async def send_2factor_sms_otp(mobile: str, otp_code: str) -> Tuple[bool, Optional[str]]:
    """Fallback 2Factor SMS OTP dispatch when Brevo is unconfigured or blocked."""
    if not settings.TWO_FACTOR_API_KEY:
        return False, "2Factor API key not configured"

    digits = re.sub(r"\D", "", mobile)
    clean_mobile = digits[-10:] if len(digits) >= 10 else digits
    normalized_mobile = normalize_indian_mobile(mobile)

    start_time = time.perf_counter()
    api_key = settings.TWO_FACTOR_API_KEY.strip()
    template = (getattr(settings, "TWO_FACTOR_TEMPLATE", None) or getattr(settings, "TWO_FACTOR_OTP_TEMPLATE", None) or "").strip()

    import urllib.parse
    if template:
        encoded_template = urllib.parse.quote(template)
        url = f"https://2factor.in/API/V1/{api_key}/SMS/{clean_mobile}/{otp_code}/{encoded_template}"
    else:
        url = f"https://2factor.in/API/V1/{api_key}/SMS/{clean_mobile}/{otp_code}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            if response.status_code == 200:
                data = response.json()
                if data.get("Status") == "Success":
                    details = data.get("Details")
                    logger.info(f"operation=2factor_sms_send status=success duration_ms={duration_ms} to={normalized_mobile} session={details}")
                    print(f" [2FACTOR SUCCESS] SMS OTP successfully sent to {normalized_mobile} (Session: {details})")
                    return True, details
                return False, data.get("Details")
            return False, f"2Factor HTTP {response.status_code}"
    except Exception as exc:
        return False, str(exc)

async def send_sms_otp(mobile: str, otp_code: str) -> Tuple[bool, Optional[str]]:
    """
    Primary OTP dispatch entrypoint.
    Prioritizes Brevo Transactional SMS API for all OTP text messages.
    Falls back gracefully to 2Factor or Dev Mock if unconfigured.
    """
    if not is_valid_indian_mobile(mobile):
        logger.warning(f"send_sms_otp rejected invalid mobile format: {mobile}")
        return False, "Invalid mobile number format"

    normalized_mobile = normalize_indian_mobile(mobile)

    # 1. Primary: Dispatch via Brevo Transactional SMS API
    brevo_key = (getattr(settings, "BREVO_API_KEY", None) or getattr(settings, "SMTP_PASS", "") or "").strip()
    if brevo_key:
        success, ref_or_err = await send_brevo_sms_otp(mobile, otp_code)
        if success:
            return True, ref_or_err
        logger.warning(f"Brevo SMS delivery failed ({ref_or_err}). Checking fallback providers...")

    # 2. Secondary Fallback: Dispatch via 2Factor if configured
    if settings.TWO_FACTOR_API_KEY:
        logger.info(f"Attempting fallback to 2Factor SMS for {normalized_mobile}...")
        success, ref_or_err = await send_2factor_sms_otp(mobile, otp_code)
        if success:
            return True, ref_or_err

    # 3. Development / Test Mode Mock Delivery
    if settings.is_dev:
        logger.info(f"[DEV MOCK] Simulated SMS OTP delivery of [{otp_code}] to {normalized_mobile}")
        print("\n" + "="*70)
        print(f" [MOCK SMS OTP DISPATCH] Destination: {normalized_mobile} | Code: [{otp_code}]")
        print("="*70 + "\n")
        return True, "DEV_MOCK_SESSION_ID"

    return False, "SMS delivery failed. Please verify provider credentials or IP authorization."

async def send_invitation_sms(mobile: str, activation_url: str) -> Tuple[bool, Optional[str]]:
    """
    Sends an account invitation SMS containing the secure one-time activation link.
    Prioritizes Brevo SMS API.
    """
    if not is_valid_indian_mobile(mobile):
        return False, "Invalid mobile number format"

    normalized_mobile = normalize_indian_mobile(mobile)
    digits = re.sub(r"\D", "", mobile)
    recipient = f"91{digits[-10:]}" if len(digits) >= 10 else digits

    print("\n" + "="*70)
    print(f" [INVITATION SMS] Destination: {normalized_mobile}")
    print(f" Activation Link: {activation_url}")
    print("="*70 + "\n")

    # 1. Try Brevo SMS
    brevo_key = (getattr(settings, "BREVO_API_KEY", None) or getattr(settings, "SMTP_PASS", "") or "").strip()
    if brevo_key:
        sender = (getattr(settings, "BREVO_SMS_SENDER", "") or "NHSSALUMNI")[:11]
        content = f"NHSS Alumni: You have been invited to activate your account. Setup here: {activation_url}"
        headers = {
            "accept": "application/json",
            "api-key": brevo_key,
            "content-type": "application/json"
        }
        payload = {
            "sender": sender,
            "recipient": recipient,
            "content": content,
            "type": "transactional"
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post("https://api.brevo.com/v3/transactionalSMS/sms", json=payload, headers=headers)
                if resp.status_code in (200, 201):
                    logger.info(f"Invitation SMS dispatched via Brevo to {recipient}")
                    return True, "BREVO_INVITATION_SENT"
        except Exception as exc:
            logger.warning(f"Brevo invitation SMS failed: {exc}")

    # 2. Try 2Factor TSMS Fallback
    if settings.TWO_FACTOR_API_KEY:
        try:
            api_key = settings.TWO_FACTOR_API_KEY.strip()
            sender_id = getattr(settings, "TWO_FACTOR_SENDER_ID", "SMSNHS")
            clean_mobile = digits[-10:] if len(digits) >= 10 else digits
            url = f"https://2factor.in/API/V1/{api_key}/ADDON_SERVICES/SEND/TSMS"
            payload = {
                "From": sender_id,
                "To": clean_mobile,
                "Msg": f"NHSS Alumni: You have been invited to activate your account. Setup here: {activation_url}"
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, data=payload)
                if resp.status_code == 200 and resp.json().get("Status") == "Success":
                    return True, resp.json().get("Details")
        except Exception as exc:
            logger.warning(f"2Factor TSMS invitation warning: {exc}")

    return True, "ACTIVATION_LINK_CREATED"


