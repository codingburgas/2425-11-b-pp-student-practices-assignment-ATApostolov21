from flask import request, jsonify, current_app, url_for
from flask_login import login_user, logout_user, login_required, current_user
from datetime import datetime, timedelta
import jwt

from . import auth
from .. import db
from ..models import User, Token, UserRole
from ..email import send_email


@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    # Validate input data
    required_fields = ['email', 'username', 'password', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400
    
    # Check if email or username already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already in use'}), 400
    
    # Validate role
    try:
        role = UserRole(data['role'])
    except ValueError:
        return jsonify({'error': 'Invalid role specified'}), 400
    
    # Create new user
    user = User(
        email=data['email'],
        username=data['username'],
        role=role
    )
    user.password = data['password']
    
    # Create confirmation token
    token_value = user.generate_confirmation_token()
    token = Token(
        token=token_value,
        user=user,
        type='confirmation',
        expiration=datetime.utcnow() + timedelta(hours=24)
    )
    
    db.session.add(user)
    db.session.add(token)
    db.session.commit()
    
    # Send confirmation email
    confirmation_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:8080')}/confirm/{token_value}"
    print(f"DEBUG: Sending confirmation email to {user.email}")
    print(f"DEBUG: Confirmation URL: {confirmation_url}")
    
    try:
        send_email(
            to=user.email,
            subject='Confirm Your Account',
            template='auth/email/confirm',
            user=user,
            confirmation_url=confirmation_url
        )
        print(f"DEBUG: Email sent successfully")
    except Exception as e:
        print(f"DEBUG: Failed to send email: {str(e)}")
    
    return jsonify({
        'message': 'User registered successfully. Please check your email to confirm your account.',
        'user_id': user.id,
        'debug_confirmation_link': confirmation_url  # Include the link in the response for debugging
    }), 201


@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    
    # Check for required fields
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if user is None or not user.verify_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Check if user is confirmed
    if not user.confirmed:
        return jsonify({'error': 'Account not confirmed. Please check your email for confirmation link.'}), 403
    
    # Log in user
    login_user(user, remember=data.get('remember', False))
    
    # Generate a simple JWT token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, current_app.config['JWT_SECRET_KEY'])
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role.value,
            'confirmed': user.confirmed
        }
    }), 200


@auth.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200


@auth.route('/confirm/<token>', methods=['GET'])
def confirm_account(token):
    # Find the token in the database
    token_record = Token.query.filter_by(token=token, type='confirmation').first()
    
    if not token_record:
        return jsonify({'error': 'Invalid or expired confirmation link'}), 400
    
    # Check if token is expired
    if token_record.expiration and token_record.expiration < datetime.utcnow():
        db.session.delete(token_record)
        db.session.commit()
        return jsonify({'error': 'The confirmation link has expired'}), 400
    
    user = token_record.user
    if user.confirmed:
        return jsonify({'message': 'Account already confirmed'}), 200
    
    # Confirm the user
    user.confirmed = True
    db.session.delete(token_record)  # Remove used token
    db.session.commit()
    
    return jsonify({'message': 'Account confirmed successfully'}), 200


@auth.route('/resend-confirmation', methods=['POST'])
@login_required
def resend_confirmation():
    if current_user.confirmed:
        return jsonify({'message': 'Account already confirmed'}), 200
    
    # Create new confirmation token
    token_value = current_user.generate_confirmation_token()
    
    # Delete any existing confirmation tokens
    Token.query.filter_by(user_id=current_user.id, type='confirmation').delete()
    
    # Create new token
    token = Token(
        token=token_value,
        user=current_user,
        type='confirmation',
        expiration=datetime.utcnow() + timedelta(hours=24)
    )
    
    db.session.add(token)
    db.session.commit()
    
    # Send confirmation email
    confirmation_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:5173')}/confirm/{token_value}"
    send_email(
        to=current_user.email,
        subject='Confirm Your Account',
        template='auth/email/confirm',
        user=current_user,
        confirmation_url=confirmation_url
    )
    
    return jsonify({'message': 'A new confirmation email has been sent to your email address'}), 200


@auth.route('/reset-password', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({'message': 'If an account with this email exists, a password reset link has been sent'}), 200
    
    # Delete any existing reset tokens
    Token.query.filter_by(user_id=user.id, type='reset').delete()
    
    # Create reset token
    token_value = user.generate_confirmation_token()
    token = Token(
        token=token_value,
        user=user,
        type='reset',
        expiration=datetime.utcnow() + timedelta(hours=1)
    )
    
    db.session.add(token)
    db.session.commit()
    
    # Send reset email
    reset_url = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:5173')}/reset-password/{token_value}"
    send_email(
        to=user.email,
        subject='Reset Your Password',
        template='auth/email/reset_password',
        user=user,
        reset_url=reset_url
    )
    
    return jsonify({'message': 'If an account with this email exists, a password reset link has been sent'}), 200


@auth.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    if not data or 'password' not in data:
        return jsonify({'error': 'New password is required'}), 400
    
    # Find the token in the database
    token_record = Token.query.filter_by(token=token, type='reset').first()
    
    if not token_record:
        return jsonify({'error': 'Invalid or expired reset link'}), 400
    
    # Check if token is expired
    if token_record.expiration and token_record.expiration < datetime.utcnow():
        db.session.delete(token_record)
        db.session.commit()
        return jsonify({'error': 'The reset link has expired'}), 400
    
    user = token_record.user
    user.password = data['password']
    db.session.delete(token_record)  # Remove used token
    db.session.commit()
    
    return jsonify({'message': 'Password has been reset successfully'}), 200


@auth.route('/profile', methods=['GET'])
@login_required
def get_profile():
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'role': current_user.role.value,
        'confirmed': current_user.confirmed,
        'created_at': current_user.created_at.isoformat()
    }), 200 