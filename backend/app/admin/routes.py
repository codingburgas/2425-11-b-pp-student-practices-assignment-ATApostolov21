import os
from flask import jsonify, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from app.admin import bp
from app.models import ChurnAnalysis
import pandas as pd
import random

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'csv'

@bp.route('/churn-upload', methods=['POST'])
@login_required
def upload_churn_analysis():
    if current_user.role != 'banking_employee':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Please upload a CSV file'}), 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    
    # Ensure upload directory exists
    os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
    file.save(filepath)
    
    # Mock churn analysis (random for demo)
    mock_results = {
        'total_customers': random.randint(100, 1000),
        'churn_risk_high': random.randint(10, 30),
        'churn_risk_medium': random.randint(20, 40),
        'churn_risk_low': random.randint(40, 60),
        'key_factors': [
            'Account Balance',
            'Transaction Frequency',
            'Customer Service Interactions',
            'Product Usage'
        ]
    }
    
    analysis = ChurnAnalysis(
        employee_id=current_user.id,
        file_path=filepath,
        results=mock_results
    )
    
    db.session.add(analysis)
    db.session.commit()
    
    return jsonify({
        'message': 'Churn analysis completed',
        'analysis_id': analysis.id,
        'results': mock_results
    }) 