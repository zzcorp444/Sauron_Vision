# strategy_engine/urls.py
from django.urls import path
from . import views

app_name = 'strategy_engine'

urlpatterns = [
    path('list/', views.strategy_list, name='strategy_list'),
    path('create/', views.create_strategy, name='create_strategy'),
    path('backtest/', views.backtest_strategy, name='backtest_strategy'),
    path('execute/<int:strategy_id>/', views.execute_strategy, name='execute_strategy'),
    path('performance/', views.strategy_performance, name='strategy_performance'),
]