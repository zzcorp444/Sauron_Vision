# ai_core/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AIAnalysis(models.Model):
    """Store AI analysis results"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    analysis_type = models.CharField(max_length=50)
    input_data = models.JSONField()
    result = models.TextField()
    confidence = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'AI Analyses'