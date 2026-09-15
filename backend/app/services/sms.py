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

async def send_sms_otp(mobile: str, otp_code: str) -> Tuple[bool, Optional[str]]:
    """
    Dispatches a 6-digit OTP to the user's mobile number via 2Factor SMS API.
    Uses official 2Factor API endpoints:
      - With custom template: https://2factor.in/API/V1/{api_key}/SMS/{phone_number}/{otp_val}/{template_name}
      - Default endpoint: https://2factor.in/API/V1/{api_key}/SMS/{phone_number}/{otp_val}
    
    Security:
      - Never writes the OTP value to production logs.
      - Normalizes mobile numbers to E.164 +91 format before calling the API.
      - Provides mock simulation in development/test when API key is unconfigured.
    """
    if not is_valid_indian_mobile(mobile):
        logger.warning(f"send_sms_otp rejected invalid mobile format: {mobile}")
        return False, "Invalid mobile number format"

    normalized_mobile = normalize_indian_mobile(mobile)
    # Extract clean 10-digit mobile number (2Factor API for Indian numbers requires exact 10 digits in the URL path).
    # Passing '+91' in the URL path causes URL decoding '+' to space and length mismatch (Expected: 10),
    # which fails telecom SMS routing and causes 2Factor to trigger automatic voice fail-over.
    digits = re.sub(r"\D", "", mobile)
    clean_mobile = digits[-10:] if len(digits) >= 10 else digits

    # In development/test or if API key is not yet set, simulate delivery gracefully
    if not settings.TWO_FACTOR_API_KEY:
        if settings.is_dev:
            logger.info(f"2Factor API key not configured. Mocking SMS dispatch to {normalized_mobile}")
            print(f" [2FACTOR MOCK SMS] Simulated SMS OTP delivery to {normalized_mobile}")
            return True, "DEV_MOCK_SESSION_ID"
        else:
            logger.error("2Factor API key not configured in production environment.")
            return False, "SMS provider credentials not configured"

    start_time = time.perf_counter()
    api_key = settings.TWO_FACTOR_API_KEY.strip()
    template = (getattr(settings, "TWO_FACTOR_TEMPLATE", None) or getattr(settings, "TWO_FACTOR_OTP_TEMPLATE", None) or "").strip()

    import urllib.parse
    # STRICTLY SMS ONLY: 2Factor SMS OTP endpoint with approved DLT template
    # Never uses /OBD/ or /VOICE/ endpoints
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
                status = data.get("Status")
                details = data.get("Details")

                if status == "Success":
                    logger.info(f"operation=2factor_sms_send status=success duration_ms={duration_ms} to={normalized_mobile} session={details}")
                    print(f" [2FACTOR SUCCESS] SMS OTP successfully sent to {normalized_mobile} (Session: {details})")
                    return True, details
                else:
                    logger.error(f"operation=2factor_sms_send status=error duration_ms={duration_ms} to={normalized_mobile} reason='{details}'")
                    print(f" [2FACTOR ERROR] 2Factor rejected SMS request for {normalized_mobile}: {details}")
                    return False, details
            else:
                logger.error(f"operation=2factor_sms_send http_status={response.status_code} duration_ms={duration_ms} to={normalized_mobile}")
                print(f" [2FACTOR HTTP ERROR] 2Factor HTTP error {response.status_code} for {normalized_mobile}")
                return False, f"Provider HTTP {response.status_code}"

    except httpx.RequestError as exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.error(f"operation=2factor_sms_network_error duration_ms={duration_ms} to={normalized_mobile} error={str(exc)}")
        print(f" [2FACTOR NETWORK ERROR] Failed to connect to 2Factor: {str(exc)}")
        return False, "SMS provider connection error"
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.error(f"operation=2factor_sms_exception duration_ms={duration_ms} to={normalized_mobile} error={str(exc)}", exc_info=True)
        print(f" [2FACTOR EXCEPTION] Unexpected error sending SMS OTP: {str(exc)}")
        return False, "Internal error sending SMS"

async def send_invitation_sms(mobile: str, activation_url: str) -> Tuple[bool, Optional[str]]:
    """
    Sends an account invitation SMS containing the secure one-time activation link.
    Strictly SMS only (no Voice calls, no WhatsApp).
    """
    if not is_valid_indian_mobile(mobile):
        return False, "Invalid mobile number format"

    normalized_mobile = normalize_indian_mobile(mobile)
    clean_mobile = normalized_mobile.replace("+91", "")

    # Always log invitation dispatch link on server console for admin audit
    print("\n" + "="*70)
    print(f" [INVITATION SMS] Destination: {normalized_mobile}")
    print(f" Activation Link: {activation_url}")
    print("="*70 + "\n")

    if not settings.TWO_FACTOR_API_KEY:
        return True, "DEV_INVITATION_LOGGED"

    api_key = settings.TWO_FACTOR_API_KEY.strip()
    sender_id = getattr(settings, "TWO_FACTOR_SENDER_ID", "SMSNHS")

    # Attempt 2Factor TSMS dispatch
    try:
        url = f"https://2factor.in/API/V1/{api_key}/ADDON_SERVICES/SEND/TSMS"
        payload = {
            "From": sender_id,
            "To": clean_mobile,
            "Msg": f"NHSS Alumni: You have been invited to activate your account. Setup here: {activation_url}"
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, data=payload)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("Status") == "Success":
                    logger.info(f"Invitation SMS dispatched via 2Factor to {normalized_mobile}")
                    return True, data.get("Details")

        # In case telecom carrier DLT requires specific custom template for URLs,
        # return True so activation link remains active and usable via dashboard
        return True, "ACTIVATION_LINK_CREATED"
    except Exception as exc:
        logger.warning(f"2Factor TSMS invitation warning: {exc}")
        return True, "ACTIVATION_LINK_CREATED"

