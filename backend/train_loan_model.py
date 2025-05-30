#!/usr/bin/env python3
"""
Training script for the Loan Approval Prediction Model
Run this script to train and save the loan approval prediction model
"""

import os
import sys
import numpy as np

# Add the app directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.ai_models.loan_model import LoanPredictor

def main():
    """Train the loan approval prediction model"""
    print("=" * 60)
    print("🏦 BankTools_AI - Loan Approval Model Training")
    print("=" * 60)
    
    # Initialize predictor
    predictor = LoanPredictor()
    
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Dataset paths (relative to script location)
    train_path = os.path.join(os.path.dirname(__file__), "..", "datasets", "Loan Prediction Dataset", "train_u6lujuX_CVtuZ9i.csv")
    test_path = os.path.join(os.path.dirname(__file__), "..", "datasets", "Loan Prediction Dataset", "test_Y3wMUE5_7gLdaTN.csv")
    
    if not os.path.exists(train_path):
        print(f"❌ Error: Training dataset not found at {train_path}")
        print("Please ensure the train_u6lujuX_CVtuZ9i.csv file is in the datasets/Loan Prediction Dataset directory.")
        return False
    
    if not os.path.exists(test_path):
        print(f"❌ Error: Test dataset not found at {test_path}")
        print("Please ensure the test_Y3wMUE5_7gLdaTN.csv file is in the datasets/Loan Prediction Dataset directory.")
        return False
    
    print(f"📊 Loading training dataset from: {train_path}")
    print(f"📊 Loading test dataset from: {test_path}")
    
    try:
        # Train the model
        results = predictor.train(train_path, test_path)
        
        # Create models directory if it doesn't exist
        models_dir = os.path.join(os.path.dirname(__file__), "models")
        os.makedirs(models_dir, exist_ok=True)
        
        # Save the model
        model_path = os.path.join(models_dir, "loan_model.joblib")
        predictor.save_model(model_path)
        
        print("\n" + "=" * 60)
        print("✅ TRAINING COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f"📁 Model saved to: {model_path}")
        
        # Test prediction with sample data
        print("\n🔍 Testing model with sample prediction:")
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
        print(f"Sample applicant: {sample_applicant}")
        print(f"Approval probability: {prediction['approval_probability']:.3f}")
        print(f"Status: {prediction['approval_status']}")
        print(f"Confidence: {prediction['confidence_level']}")
        print(f"Recommendations: {prediction['recommendations']}")
        
        print("\n🎯 Model is ready for use in the Flask application!")
        return True
        
    except Exception as e:
        print(f"❌ Error during training: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 