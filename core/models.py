# core/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid

class User(AbstractUser):
    """Custom user model for Sauron Vision"""
    user_id = models.CharField(max_length=50, unique=True, blank=True)
    passkey = models.CharField(max_length=255)
    api_key = models.UUIDField(default=uuid.uuid4, editable=False)
    is_trader = models.BooleanField(default=True)
    risk_tolerance = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')],
        default='medium'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.user_id:
            self.user_id = f"SV_{self.username.upper()}"
        super().save(*args, **kwargs)

class UserSession(models.Model):
    """Track user sessions for security"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    session_id = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

class TradingPreference(models.Model):
    """User trading preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    preferred_assets = models.JSONField(default=list)
    trading_strategies = models.JSONField(default=list)
    risk_parameters = models.JSONField(default=dict)
    notification_settings = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)