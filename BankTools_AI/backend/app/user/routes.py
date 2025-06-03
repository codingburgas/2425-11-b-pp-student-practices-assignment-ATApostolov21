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

@bp.route('/loan-requests', methods=['GET'])
@login_required
def get_user_loan_requests():
    """
    Retrieve all loan requests for the authenticated user
    Only banking users can access this endpoint and only their own data
    """
    if current_user.role != 'banking_user':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        # Only get loan requests for the current user
        loan_requests = LoanRequest.query.filter_by(user_id=current_user.id).order_by(LoanRequest.created_at.desc()).all()
        
        loans_data = []
        for loan in loan_requests:
            loans_data.append({
                'id': loan.id,
                'amount': loan.amount,
                'purpose': loan.purpose,
                'income': loan.income,
                'employment_years': loan.employment_years,
                'credit_score': loan.credit_score,
                'prediction': loan.prediction,
                'created_at': loan.created_at.isoformat(),
                'status': loan.prediction.title() if loan.prediction else 'Pending'
            })
        
        return jsonify({
            'loan_requests': loans_data,
            'total_count': len(loans_data)
        })
        
    except Exception as e:
        current_app.logger.error(f"Error fetching loan requests for user {current_user.id}: {str(e)}")
        return jsonify({'error': 'Failed to fetch loan requests'}), 500

@bp.route('/loan-request/<int:loan_id>', methods=['GET'])
@login_required
def get_loan_request_details(loan_id):
    """
    Retrieve details of a specific loan request
    Only the owner can access their own loan request
    """
    if current_user.role != 'banking_user':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        # Ensure user can only access their own loan requests
        loan_request = LoanRequest.query.filter_by(id=loan_id, user_id=current_user.id).first()
        
        if not loan_request:
            return jsonify({'error': 'Loan request not found or access denied'}), 404
        
        loan_data = {
            'id': loan_request.id,
            'amount': loan_request.amount,
            'purpose': loan_request.purpose,
            'income': loan_request.income,
            'employment_years': loan_request.employment_years,
            'credit_score': loan_request.credit_score,
            'prediction': loan_request.prediction,
            'created_at': loan_request.created_at.isoformat(),
            'status': loan_request.prediction.title() if loan_request.prediction else 'Pending'
        }
        
        return jsonify({'loan_request': loan_data})
        
    except Exception as e:
        current_app.logger.error(f"Error fetching loan request {loan_id} for user {current_user.id}: {str(e)}")
        return jsonify({'error': 'Failed to fetch loan request details'}), 500

@bp.route('/loan-request/<int:loan_id>', methods=['DELETE'])
@login_required
def delete_loan_request(loan_id):
    """
    Delete a specific loan request
    Only the owner can delete their own loan request
    """
    if current_user.role != 'banking_user':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        # Ensure user can only delete their own loan requests
        loan_request = LoanRequest.query.filter_by(id=loan_id, user_id=current_user.id).first()
        
        if not loan_request:
            return jsonify({'error': 'Loan request not found or access denied'}), 404
        
        # Store loan details for response
        loan_purpose = loan_request.purpose
        loan_amount = loan_request.amount
        
        # Delete the loan request
        db.session.delete(loan_request)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Loan request for {loan_purpose} (${loan_amount:,.2f}) has been successfully deleted'
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting loan request {loan_id} for user {current_user.id}: {str(e)}")
        return jsonify({'error': 'Failed to delete loan request'}), 500 