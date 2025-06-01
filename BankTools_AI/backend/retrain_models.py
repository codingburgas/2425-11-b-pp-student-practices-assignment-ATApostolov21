#!/usr/bin/env python3
"""
Enhanced Model Retraining Script for BankTools_AI
Retrains both churn prediction and loan approval models with improved error handling
"""

import os
import sys
import time
import numpy as np
from datetime import datetime

def setup_environment():
    """Setup the environment for model training"""
    # Add the app directory to the path so we can import our modules
    app_path = os.path.join(os.path.dirname(__file__), 'app')
    if app_path not in sys.path:
        sys.path.append(app_path)
    
    # Set random seed for reproducibility
    np.random.seed(42)

def check_datasets():
    """Check if required datasets exist"""
    base_dir = os.path.dirname(__file__)
    datasets_dir = os.path.join(base_dir, "..", "datasets")
    
    # Check churn dataset
    churn_path = os.path.join(datasets_dir, "Bank Customer Churn Prediction", "Churn_Modelling.csv")
    churn_exists = os.path.exists(churn_path)
    
    # Check loan datasets
    loan_train_path = os.path.join(datasets_dir, "Loan Prediction Dataset", "train_u6lujuX_CVtuZ9i.csv")
    loan_test_path = os.path.join(datasets_dir, "Loan Prediction Dataset", "test_Y3wMUE5_7gLdaTN.csv")
    loan_exists = os.path.exists(loan_train_path) and os.path.exists(loan_test_path)
    
    return {
        'churn': {'exists': churn_exists, 'path': churn_path},
        'loan': {
            'exists': loan_exists, 
            'train_path': loan_train_path,
            'test_path': loan_test_path
        }
    }

def train_churn_model():
    """Train the churn prediction model"""
    print("🧠 TRAINING CHURN PREDICTION MODEL")
    print("-" * 50)
    
    try:
        from app.ai_models.churn_model import ChurnPredictor
        
        # Initialize predictor
        predictor = ChurnPredictor()
        
        # Dataset path
        base_dir = os.path.dirname(__file__)
        dataset_path = os.path.join(base_dir, "..", "datasets", "Bank Customer Churn Prediction", "Churn_Modelling.csv")
        
        if not os.path.exists(dataset_path):
            print(f"❌ Error: Churn dataset not found at {dataset_path}")
            return False
        
        print(f"📊 Loading dataset from: {dataset_path}")
        
        # Train the model
        results = predictor.train(dataset_path)
        
        # Create models directory if it doesn't exist
        models_dir = os.path.join(os.path.dirname(__file__), "models")
        os.makedirs(models_dir, exist_ok=True)
        
        # Save the model
        model_path = os.path.join(models_dir, "churn_model.joblib")
        predictor.save_model(model_path)
        
        print(f"✅ Churn model trained and saved to: {model_path}")
        
        # Test prediction
        sample_customer = {
            'CreditScore': 650,
            'Geography': 'France',
            'Gender': 'Female',
            'Age': 35,
            'Tenure': 5,
            'Balance': 50000,
            'NumOfProducts': 2,
            'HasCrCard': 1,
            'IsActiveMember': 1,
            'EstimatedSalary': 75000
        }
        
        prediction = predictor.predict(sample_customer)
        print(f"🔍 Sample prediction: {prediction['risk_level']} risk (probability: {prediction['churn_probability']:.3f})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error training churn model: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def train_loan_model():
    """Train the loan approval model"""
    print("🏦 TRAINING LOAN APPROVAL MODEL")
    print("-" * 50)
    
    try:
        from app.ai_models.loan_model import LoanPredictor
        
        # Initialize predictor
        predictor = LoanPredictor()
        
        # Dataset paths
        base_dir = os.path.dirname(__file__)
        train_path = os.path.join(base_dir, "..", "datasets", "Loan Prediction Dataset", "train_u6lujuX_CVtuZ9i.csv")
        test_path = os.path.join(base_dir, "..", "datasets", "Loan Prediction Dataset", "test_Y3wMUE5_7gLdaTN.csv")
        
        if not os.path.exists(train_path):
            print(f"❌ Error: Training dataset not found at {train_path}")
            return False
        
        if not os.path.exists(test_path):
            print(f"❌ Error: Test dataset not found at {test_path}")
            return False
        
        print(f"📊 Loading training dataset from: {train_path}")
        print(f"📊 Loading test dataset from: {test_path}")
        
        # Train the model
        results = predictor.train(train_path, test_path)
        
        # Create models directory if it doesn't exist
        models_dir = os.path.join(os.path.dirname(__file__), "models")
        os.makedirs(models_dir, exist_ok=True)
        
        # Save the model
        model_path = os.path.join(models_dir, "loan_model.joblib")
        predictor.save_model(model_path)
        
        print(f"✅ Loan model trained and saved to: {model_path}")
        
        # Test prediction
        sample_applicant = {
            'Gender': 'Male',
            'Married': 'Yes',
            'Dependents': 1,
            'Education': 'Graduate',
            'Self_Employed': 'No',
            'ApplicantIncome': 5000,
            'CoapplicantIncome': 2000,
            'LoanAmount': 150,
            'Loan_Amount_Term': 360,
            'Credit_History': 1,
            'Property_Area': 'Urban'
        }
        
        prediction = predictor.predict(sample_applicant)
        print(f"🔍 Sample prediction: {prediction['approval_status']} (probability: {prediction['approval_probability']:.3f})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error training loan model: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def validate_models():
    """Validate that the trained models can be loaded and used"""
    print("🔍 VALIDATING TRAINED MODELS")
    print("-" * 50)
    
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    
    # Validate churn model
    churn_model_path = os.path.join(models_dir, "churn_model.joblib")
    if os.path.exists(churn_model_path):
        try:
            from app.ai_models.churn_model import ChurnPredictor
            predictor = ChurnPredictor()
            predictor.load_model(churn_model_path)
            print("✅ Churn model validation successful")
        except Exception as e:
            print(f"❌ Churn model validation failed: {str(e)}")
            return False
    else:
        print("❌ Churn model file not found")
        return False
    
    # Validate loan model
    loan_model_path = os.path.join(models_dir, "loan_model.joblib")
    if os.path.exists(loan_model_path):
        try:
            from app.ai_models.loan_model import LoanPredictor
            predictor = LoanPredictor()
            predictor.load_model(loan_model_path)
            print("✅ Loan model validation successful")
        except Exception as e:
            print(f"❌ Loan model validation failed: {str(e)}")
            return False
    else:
        print("❌ Loan model file not found")
        return False
    
    return True

def main():
    """Main function to retrain all models"""
    print("=" * 80)
    print("🤖 BankTools_AI - Enhanced Model Retraining Pipeline")
    print("=" * 80)
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    start_time = time.time()
    models_trained = 0
    
    # Setup environment
    setup_environment()
    
    # Check datasets
    print("📋 Checking dataset availability...")
    datasets = check_datasets()
    
    if not datasets['churn']['exists']:
        print(f"❌ Churn dataset not found at {datasets['churn']['path']}")
    else:
        print("✅ Churn dataset found")
    
    if not datasets['loan']['exists']:
        print(f"❌ Loan datasets not found")
        print(f"   Train: {datasets['loan']['train_path']}")
        print(f"   Test: {datasets['loan']['test_path']}")
    else:
        print("✅ Loan datasets found")
    
    print()
    
    # Create models directory
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)
    print(f"📁 Models will be saved to: {models_dir}")
    print()
    
    # Train models
    if datasets['churn']['exists']:
        if train_churn_model():
            models_trained += 1
        print()
    
    if datasets['loan']['exists']:
        if train_loan_model():
            models_trained += 1
        print()
    
    # Validate models
    if models_trained > 0:
        validation_success = validate_models()
        print()
    else:
        validation_success = False
    
    # Final Report
    end_time = time.time()
    duration = end_time - start_time
    
    print("=" * 80)
    print("📊 RETRAINING SUMMARY")
    print("=" * 80)
    print(f"🕒 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"⏱️  Total duration: {duration:.2f} seconds")
    print(f"🎯 Models trained: {models_trained}/2")
    print(f"✅ Validation: {'Passed' if validation_success else 'Failed'}")
    
    if models_trained == 2 and validation_success:
        print("\n🎉 SUCCESS: All models retrained and validated successfully!")
        print("🚀 The Flask application can now use the updated models.")
    elif models_trained > 0:
        print(f"\n⚠️  PARTIAL SUCCESS: {models_trained} model(s) trained successfully.")
        print("🔧 Check the error messages above for failed models.")
    else:
        print("\n❌ FAILURE: No models were trained successfully.")
        print("🔧 Please check dataset availability and error messages.")
    
    print("=" * 80)
    
    return models_trained == 2 and validation_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 