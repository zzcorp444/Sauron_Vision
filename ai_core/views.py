# ai_core/views.py
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from .llm_interface import SauronAI


@login_required
@csrf_exempt
def ai_analysis(request):
    """AI-powered market analysis"""
    if request.method == 'POST':
        data = json.loads(request.body)
        ai = SauronAI()

        analysis_type = data.get('type', 'market')

        if analysis_type == 'market':
            result = ai.analyze_market(data.get('market_data', {}))
        elif analysis_type == 'strategy':
            result = ai.generate_strategy(data.get('parameters', {}))
        elif analysis_type == 'signal':
            result = ai.explain_signal(data.get('signal_data', {}))
        else:
            result = "Unknown analysis type"

        return JsonResponse({'analysis': result})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@login_required
@csrf_exempt
def price_prediction(request):
    """AI price prediction"""
    if request.method == 'POST':
        data = json.loads(request.body)
        symbol = data.get('symbol', 'AAPL')

        # Simulate AI prediction
        prediction = {
            'symbol': symbol,
            'current_price': 150.25,
            'predicted_price': 155.50,
            'confidence': 0.78,
            'timeframe': '1 day',
            'direction': 'bullish'
        }

        return JsonResponse(prediction)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@login_required
def sentiment_analysis(request):
    """AI sentiment analysis"""
    symbol = request.GET.get('symbol', 'market')

    # Simulate sentiment analysis
    sentiment = {
        'symbol': symbol,
        'overall_sentiment': 0.72,
        'news_sentiment': 0.68,
        'social_sentiment': 0.75,
        'analyst_sentiment': 0.70,
        'recommendation': 'bullish'
    }

    return JsonResponse(sentiment)
