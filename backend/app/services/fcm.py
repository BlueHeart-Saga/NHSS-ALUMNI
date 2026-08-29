import logging

logger = logging.getLogger("app.notifications")

class NotificationService:
    @staticmethod
    async def send_push_notification(user_id: str, title: str, body: str, data: dict = None):
        """Dispatches FCM push notification (or logs during development)"""
        logger.info(f"[PUSH NOTIFICATION] Target User: {user_id} | Title: {title} | Message: {body}")
        return True

    @staticmethod
    async def broadcast_announcement(target: str, target_id: str, title: str, content: str):
        """Broadcast notification for new announcement"""
        logger.info(f"[BROADCAST NOTIFICATION] Target: {target}:{target_id} | Title: {title}")
        return True

notification_service = NotificationService()
