from flask import jsonify, request, url_for
from flask_login import login_user, logout_user, current_user
from flask_mail import Message
from app import db, mail
from app.auth import bp
from app.models import User

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data['email'],
        role=data['role']
    )
    user.set_password(data['password'])
    
    # Generate verification token
    verification_token = user.generate_verification_token()
    
    db.session.add(user)
    db.session.commit()
    
    # Send verification email
    try:
        send_verification_email(user.email, verification_token)
        return jsonify({
            'message': 'Registration successful. Please check your email to verify your account.',
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'is_verified': user.is_verified
            }
        }), 201
    except Exception as e:
        return jsonify({
            'message': 'Registration successful, but failed to send verification email. You can request a new verification email.',
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role,
                'is_verified': user.is_verified
            }
        }), 201

@bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Verification token required'}), 400
    
    user = User.query.filter_by(verification_token=token).first()
    
    if not user:
        return jsonify({'error': 'Invalid or expired verification token'}), 400
    
    if user.verify_email(token):
        db.session.commit()
        return jsonify({'message': 'Email verified successfully'}), 200
    else:
        return jsonify({'error': 'Invalid verification token'}), 400

@bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.is_verified:
        return jsonify({'error': 'Email already verified'}), 400
    
    # Generate new verification token
    verification_token = user.generate_verification_token()
    db.session.commit()
    
    try:
        send_verification_email(user.email, verification_token)
        return jsonify({'message': 'Verification email sent'}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to send verification email'}), 500

@bp.route('/login', methods=['POST'])
def login():
    # If user is already logged in, return their current info instead of an error
    if current_user.is_authenticated:
        return jsonify({
            'message': 'Already logged in',
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'role': current_user.role,
                'is_verified': current_user.is_verified
            }
        })
    
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user is None or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Temporarily disable email verification requirement for development
    # if not user.is_verified:
    #     return jsonify({'error': 'Please verify your email before logging in'}), 401
    
    login_user(user)
    
    return jsonify({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'is_verified': user.is_verified
        }
    })

@bp.route('/logout', methods=['POST'])
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'})

def send_verification_email(email, token):
    """Send verification email to user"""
    verification_url = f"http://localhost:5173/verify-email?token={token}"
    
    msg = Message(
        'Verify Your BankTools_AI Account',
        sender='noreply@banktools-ai.com',
        recipients=[email]
    )
    
    msg.html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to BankTools_AI!</h2>
        <p>Thank you for registering with BankTools_AI. Please verify your email address to activate your account.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_url}" 
               style="background: linear-gradient(to right, #4F46E5, #7C3AED); 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      display: inline-block;">
                Verify Email Address
            </a>
        </div>
        <p style="color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #4F46E5; word-break: break-all;">{verification_url}</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
            This verification link will expire in 24 hours. If you didn't create an account with BankTools_AI, please ignore this email.
        </p>
    </div>
    """
    
    mail.send(msg) 