"""
Database initialization script

This script performs the following tasks:
1. Creates the database if it doesn't exist
2. Creates tables based on the models
3. Adds admin and test users if they don't exist

Usage:
    python setup_db.py
"""
import os
import sys
from flask import Flask
from app import create_app, db
from app.models import User, UserRole
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Create app with development config
app = create_app('development')

def setup_database():
    """Set up the database for the first time."""
    with app.app_context():
        try:
            # Create all tables
            db.create_all()
            print("✅ Database tables created successfully")
            
            # Check if admin user exists
            admin = User.query.filter_by(role=UserRole.ADMIN).first()
            if not admin:
                # Create admin user
                admin = User(
                    username='admin',
                    email='admin@banktools.ai',
                    role=UserRole.ADMIN,
                    confirmed=True
                )
                admin.password = 'adminpassword'
                db.session.add(admin)
                db.session.commit()
                print("✅ Admin user created successfully")
            else:
                print("ℹ️ Admin user already exists")
            
            # Check if test users exist
            bu = User.query.filter_by(email='bu@banktools.ai').first()
            if not bu:
                # Create banking user
                bu = User(
                    username='bankinguser',
                    email='bu@banktools.ai',
                    role=UserRole.BANKING_USER,
                    confirmed=True
                )
                bu.password = 'password'
                db.session.add(bu)
                db.session.commit()
                print("✅ Banking User created successfully")
            else:
                print("ℹ️ Banking User already exists")
            
            be = User.query.filter_by(email='be@banktools.ai').first()
            if not be:
                # Create banking employee
                be = User(
                    username='bankingemp',
                    email='be@banktools.ai',
                    role=UserRole.BANKING_EMPLOYEE,
                    confirmed=True
                )
                be.password = 'password'
                db.session.add(be)
                db.session.commit()
                print("✅ Banking Employee created successfully")
            else:
                print("ℹ️ Banking Employee already exists")
            
            print("\n🚀 Database setup completed successfully!")
            print("\nTest users:")
            print("- Admin: admin@banktools.ai / adminpassword")
            print("- Banking User: bu@banktools.ai / password")
            print("- Banking Employee: be@banktools.ai / password")
            
        except Exception as e:
            print(f"❌ Error setting up database: {str(e)}")
            return False
    
    return True

if __name__ == '__main__':
    print("🔧 Setting up BankTools_AI database...")
    if setup_database():
        sys.exit(0)
    else:
        sys.exit(1) 