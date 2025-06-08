"""
Flask routes for AI model predictions
Provides API endpoints for churn prediction and loan approval
"""

from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
import os
import traceback
from .churn_model import ChurnPredictor
from .loan_model import LoanPredictor
from .loan_utils import (
    validate_frontend_loan_data,
    predict_loan_approval,
    format_prediction_response
)

ai_models = Blueprint('ai_models', __name__)

# Global model instances
churn_predictor = None
loan_predictor = None

def load_models():
    """Load trained models on app startup"""
    global churn_predictor, loan_predictor
    
    try:
        # Get the correct path to the models directory (backend/models/)
        # Go up from app directory to backend, then into models
        backend_dir = os.path.dirname(current_app.root_path)
        models_dir = os.path.join(backend_dir, 'models')
        
        # Load churn model
        churn_model_path = os.path.join(models_dir, 'churn_model.joblib')
        if os.path.exists(churn_model_path):
            churn_predictor = ChurnPredictor()
            churn_predictor.load_model(churn_model_path)
            print("Churn model loaded successfully")
        else:
            print(f"Churn model not found at {churn_model_path}")
            
        # Load loan model
        loan_model_path = os.path.join(models_dir, 'loan_model.joblib')
        if os.path.exists(loan_model_path):
            loan_predictor = LoanPredictor()
            loan_predictor.load_model(loan_model_path)
            print("Loan model loaded successfully")
        else:
            print(f"Loan model not found at {loan_model_path}")
            
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        traceback.print_exc()

def create_blueprint():
    """Create and return the AI models blueprint"""
    return ai_models

@ai_models.route('/predict-churn', methods=['POST'])
@login_required
def predict_churn():
    """
    Predict customer churn probability
    Expected JSON format:
    {
        "CreditScore": 650,
        "Geography": "France",
        "Gender": "Female", 
        "Age": 35,
        "Tenure": 5,
        "Balance": 50000,
        "NumOfProducts": 2,
        "HasCrCard": 1,
        "IsActiveMember": 1,
        "EstimatedSalary": 75000
    }
    """
    try:
        # Check if user has permission (banking employees only)
        if current_user.role != 'banking_employee':
            return jsonify({
                'success': False,
                'error': 'Access denied. Only banking employees can access churn analysis.'
            }), 403
        
        # Check if model is loaded
        if churn_predictor is None or not churn_predictor.is_trained:
            return jsonify({
                'success': False,
                'error': 'Churn prediction model is not available. Please contact administrator.'
            }), 503
        
        # Get customer data from request
        customer_data = request.get_json()
        
        if not customer_data:
            return jsonify({
                'success': False,
                'error': 'No customer data provided'
            }), 400
        
        # Validate required fields
        required_fields = ['CreditScore', 'Geography', 'Gender', 'Age', 'Tenure', 
                          'Balance', 'NumOfProducts', 'HasCrCard', 'IsActiveMember', 'EstimatedSalary']
        
        missing_fields = [field for field in required_fields if field not in customer_data]
        if missing_fields:
            return jsonify({
                'success': False,
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Make prediction
        prediction = churn_predictor.predict(customer_data)
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'customer_data': customer_data
        })
        
    except Exception as e:
        current_app.logger.error(f"Error in churn prediction: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Internal server error during prediction'
        }), 500

@ai_models.route('/predict-loan', methods=['POST'])
@login_required
def predict_loan():
    """
    Predict loan approval probability using prediction system
    Expected JSON format (frontend format):
    {
        "amount": 150000,
        "purpose": "Home Purchase",
        "income": 75000,
        "employment_years": 5,
        "credit_score": 720
    }
    """
    try:
        # Check if user has permission (banking users only)
        if current_user.role != 'banking_user':
            return jsonify({
                'success': False,
                'error': 'Access denied. Only bank customers can access loan prediction.'
            }), 403
        
        # Get applicant data from request
        applicant_data = request.get_json()
        
        # Validate input data using validation
        is_valid, error_message = validate_frontend_loan_data(applicant_data)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': error_message
            }), 400
        
        # Use prediction system
        prediction_result = predict_loan_approval(applicant_data)
        
        # Format response using formatter
        response = format_prediction_response(prediction_result)
        response['applicant_data'] = applicant_data
        
        current_app.logger.info(f"Loan prediction for user {current_user.id}: "
                              f"{prediction_result['approval_status']} using {prediction_result['prediction_method']}")
        
        return jsonify(response)
        
    except Exception as e:
        current_app.logger.error(f"Error in loan prediction: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': 'Internal server error during prediction'
        }), 500

@ai_models.route('/model-status', methods=['GET'])
@login_required
def model_status():
    """Get the status of loaded models"""
    try:
        status = {
            'churn_model': {
                'loaded': churn_predictor is not None and churn_predictor.is_trained,
                'type': 'ChurnPredictor' if churn_predictor else None
            },
            'loan_model': {
                'loaded': loan_predictor is not None and loan_predictor.is_trained,
                'type': 'LoanPredictor' if loan_predictor else None,
                'selected_features': loan_predictor.selected_features if loan_predictor and loan_predictor.is_trained else None
            }
        }
        
        return jsonify({
            'success': True,
            'models': status
        })
        
    except Exception as e:
        current_app.logger.error(f"Error getting model status: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error retrieving model status'
        }), 500

@ai_models.route('/train-models', methods=['POST'])
@login_required
def train_models():
    """
    Endpoint to trigger model training (admin only)
    This should be used carefully as it will retrain models
    """
    try:
        # Check if user is admin/employee
        if current_user.role != 'banking_employee':
            return jsonify({
                'success': False,
                'error': 'Access denied. Only banking employees can trigger model training.'
            }), 403
        
        # This is a placeholder for model training
        # In production, you might want to run this as a background task
        return jsonify({
            'success': True,
            'message': 'Model training initiated. This process may take several minutes.',
            'note': 'Please run the model training scripts manually: python train_churn_model.py and python train_loan_model.py'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error in model training endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Error initiating model training'
        }), 500 