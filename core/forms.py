# core/forms.py
from django import forms
from django.contrib.auth.forms import AuthenticationForm

class SauronLoginForm(forms.Form):
    """Custom login form with Sauron Vision styling"""
    user_id = forms.CharField(
        max_length=50,
        widget=forms.TextInput(attrs={
            'class': 'sauron-input',
            'placeholder': 'Enter your ID',
            'autocomplete': 'off'
        })
    )
    passkey = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'sauron-input',
            'placeholder': 'Enter your Passkey',
            'autocomplete': 'off'
        })
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['user_id'].widget.attrs.update({'autofocus': True})