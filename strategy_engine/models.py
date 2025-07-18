# strategy_engine/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Strategy(models.Model):
    """Trading strategy model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField()
    strategy_type = models.CharField(max_length=50)
    parameters = models.JSONField(default=dict)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Strategies'


class Trade(models.Model):
    """Trade execution model"""
    strategy = models.ForeignKey(Strategy, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=20)
    side = models.CharField(max_length=10, choices=[('buy', 'Buy'), ('sell', 'Sell')])
    quantity = models.DecimalField(max_digits=20, decimal_places=8)
    price = models.DecimalField(max_digits=20, decimal_places=8)
    executed_at = models.DateTimeField(auto_now_add=True)
    pnl = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)