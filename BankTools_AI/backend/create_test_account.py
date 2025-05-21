from app import create_app, db
from app.models import User, Token, UserRole
from datetime import datetime, timedelta
import uuid

def create_test_account(email, username, password, role_name):
    app = create_app()
    with app.app_context():
        # Check if user already exists
        existing_user = User.query.filter((User.email == email) | (User.username == username)).first()
        if existing_user:
            print(f"User already exists: {existing_user.username} ({existing_user.email})")
            return

        # Create role
        try:
            role = UserRole(role_name)
        except ValueError:
            print(f"Invalid role: {role_name}")
            print(f"Valid roles: {[r.value for r in UserRole]}")
            return

        # Create user
        user = User(
            email=email,
            username=username,
            role=role,
            confirmed=True  # Pre-confirm the account
        )
        user.password = password
        
        # Create a token for reference but we don't need it since account is pre-confirmed
        token_value = str(uuid.uuid4())
        token = Token(
            token=token_value,
            user=user,
            type='confirmation',
            expiration=datetime.utcnow() + timedelta(hours=24)
        )
        
        # Save to database
        db.session.add(user)
        db.session.add(token)
        db.session.commit()
        
        print(f"Created and confirmed test account:")
        print(f"Email: {email}")
        print(f"Username: {username}")
        print(f"Password: {password}")
        print(f"Role: {role.value}")
        print(f"Token (for reference): {token_value}")
        print("\nThis account is already confirmed and ready to use.")

if __name__ == "__main__":
    # Create a test account - modify these values as needed
    create_test_account(
        email="testuser@example.com",
        username="testuser",
        password="password",
        role_name="banking_user"  # Options: banking_user, banking_employee, admin
    ) 