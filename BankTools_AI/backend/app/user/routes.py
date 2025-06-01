from flask import jsonify, request, current_app
from flask_login import login_required, current_user
from app import db
from app.user import bp
from app.models import LoanRequest
from app.ai_models.loan_utils import (
    validate_loan_application_data, 
    predict_loan_approval,
    format_prediction_response
)
import traceback

def get_loan_predictor():
    """Get the loan predictor instance from the AI models module"""
    try:
        from app.ai_models.routes import loan_predictor
        return loan_predictor
    except ImportError:
        return None

def map_form_data_to_model_format(form_data):
    """
    Map the simple loan request form data to the format expected by the AI model
    This function handles the conversion between the simplified form and the full model input
    """
    # Default values for fields not in the simple form
    model_data = {
        'Gender': 'Male',  # Default, could be enhanced to collect this
        'Married': 'Yes',  # Default, could be enhanced to collect this
        'Dependents': 0,   # Default, could be enhanced to collect this
        'Education': 'Graduate',  # Default based on typical banking customers
        'Self_Employed': 'No',    # Default, could be enhanced to collect this
        'ApplicantIncome': form_data.get('income', 0),
        'CoapplicantIncome': 0,   # Default, could be enhanced to collect this
        'LoanAmount': form_data.get('amount', 0) / 1000,  # Convert to thousands
        'Loan_Amount_Term': 360,  # Default 30-year term
        'Credit_History': 1 if form_data.get('credit_score', 0) >= 650 else 0,
        'Property_Area': 'Urban'  # Default, could be enhanced to collect this
    }
    
    # Enhance mapping based on available data
    if form_data.get('employment_years', 0) >= 5:
        model_data['Self_Employed'] = 'No'  # Stable employment
    
    return model_data

@bp.route('/loan-request', methods=['POST'])
@login_required
def submit_loan_request():
    """
    Submit a loan request using the unified AI prediction system
    This endpoint now uses the real AI model with fallback to rule-based prediction
    """
    if current_user.role != 'banking_user':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        data = request.get_json()
        
        # Validate input data
        required_fields = ['amount', 'purpose', 'income', 'employment_years', 'credit_score']
        is_valid, error_message = validate_loan_application_data(data, required_fields)
        
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        # Get AI prediction using unified system
        prediction_result = predict_loan_approval(data, use_simple_format=True)
        
        # Create loan request record
        loan_request = LoanRequest(
            user_id=current_user.id,
            amount=data['amount'],
            purpose=data['purpose'],
            income=data['income'],
            employment_years=data['employment_years'],
            credit_score=data['credit_score'],
            prediction=prediction_result['approval_status'].lower()
        )
        
        db.session.add(loan_request)
        db.session.commit()
        
        # Format response using utility function
        response = format_prediction_response(prediction_result, loan_request.id)
        response['message'] = 'Loan request processed successfully'
        
        current_app.logger.info(f"Loan request {loan_request.id} processed for user {current_user.id}: "
                              f"{prediction_result['approval_status']} using {prediction_result['prediction_method']}")
        
        return jsonify(response)
        
    except Exception as e:
        current_app.logger.error(f"Error in loan request processing: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error during loan request processing'}), 500 