# ai_core/llm_interface.py
import anthropic
import os
from django.conf import settings


class SauronAI:
    def __init__(self):
        # Use Claude instead of OpenAI
        self.client = anthropic.Anthropic(
            api_key=os.getenv('ANTHROPIC_API_KEY')
        )

    def analyze_market(self, data):
        """Analyze market data using Claude"""
        try:
            message = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1000,
                temperature=0.7,
                system="You are Sauron Vision, an advanced AI trading assistant. Provide insightful market analysis.",
                messages=[
                    {
                        "role": "user",
                        "content": f"Analyze this market data and provide trading insights: {data}"
                    }
                ]
            )
            return message.content[0].text
        except Exception as e:
            return f"Analysis error: {str(e)}"

    def generate_strategy(self, parameters):
        """Generate trading strategy using Claude"""
        try:
            message = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=1500,
                temperature=0.8,
                system="You are a quantitative trading strategist. Create detailed trading strategies.",
                messages=[
                    {
                        "role": "user",
                        "content": f"Create a trading strategy with these parameters: {parameters}"
                    }
                ]
            )
            return message.content[0].text
        except Exception as e:
            return f"Strategy generation error: {str(e)}"

    def explain_signal(self, signal_data):
        """Explain trading signals in plain language"""
        try:
            message = self.client.messages.create(
                model="claude-3-opus-20240229",
                max_tokens=500,
                temperature=0.5,
                system="Explain trading signals clearly and concisely.",
                messages=[
                    {
                        "role": "user",
                        "content": f"Explain this trading signal: {signal_data}"
                    }
                ]
            )
            return message.content[0].text
        except Exception as e:
            return f"Signal explanation error: {str(e)}"