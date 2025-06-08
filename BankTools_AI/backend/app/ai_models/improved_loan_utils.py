"""
Utility functions for the improved loan approval model
Handles frontend form data and provides prediction services
"""

import os
import traceback
from typing import Dict, Any, Optional, Tuple
from .improved_loan_model import ImprovedLoanPredictor

# Global model instance
_improved_loan_predictor = None

def _safe_log(message: str, level: str = 'info'):
    """Safe logging that works with or without Flask context"""
    try:
        from flask import current_app
        if level == 'error':
            current_app.logger.error(message)
        elif level == 'warning':
            current_app.logger.warning(message)
        else:
            current_app.logger.info(message)
    except (ImportError, RuntimeError):
        print(f"[{level.upper()}] {message}")

def get_improved_loan_predictor():
    """Get the improved loan predictor instance, loading it if necessary"""
    global _improved_loan_predictor
    
    # If we have a cached instance, use it
    if _improved_loan_predictor and _improved_loan_predictor.is_trained:
        return _improved_loan_predictor
    
    # Load the model directly
    try:
        # Find the model file
        try:
            # Try Flask app context first
            from flask import current_app
            backend_dir = os.path.dirname(current_app.root_path)
            models_dir = os.path.join(backend_dir, 'models')
        except RuntimeError:
            # No Flask context, use relative path
            current_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.dirname(os.path.dirname(current_dir))
            models_dir = os.path.join(backend_dir, 'models')
        
        model_path = os.path.join(models_dir, 'improved_loan_model.joblib')
        
        if os.path.exists(model_path):
            _improved_loan_predictor = ImprovedLoanPredictor()
            _improved_loan_predictor.load_model(model_path)
            _safe_log(f"Improved loan model loaded from {model_path}", 'info')
            return _improved_loan_predictor
        else:
            _safe_log(f"Improved loan model file not found at {model_path}", 'warning')
            
    except Exception as e:
        _safe_log(f"Error loading improved loan model: {str(e)}", 'error')
        traceback.print_exc()
    
    return None

def validate_frontend_loan_data(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
    """
    Validate loan application data from frontend form
    
    Args:
        data: The application data to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not data:
        return False, "No data provided"
    
    # Required fields for frontend form
    required_fields = ['amount', 'purpose', 'income', 'employment_years', 'credit_score']
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    
    if missing_fields:
        return False, f'Missing required fields: {", ".join(missing_fields)}'
    
    # Additional validation
    try:
        amount = float(data.get('amount', 0))
        if amount <= 0:
            return False, "Loan amount must be greater than 0"
        
        income = float(data.get('income', 0))
        if income <= 0:
            return False, "Income must be greater than 0"
        
        credit_score = int(data.get('credit_score', 0))
        if credit_score < 300 or credit_score > 850:
            return False, "Credit score must be between 300 and 850"
        
        employment_years = float(data.get('employment_years', 0))
        if employment_years < 0:
            return False, "Employment years cannot be negative"
        
        purpose = str(data.get('purpose', '')).strip()
        if not purpose:
            return False, "Loan purpose is required"
            
    except (ValueError, TypeError) as e:
        return False, f"Invalid data types in application: {str(e)}"
    
    return True, None

def predict_loan_approval_improved(application_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predict loan approval using the improved model
    
    Args:
        application_data: Frontend form data with keys:
            - amount: Loan amount
            - purpose: Loan purpose
            - income: Annual income
            - employment_years: Years of employment
            - credit_score: Credit score
        
    Returns:
        Prediction result dictionary
    """
    try:
        # Get the improved model
        predictor = get_improved_loan_predictor()
        
        if predictor and predictor.is_trained:
            try:
                # Validate input data
                is_valid, error_message = validate_frontend_loan_data(application_data)
                if not is_valid:
                    return {
                        'approval_status': 'Rejected',
                        'approval_probability': 0.0,
                        'confidence_level': 'High',
                        'recommendations': [f"Data validation error: {error_message}"],
                        'prediction_method': 'validation_error'
                    }
                
                # Use the improved model for prediction
                result = predictor.predict(application_data)
                result['prediction_method'] = 'improved_ai_model'
                
                _safe_log(f"Improved AI model prediction: {result['approval_status']} "
                         f"(probability: {result['approval_probability']:.3f})", 'info')
                
                return result
                
            except Exception as e:
                _safe_log(f"Error using improved AI model: {str(e)}", 'error')
                traceback.print_exc()
                # Fall through to fallback prediction
        else:
            _safe_log("Improved AI model not available, using fallback prediction", 'warning')
        
        # Fallback to rule-based prediction
        return rule_based_prediction_frontend(application_data)
        
    except Exception as e:
        _safe_log(f"Error in improved loan prediction: {str(e)}", 'error')
        traceback.print_exc()
        return {
            'approval_status': 'Rejected',
            'approval_probability': 0.0,
            'confidence_level': 'Low',
            'recommendations': ['System error occurred. Please try again later.'],
            'prediction_method': 'error_fallback'
        }

def rule_based_prediction_frontend(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Enhanced rule-based prediction for frontend form data
    
    Args:
        data: Frontend application data
        
    Returns:
        Prediction result dictionary
    """
    try:
        credit_score = float(data.get('credit_score', 650))
        income = float(data.get('income', 50000))
        employment_years = float(data.get('employment_years', 2))
        amount = float(data.get('amount', 100000))
        purpose = str(data.get('purpose', 'Personal/Other'))
        
        # Calculate debt-to-income ratio (approximate monthly payment)
        monthly_income = income / 12
        estimated_monthly_payment = (amount * 0.06) / 12  # 6% annual rate estimate
        debt_to_income = estimated_monthly_payment / monthly_income if monthly_income > 0 else 1
        
        # Enhanced rule-based scoring
        score = 0
        
        # Credit score factor (35% weight)
        if credit_score >= 750:
            score += 35
        elif credit_score >= 700:
            score += 28
        elif credit_score >= 650:
            score += 20
        elif credit_score >= 600:
            score += 12
        else:
            score += 5
        
        # Income factor (25% weight)
        if income >= 100000:
            score += 25
        elif income >= 75000:
            score += 22
        elif income >= 50000:
            score += 18
        elif income >= 30000:
            score += 12
        else:
            score += 6
        
        # Employment stability (20% weight)
        if employment_years >= 10:
            score += 20
        elif employment_years >= 5:
            score += 17
        elif employment_years >= 3:
            score += 14
        elif employment_years >= 2:
            score += 10
        elif employment_years >= 1:
            score += 6
        else:
            score += 2
        
        # Debt-to-income ratio (15% weight)
        if debt_to_income <= 0.20:
            score += 15
        elif debt_to_income <= 0.28:
            score += 12
        elif debt_to_income <= 0.36:
            score += 8
        elif debt_to_income <= 0.43:
            score += 4
        else:
            score -= 5
        
        # Loan purpose factor (5% weight)
        purpose_scores = {
            'Home Purchase': 5,
            'Home Refinance': 4,
            'Education': 3,
            'Auto Loan': 2,
            'Business Loan': 1,
            'Debt Consolidation': 1,
            'Personal Loan': 0,
            'Personal/Other': -1
        }
        score += purpose_scores.get(purpose, 0)
        
        # Determine approval
        approval_probability = min(0.95, max(0.05, score / 100))
        approved = score >= 65  # 65% threshold for approval
        
        # Generate recommendations
        recommendations = []
        if not approved:
            if score >= 55:  # Close to approval
                recommendations.extend([
                    "Your application is close to approval. Consider these improvements:",
                    f"• Improve credit score (current: {int(credit_score)}). Target: 700+",
                    "• Consider a co-applicant to strengthen your application",
                    "• Reduce loan amount if possible"
                ])
            else:
                recommendations.extend([
                    "Your application needs significant improvements:",
                    f"• Substantially improve credit score (current: {int(credit_score)})",
                    "• Increase income or reduce existing debt",
                    "• Build more employment history"
                ])
            
            # Specific recommendations
            if credit_score < 650:
                recommendations.append("• Focus on credit improvement: pay bills on time, reduce credit utilization")
            if income < 50000:
                recommendations.append("• Consider increasing income through additional employment")
            if employment_years < 2:
                recommendations.append("• Build employment history - lenders prefer 2+ years stability")
            if debt_to_income > 0.36:
                recommendations.append("• Improve debt-to-income ratio by reducing loan amount or increasing income")
        else:
            recommendations.extend([
                "Congratulations! Your application meets our approval criteria.",
                "• Prepare documentation: pay stubs, tax returns, bank statements",
                "• Review loan terms and interest rates",
                "• Shop around for competitive rates"
            ])
            
            if approval_probability < 0.8:
                recommendations.append("• Consider improving credit score for better interest rates")
        
        return {
            'approval_probability': float(approval_probability),
            'approval_prediction': int(approved),
            'approval_status': 'Approved' if approved else 'Rejected',
            'confidence_level': 'High' if abs(approval_probability - 0.5) > 0.3 else 'Medium' if abs(approval_probability - 0.5) > 0.15 else 'Low',
            'recommendations': recommendations,
            'prediction_method': 'enhanced_rule_based',
            'score_breakdown': {
                'credit_score_points': min(35, max(5, (credit_score - 300) / 550 * 35)),
                'income_points': min(25, max(6, (income - 20000) / 80000 * 25)),
                'employment_points': min(20, max(2, employment_years / 10 * 20)),
                'debt_to_income_points': max(-5, min(15, (0.5 - debt_to_income) / 0.5 * 15)),
                'purpose_points': purpose_scores.get(purpose, 0),
                'total_score': score
            }
        }
        
    except Exception as e:
        _safe_log(f"Error in rule-based prediction: {str(e)}", 'error')
        return {
            'approval_status': 'Rejected',
            'approval_probability': 0.0,
            'confidence_level': 'Low',
            'recommendations': ['Error processing application. Please check your data and try again.'],
            'prediction_method': 'error_fallback'
        }

def format_improved_prediction_response(prediction: Dict[str, Any], request_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Format prediction response for API consistency
    
    Args:
        prediction: Raw prediction result from improved model
        request_id: Optional request ID for tracking
        
    Returns:
        Formatted response dictionary
    """
    response = {
        'success': True,
        'prediction': {
            'approval_status': prediction['approval_status'],
            'approval_probability': round(prediction['approval_probability'], 3),
            'confidence_level': prediction['confidence_level'],
            'recommendations': prediction['recommendations']
        },
        'model_info': {
            'prediction_method': prediction.get('prediction_method', 'unknown'),
            'model_available': prediction.get('prediction_method') == 'improved_ai_model',
            'selected_features': prediction.get('selected_features_used', []),
            'model_type': prediction.get('model_type', 'Unknown')
        }
    }
    
    if request_id:
        response['request_id'] = request_id
    
    # Add score breakdown if available (from rule-based prediction)
    if 'score_breakdown' in prediction:
        response['score_breakdown'] = prediction['score_breakdown']
    
    return response

# Backward compatibility function
def predict_loan_approval_unified(application_data: Dict[str, Any], use_simple_format: bool = True) -> Dict[str, Any]:
    """
    Unified prediction function that works with both old and new systems
    
    Args:
        application_data: Application data (frontend format if use_simple_format=True)
        use_simple_format: Whether the input is in frontend format
        
    Returns:
        Prediction result
    """
    if use_simple_format:
        # Use the improved model for frontend data
        return predict_loan_approval_improved(application_data)
    else:
        # For backward compatibility with old format, try to convert
        # This handles the old model format with Gender, Married, etc.
        try:
            # Try to use the improved model anyway
            predictor = get_improved_loan_predictor()
            if predictor and predictor.is_trained:
                # The improved model can handle both formats
                result = predictor.predict(application_data)
                result['prediction_method'] = 'improved_ai_model_legacy'
                return result
        except Exception as e:
            _safe_log(f"Error using improved model with legacy format: {str(e)}", 'warning')
        
        # Fallback to rule-based for legacy format
        return rule_based_prediction_frontend(application_data) 