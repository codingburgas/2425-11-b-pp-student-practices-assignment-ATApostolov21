"""
AI Models module for BankTools_AI
Provides machine learning prediction capabilities
"""

from flask import Blueprint

def create_blueprint():
    """Create and configure the AI models blueprint"""
    from .routes import ai_models
    return ai_models 