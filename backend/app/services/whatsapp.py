import logging
import time
import re
from typing import Tuple, Optional, Dict, Any, List
import httpx
from app.core.config import settings

logger = logging.getLogger("app.whatsapp")

def format_whatsapp_mobile(mobile: str) -> str:
    """
    Formats a mobile number for WhatsApp Graph API dispatch (digits only, with country code 91 for India).
    E.g. '+91 9876543210' or '9876543210' -> '919876543210'
    """
    if not mobile:
        return ""
    digits = re.sub(r"\D", "", mobile)
    if len(digits) == 10:
        return f"91{digits}"
    elif len(digits) == 12 and digits.startswith("91"):
        return digits
    elif len(digits) > 10:
        return f"91{digits[-10:]}"
    return digits

async def send_whatsapp_message(mobile: str, text: str) -> Tuple[bool, Optional[str]]:
    """
    Dispatches a direct text message via Meta WhatsApp Cloud API.
    POST https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages
    """
    token = (settings.WHATSAPP_TOKEN or "").strip()
    phone_number_id = (settings.WHATSAPP_PHONE_NUMBER_ID or "").strip()

    if not token or not phone_number_id:
        logger.warning("WhatsApp Meta Cloud API credentials not configured.")
        return False, "WhatsApp API token or Phone Number ID missing"

    recipient = format_whatsapp_mobile(mobile)
    if not recipient:
        return False, "Invalid mobile number format for WhatsApp"

    url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": recipient,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": text
        }
    }

    start_time = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            if resp.status_code in (200, 201):
                data = resp.json()
                msg_id = (data.get("messages") or [{}])[0].get("id") or "SUCCESS"
                logger.info(f"operation=whatsapp_send status=success duration_ms={duration_ms} to={recipient} msg_id={msg_id}")
                print(f" [WHATSAPP SUCCESS] Message sent to {recipient} (Msg ID: {msg_id})")
                return True, msg_id
            else:
                resp_text = resp.text
                logger.error(f"operation=whatsapp_send status=error http_status={resp.status_code} to={recipient} body={resp_text}")
                print(f" [WHATSAPP ERROR] Meta API HTTP {resp.status_code}: {resp_text}")
                return False, resp_text
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.error(f"operation=whatsapp_exception duration_ms={duration_ms} to={recipient} error={str(exc)}")
        return False, str(exc)

async def send_whatsapp_template(
    mobile: str,
    template_name: str,
    language_code: str = "en_US",
    components: Optional[List[Dict[str, Any]]] = None
) -> Tuple[bool, Optional[str]]:
    """
    Dispatches an approved template message via Meta WhatsApp Cloud API.
    """
    token = (settings.WHATSAPP_TOKEN or "").strip()
    phone_number_id = (settings.WHATSAPP_PHONE_NUMBER_ID or "").strip()

    if not token or not phone_number_id:
        return False, "WhatsApp API token or Phone Number ID missing"

    recipient = format_whatsapp_mobile(mobile)
    if not recipient:
        return False, "Invalid mobile number format for WhatsApp"

    url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload: Dict[str, Any] = {
        "messaging_product": "whatsapp",
        "to": recipient,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": language_code
            }
        }
    }
    if components:
        payload["template"]["components"] = components

    start_time = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            if resp.status_code in (200, 201):
                data = resp.json()
                msg_id = (data.get("messages") or [{}])[0].get("id") or "SUCCESS"
                logger.info(f"operation=whatsapp_template_send status=success duration_ms={duration_ms} template={template_name} to={recipient} msg_id={msg_id}")
                print(f" [WHATSAPP TEMPLATE SUCCESS] Sent template '{template_name}' to {recipient} (Msg ID: {msg_id})")
                return True, msg_id
            else:
                resp_text = resp.text
                logger.error(f"operation=whatsapp_template_send status=error http_status={resp.status_code} template={template_name} to={recipient} body={resp_text}")
                return False, resp_text
    except Exception as exc:
        return False, str(exc)

async def send_whatsapp_otp(mobile: str, otp: str) -> Tuple[bool, Optional[str]]:
    """
    Real-time WhatsApp OTP Dispatcher via Meta WhatsApp Cloud API.
    Attempts template dispatch ('nhss_alumni_otp' or 'auth_otp') first,
    and falls back to direct text message if template is not yet approved.
    """
    token = (settings.WHATSAPP_TOKEN or "").strip()
    phone_number_id = (settings.WHATSAPP_PHONE_NUMBER_ID or "").strip()

    if not token or not phone_number_id:
        return False, "WhatsApp credentials not configured in settings"

    recipient = format_whatsapp_mobile(mobile)
    if not recipient:
        return False, "Invalid recipient mobile format"

    template_name = getattr(settings, "WHATSAPP_OTP_TEMPLATE", "nhss_alumni_otp")

    # Components for Authentication OTP Template with parameter {{1}}
    components = [
        {
            "type": "body",
            "parameters": [
                {"type": "text", "text": str(otp)}
            ]
        }
    ]

    # Try template dispatch
    success, result = await send_whatsapp_template(
        mobile=recipient,
        template_name=template_name,
        language_code="en_US",
        components=components
    )

    if success:
        return True, result

    # Fallback to direct text message
    direct_msg = f"Your NHSS Alumni verification code is: {otp}. Valid for 10 minutes. Do not share this code."
    return await send_whatsapp_message(recipient, direct_msg)
