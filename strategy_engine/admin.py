# strategy_engine/admin.py
from django.contrib import admin
from .models import Strategy, Trade

@admin.register(Strategy)
class StrategyAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'strategy_type', 'is_active', 'created_at']
    list_filter = ['strategy_type', 'is_active']
    search_fields = ['name', 'description']

@admin.register(Trade)
class TradeAdmin(admin.ModelAdmin):
    list_display = ['strategy', 'symbol', 'side', 'quantity', 'price', 'executed_at']
    list_filter = ['side', 'executed_at']
    search_fields = ['symbol']