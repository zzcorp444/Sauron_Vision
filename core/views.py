# core/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from .models import User, UserSession
from .forms import SauronLoginForm
import json


class LoginView(View):
    """Custom login view with Sauron Vision styling"""
    template_name = 'login.html'
    form_class = SauronLoginForm

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('dashboard')

        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = self.form_class(request.POST)

        if form.is_valid():
            user_id = form.cleaned_data['user_id']
            passkey = form.cleaned_data['passkey']

            try:
                user = User.objects.get(user_id=user_id)
                if user.check_password(passkey):
                    login(request, user)

                    # Log session
                    UserSession.objects.create(
                        user=user,
                        session_id=request.session.session_key,
                        ip_address=self.get_client_ip(request),
                        user_agent=request.META.get('HTTP_USER_AGENT', '')
                    )

                    messages.success(request, f'Welcome back, {user.username}. The eye sees all.')
                    return redirect('dashboard')
                else:
                    messages.error(request, 'Invalid credentials. The eye does not recognize you.')
            except User.DoesNotExist:
                messages.error(request, 'Invalid credentials. The eye does not recognize you.')

        return render(request, self.template_name, {'form': form})

    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@login_required
def dashboard(request):
    """Main dashboard view"""
    # Fix: Check if the Alert model exists before querying
    active_alerts = 0
    try:
        from market_data.models import Alert
        active_alerts = Alert.objects.filter(user=request.user, is_read=False).count()
    except Exception:
        # Table doesn't exist yet, return 0
        active_alerts = 0

    context = {
        'user': request.user,
        'active_alerts': active_alerts,
        'market_status': 'OPEN',  # This would be dynamic
    }
    return render(request, 'dashboard.html', context)


@login_required
def logout_view(request):
    """Custom logout view"""
    logout(request)
    messages.info(request, 'You have been logged out. The eye closes.')
    return redirect('login')


@login_required
@csrf_exempt
def api_market_data(request):
    """API endpoint for market data"""
    if request.method == 'GET':
        # This would fetch real market data
        sample_data = {
            'AAPL': {'price': 150.25, 'change': 1.25, 'volume': 1000000},
            'GOOGL': {'price': 2750.50, 'change': -5.75, 'volume': 500000},
            'TSLA': {'price': 850.75, 'change': 15.30, 'volume': 2000000},
        }
        return JsonResponse(sample_data)


@login_required
def terminal_view(request):
    """Terminal interface view"""
    return render(request, 'components/terminal.html')


@login_required
def ai_analysis(request):
    """AI-powered market analysis endpoint"""
    if request.method == 'POST':
        try:
            from ai_core.llm_interface import SauronAI
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
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Method not allowed'}, status=405)