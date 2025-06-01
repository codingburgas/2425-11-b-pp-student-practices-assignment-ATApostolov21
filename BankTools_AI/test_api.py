#!/usr/bin/env python3
"""
Simple test script to verify the backend API endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5001"

def test_endpoints():
    """Test various API endpoints"""
    
    print("Testing BankTools_AI Backend API")
    print("=" * 40)
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✓ Server is running: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("✗ Server is not running or not accessible")
        return
    
    # Test 2: Test model status endpoint (requires authentication)
    try:
        response = requests.get(f"{BASE_URL}/api/model-status")
        print(f"Model status endpoint: {response.status_code}")
        if response.status_code == 401:
            print("  → Authentication required (expected)")
        elif response.status_code == 200:
            print(f"  → Response: {response.json()}")
    except Exception as e:
        print(f"✗ Model status test failed: {e}")
    
    # Test 3: Test user loan request endpoint (requires authentication)
    test_loan_data = {
        "amount": 50000,
        "purpose": "Home Purchase",
        "income": 75000,
        "employment_years": 5,
        "credit_score": 720
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/user/loan-request",
            json=test_loan_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"User loan request endpoint: {response.status_code}")
        if response.status_code == 401:
            print("  → Authentication required (expected)")
        elif response.status_code == 403:
            print("  → Access forbidden (expected without proper role)")
        else:
            print(f"  → Response: {response.json()}")
    except Exception as e:
        print(f"✗ User loan request test failed: {e}")
    
    # Test 4: Test AI model endpoint (requires authentication)
    ai_model_data = {
        "Gender": "Male",
        "Married": "Yes",
        "Dependents": 1,
        "Education": "Graduate",
        "Self_Employed": "No",
        "ApplicantIncome": 5000,
        "CoapplicantIncome": 2000,
        "LoanAmount": 150,
        "Loan_Amount_Term": 360,
        "Credit_History": 1,
        "Property_Area": "Urban"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/predict-loan",
            json=ai_model_data,
            headers={"Content-Type": "application/json"}
        )
        print(f"AI model endpoint: {response.status_code}")
        if response.status_code == 401:
            print("  → Authentication required (expected)")
        elif response.status_code == 403:
            print("  → Access forbidden (expected without proper role)")
        else:
            print(f"  → Response: {response.json()}")
    except Exception as e:
        print(f"✗ AI model test failed: {e}")
    
    print("\nTest Summary:")
    print("- All endpoints require authentication")
    print("- User loan request endpoint expects simple form data")
    print("- AI model endpoint expects full model data")
    print("- To test with authentication, log in through the web interface first")

if __name__ == "__main__":
    test_endpoints() 