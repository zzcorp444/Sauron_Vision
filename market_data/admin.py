# market_data/admin.py
from django.contrib import admin
from .models import MarketData, NewsData, Alert

@admin.register(MarketData)
class MarketDataAdmin(admin.ModelAdmin):
    list_display = ['symbol', 'price', 'volume', 'timestamp']
    list_filter = ['symbol', 'timestamp']
    search_fields = ['symbol']

@admin.register(NewsData)
class NewsDataAdmin(admin.ModelAdmin):
    list_display = ['title', 'source', 'sentiment_score', 'published_at']
    list_filter = ['source', 'published_at']
    search_fields = ['title', 'content']

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['user', 'alert_type', 'priority', 'is_read', 'created_at']
    list_filter = ['priority', 'is_read', 'created_at']