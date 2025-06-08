from app import create_app, db
from app.models import User
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    # Check if employee user exists
    employee = User.query.filter_by(email='employee@bank.com').first()
    if not employee:
        # Create employee user
        employee = User(
            email='employee@bank.com',
            password_hash=generate_password_hash('password123'),
            role='banking_employee',
            is_verified=True
        )
        db.session.add(employee)
        db.session.commit()
        print('✅ Created test employee user')
    else:
        print('✅ Employee user already exists') 