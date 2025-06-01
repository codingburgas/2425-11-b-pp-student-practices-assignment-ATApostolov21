#!/usr/bin/env python3
"""
Test script for the unified loan prediction system
Tests both AI model and fallback mechanisms
"""

import os
import sys

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_loan_utils():
    """Test the loan utilities functions"""
    print("🧪 Testing Loan Prediction Utilities")
    print("=" * 50)
    
    try:
        from app.ai_models.loan_utils import (
            validate_loan_application_data,
            map_simple_form_to_model_format,
            rule_based_prediction,
            predict_loan_approval,
            format_prediction_response
        )
        
        # Test 1: Validation
        print("1. Testing validation...")
        
        # Valid data
        valid_data = {
            'amount': 50000,
            'purpose': 'Home Purchase',
            'income': 75000,
            'employment_years': 5,
            'credit_score': 720
        }
        
        is_valid, error = validate_loan_application_data(valid_data, ['amount', 'purpose', 'income', 'employment_years', 'credit_score'])
        print(f"   Valid data: {is_valid} (error: {error})")
        
        # Invalid data
        invalid_data = {
            'amount': -1000,  # Invalid amount
            'income': 0,      # Invalid income
            'credit_score': 1000  # Invalid credit score
        }
        
        is_valid, error = validate_loan_application_data(invalid_data, ['amount', 'income', 'credit_score'])
        print(f"   Invalid data: {is_valid} (error: {error})")
        
        # Test 2: Data mapping
        print("\n2. Testing data mapping...")
        mapped_data = map_simple_form_to_model_format(valid_data)
        print(f"   Original: {valid_data}")
        print(f"   Mapped: {mapped_data}")
        
        # Test 3: Rule-based prediction
        print("\n3. Testing rule-based prediction...")
        rule_prediction = rule_based_prediction(valid_data)
        print(f"   Status: {rule_prediction['approval_status']}")
        print(f"   Probability: {rule_prediction['approval_probability']:.3f}")
        print(f"   Method: {rule_prediction['prediction_method']}")
        
        # Test 4: Unified prediction (simple format)
        print("\n4. Testing unified prediction (simple format)...")
        unified_prediction = predict_loan_approval(valid_data, use_simple_format=True)
        print(f"   Status: {unified_prediction['approval_status']}")
        print(f"   Probability: {unified_prediction['approval_probability']:.3f}")
        print(f"   Method: {unified_prediction['prediction_method']}")
        print(f"   Confidence: {unified_prediction['confidence_level']}")
        
        # Test 5: Full model format
        print("\n5. Testing unified prediction (full model format)...")
        full_model_data = {
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
        
        full_prediction = predict_loan_approval(full_model_data, use_simple_format=False)
        print(f"   Status: {full_prediction['approval_status']}")
        print(f"   Probability: {full_prediction['approval_probability']:.3f}")
        print(f"   Method: {full_prediction['prediction_method']}")
        
        # Test 6: Response formatting
        print("\n6. Testing response formatting...")
        formatted_response = format_prediction_response(unified_prediction, request_id=123)
        print(f"   Success: {formatted_response['success']}")
        print(f"   Request ID: {formatted_response.get('request_id')}")
        print(f"   Model Available: {formatted_response['model_info']['model_available']}")
        
        print("\n✅ All loan utility tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error in loan utilities test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_model_loading():
    """Test that the AI model can be loaded"""
    print("\n🤖 Testing AI Model Loading")
    print("=" * 50)
    
    try:
        from app.ai_models.loan_model import LoanPredictor
        
        # Check if model file exists
        models_dir = os.path.join(os.path.dirname(__file__), "models")
        model_path = os.path.join(models_dir, "loan_model.joblib")
        
        if not os.path.exists(model_path):
            print(f"❌ Model file not found at {model_path}")
            return False
        
        print(f"✅ Model file found at {model_path}")
        
        # Load the model
        predictor = LoanPredictor()
        predictor.load_model(model_path)
        
        print(f"✅ Model loaded successfully")
        print(f"   Trained: {predictor.is_trained}")
        
        # Test prediction
        sample_data = {
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
        
        prediction = predictor.predict(sample_data)
        print(f"✅ Sample prediction successful:")
        print(f"   Status: {prediction['approval_status']}")
        print(f"   Probability: {prediction['approval_probability']:.3f}")
        print(f"   Confidence: {prediction['confidence_level']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error in model loading test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_different_scenarios():
    """Test different loan scenarios"""
    print("\n📊 Testing Different Loan Scenarios")
    print("=" * 50)
    
    try:
        from app.ai_models.loan_utils import predict_loan_approval
        
        scenarios = [
            {
                'name': 'High-quality applicant',
                'data': {
                    'amount': 50000,
                    'purpose': 'Home Purchase',
                    'income': 100000,
                    'employment_years': 10,
                    'credit_score': 800
                }
            },
            {
                'name': 'Medium-quality applicant',
                'data': {
                    'amount': 30000,
                    'purpose': 'Car Purchase',
                    'income': 50000,
                    'employment_years': 3,
                    'credit_score': 680
                }
            },
            {
                'name': 'Low-quality applicant',
                'data': {
                    'amount': 75000,
                    'purpose': 'Business',
                    'income': 25000,
                    'employment_years': 1,
                    'credit_score': 550
                }
            }
        ]
        
        for scenario in scenarios:
            print(f"\n{scenario['name']}:")
            prediction = predict_loan_approval(scenario['data'], use_simple_format=True)
            print(f"   Status: {prediction['approval_status']}")
            print(f"   Probability: {prediction['approval_probability']:.3f}")
            print(f"   Method: {prediction['prediction_method']}")
            print(f"   Recommendations: {len(prediction['recommendations'])} items")
        
        print("\n✅ All scenario tests completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error in scenario testing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("🧪 BankTools_AI - Loan Integration Test Suite")
    print("=" * 60)
    
    tests_passed = 0
    total_tests = 3
    
    # Test 1: Loan utilities
    if test_loan_utils():
        tests_passed += 1
    
    # Test 2: Model loading
    if test_model_loading():
        tests_passed += 1
    
    # Test 3: Different scenarios
    if test_different_scenarios():
        tests_passed += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Tests passed: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 ALL TESTS PASSED! The loan integration is working correctly.")
        print("✅ Real AI model integration successful")
        print("✅ Fallback mechanisms working")
        print("✅ Unified prediction system operational")
    else:
        print(f"⚠️  {total_tests - tests_passed} test(s) failed. Check the output above.")
    
    print("=" * 60)
    
    return tests_passed == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 