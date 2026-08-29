import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("app.email")

def send_email_smtp(to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
    """
    Sends an email via SMTP TLS (smtp.gmail.com:587) using configuration from settings.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        logger.warning("SMTP credentials not configured. Skipping email dispatch.")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email

        if text_content:
            part1 = MIMEText(text_content, "plain", "utf-8")
            msg.attach(part1)

        part2 = MIMEText(html_content, "html", "utf-8")
        msg.attach(part2)

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=15) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(settings.EMAILS_FROM_EMAIL, [to_email], msg.as_string())

        logger.info(f"Successfully dispatched SMTP email to {to_email} with subject: '{subject}'")
        print(f"\n[SMTP EMAIL SENT SUCCESS] Email dispatched to: {to_email} | Sender: {settings.EMAILS_FROM_NAME}\n")
        return True
    except Exception as e:
        logger.error(f"Failed to dispatch SMTP email to {to_email}: {str(e)}")
        print(f"\n[SMTP EMAIL ERROR] Failed to send email to {to_email}: {str(e)}\n")
        return False

def send_otp_email(to_email: str, otp_code: str, purpose: str = "Verification") -> bool:
    """
    Sends a formatted OTP verification email to the user using SMTP.
    """
    subject = f"{otp_code} is your {settings.EMAILS_FROM_NAME} Verification Code"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 20px; color: #111111; }}
            .container {{ max-width: 540px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
            .header {{ text-align: center; border-bottom: 1px solid #E5E7EB; padding-bottom: 20px; margin-bottom: 24px; }}
            .badge {{ display: inline-block; background-color: #FFF7D6; border: 1px solid #F4C542; color: #854D0E; font-weight: bold; font-size: 12px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }}
            .title {{ font-size: 22px; font-weight: 700; color: #111111; margin-top: 16px; margin-bottom: 6px; text-align: center; }}
            .subtitle {{ font-size: 14px; color: #6B7280; text-align: center; margin-bottom: 24px; }}
            .otp-box {{ background-color: #FFF7D6; border: 2px dashed #F4C542; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }}
            .otp-code {{ font-size: 36px; font-weight: 800; font-family: monospace; letter-spacing: 8px; color: #111111; margin: 0; }}
            .info {{ font-size: 13px; color: #4B5563; line-height: 1.6; text-align: center; }}
            .footer {{ border-top: 1px solid #E5E7EB; margin-top: 32px; padding-top: 20px; font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.5; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="badge">{settings.EMAILS_FROM_NAME}</span>
                <h1 class="title">Verification Code</h1>
                <p class="subtitle">Use the code below to complete your {purpose.lower()}</p>
            </div>
            
            <div class="otp-box">
                <div class="otp-code">{otp_code}</div>
            </div>

            <p class="info">
                This verification code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone for security.
            </p>

            <div class="footer">
                <p>This email was sent automatically by <strong>{settings.EMAILS_FROM_NAME}</strong>.<br>If you did not request this code, please ignore this email.</p>
                <p>© 2026 JustGatherNow Alumni Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"Your {settings.EMAILS_FROM_NAME} verification code is: {otp_code}. Valid for 10 minutes."

    return send_email_smtp(to_email, subject, html_content, text_content)

def send_school_admin_invite_email(to_email: str, admin_name: str, school_name: str) -> bool:
    """
    Sends an invitation email to a newly provisioned School Admin with a link to complete setup and set password.
    """
    import urllib.parse
    setup_link = f"{settings.FRONTEND_URL}/admin/setup-password?email={urllib.parse.quote(to_email)}"
    subject = f"Setup Your School Admin Account for {school_name} — {settings.EMAILS_FROM_NAME}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 20px; color: #111111; }}
            .container {{ max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
            .header {{ text-align: center; border-bottom: 1px solid #E5E7EB; padding-bottom: 20px; margin-bottom: 24px; }}
            .badge {{ display: inline-block; background-color: #FFF7D6; border: 1px solid #F4C542; color: #854D0E; font-weight: bold; font-size: 12px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }}
            .title {{ font-size: 22px; font-weight: 700; color: #111111; margin-top: 16px; margin-bottom: 6px; text-align: center; }}
            .subtitle {{ font-size: 14px; color: #6B7280; text-align: center; margin-bottom: 24px; }}
            .btn-box {{ text-align: center; margin: 28px 0; }}
            .btn {{ display: inline-block; background-color: #111111; color: #F4C542; text-decoration: none; font-weight: bold; font-size: 15px; padding: 14px 28px; border-radius: 12px; }}
            .info {{ font-size: 13px; color: #4B5563; line-height: 1.6; text-align: center; }}
            .footer {{ border-top: 1px solid #E5E7EB; margin-top: 32px; padding-top: 20px; font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.5; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="badge">{settings.EMAILS_FROM_NAME}</span>
                <h1 class="title">Welcome, {admin_name}!</h1>
                <p class="subtitle">You have been provisioned as a School Administrator for <strong>{school_name}</strong>.</p>
            </div>
            
            <p class="info">
                Please click the button below to verify your email address with an OTP code and create your account password.
            </p>

            <div class="btn-box">
                <a href="{setup_link}" class="btn">Verify &amp; Create Account Password →</a>
            </div>

            <p class="info" style="font-size: 11px; color: #6B7280;">
                Or copy and paste this link into your browser:<br>
                <a href="{setup_link}" style="color: #2563EB;">{setup_link}</a>
            </p>

            <div class="footer">
                <p>This invitation was sent automatically by <strong>{settings.EMAILS_FROM_NAME}</strong> Platform Developers.</p>
                <p>© 2026 JustGatherNow Alumni Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"Welcome {admin_name}! You have been provisioned as School Administrator for {school_name}. Complete your account setup here: {setup_link}"

    return send_email_smtp(to_email, subject, html_content, text_content)
