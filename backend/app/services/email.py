import smtplib
import logging
import time
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

    start_time = time.perf_counter()
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

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.info(f"operation=smtp_send duration_ms={duration_ms}")
        return True
    except Exception as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.error(f"operation=smtp_send_error duration_ms={duration_ms} error={str(e)}")
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
                <p>© 2026 NHSS ALUMNI PLATFORM. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"Your {settings.EMAILS_FROM_NAME} verification code is: {otp_code}. Valid for 10 minutes."

    return send_email_smtp(to_email, subject, html_content, text_content)

def send_alumni_verified_email(to_email: str, alumni_name: str, school_name: str = "NHSS SCHOOL") -> bool:
    """
    Sends an automated verification approval confirmation email to the alumnus when approved by school admin.
    """
    subject = f"🎉 Congratulations! Your Alumni Account at {school_name} is Verified"
    login_url = f"{settings.FRONTEND_URL}/login"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 20px; color: #111111; }}
            .container {{ max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border: 2px solid #111111; border-radius: 20px; padding: 32px; box-shadow: 6px 6px 0px #111111; }}
            .header {{ text-align: center; border-bottom: 2px solid #F4C542; padding-bottom: 20px; margin-bottom: 24px; }}
            .badge {{ display: inline-block; background-color: #FFF7D6; border: 1px solid #F4C542; color: #854D0E; font-weight: 800; font-size: 11px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }}
            .title {{ font-size: 24px; font-weight: 800; color: #111111; margin-top: 16px; margin-bottom: 6px; text-align: center; }}
            .subtitle {{ font-size: 14px; color: #4B5563; text-align: center; margin-bottom: 24px; line-height: 1.5; }}
            .success-box {{ background-color: #F0FDF4; border-radius: 14px; padding: 20px; text-align: center; margin: 20px 0; border: 1px solid #86EFAC; }}
            .success-text {{ font-size: 15px; font-weight: 700; color: #166534; margin: 0; line-height: 1.6; }}
            .btn {{ display: inline-block; background-color: #111111; color: #F4C542; font-weight: 800; font-size: 14px; padding: 14px 28px; text-decoration: none; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 16px; border: 2px solid #F4C542; }}
            .footer {{ border-top: 1px solid #E5E7EB; margin-top: 32px; padding-top: 20px; font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.5; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="badge">{school_name} Alumni Portal</span>
                <h1 class="title">You are Verified! 🎉</h1>
                <p class="subtitle">Dear <strong>{alumni_name}</strong>, your alumni registration application has been reviewed and officially approved by the school administration.</p>
            </div>
            
            <div class="success-box">
                <p class="success-text">Your profile is now verified! Please check your profile details and log in to explore alumni reunions, batch events, member directory search, and memory galleries.</p>
            </div>

            <div style="text-align: center;">
                <a href="{login_url}" class="btn" target="_blank">Login to Explore Portal →</a>
            </div>

            <div class="footer">
                <p>This email was sent automatically by <strong>{settings.EMAILS_FROM_NAME}</strong>.<br>Thank you for staying connected with {school_name}.</p>
                <p>© 2026 {school_name} Alumni Association. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"Congratulations {alumni_name}! Your alumni registration at {school_name} has been verified. Login now to explore: {login_url}"

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
                <p class="subtitle">Thank you! Your request has been verified by our team. You have been provisioned as a School Administrator for <strong>{school_name}</strong>.</p>
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
                <p>© 2026 NHSS Alumni Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"Welcome {admin_name}! You have been provisioned as School Administrator for {school_name}. Complete your account setup here: {setup_link}"

    return send_email_smtp(to_email, subject, html_content, text_content)

def send_contact_thank_you_email(to_email: str, sender_name: str, message_text: str) -> bool:
    """
    Sends an automated Thank-You email to visitors submitting the Contact Us form.
    """
    subject = f"Thank you for contacting {settings.EMAILS_FROM_NAME}!"

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
            .msg-box {{ background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; font-size: 13px; color: #374151; line-height: 1.6; margin: 20px 0; }}
            .info {{ font-size: 13px; color: #4B5563; line-height: 1.6; text-align: center; }}
            .footer {{ border-top: 1px solid #E5E7EB; margin-top: 32px; padding-top: 20px; font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.5; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="badge">{settings.EMAILS_FROM_NAME}</span>
                <h1 class="title">Thank You, {sender_name}!</h1>
                <p class="subtitle">We have received your message and our team will get back to you shortly.</p>
            </div>
            
            <p class="info">
                Here is a copy of your submitted message:
            </p>

            <div class="msg-box">
                <em>"{message_text}"</em>
            </div>

            <p class="info">
                If you have urgent queries regarding alumni reunions or verification, you can also reach us directly at <strong>{settings.EMAILS_FROM_EMAIL}</strong>.
            </p>

            <div class="footer">
                <p>This automated reply was sent by <strong>{settings.EMAILS_FROM_NAME}</strong>.</p>
                <p>© 2026 NHSS Alumni Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"Thank you for contacting {settings.EMAILS_FROM_NAME}, {sender_name}! We have received your inquiry and will respond shortly."

    return send_email_smtp(to_email, subject, html_content, text_content)

def send_contact_admin_notification_email(sender_name: str, sender_email: str, sender_mobile: str, message_text: str) -> bool:
    """
    Sends an immediate admin email notification to EMAILS_FROM_EMAIL when a contact form is submitted.
    """
    admin_email = settings.EMAILS_FROM_EMAIL
    if not admin_email:
        admin_email = "devopstrioglobal@gmail.com"

    subject = f"NEW CONTACT INQUIRY: {sender_name} ({sender_email})"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 20px; color: #111111; }}
            .container {{ max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
            .header {{ text-align: center; border-bottom: 1px solid #E5E7EB; padding-bottom: 20px; margin-bottom: 24px; }}
            .badge {{ display: inline-block; background-color: #DC2626; color: #FFFFFF; font-weight: bold; font-size: 11px; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }}
            .title {{ font-size: 20px; font-weight: 700; color: #111111; margin-top: 14px; text-align: center; }}
            .meta-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }}
            .meta-table td {{ padding: 10px; border-bottom: 1px solid #F3F4F6; }}
            .meta-label {{ font-weight: bold; color: #4B5563; width: 30%; uppercase: true; }}
            .msg-box {{ background-color: #FFF7D6; border: 1px solid #F4C542; border-radius: 12px; padding: 18px; font-size: 14px; color: #111111; line-height: 1.6; margin: 20px 0; white-space: pre-wrap; }}
            .footer {{ border-top: 1px solid #E5E7EB; margin-top: 28px; padding-top: 18px; font-size: 11px; color: #9CA3AF; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="badge">NEW INQUIRY</span>
                <h1 class="title">New Website Contact Form Submission</h1>
            </div>
            
            <table class="meta-table">
                <tr>
                    <td class="meta-label">SENDER NAME</td>
                    <td><strong>{sender_name}</strong></td>
                </tr>
                <tr>
                    <td class="meta-label">EMAIL ADDRESS</td>
                    <td><a href="mailto:{sender_email}" style="color: #2563EB;">{sender_email}</a></td>
                </tr>
                <tr>
                    <td class="meta-label">MOBILE PHONE</td>
                    <td><strong>{sender_mobile or 'N/A'}</strong></td>
                </tr>
            </table>

            <div style="font-weight: bold; font-size: 12px; color: #854D0E; text-transform: uppercase; letter-spacing: 1px;">MESSAGE CONTENT:</div>
            <div class="msg-box">{message_text}</div>

            <div class="footer">
                <p>This admin alert was generated by <strong>{settings.EMAILS_FROM_NAME}</strong> platform backend.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"New Contact Inquiry from {sender_name} ({sender_email}, {sender_mobile}):\n\n{message_text}"

    return send_email_smtp(admin_email, subject, html_content, text_content)

def send_registration_thank_you_email(to_email: str, alumni_name: str, school_name: str = "NHSS SCHOOL") -> bool:
    """
    Sends an automated registration thank-you & acknowledgment email to the alumnus upon completing their registration form.
    Informs them that their application is pending school administration verification.
    """
    subject = f"Thank You for Registering with {school_name} Alumni Portal"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: 'Segoe UI', Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 20px; color: #111111; }}
            .container {{ max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border: 2px solid #111111; border-radius: 20px; padding: 32px; box-shadow: 6px 6px 0px #111111; }}
            .header {{ text-align: center; border-bottom: 2px solid #F4C542; padding-bottom: 20px; margin-bottom: 24px; }}
            .badge {{ display: inline-block; background-color: #FFF7D6; border: 1px solid #F4C542; color: #854D0E; font-weight: 800; font-size: 11px; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }}
            .title {{ font-size: 24px; font-weight: 800; color: #111111; margin-top: 16px; margin-bottom: 6px; text-align: center; }}
            .subtitle {{ font-size: 14px; color: #4B5563; text-align: center; margin-bottom: 24px; line-height: 1.5; }}
            .info-box {{ background-color: #FFF7D6; border-radius: 14px; padding: 20px; text-align: center; margin: 20px 0; border: 1px solid #F4C542; }}
            .info-text {{ font-size: 14px; font-weight: 700; color: #854D0E; margin: 0; line-height: 1.6; }}
            .steps {{ font-size: 13px; color: #374151; line-height: 1.7; background-color: #F9FAFB; padding: 16px 20px; border-radius: 12px; border: 1px solid #E5E7EB; margin: 20px 0; }}
            .footer {{ border-top: 1px solid #E5E7EB; margin-top: 32px; padding-top: 20px; font-size: 11px; color: #9CA3AF; text-align: center; line-height: 1.5; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="badge">{school_name} Alumni Portal</span>
                <h1 class="title">Thank You for Registering!</h1>
                <p class="subtitle">Dear <strong>{alumni_name}</strong>, thank you for completing your alumni registration application.</p>
            </div>
            
            <div class="info-box">
                <p class="info-text">⏳ Your application has been successfully submitted and is currently awaiting verification by the school administration team.</p>
            </div>

            <div class="steps">
                <strong>What happens next?</strong>
                <ol style="margin-top: 8px; margin-bottom: 0; padding-left: 20px;">
                    <li>Our school admin team will review your admission details and graduation record.</li>
                    <li>As soon as your application is verified, you will receive an official approval email notification.</li>
                    <li>Once verified, you will get full access to batch get-togethers, alumni directory, and events.</li>
                </ol>
            </div>

            <div class="footer">
                <p>This email was sent automatically by <strong>{settings.EMAILS_FROM_NAME}</strong>.<br>Thank you for registering with {school_name}.</p>
                <p>© 2026 {school_name} Alumni Association. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    text_content = f"Thank you for registering with {school_name} Alumni Portal, {alumni_name}! Your application is currently awaiting school management verification. You will receive an email once your profile is verified."

    return send_email_smtp(to_email, subject, html_content, text_content)
