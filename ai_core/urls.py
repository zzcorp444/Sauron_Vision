# ai_core/urls.py
from django.urls import path
from . import views

app_name = 'ai_core'

urlpatterns = [
    path('analyze/', views.ai_analysis, name='ai_analysis'),
    path('predict/', views.price_prediction, name='price_prediction'),
    path('sentiment/', views.sentiment_analysis, name='sentiment_analysis'),
]