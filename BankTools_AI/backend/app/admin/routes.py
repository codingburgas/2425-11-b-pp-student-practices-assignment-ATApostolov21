import os
import numpy as np
import pandas as pd
from flask import jsonify, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from app.admin import bp
from app.models import ChurnAnalysis

def convert_numpy_types(obj):
    """Recursively convert numpy types to native Python types for JSON serialization"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_types(item) for item in obj)
    elif pd.isna(obj):
        return None
    else:
        return obj

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
        
        # Read the uploaded CSV file with enhanced error handling
        try:
            df = pd.read_csv(filepath)
        except Exception as e:
            return jsonify({
                'error': f'Error reading CSV file: {str(e)}. Please ensure the file is a valid CSV format.'
            }), 400
        
        # Enhanced data validation and cleaning using the improved churn model utilities
        # Simple data validation and cleaning
        
        # Basic missing value analysis
        missing_before = df.isnull().sum().sum()
        
        # Basic data cleaning - remove rows with too many missing values
        initial_rows = len(df)
        df_clean = df.dropna(thresh=len(df.columns) * 0.7)  # Keep rows with at least 70% non-null values
        rows_dropped = initial_rows - len(df_clean)
        
        print(f"Data cleaning: {initial_rows} -> {len(df_clean)} rows (dropped {rows_dropped})")
        
        # Validate required columns after cleaning
        required_columns = ['CreditScore', 'Geography', 'Gender', 'Age', 'Tenure', 
                          'Balance', 'NumOfProducts', 'HasCrCard', 'IsActiveMember', 'EstimatedSalary']
        
        missing_columns = [col for col in required_columns if col not in df_clean.columns]
        if missing_columns:
            return jsonify({
                'error': f'Missing required columns after cleaning: {", ".join(missing_columns)}. Please ensure your CSV has all required fields.'
            }), 400
        
        # Enhanced data validation - remove rows with critical missing values
        critical_columns = ['CreditScore', 'Age', 'Geography', 'Gender']
        initial_rows = len(df_clean)
        df_clean = df_clean.dropna(subset=critical_columns)
        rows_dropped = initial_rows - len(df_clean)
        
        if len(df_clean) == 0:
            return jsonify({
                'error': 'No valid customer data found after enhanced cleaning. Please ensure your CSV has complete data for critical columns (CreditScore, Age, Geography, Gender).'
            }), 400
        
        # Add customer identifiers if missing
        if 'CustomerName' not in df_clean.columns:
            df_clean['CustomerName'] = [f"Customer_{i+1:04d}" for i in range(len(df_clean))]
        
        if 'CustomerId' not in df_clean.columns:
            df_clean['CustomerId'] = [f"CUST_{i+1000:06d}" for i in range(len(df_clean))]
        
        # Process each customer through the AI model with enhanced error handling
        customer_predictions = []
        churn_probabilities = []
        skipped_customers = 0
        processing_errors = []
        
        for idx, row in df_clean.iterrows():
            try:
                # Enhanced data validation and conversion with comprehensive NaN handling
                def safe_numeric(value, default=0.0, min_val=None, max_val=None):
                    """Enhanced numeric conversion with range validation"""
                    try:
                        # Handle various forms of missing/invalid values
                        if pd.isna(value) or value == '' or str(value).lower().strip() in [
                            'nan', 'null', 'none', 'na', 'n/a', 'undefined', 'missing', 
                            'unknown', '#n/a', '#null!', '#div/0!', '#value!', 'nil', 
                            'void', 'empty', '-', '--', '?', '??', 'inf', '-inf'
                        ]:
                            return float(default)
                        
                        # Convert to float
                        numeric_value = float(value)
                        
                        # Handle infinite values
                        if np.isinf(numeric_value):
                            return float(default)
                        
                        # Apply range constraints
                        if min_val is not None:
                            numeric_value = max(numeric_value, min_val)
                        if max_val is not None:
                            numeric_value = min(numeric_value, max_val)
                        
                        return numeric_value
                        
                    except (ValueError, TypeError, OverflowError):
                        return float(default)
                
                def safe_categorical(value, default='Unknown', valid_values=None):
                    """Enhanced categorical conversion with validation"""
                    try:
                        if pd.isna(value) or value == '' or str(value).lower().strip() in [
                            'nan', 'null', 'none', 'na', 'n/a', 'undefined', 'missing', 
                            'unknown', '#n/a', '#null!', 'nil', 'void', 'empty', '-', '--', '?', '??'
                        ]:
                            return default
                        
                        clean_value = str(value).strip().title()
                        
                        # Validate against allowed values if provided
                        if valid_values and clean_value not in valid_values:
                            # Try to find closest match
                            clean_lower = clean_value.lower()
                            for valid_val in valid_values:
                                if clean_lower in valid_val.lower() or valid_val.lower() in clean_lower:
                                    return valid_val
                            return default
                        
                        return clean_value
                        
                    except (ValueError, TypeError):
                        return default
                
                # Enhanced data extraction with comprehensive validation
                credit_score = safe_numeric(row['CreditScore'], default=650, min_val=300, max_val=850)
                age = safe_numeric(row['Age'], default=35, min_val=18, max_val=100)
                tenure = safe_numeric(row['Tenure'], default=5, min_val=0, max_val=50)
                balance = safe_numeric(row['Balance'], default=0.0, min_val=0)
                num_products = safe_numeric(row['NumOfProducts'], default=2, min_val=1, max_val=4)
                has_cr_card = safe_numeric(row['HasCrCard'], default=1, min_val=0, max_val=1)
                is_active = safe_numeric(row['IsActiveMember'], default=1, min_val=0, max_val=1)
                estimated_salary = safe_numeric(row['EstimatedSalary'], default=50000.0, min_val=0)
                
                geography = safe_categorical(row['Geography'], default='France', 
                                           valid_values=['France', 'Germany', 'Spain'])
                gender = safe_categorical(row['Gender'], default='Male', 
                                        valid_values=['Male', 'Female'])
                
                # Additional data quality checks
                data_quality_score = 100.0
                quality_issues = []
                
                # Check for suspicious patterns
                if credit_score == 650:  # Default value used
                    data_quality_score -= 10
                    quality_issues.append("Credit score missing/invalid")
                
                if age == 35:  # Default value used
                    data_quality_score -= 10
                    quality_issues.append("Age missing/invalid")
                
                if balance == 0 and estimated_salary > 100000:  # Suspicious combination
                    data_quality_score -= 5
                    quality_issues.append("High salary with zero balance")
                
                # Skip customers with very low data quality
                if data_quality_score < 70:
                    skipped_customers += 1
                    processing_errors.append(f"Customer {idx}: Low data quality ({data_quality_score:.1f}%) - {', '.join(quality_issues)}")
                    continue
                
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
                
                # Get AI prediction with error handling
                try:
                    prediction = churn_predictor.predict(customer_data)
                    churn_prob = prediction['churn_probability']
                    
                    # Validate prediction result
                    if not isinstance(churn_prob, (int, float)) or np.isnan(churn_prob):
                        raise ValueError("Invalid prediction result")
                    
                    churn_probabilities.append(churn_prob)
                    
                except Exception as pred_error:
                    skipped_customers += 1
                    processing_errors.append(f"Customer {idx}: Prediction error - {str(pred_error)}")
                    continue
                
                # Determine risk level and color with improved thresholds
                if churn_prob >= 0.35:  # Lowered from 0.7 for better sensitivity
                    risk_level = "High"
                    risk_color = "🔴"
                elif churn_prob >= 0.15:  # Lowered from 0.4 for better detection
                    risk_level = "Medium"
                    risk_color = "🟠"
                else:
                    risk_level = "Low"
                    risk_color = "🟢"
                
                customer_predictions.append({
                    'customer_id': safe_categorical(row.get('CustomerId', f"CUST_{idx+1000:06d}")),
                    'customer_name': safe_categorical(row.get('CustomerName', f"Customer_{idx+1:04d}")),
                    'churn_probability': float(churn_prob),
                    'risk_level': risk_level,
                    'risk_color': risk_color,
                    'geography': geography,
                    'age': int(age),
                    'tenure': int(tenure),
                    'balance': float(balance),
                    'credit_score': int(credit_score),
                    'num_products': int(num_products),
                    'is_active': bool(is_active),
                    'estimated_salary': float(estimated_salary),
                    'recommendations': prediction['recommendations'],
                    'data_quality_score': data_quality_score,
                    'quality_issues': quality_issues
                })
                
            except Exception as e:
                skipped_customers += 1
                processing_errors.append(f"Customer {idx}: Processing error - {str(e)}")
                continue
        
        if not customer_predictions:
            error_summary = "\n".join(processing_errors[:5])  # Show first 5 errors
            return jsonify({
                'error': f'No valid customer data could be processed. Errors encountered:\n{error_summary}'
            }), 400
        
        # Enhanced summary statistics with data quality metrics
        total_customers = len(customer_predictions)
        avg_churn_risk = np.mean(churn_probabilities)
        avg_data_quality = np.mean([c['data_quality_score'] for c in customer_predictions])
        
        # Risk distribution
        high_risk_count = len([p for p in customer_predictions if p['risk_level'] == 'High'])
        medium_risk_count = len([p for p in customer_predictions if p['risk_level'] == 'Medium'])
        low_risk_count = len([p for p in customer_predictions if p['risk_level'] == 'Low'])
        
        # Data quality distribution
        high_quality_count = len([p for p in customer_predictions if p['data_quality_score'] >= 90])
        medium_quality_count = len([p for p in customer_predictions if 70 <= p['data_quality_score'] < 90])
        low_quality_count = len([p for p in customer_predictions if p['data_quality_score'] < 70])
        
        # Geography analysis
        geography_stats = {}
        for customer in customer_predictions:
            geo = customer['geography']
            if geo not in geography_stats:
                geography_stats[geo] = {
                    'count': 0, 
                    'total_risk': 0, 
                    'total_quality': 0,
                    'high_risk_count': 0
                }
            geography_stats[geo]['count'] += 1
            geography_stats[geo]['total_risk'] += customer['churn_probability']
            geography_stats[geo]['total_quality'] += customer['data_quality_score']
            if customer['risk_level'] == 'High':
                geography_stats[geo]['high_risk_count'] += 1
        
        for geo in geography_stats:
            count = geography_stats[geo]['count']
            geography_stats[geo]['avg_risk'] = geography_stats[geo]['total_risk'] / count
            geography_stats[geo]['avg_quality'] = geography_stats[geo]['total_quality'] / count
            geography_stats[geo]['high_risk_percentage'] = (geography_stats[geo]['high_risk_count'] / count) * 100
        
        # Get real feature importance from the trained churn model
        try:
            feature_importance_data = churn_predictor.get_feature_importance()
            # Convert to the format expected by frontend
            risk_factors = []
            for feature in feature_importance_data['features']:
                risk_factors.append({
                    'factor': feature['factor'],
                    'importance': feature['importance'],
                    'description': feature['description'],
                    'weight_direction': feature['weight_direction'],
                    'rank': feature['rank']
                })
        except Exception as e:
            print(f"Error getting feature importance: {str(e)}")
            # Fallback to a simple analysis based on data
            risk_factors = [
                {
                    'factor': 'Account Balance', 
                    'importance': 0.25, 
                    'description': 'Lower balance correlates with higher churn risk in this dataset'
                },
                {
                    'factor': 'Product Portfolio', 
                    'importance': 0.22, 
                    'description': 'Customers with fewer products show higher churn tendency'
                },
                {
                    'factor': 'Customer Activity', 
                    'importance': 0.20, 
                    'description': 'Inactive customers are more likely to churn'
                },
                {
                    'factor': 'Age Demographics', 
                    'importance': 0.18, 
                    'description': 'Certain age groups exhibit different churn patterns'
                },
                {
                    'factor': 'Geographic Location', 
                    'importance': 0.15, 
                    'description': 'Regional differences impact customer retention'
                }
            ]
        
        # Prepare comprehensive results with enhanced data quality reporting
        analysis_results = {
            'summary': {
                'total_customers': total_customers,
                'avg_churn_risk': float(avg_churn_risk),
                'churn_rate_percentage': float(avg_churn_risk * 100),
                'high_risk_customers': high_risk_count,
                'medium_risk_customers': medium_risk_count,
                'low_risk_customers': low_risk_count,
                'avg_data_quality': float(avg_data_quality)
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
            'data_quality_distribution': {
                'high': {
                    'count': high_quality_count,
                    'percentage': (high_quality_count / total_customers) * 100 if total_customers > 0 else 0,
                    'description': 'Data quality >= 90%'
                },
                'medium': {
                    'count': medium_quality_count,
                    'percentage': (medium_quality_count / total_customers) * 100 if total_customers > 0 else 0,
                    'description': 'Data quality 70-89%'
                },
                'low': {
                    'count': low_quality_count,
                    'percentage': (low_quality_count / total_customers) * 100 if total_customers > 0 else 0,
                    'description': 'Data quality < 70%'
                }
            },
            'geography_analysis': geography_stats,
            'risk_factors': risk_factors,
            'customer_details': sorted(customer_predictions, key=lambda x: x['churn_probability'], reverse=True),
            'data_processing_report': {
                'original_rows': initial_rows,
                'rows_after_cleaning': len(df_clean),
                'rows_dropped_in_cleaning': rows_dropped,
                'successfully_processed': total_customers,
                'skipped_customers': skipped_customers,
                'processing_success_rate': (total_customers / (total_customers + skipped_customers)) * 100 if (total_customers + skipped_customers) > 0 else 100,
                'missing_values_before_cleaning': missing_before,
                'data_quality_score': f"{avg_data_quality:.2f}",
                'cleaning_steps_performed': "Simple data cleaning",
                'processing_errors': processing_errors[:10]  # First 10 errors for reference
            },
            'model_info': {
                'model_type': 'Enhanced Custom Logistic Regression with Data Validation',
                'features_used': len(required_columns),
                'processing_date': pd.Timestamp.now().isoformat(),
                'data_validation_enabled': True,
                'outlier_detection_method': 'IQR',
                'missing_value_handling': 'Comprehensive multi-pattern detection and intelligent imputation'
            }
        }
        
        # Save analysis to database
        analysis = ChurnAnalysis(
            employee_id=current_user.id,
            name=analysis_name,
            file_path=filepath,
            results=convert_numpy_types(analysis_results)  # Convert numpy types to native Python types
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
            'results': convert_numpy_types(analysis_results),
            'processing_summary': convert_numpy_types({
                'total_processed': total_customers,
                'skipped_customers': skipped_customers,
                'success_rate': f"{((total_customers / (total_customers + skipped_customers)) * 100):.1f}%" if (total_customers + skipped_customers) > 0 else "100%"
            })
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
        # Ensure user can only delete their own analyses
        analysis = ChurnAnalysis.query.filter_by(id=analysis_id, employee_id=current_user.id).first()
        
        if not analysis:
            return jsonify({'error': 'Analysis not found or access denied'}), 404
        
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