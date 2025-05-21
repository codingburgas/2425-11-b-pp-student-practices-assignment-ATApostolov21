from flask import request, jsonify
from flask_login import login_required, current_user
from functools import wraps

from . import user
from .. import db
from ..models import User, LoanPrediction, UserRole
from ..ai_models.loan_model import loan_model


def banking_user_required(f):
    """
    Custom decorator to restrict access to banking users.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_banking_user():
            return jsonify({'error': 'Access denied. Banking User role required.'}), 403
        return f(*args, **kwargs)
    return decorated_function


@user.route('/dashboard', methods=['GET'])
@login_required
@banking_user_required
def dashboard():
    """
    Retrieve the banking user's dashboard data, including past loan predictions.
    """
    # Get user's loan prediction history, ordered by most recent first
    loan_predictions = LoanPrediction.query.filter_by(user_id=current_user.id)\
        .order_by(LoanPrediction.created_at.desc()).all()
    
    prediction_data = []
    for pred in loan_predictions:
        prediction_data.append({
            'id': pred.id,
            'loan_amount': pred.loan_amount,
            'loan_term': pred.loan_term,
            'credit_score': pred.credit_score,
            'annual_income': pred.annual_income,
            'employment_years': pred.employment_years,
            'debt_to_income': pred.debt_to_income,
            'approved': pred.approved,
            'approval_probability': pred.approval_probability,
            'created_at': pred.created_at.isoformat()
        })
    
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email
        },
        'loan_predictions': prediction_data,
        'prediction_count': len(prediction_data)
    }), 200


@user.route('/loan-prediction', methods=['POST'])
@login_required
@banking_user_required
def predict_loan():
    """
    Process a loan prediction request from a banking user.
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    # Validate required fields
    required_fields = ['loan_amount', 'loan_term', 'credit_score', 'annual_income', 
                      'employment_years', 'debt_to_income']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Validate data types and ranges
    try:
        loan_amount = float(data['loan_amount'])
        if loan_amount <= 0:
            return jsonify({'error': 'Loan amount must be positive'}), 400
            
        loan_term = int(data['loan_term'])
        if loan_term <= 0:
            return jsonify({'error': 'Loan term must be positive'}), 400
            
        credit_score = int(data['credit_score'])
        if credit_score < 300 or credit_score > 850:
            return jsonify({'error': 'Credit score must be between 300 and 850'}), 400
            
        annual_income = float(data['annual_income'])
        if annual_income <= 0:
            return jsonify({'error': 'Annual income must be positive'}), 400
            
        employment_years = float(data['employment_years'])
        if employment_years < 0:
            return jsonify({'error': 'Employment years cannot be negative'}), 400
            
        debt_to_income = float(data['debt_to_income'])
        if debt_to_income < 0 or debt_to_income > 100:
            return jsonify({'error': 'Debt-to-income ratio must be between 0 and 100'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid data type in one or more fields'}), 400
    
    # Get prediction from the model
    prediction_result = loan_model.predict({
        'loan_amount': loan_amount,
        'loan_term': loan_term,
        'credit_score': credit_score,
        'annual_income': annual_income,
        'employment_years': employment_years,
        'debt_to_income': debt_to_income
    })
    
    # Create a new loan prediction record
    loan_prediction = LoanPrediction(
        user_id=current_user.id,
        loan_amount=loan_amount,
        loan_term=loan_term,
        credit_score=credit_score,
        annual_income=annual_income,
        employment_years=employment_years,
        debt_to_income=debt_to_income,
        approved=prediction_result['approved'],
        approval_probability=prediction_result['approval_probability']
    )
    
    # Save to database
    db.session.add(loan_prediction)
    db.session.commit()
    
    # Return the prediction result
    return jsonify({
        'prediction': {
            'id': loan_prediction.id,
            'approved': loan_prediction.approved,
            'approval_probability': loan_prediction.approval_probability,
            'created_at': loan_prediction.created_at.isoformat()
        }
    }), 200


@user.route('/loan-predictions', methods=['GET'])
@login_required
@banking_user_required
def get_loan_predictions():
    """
    Get all loan predictions for the current user.
    """
    # Get optional limit parameter
    limit = request.args.get('limit', default=10, type=int)
    
    # Get user's loan prediction history, ordered by most recent first
    loan_predictions = LoanPrediction.query.filter_by(user_id=current_user.id)\
        .order_by(LoanPrediction.created_at.desc())\
        .limit(limit).all()
    
    prediction_data = []
    for pred in loan_predictions:
        prediction_data.append({
            'id': pred.id,
            'loan_amount': pred.loan_amount,
            'loan_term': pred.loan_term,
            'credit_score': pred.credit_score,
            'annual_income': pred.annual_income,
            'employment_years': pred.employment_years,
            'debt_to_income': pred.debt_to_income,
            'approved': pred.approved,
            'approval_probability': pred.approval_probability,
            'created_at': pred.created_at.isoformat()
        })
    
    return jsonify({
        'loan_predictions': prediction_data,
        'count': len(prediction_data)
    }), 200


@user.route('/loan-prediction/<int:prediction_id>', methods=['GET'])
@login_required
@banking_user_required
def get_loan_prediction(prediction_id):
    """
    Get details for a specific loan prediction.
    """
    loan_prediction = LoanPrediction.query.filter_by(
        id=prediction_id, user_id=current_user.id).first()
    
    if not loan_prediction:
        return jsonify({'error': 'Loan prediction not found'}), 404
    
    return jsonify({
        'id': loan_prediction.id,
        'loan_amount': loan_prediction.loan_amount,
        'loan_term': loan_prediction.loan_term,
        'credit_score': loan_prediction.credit_score,
        'annual_income': loan_prediction.annual_income,
        'employment_years': loan_prediction.employment_years,
        'debt_to_income': loan_prediction.debt_to_income,
        'approved': loan_prediction.approved,
        'approval_probability': loan_prediction.approval_probability,
        'created_at': loan_prediction.created_at.isoformat()
    }), 200 