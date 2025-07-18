# strategy_engine/views.py
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json

@login_required
def strategy_list(request):
    """List all trading strategies"""
    strategies = [
        {
            'id': 1,
            'name': 'Mean Reversion',
            'type': 'statistical',
            'status': 'active',
            'performance': 12.5
        },
        {
            'id': 2,
            'name': 'Momentum Breakout',
            'type': 'technical',
            'status': 'paused',
            'performance': 8.3
        },
        {
            'id': 3,
            'name': 'AI Prediction',
            'type': 'machine_learning',
            'status': 'active',
            'performance': 15.7
        }
    ]
    return JsonResponse({'strategies': strategies})

@login_required
@csrf_exempt
def create_strategy(request):
    """Create a new trading strategy"""
    if request.method == 'POST':
        data = json.loads(request.body)
        # Process strategy creation
        response = {
            'success': True,
            'strategy_id': 4,
            'message': 'Strategy created successfully'
        }
        return JsonResponse(response)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
@csrf_exempt
def backtest_strategy(request):
    """Backtest a trading strategy"""
    if request.method == 'POST':
        data = json.loads(request.body)
        # Simulate backtest results
        results = {
            'total_return': 25.5,
            'sharpe_ratio': 1.8,
            'max_drawdown': -12.3,
            'win_rate': 0.65,
            'trades': 150,
            'profitable_trades': 98
        }
        return JsonResponse(results)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def execute_strategy(request, strategy_id):
    """Execute a trading strategy"""
    if request.method == 'POST':
        # Execute strategy logic
        response = {
            'success': True,
            'message': f'Strategy {strategy_id} executed',
            'trades_placed': 3
        }
        return JsonResponse(response)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@login_required
def strategy_performance(request):
    """Get strategy performance metrics"""
    performance = {
        'daily_pnl': 1250.50,
        'weekly_pnl': 5830.25,
        'monthly_pnl': 15250.75,
        'total_pnl': 45250.00,
        'best_trade': {'symbol': 'AAPL', 'profit': 2500.00},
        'worst_trade': {'symbol': 'TSLA', 'loss': -850.00}
    }
    return JsonResponse(performance)