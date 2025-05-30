#!/usr/bin/env python3
"""
Training script for the Churn Prediction Model
Run this script to train and save the churn prediction model
"""

import os
import sys
import numpy as np

# Add the app directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.ai_models.churn_model import ChurnPredictor

def main():
    """Train the churn prediction model"""
    print("=" * 60)
    print("🧠 BankTools_AI - Churn Prediction Model Training")
    print("=" * 60)
    
    # Initialize predictor
    predictor = ChurnPredictor()
    
    # Set random seed for reproducibility
    np.random.seed(42)
    
    # Dataset path (relative to script location)
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "datasets", "Churn_Modelling.csv")
    
    if not os.path.exists(dataset_path):
        print(f"❌ Error: Dataset not found at {dataset_path}")
        print("Please ensure the Churn_Modelling.csv file is in the datasets directory.")
        return False
    
    print(f"📊 Loading dataset from: {dataset_path}")
    
    try:
        # Train the model
        results = predictor.train(dataset_path)
        
        # Create models directory if it doesn't exist
        models_dir = os.path.join(os.path.dirname(__file__), "models")
        os.makedirs(models_dir, exist_ok=True)
        
        # Save the model
        model_path = os.path.join(models_dir, "churn_model.joblib")
        predictor.save_model(model_path)
        
        print("\n" + "=" * 60)
        print("✅ TRAINING COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f"📁 Model saved to: {model_path}")
        
        # Test prediction with sample data
        print("\n🔍 Testing model with sample prediction:")
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
        print(f"Sample customer: {sample_customer}")
        print(f"Churn probability: {prediction['churn_probability']:.3f}")
        print(f"Risk level: {prediction['risk_level']}")
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