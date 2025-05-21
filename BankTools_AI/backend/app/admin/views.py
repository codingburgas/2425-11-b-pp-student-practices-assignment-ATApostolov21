import os
from flask import request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from functools import wraps
import uuid

from . import admin
from .. import db
from ..models import User, ChurnData, ChurnPrediction, UserRole
from ..ai_models.churn_model import churn_model


def banking_employee_required(f):
    """
    Custom decorator to restrict access to banking employees.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_banking_employee():
            return jsonify({'error': 'Access denied. Banking Employee role required.'}), 403
        return f(*args, **kwargs)
    return decorated_function


@admin.route('/dashboard', methods=['GET'])
@login_required
@banking_employee_required
def dashboard():
    """
    Retrieve the banking employee's dashboard data, including uploaded datasets.
    """
    # Get datasets uploaded by the current user
    datasets = ChurnData.query.filter_by(uploaded_by=current_user.id)\
        .order_by(ChurnData.created_at.desc()).all()
    
    dataset_data = []
    for dataset in datasets:
        # Count predictions for this dataset
        prediction_count = ChurnPrediction.query.filter_by(dataset_id=dataset.id).count()
        
        dataset_data.append({
            'id': dataset.id,
            'name': dataset.dataset_name,
            'row_count': dataset.row_count,
            'processed': dataset.processed,
            'created_at': dataset.created_at.isoformat(),
            'prediction_count': prediction_count
        })
    
    return jsonify({
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email
        },
        'datasets': dataset_data,
        'dataset_count': len(dataset_data)
    }), 200


@admin.route('/upload-dataset', methods=['POST'])
@login_required
@banking_employee_required
def upload_dataset():
    """
    Handle dataset upload for churn analysis.
    """
    # Check if the request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    
    # Check if the file is selected
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    # Check file extension
    if not file.filename.lower().endswith('.csv'):
        return jsonify({'error': 'Only CSV files are allowed'}), 400
    
    # Get dataset name from form or use filename
    dataset_name = request.form.get('name', file.filename)
    
    # Secure the filename and create a unique path
    filename = secure_filename(file.filename)
    unique_id = str(uuid.uuid4())
    relative_path = os.path.join('datasets', f"{unique_id}_{filename}")
    
    # Create datasets directory if it doesn't exist
    datasets_dir = os.path.join(current_app.root_path, 'static', 'datasets')
    os.makedirs(datasets_dir, exist_ok=True)
    
    # Save the file
    file_path = os.path.join(current_app.root_path, 'static', relative_path)
    file.save(file_path)
    
    # Count rows in the CSV (excluding header)
    with open(file_path, 'r') as f:
        row_count = sum(1 for _ in f) - 1  # Subtract 1 for header
    
    # Create a new dataset record
    dataset = ChurnData(
        dataset_name=dataset_name,
        file_path=relative_path,
        row_count=row_count,
        uploaded_by=current_user.id
    )
    
    # Save to database
    db.session.add(dataset)
    db.session.commit()
    
    return jsonify({
        'message': 'Dataset uploaded successfully',
        'dataset': {
            'id': dataset.id,
            'name': dataset.dataset_name,
            'row_count': dataset.row_count,
            'created_at': dataset.created_at.isoformat()
        }
    }), 201


@admin.route('/datasets', methods=['GET'])
@login_required
@banking_employee_required
def get_datasets():
    """
    Get all datasets uploaded by the current user.
    """
    # Get optional limit parameter
    limit = request.args.get('limit', default=10, type=int)
    
    # Get datasets uploaded by the current user
    datasets = ChurnData.query.filter_by(uploaded_by=current_user.id)\
        .order_by(ChurnData.created_at.desc())\
        .limit(limit).all()
    
    dataset_data = []
    for dataset in datasets:
        # Count predictions for this dataset
        prediction_count = ChurnPrediction.query.filter_by(dataset_id=dataset.id).count()
        
        dataset_data.append({
            'id': dataset.id,
            'name': dataset.dataset_name,
            'row_count': dataset.row_count,
            'processed': dataset.processed,
            'created_at': dataset.created_at.isoformat(),
            'prediction_count': prediction_count
        })
    
    return jsonify({
        'datasets': dataset_data,
        'count': len(dataset_data)
    }), 200


@admin.route('/dataset/<int:dataset_id>', methods=['GET'])
@login_required
@banking_employee_required
def get_dataset(dataset_id):
    """
    Get details for a specific dataset and its predictions.
    """
    dataset = ChurnData.query.filter_by(id=dataset_id, uploaded_by=current_user.id).first()
    
    if not dataset:
        return jsonify({'error': 'Dataset not found'}), 404
    
    # Get predictions for this dataset (with pagination)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    predictions_query = ChurnPrediction.query.filter_by(dataset_id=dataset.id)\
        .order_by(ChurnPrediction.churn_probability.desc())
        
    predictions_paginated = predictions_query.paginate(page=page, per_page=per_page)
    
    predictions = []
    for pred in predictions_paginated.items:
        predictions.append({
            'id': pred.id,
            'customer_id': pred.customer_id,
            'churn_probability': pred.churn_probability,
            'will_churn': pred.will_churn,
            'created_at': pred.created_at.isoformat()
        })
    
    # Calculate summary statistics
    total_predictions = predictions_query.count()
    if total_predictions > 0:
        churn_count = predictions_query.filter_by(will_churn=True).count()
        churn_rate = churn_count / total_predictions
    else:
        churn_count = 0
        churn_rate = 0
    
    return jsonify({
        'dataset': {
            'id': dataset.id,
            'name': dataset.dataset_name,
            'row_count': dataset.row_count,
            'processed': dataset.processed,
            'created_at': dataset.created_at.isoformat()
        },
        'predictions': predictions,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total_pages': predictions_paginated.pages,
            'total_items': total_predictions
        },
        'statistics': {
            'total_customers': total_predictions,
            'churn_count': churn_count,
            'churn_rate': round(churn_rate, 4),
        }
    }), 200


@admin.route('/process-dataset/<int:dataset_id>', methods=['POST'])
@login_required
@banking_employee_required
def process_dataset(dataset_id):
    """
    Process a dataset to generate churn predictions.
    """
    dataset = ChurnData.query.filter_by(id=dataset_id, uploaded_by=current_user.id).first()
    
    if not dataset:
        return jsonify({'error': 'Dataset not found'}), 404
    
    if dataset.processed:
        return jsonify({'error': 'Dataset has already been processed'}), 400
    
    # Check if file exists
    file_path = os.path.join(current_app.root_path, 'static', dataset.file_path)
    if not os.path.exists(file_path):
        return jsonify({'error': 'Dataset file not found'}), 404
    
    try:
        # Process the dataset with the churn model
        predictions = churn_model.predict_batch(file_path)
        
        # Create prediction records
        for pred in predictions:
            prediction = ChurnPrediction(
                dataset_id=dataset.id,
                customer_id=pred['customer_id'],
                churn_probability=pred['churn_probability'],
                will_churn=pred['will_churn']
            )
            db.session.add(prediction)
        
        # Mark dataset as processed
        dataset.processed = True
        db.session.commit()
        
        # Return basic stats
        churn_count = sum(1 for pred in predictions if pred['will_churn'])
        total_count = len(predictions)
        churn_rate = churn_count / total_count if total_count > 0 else 0
        
        return jsonify({
            'message': 'Dataset processed successfully',
            'predictions_count': len(predictions),
            'statistics': {
                'total_customers': total_count,
                'churn_count': churn_count,
                'churn_rate': round(churn_rate, 4)
            }
        }), 200
        
    except Exception as e:
        # In a real app, log the error
        return jsonify({'error': f'Error processing dataset: {str(e)}'}), 500 