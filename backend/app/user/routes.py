from flask import jsonify, request
from flask_login import login_required, current_user
from app import db
from app.user import bp
from app.models import LoanRequest
import random

@bp.route('/loan-request', methods=['POST'])
@login_required
def submit_loan_request():
    if current_user.role != 'banking_user':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    data = request.get_json()
    
    loan_request = LoanRequest(
        user_id=current_user.id,
        amount=data['amount'],
        purpose=data['purpose'],
        income=data['income'],
        employment_years=data['employment_years'],
        credit_score=data['credit_score'],
        # Mock AI prediction (random for demo)
        prediction='approved' if random.random() > 0.3 else 'rejected'
    )
    
    db.session.add(loan_request)
    db.session.commit()
    
    return jsonify({
        'message': 'Loan request processed',
        'prediction': loan_request.prediction,
        'request_id': loan_request.id
    }) 