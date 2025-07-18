# ai_core/admin.py
from django.contrib import admin
from .models import AIAnalysis

@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ['user', 'analysis_type', 'confidence', 'created_at']
    list_filter = ['analysis_type', 'created_at']
    readonly_fields = ['input_data', 'result']