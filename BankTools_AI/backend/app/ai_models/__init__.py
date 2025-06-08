"""
AI Models Package for BankTools_AI

This package contains clean, modular AI models for:
- Churn Prediction (Customer retention analysis)
- Loan Approval Prediction (Credit risk assessment)

The models have been organized into separate modules:
- churn/: Churn prediction models and utilities
- loan/: Loan prediction models and utilities  
- shared/: Shared utilities used across different models

For backward compatibility, the models maintain the same interface:
- ChurnPredictor: Clean churn prediction model
- LoanPredictor: Clean loan prediction model
"""

# Import clean models from their respective modules
from .churn import ChurnPredictor
from .loan import LoanPredictor

# Import shared utility classes
from .shared import (
    BasePredictor, LogisticRegression, ModelEvaluator, DataUtils,
    DataValidator, DataCleaner, LoanDataCleaner,
    ChurnFeatureEngineer, LoanFeatureEngineer,
    DataQualityAssessment, EnhancedDataCleaner
)

# Backward compatibility - original models are no longer available
# but we provide helpful error messages
class OriginalChurnPredictor:
    def __init__(self):
        raise ImportError(
            "Original churn model has been removed. Use ChurnPredictor instead.\n"
            "from app.ai_models import ChurnPredictor"
        )

class OriginalLoanPredictor:
    def __init__(self):
        raise ImportError(
            "Original loan model has been removed. Use LoanPredictor instead.\n"
            "from app.ai_models import LoanPredictor"
        )

__all__ = [
    # Clean models (recommended)
    'ChurnPredictor',
    'LoanPredictor',
    
    # Shared utility classes
    'BasePredictor',
    'LogisticRegression', 
    'ModelEvaluator',
    'DataUtils',
    'DataValidator',
    'DataCleaner',
    'LoanDataCleaner',
    'ChurnFeatureEngineer',
    'LoanFeatureEngineer',
    'DataQualityAssessment',
    'EnhancedDataCleaner',
    
    # Original models (removed - here for error messages)
    'OriginalChurnPredictor',
    'OriginalLoanPredictor',
]

__version__ = '2.0.0'
__author__ = 'BankTools_AI Team'
__description__ = 'Clean, modular AI models for banking applications'

def create_blueprint():
    """Create and configure the AI models blueprint"""
    from .routes import ai_models
    return ai_models 