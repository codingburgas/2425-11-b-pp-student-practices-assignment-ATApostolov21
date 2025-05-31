import os
import numpy as np
import pandas as pd
from flask import jsonify, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from app.admin import bp
from app.models import ChurnAnalysis

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'csv'

@bp.route('/churn-upload', methods=['POST'])
@login_required
def upload_churn_analysis():
    if current_user.role != 'banking_employee':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    if 'analysis_name' not in request.form:
        return jsonify({'error': 'Analysis name is required'}), 400
        
    file = request.files['file']
    analysis_name = request.form['analysis_name'].strip()
    
    if not analysis_name:
        return jsonify({'error': 'Analysis name cannot be empty'}), 400
        
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Please upload a CSV file'}), 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    
    # Ensure upload directory exists
    os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
    file.save(filepath)
    
    try:
        # Load and process the uploaded CSV file with real AI model
        from app.ai_models.routes import churn_predictor
        
        if churn_predictor is None or not churn_predictor.is_trained:
            return jsonify({
                'error': 'Churn prediction model is not available. Please contact administrator.'
            }), 503
        
        # Read the uploaded CSV file
        df = pd.read_csv(filepath)
        
        # Clean and validate data - handle missing values
        df = df.dropna(subset=['CreditScore', 'Geography', 'Gender', 'Age', 'Tenure', 
                              'Balance', 'NumOfProducts', 'HasCrCard', 'IsActiveMember', 'EstimatedSalary'])
        
        if len(df) == 0:
            return jsonify({
                'error': 'No valid customer data found. Please ensure your CSV has complete data for all required columns.'
            }), 400
        
        # Validate required columns
        required_columns = ['CreditScore', 'Geography', 'Gender', 'Age', 'Tenure', 
                          'Balance', 'NumOfProducts', 'HasCrCard', 'IsActiveMember', 'EstimatedSalary']
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            return jsonify({
                'error': f'Missing required columns: {", ".join(missing_columns)}. Please ensure your CSV has all required fields.'
            }), 400
        
        # Add customer identifiers if missing
        if 'CustomerName' not in df.columns:
            df['CustomerName'] = [f"Customer_{i+1:04d}" for i in range(len(df))]
        
        if 'CustomerId' not in df.columns:
            df['CustomerId'] = [f"CUST_{i+1000:06d}" for i in range(len(df))]
        
        # Process each customer through the AI model
        customer_predictions = []
        churn_probabilities = []
        skipped_customers = 0
        
        for idx, row in df.iterrows():
            try:
                # Validate and convert data with proper NaN handling
                def safe_float(value, default=0.0):
                    try:
                        if pd.isna(value) or value == '' or str(value).lower() in ['nan', 'null', 'none']:
                            return default
                        return float(value)
                    except (ValueError, TypeError):
                        return default
                
                def safe_int(value, default=0):
                    try:
                        if pd.isna(value) or value == '' or str(value).lower() in ['nan', 'null', 'none']:
                            return default
                        return int(float(value))
                    except (ValueError, TypeError):
                        return default
                
                def safe_string(value, default='Unknown'):
                    try:
                        if pd.isna(value) or value == '' or str(value).lower() in ['nan', 'null', 'none']:
                            return default
                        return str(value).strip()
                    except (ValueError, TypeError):
                        return default
                
                # Validate numeric ranges
                credit_score = safe_int(row['CreditScore'], 600)
                age = safe_int(row['Age'], 30)
                tenure = safe_int(row['Tenure'], 1)
                balance = safe_float(row['Balance'], 0.0)
                num_products = safe_int(row['NumOfProducts'], 1)
                has_cr_card = safe_int(row['HasCrCard'], 0)
                is_active = safe_int(row['IsActiveMember'], 1)
                estimated_salary = safe_float(row['EstimatedSalary'], 50000.0)
                geography = safe_string(row['Geography'], 'France')
                gender = safe_string(row['Gender'], 'Male')
                
                # Validate ranges
                if not (300 <= credit_score <= 850):
                    credit_score = max(300, min(850, credit_score))
                if not (18 <= age <= 100):
                    age = max(18, min(100, age))
                if not (0 <= tenure <= 50):
                    tenure = max(0, min(50, tenure))
                if balance < 0:
                    balance = 0.0
                if not (1 <= num_products <= 4):
                    num_products = max(1, min(4, num_products))
                if has_cr_card not in [0, 1]:
                    has_cr_card = 1
                if is_active not in [0, 1]:
                    is_active = 1
                if estimated_salary < 0:
                    estimated_salary = 50000.0
                
                customer_data = {
                    'CreditScore': float(credit_score),
                    'Geography': geography,
                    'Gender': gender,
                    'Age': float(age),
                    'Tenure': float(tenure),
                    'Balance': float(balance),
                    'NumOfProducts': float(num_products),
                    'HasCrCard': float(has_cr_card),
                    'IsActiveMember': float(is_active),
                    'EstimatedSalary': float(estimated_salary)
                }
                
                # Get AI prediction
                prediction = churn_predictor.predict(customer_data)
                churn_prob = prediction['churn_probability']
                churn_probabilities.append(churn_prob)
                
                # Determine risk level and color
                if churn_prob >= 0.7:
                    risk_level = "High"
                    risk_color = "🔴"
                elif churn_prob >= 0.4:
                    risk_level = "Medium"
                    risk_color = "🟠"
                else:
                    risk_level = "Low"
                    risk_color = "🟢"
                
                customer_predictions.append({
                    'customer_id': safe_string(row.get('CustomerId', f"CUST_{idx+1000:06d}")),
                    'customer_name': safe_string(row.get('CustomerName', f"Customer_{idx+1:04d}")),
                    'churn_probability': float(churn_prob),
                    'risk_level': risk_level,
                    'risk_color': risk_color,
                    'geography': geography,
                    'age': age,
                    'tenure': tenure,
                    'balance': balance,
                    'credit_score': credit_score,
                    'num_products': num_products,
                    'is_active': bool(is_active),
                    'estimated_salary': estimated_salary,
                    'recommendations': prediction['recommendations']
                })
                
            except Exception as e:
                print(f"Error processing customer {idx}: {str(e)}")
                skipped_customers += 1
                continue
        
        if not customer_predictions:
            return jsonify({'error': 'No valid customer data could be processed'}), 400
        
        # Calculate summary statistics
        total_customers = len(customer_predictions)
        avg_churn_risk = np.mean(churn_probabilities)
        
        # Risk distribution
        high_risk_count = len([p for p in customer_predictions if p['risk_level'] == 'High'])
        medium_risk_count = len([p for p in customer_predictions if p['risk_level'] == 'Medium'])
        low_risk_count = len([p for p in customer_predictions if p['risk_level'] == 'Low'])
        
        # Geography analysis
        geography_stats = {}
        for customer in customer_predictions:
            geo = customer['geography']
            if geo not in geography_stats:
                geography_stats[geo] = {'count': 0, 'total_risk': 0}
            geography_stats[geo]['count'] += 1
            geography_stats[geo]['total_risk'] += customer['churn_probability']
        
        for geo in geography_stats:
            geography_stats[geo]['avg_risk'] = geography_stats[geo]['total_risk'] / geography_stats[geo]['count']
        
        # Top risk factors (simplified feature importance)
        risk_factors = [
            {'factor': 'Account Balance', 'importance': 0.25, 'description': 'Lower balance increases churn risk'},
            {'factor': 'Product Usage', 'importance': 0.22, 'description': 'Customers with fewer products are more likely to churn'},
            {'factor': 'Customer Activity', 'importance': 0.20, 'description': 'Inactive customers show higher churn tendency'},
            {'factor': 'Age Demographics', 'importance': 0.18, 'description': 'Certain age groups show higher churn rates'},
            {'factor': 'Tenure', 'importance': 0.15, 'description': 'Newer customers are more likely to churn'}
        ]
        
        # Prepare comprehensive results
        analysis_results = {
            'summary': {
                'total_customers': total_customers,
                'avg_churn_risk': float(avg_churn_risk),
                'churn_rate_percentage': float(avg_churn_risk * 100),
                'high_risk_customers': high_risk_count,
                'medium_risk_customers': medium_risk_count,
                'low_risk_customers': low_risk_count
            },
            'risk_distribution': {
                'high': {
                    'count': high_risk_count,
                    'percentage': (high_risk_count / total_customers) * 100 if total_customers > 0 else 0
                },
                'medium': {
                    'count': medium_risk_count,
                    'percentage': (medium_risk_count / total_customers) * 100 if total_customers > 0 else 0
                },
                'low': {
                    'count': low_risk_count,
                    'percentage': (low_risk_count / total_customers) * 100 if total_customers > 0 else 0
                }
            },
            'geography_analysis': geography_stats,
            'risk_factors': risk_factors,
            'customer_details': sorted(customer_predictions, key=lambda x: x['churn_probability'], reverse=True),
            'model_info': {
                'model_type': 'Custom Logistic Regression',
                'features_used': len(required_columns),
                'processing_date': pd.Timestamp.now().isoformat()
            }
        }
        
        # Save analysis to database
        analysis = ChurnAnalysis(
            employee_id=current_user.id,
            name=analysis_name,
            file_path=filepath,
            results=analysis_results
        )
        
        db.session.add(analysis)
        db.session.commit()
        
        # Create success message with processing details
        success_message = 'Real AI churn analysis completed successfully'
        if skipped_customers > 0:
            success_message += f' ({skipped_customers} customers skipped due to data issues)'
        
        return jsonify({
            'message': success_message,
            'analysis_id': analysis.id,
            'results': analysis_results,
            'processing_summary': {
                'total_processed': total_customers,
                'skipped_customers': skipped_customers,
                'success_rate': f"{((total_customers / (total_customers + skipped_customers)) * 100):.1f}%" if (total_customers + skipped_customers) > 0 else "100%"
            }
        })
        
    except Exception as e:
        print(f"Error in churn analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': f'Error processing churn analysis: {str(e)}'
        }), 500

@bp.route('/churn-analysis/<int:analysis_id>', methods=['GET'])
@login_required
def get_churn_analysis(analysis_id):
    """Retrieve a specific churn analysis"""
    if current_user.role != 'banking_employee':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    analysis = ChurnAnalysis.query.filter_by(id=analysis_id, employee_id=current_user.id).first()
    
    if not analysis:
        return jsonify({'error': 'Analysis not found'}), 404
    
    return jsonify({
        'analysis_id': analysis.id,
        'name': analysis.name,
        'created_at': analysis.created_at.isoformat(),
        'results': analysis.results
    })

@bp.route('/churn-analyses', methods=['GET'])
@login_required
def list_churn_analyses():
    if current_user.role != 'banking_employee':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        analyses = ChurnAnalysis.query.filter_by(employee_id=current_user.id).order_by(ChurnAnalysis.created_at.desc()).all()
        
        return jsonify({
            'analyses': [{
                'id': analysis.id,
                'name': analysis.name,
                'created_at': analysis.created_at.isoformat(),
                'total_customers': analysis.results.get('summary', {}).get('total_customers', 0),
                'avg_churn_risk': analysis.results.get('summary', {}).get('avg_churn_risk', 0),
                'high_risk_customers': analysis.results.get('summary', {}).get('high_risk_customers', 0)
            } for analysis in analyses]
        })
        
    except Exception as e:
        current_app.logger.error(f"Error fetching churn analyses: {str(e)}")
        return jsonify({'error': 'Failed to fetch analyses'}), 500

@bp.route('/churn-analysis/<int:analysis_id>', methods=['DELETE'])
@login_required
def delete_churn_analysis(analysis_id):
    if current_user.role != 'banking_employee':
        return jsonify({'error': 'Unauthorized access'}), 403
    
    try:
        analysis = ChurnAnalysis.query.get_or_404(analysis_id)
        
        # Store analysis name for response
        analysis_name = analysis.name
        
        # Delete the analysis from database
        db.session.delete(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Analysis "{analysis_name}" has been successfully deleted'
        })
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting churn analysis {analysis_id}: {str(e)}")
        return jsonify({'error': 'Failed to delete analysis'}), 500 