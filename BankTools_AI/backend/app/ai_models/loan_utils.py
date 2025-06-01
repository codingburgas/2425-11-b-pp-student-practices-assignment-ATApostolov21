"""
Loan Prediction Utilities
Provides unified interface for loan predictions across different endpoints
"""

import os
import traceback
from typing import Dict, Any, Optional, Tuple

# Global model instance for reuse
_loan_predictor = None

def _safe_log(message: str, level: str = 'info'):
    """Safely log messages, handling cases where Flask context is not available"""
    try:
        from flask import current_app
        if level == 'info':
            current_app.logger.info(message)
        elif level == 'warning':
            current_app.logger.warning(message)
        elif level == 'error':
            current_app.logger.error(message)
    except RuntimeError:
        # Flask context not available, use print instead
        print(f"[{level.upper()}] {message}")

def get_loan_predictor():
    """Get the loan predictor instance, loading it if necessary"""
    global _loan_predictor
    
    # Try to get from routes module first (if in Flask context)
    try:
        from app.ai_models.routes import loan_predictor
        if loan_predictor and loan_predictor.is_trained:
            _loan_predictor = loan_predictor
            return loan_predictor
    except (ImportError, AttributeError):
        pass
    
    # If we have a cached instance, use it
    if _loan_predictor and _loan_predictor.is_trained:
        return _loan_predictor
    
    # Load the model directly
    try:
        from app.ai_models.loan_model import LoanPredictor
        
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
        
        model_path = os.path.join(models_dir, 'loan_model.joblib')
        
        if os.path.exists(model_path):
            _loan_predictor = LoanPredictor()
            _loan_predictor.load_model(model_path)
            _safe_log(f"Loan model loaded from {model_path}", 'info')
            return _loan_predictor
        else:
            _safe_log(f"Loan model file not found at {model_path}", 'warning')
            
    except Exception as e:
        _safe_log(f"Error loading loan model: {str(e)}", 'error')
    
    return None

def validate_loan_application_data(data: Dict[str, Any], required_fields: list) -> Tuple[bool, Optional[str]]:
    """
    Validate loan application data
    
    Args:
        data: The application data to validate
        required_fields: List of required field names
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not data:
        return False, "No data provided"
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, f'Missing required fields: {", ".join(missing_fields)}'
    
    # Additional validation
    try:
        if data.get('amount', 0) <= 0:
            return False, "Loan amount must be greater than 0"
        
        if data.get('income', 0) <= 0:
            return False, "Income must be greater than 0"
        
        credit_score = data.get('credit_score', 0)
        if credit_score < 300 or credit_score > 850:
            return False, "Credit score must be between 300 and 850"
        
        employment_years = data.get('employment_years', 0)
        if employment_years < 0:
            return False, "Employment years cannot be negative"
            
    except (ValueError, TypeError):
        return False, "Invalid data types in application"
    
    return True, None

def map_simple_form_to_model_format(form_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Map simplified loan request form data to the format expected by the AI model
    
    Args:
        form_data: Simple form data with basic fields
        
    Returns:
        Dictionary formatted for the AI model
    """
    # Convert amount to thousands (model expects loan amount in thousands)
    loan_amount = form_data.get('amount', 0) / 1000
    
    # Determine credit history based on credit score
    credit_history = 1 if form_data.get('credit_score', 0) >= 650 else 0
    
    # Map employment stability
    employment_years = form_data.get('employment_years', 0)
    self_employed = 'No' if employment_years >= 2 else 'Yes'  # Assume stable employment
    
    model_data = {
        'Gender': 'Male',  # Default - could be enhanced to collect this
        'Married': 'Yes',  # Default - could be enhanced to collect this  
        'Dependents': 0,   # Default - could be enhanced to collect this
        'Education': 'Graduate',  # Default based on typical banking customers
        'Self_Employed': self_employed,
        'ApplicantIncome': form_data.get('income', 0),
        'CoapplicantIncome': 0,   # Default - could be enhanced to collect this
        'LoanAmount': loan_amount,
        'Loan_Amount_Term': 360,  # Default 30-year term
        'Credit_History': credit_history,
        'Property_Area': 'Urban'  # Default - could be enhanced to collect this
    }
    
    return model_data

def rule_based_prediction(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Fallback rule-based prediction when AI model is not available
    
    Args:
        data: Application data
        
    Returns:
        Prediction result dictionary
    """
    credit_score = data.get('credit_score', 0)
    income = data.get('income', 0)
    employment_years = data.get('employment_years', 0)
    amount = data.get('amount', 0)
    
    # Calculate debt-to-income ratio (approximate monthly payment)
    monthly_income = income / 12
    estimated_monthly_payment = (amount * 0.05) / 12  # Rough estimate
    debt_to_income = estimated_monthly_payment / monthly_income if monthly_income > 0 else 1
    
    # Rule-based scoring
    score = 0
    
    # Credit score factor (40% weight)
    if credit_score >= 750:
        score += 40
    elif credit_score >= 700:
        score += 30
    elif credit_score >= 650:
        score += 20
    else:
        score += 10
    
    # Income factor (30% weight)
    if income >= 75000:
        score += 30
    elif income >= 50000:
        score += 25
    elif income >= 30000:
        score += 20
    else:
        score += 10
    
    # Employment stability (20% weight)
    if employment_years >= 5:
        score += 20
    elif employment_years >= 2:
        score += 15
    else:
        score += 5
    
    # Debt-to-income ratio (10% weight)
    if debt_to_income <= 0.28:
        score += 10
    elif debt_to_income <= 0.36:
        score += 5
    
    # Determine approval
    approval_probability = min(0.95, max(0.05, score / 100))
    approved = score >= 60  # 60% threshold
    
    recommendations = []
    if approved:
        recommendations.extend([
            "Congratulations! Your application meets our basic criteria",
            "Please provide required documentation",
            "Review loan terms and conditions carefully"
        ])
    else:
        if credit_score < 650:
            recommendations.append("Improve your credit score before reapplying")
        if income < 30000:
            recommendations.append("Consider increasing your income or adding a co-applicant")
        if debt_to_income > 0.36:
            recommendations.append("Reduce existing debt to improve debt-to-income ratio")
        if employment_years < 2:
            recommendations.append("Establish longer employment history")
    
    return {
        'approval_probability': approval_probability,
        'approval_prediction': 1 if approved else 0,
        'approval_status': 'Approved' if approved else 'Rejected',
        'confidence_level': 'Medium',  # Rule-based has medium confidence
        'recommendations': recommendations,
        'prediction_method': 'rule_based'
    }

def predict_loan_approval(application_data: Dict[str, Any], use_simple_format: bool = False) -> Dict[str, Any]:
    """
    Unified loan approval prediction function
    
    Args:
        application_data: The loan application data
        use_simple_format: Whether to map simple form data to model format
        
    Returns:
        Prediction result dictionary with standardized format
    """
    try:
        # Get the AI model
        predictor = get_loan_predictor()
        
        if predictor and predictor.is_trained:
            try:
                # Prepare data for AI model
                if use_simple_format:
                    model_input = map_simple_form_to_model_format(application_data)
                else:
                    model_input = application_data
                
                # Get AI prediction
                ai_result = predictor.predict(model_input)
                ai_result['prediction_method'] = 'ai_model'
                
                _safe_log(f"AI model prediction: {ai_result['approval_status']} "
                         f"(probability: {ai_result['approval_probability']:.3f})", 'info')
                
                return ai_result
                
            except Exception as e:
                _safe_log(f"Error using AI model: {str(e)}", 'error')
                traceback.print_exc()
                # Fall through to rule-based prediction
        else:
            _safe_log("AI model not available, using rule-based prediction", 'warning')
        
        # Fallback to rule-based prediction
        return rule_based_prediction(application_data)
        
    except Exception as e:
        _safe_log(f"Error in loan prediction: {str(e)}", 'error')
        traceback.print_exc()
        
        # Emergency fallback
        return {
            'approval_probability': 0.5,
            'approval_prediction': 0,
            'approval_status': 'Rejected',
            'confidence_level': 'Low',
            'recommendations': ['Application could not be processed. Please contact support.'],
            'prediction_method': 'error_fallback'
        }

def format_prediction_response(prediction: Dict[str, Any], request_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Format prediction response for API consistency
    
    Args:
        prediction: Raw prediction result
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
            'model_available': prediction.get('prediction_method') == 'ai_model'
        }
    }
    
    if request_id:
        response['request_id'] = request_id
    
    return response 