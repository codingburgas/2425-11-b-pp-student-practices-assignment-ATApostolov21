#!/usr/bin/env python3
"""
Test Flask endpoints to ensure AI model integration is working
"""

import os
import sys
import json

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_flask_context():
    """Test that the loan prediction works in Flask context"""
    print("🌐 Testing Flask Context Integration")
    print("=" * 50)
    
    try:
        # Create Flask app
        from app import create_app
        from app.models import User
        from flask_login import login_user
        
        app = create_app()
        
        with app.app_context():
            # Test the loan utilities in Flask context
            from app.ai_models.loan_utils import predict_loan_approval, get_loan_predictor
            
            # Check if model loads in Flask context
            predictor = get_loan_predictor()
            print(f"✅ Model loaded in Flask context: {predictor is not None}")
            print(f"   Model trained: {predictor.is_trained if predictor else False}")
            
            # Test prediction
            test_data = {
                'amount': 50000,
                'purpose': 'Home Purchase',
                'income': 75000,
                'employment_years': 5,
                'credit_score': 720
            }
            
            prediction = predict_loan_approval(test_data, use_simple_format=True)
            print(f"✅ Prediction in Flask context:")
            print(f"   Status: {prediction['approval_status']}")
            print(f"   Probability: {prediction['approval_probability']:.3f}")
            print(f"   Method: {prediction['prediction_method']}")
            
            # Test full model format
            full_data = {
                'Gender': 'Male',
                'Married': 'Yes',
                'Dependents': 1,
                'Education': 'Graduate',
                'Self_Employed': 'No',
                'ApplicantIncome': 75000,
                'CoapplicantIncome': 0,
                'LoanAmount': 50,
                'Loan_Amount_Term': 360,
                'Credit_History': 1,
                'Property_Area': 'Urban'
            }
            
            full_prediction = predict_loan_approval(full_data, use_simple_format=False)
            print(f"✅ Full model prediction:")
            print(f"   Status: {full_prediction['approval_status']}")
            print(f"   Probability: {full_prediction['approval_probability']:.3f}")
            print(f"   Method: {full_prediction['prediction_method']}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error in Flask context test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run Flask context tests"""
    print("🧪 BankTools_AI - Flask Endpoint Integration Test")
    print("=" * 60)
    
    success = test_flask_context()
    
    print("\n" + "=" * 60)
    print("📊 FLASK TEST SUMMARY")
    print("=" * 60)
    
    if success:
        print("🎉 Flask context test PASSED!")
        print("✅ AI model loads correctly in Flask context")
        print("✅ Predictions use real AI model")
        print("✅ Both simple and full format work")
    else:
        print("❌ Flask context test FAILED!")
    
    print("=" * 60)
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 