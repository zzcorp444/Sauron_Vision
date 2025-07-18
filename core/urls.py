# core/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.LoginView.as_view(), name='login'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('terminal/', views.terminal_view, name='terminal'),
    path('vision/', views.vision_view, name='vision'),  # Add this
    path('api/market-data/', views.api_market_data, name='api_market_data'),
    path('api/vision-data/<str:symbol>/', views.api_vision_data, name='api_vision_data'),  # Add this
]