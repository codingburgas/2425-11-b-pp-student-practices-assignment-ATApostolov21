#!/usr/bin/env python3
"""
Create test users for BankTools AI application

This script creates the demo accounts mentioned in the README:
- Banking Customer: user@test.com
- Banking Employee: employee@test.com

Run this script to set up test users for development.
"""

from app import create_app, db
from app.models import User

def create_test_users():
    """Create test users with proper roles"""
    app = create_app()
    
    with app.app_context():
        # Check if users already exist
        existing_customer = User.query.filter_by(email='user@test.com').first()
        existing_employee = User.query.filter_by(email='employee@test.com').first()
        
        if existing_customer:
            print("✅ Banking Customer (user@test.com) already exists")
        else:
            # Create Banking Customer
            customer = User(
                email='user@test.com',
                role='banking_user'
            )
            customer.set_password('password123')
            customer.is_verified = True  # Skip email verification for test accounts
            db.session.add(customer)
            print("✅ Created Banking Customer: user@test.com")
        
        if existing_employee:
            print("✅ Banking Employee (employee@test.com) already exists")
        else:
            # Create Banking Employee
            employee = User(
                email='employee@test.com',
                role='banking_employee'
            )
            employee.set_password('password123')
            employee.is_verified = True  # Skip email verification for test accounts
            db.session.add(employee)
            print("✅ Created Banking Employee: employee@test.com")
        
        # Create additional Business User equivalent (same as banking_user)
        bu_email = 'bu@test.com'
        existing_bu = User.query.filter_by(email=bu_email).first()
        
        if existing_bu:
            print("✅ Business User (bu@test.com) already exists")
        else:
            # Create Business User (with banking_user role for loan access)
            business_user = User(
                email=bu_email,
                role='banking_user'  # Use banking_user role for loan access
            )
            business_user.set_password('password123')
            business_user.is_verified = True
            db.session.add(business_user)
            print("✅ Created Business User: bu@test.com (with banking_user role)")
        
        try:
            db.session.commit()
            print("\n🎉 Test users created successfully!")
            print("\n📋 Available Test Accounts:")
            print("1. Banking Customer (Loan Access):")
            print("   Email: user@test.com")
            print("   Password: password123")
            print("   Role: banking_user")
            print("   Access: Loan applications, dashboard, AI predictions")
            print("")
            print("2. Banking Employee (Analytics Access):")
            print("   Email: employee@test.com") 
            print("   Password: password123")
            print("   Role: banking_employee")
            print("   Access: Churn analysis, employee dashboard")
            print("")
            print("3. Business User (Loan Access):")
            print("   Email: bu@test.com")
            print("   Password: password123") 
            print("   Role: banking_user")
            print("   Access: Loan applications, dashboard, AI predictions")
            print("")
            print("🔑 All accounts have password: password123")
            print("✅ All accounts are pre-verified (no email verification needed)")
            
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating test users: {e}")

if __name__ == '__main__':
    create_test_users() 