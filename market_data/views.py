# market_data/views.py
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
import random
from datetime import datetime


@login_required
def market_scanner(request):
    """Scan market for opportunities"""
    # Sample data - replace with real market data
    data = {
        'trending': [
            {'symbol': 'AAPL', 'price': 150.25, 'change': 2.5, 'volume': 15000000},
            {'symbol': 'TSLA', 'price': 850.50, 'change': -1.2, 'volume': 20000000},
            {'symbol': 'GOOGL', 'price': 2750.75, 'change': 1.8, 'volume': 8000000},
        ],
        'movers': [
            {'symbol': 'NVDA', 'price': 450.30, 'change': 5.2, 'volume': 25000000},
            {'symbol': 'AMD', 'price': 120.45, 'change': -3.5, 'volume': 18000000},
        ],
        'signals': [
            {'symbol': 'MSFT', 'signal': 'BUY', 'strength': 0.85},
            {'symbol': 'META', 'signal': 'SELL', 'strength': 0.72},
        ]
    }
    return JsonResponse(data)


@login_required
def realtime_data(request):
    """Get real-time market data"""
    symbols = request.GET.get('symbols', 'AAPL,GOOGL,TSLA').split(',')
    data = {}

    for symbol in symbols:
        # Simulate real-time data
        base_price = random.uniform(100, 1000)
        data[symbol] = {
            'price': round(base_price + random.uniform(-5, 5), 2),
            'change': round(random.uniform(-5, 5), 2),
            'volume': random.randint(1000000, 50000000),
            'bid': round(base_price - 0.05, 2),
            'ask': round(base_price + 0.05, 2),
            'timestamp': datetime.now().isoformat()
        }

    return JsonResponse(data)


@login_required
def historical_data(request, symbol):
    """Get historical data for a symbol"""
    # Sample historical data
    data = {
        'symbol': symbol,
        'data': [
            {'date': '2024-01-01', 'open': 150, 'high': 155, 'low': 149, 'close': 154, 'volume': 10000000},
            {'date': '2024-01-02', 'open': 154, 'high': 156, 'low': 152, 'close': 155, 'volume': 12000000},
            # Add more data points
        ]
    }
    return JsonResponse(data)


@login_required
def market_news(request):
    """Get market news"""
    news = [
        {
            'title': 'Fed Announces Rate Decision',
            'source': 'Reuters',
            'time': '2 hours ago',
            'sentiment': 0.7,
            'impact': 'high'
        },
        {
            'title': 'Tech Stocks Rally on AI Optimism',
            'source': 'Bloomberg',
            'time': '4 hours ago',
            'sentiment': 0.85,
            'impact': 'medium'
        }
    ]
    return JsonResponse({'news': news})


@login_required
def sentiment_analysis(request):
    """Get market sentiment analysis"""
    data = {
        'overall': 0.65,
        'fear_greed': 72,
        'sectors': {
            'technology': 0.78,
            'finance': 0.55,
            'healthcare': 0.62,
            'energy': 0.45
        }
    }
    return JsonResponse(data)