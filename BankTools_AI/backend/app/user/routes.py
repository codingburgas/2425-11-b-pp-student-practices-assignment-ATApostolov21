from flask import jsonify, request, current_app
from flask_login import login_required, current_user, logout_user
from app import db
from app.user import bp
from app.models import LoanRequest, User, ChurnAnalysis
from app.ai_models.loan.loan_utils import (
    validate_frontend_loan_data, 
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

@bp.route('/profile')
@login_required
def profile():
    """Get user profile information"""
    return jsonify({
        'id': current_user.id,
        'email': current_user.email,
        'role': current_user.role,
        'created_at': current_user.created_at.isoformat() if current_user.created_at else None,
        'is_verified': current_user.is_verified,
        'auth_provider': getattr(current_user, 'auth_provider', 'local')
    })

@bp.route('/update-email', methods=['PUT'])
@login_required
def update_email():
    """Update user email address"""
    try:
        data = request.get_json()
        new_email = data.get('email', '').strip().lower()
        
        if not new_email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Basic email validation
        if '@' not in new_email or '.' not in new_email:
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if email is already taken by another user
        existing_user = User.query.filter_by(email=new_email).first()
        if existing_user and existing_user.id != current_user.id:
            return jsonify({'error': 'Email already in use by another account'}), 400
        
        # Update email
        current_user.email = new_email
        current_user.is_verified = False  # Reset verification status
        db.session.commit()
        
        return jsonify({
            'message': 'Email updated successfully',
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'role': current_user.role,
                'is_verified': current_user.is_verified
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error updating email for user {current_user.id}: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update email'}), 500

@bp.route('/update-password', methods=['PUT'])
@login_required
def update_password():
    """Update user password"""
    try:
        data = request.get_json()
        current_password = data.get('currentPassword', '')
        new_password = data.get('newPassword', '')
        confirm_password = data.get('confirmPassword', '')
        
        # Validate input
        if not current_password:
            return jsonify({'error': 'Current password is required'}), 400
        
        if not new_password:
            return jsonify({'error': 'New password is required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400
        
        if new_password != confirm_password:
            return jsonify({'error': 'New passwords do not match'}), 400
        
        # Check if user uses password authentication (not Google OAuth only)
        if not current_user.password_hash:
            return jsonify({'error': 'Password change not available for OAuth accounts'}), 400
        
        # Verify current password
        if not current_user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Update password
        current_user.set_password(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password updated successfully'})
        
    except Exception as e:
        current_app.logger.error(f"Error updating password for user {current_user.id}: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Failed to update password'}), 500

@bp.route('/loan-requests')
@login_required
def get_loan_requests():
    """Get user's loan request history"""
    if current_user.role != 'banking_user':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        loan_requests = LoanRequest.query.filter_by(user_id=current_user.id).order_by(LoanRequest.created_at.desc()).all()
        
        requests_data = []
        for req in loan_requests:
            # Convert prediction to proper status
            status = 'Pending'  # Default status
            if req.prediction:
                prediction_lower = req.prediction.lower().strip()
                if prediction_lower == 'approved':
                    status = 'Approved'
                elif prediction_lower == 'rejected':
                    status = 'Rejected'
                else:
                    # Handle any other prediction values by capitalizing them
                    status = req.prediction.title()
            
            requests_data.append({
                'id': req.id,
                'amount': req.amount,
                'purpose': req.purpose,
                'income': req.income,
                'employment_years': req.employment_years,
                'credit_score': req.credit_score,
                'prediction': req.prediction,
                'status': status,
                'created_at': req.created_at.isoformat() if req.created_at else None
            })
        
        return jsonify({'loan_requests': requests_data})
        
    except Exception as e:
        current_app.logger.error(f"Error fetching loan requests: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/loan-request', methods=['POST'])
@login_required
def submit_loan_request():
    """
    Submit a loan request using the AI prediction system
    This endpoint now uses the new model with SelectKBest feature selection
    """
    if current_user.role != 'banking_user':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        data = request.get_json()
        
        # Validate input data using validation
        is_valid, error_message = validate_frontend_loan_data(data)
        
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        # Get AI prediction using system
        prediction_result = predict_loan_approval(data)
        
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
        response['message'] = 'Loan request processed successfully with AI model'
        
        current_app.logger.info(f"Loan request {loan_request.id} processed for user {current_user.id}: "
                              f"{prediction_result['approval_status']} using {prediction_result['prediction_method']}")
        
        return jsonify(response)
        
    except Exception as e:
        current_app.logger.error(f"Error in loan request processing: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': 'Internal server error during loan request processing'}), 500

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
        
        # Convert prediction to proper status
        status = 'Pending'  # Default status
        if loan_request.prediction:
            prediction_lower = loan_request.prediction.lower().strip()
            if prediction_lower == 'approved':
                status = 'Approved'
            elif prediction_lower == 'rejected':
                status = 'Rejected'
            else:
                # Handle any other prediction values by capitalizing them
                status = loan_request.prediction.title()
        
        loan_data = {
            'id': loan_request.id,
            'amount': loan_request.amount,
            'purpose': loan_request.purpose,
            'income': loan_request.income,
            'employment_years': loan_request.employment_years,
            'credit_score': loan_request.credit_score,
            'prediction': loan_request.prediction,
            'status': status,
            'created_at': loan_request.created_at.isoformat()
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

@bp.route('/delete-account', methods=['DELETE'])
@login_required
def delete_account():
    """
    Delete user account and all associated data
    This is a permanent action that cannot be undone
    """
    try:
        user_id = current_user.id
        user_email = current_user.email
        
        # Delete all associated loan requests
        LoanRequest.query.filter_by(user_id=user_id).delete()
        
        # Delete all associated churn analyses
        ChurnAnalysis.query.filter_by(employee_id=user_id).delete()
        
        # Log out the user before deleting the account
        logout_user()
        
        # Delete the user account
        user = User.query.get(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            
            current_app.logger.info(f"User account {user_email} (ID: {user_id}) has been successfully deleted")
            
            return jsonify({
                'success': True,
                'message': 'Account has been permanently deleted. All your data has been removed.'
            })
        else:
            return jsonify({'error': 'User not found'}), 404
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting user account {current_user.id}: {str(e)}")
        return jsonify({'error': 'Failed to delete account. Please try again.'}), 500 