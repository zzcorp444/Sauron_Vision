# market_data/models.py
from django.db import models
from django.utils import timezone


class MarketData(models.Model):
    """Store real-time market data"""
    symbol = models.CharField(max_length=20)
    price = models.DecimalField(max_digits=20, decimal_places=8)
    volume = models.BigIntegerField()
    timestamp = models.DateTimeField(default=timezone.now)
    source = models.CharField(max_length=50)

    class Meta:
        indexes = [
            models.Index(fields=['symbol', 'timestamp']),
        ]
        ordering = ['-timestamp']


class NewsData(models.Model):
    """Store news and sentiment data"""
    title = models.CharField(max_length=500)
    content = models.TextField()
    source = models.CharField(max_length=100)
    sentiment_score = models.FloatField(null=True, blank=True)
    relevance_score = models.FloatField(null=True, blank=True)
    symbols = models.JSONField(default=list)
    published_at = models.DateTimeField()
    scraped_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-published_at']


class Alert(models.Model):
    """User alerts and notifications"""
    user = models.ForeignKey('core.User', on_delete=models.CASCADE)
    alert_type = models.CharField(max_length=50)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    priority = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')],
        default='medium'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']