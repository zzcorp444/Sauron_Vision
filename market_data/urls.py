# market_data/urls.py
from django.urls import path
from . import views

app_name = 'market_data'

urlpatterns = [
    path('scanner/', views.market_scanner, name='market_scanner'),
    path('realtime/', views.realtime_data, name='realtime_data'),
    path('historical/<str:symbol>/', views.historical_data, name='historical_data'),
    path('news/', views.market_news, name='market_news'),
    path('sentiment/', views.sentiment_analysis, name='sentiment_analysis'),
]