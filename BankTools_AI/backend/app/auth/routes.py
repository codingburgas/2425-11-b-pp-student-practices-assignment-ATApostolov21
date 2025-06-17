from flask import jsonify, request, url_for, redirect
from flask_login import login_user, logout_user, current_user
from flask_mail import Message
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app import db, mail
from app.auth import bp
from app.models import User
from app.auth.google_oauth import GoogleOAuth

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Map frontend account_type to backend role
    account_type = data.get('account_type', data.get('role', 'customer'))
    if account_type == 'customer':
        role = 'banking_user'
    elif account_type == 'employee':
        role = 'banking_employee'
    elif account_type in ['banking_user', 'banking_employee']:
        role = account_type
    else:
        role = 'banking_user'  # Default to banking_user
    
    user = User(
        email=data['email'],
        role=role
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
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if user is None:
        return jsonify({'error': 'No account found with this email address. Please check your email or register for a new account.'}), 401
    
    if not user.check_password(password):
        return jsonify({'error': 'Incorrect password. Please check your password and try again.'}), 401
    
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

@bp.route('/google', methods=['POST'])
def google_auth():
    """Handle Google OAuth credential verification from frontend"""
    try:
        data = request.get_json()
        credential = data.get('credential')
        
        if not credential:
            return jsonify({'error': 'Google credential required'}), 400
        
        # Verify the Google ID token
        try:
            # Specify the CLIENT_ID of the app that accesses the backend
            from flask import current_app
            client_id = current_app.config.get('GOOGLE_CLIENT_ID')
            
            if not client_id:
                return jsonify({'error': 'Google OAuth not configured'}), 500
            
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                credential, 
                google_requests.Request(), 
                client_id
            )
            
            # Get user information from the token
            google_id = idinfo['sub']
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            profile_picture = idinfo.get('picture', '')
            
            # Check if user already exists
            user = User.query.filter_by(email=email).first()
            
            if user:
                # Update existing user with Google info if not already set
                if not user.google_id:
                    user.google_id = google_id
                    user.auth_provider = 'google'
                    user.is_verified = True  # Google accounts are pre-verified
                    if not user.first_name:
                        user.first_name = first_name
                    if not user.last_name:
                        user.last_name = last_name
                    if not user.profile_picture:
                        user.profile_picture = profile_picture
                    db.session.commit()
            else:
                # Create new user with Google info
                # Default role for Google sign-ups is banking_user
                user = User(
                    email=email,
                    google_id=google_id,
                    first_name=first_name,
                    last_name=last_name,
                    profile_picture=profile_picture,
                    role='banking_user',  # Default role
                    auth_provider='google',
                    is_verified=True  # Google accounts are pre-verified
                )
                db.session.add(user)
                db.session.commit()
            
            # Log in the user
            login_user(user)
            
            return jsonify({
                'message': 'Google login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role,
                    'is_verified': user.is_verified,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'profile_picture': user.profile_picture,
                    'auth_provider': user.auth_provider
                }
            })
            
        except ValueError as e:
            # Invalid token
            return jsonify({'error': 'Invalid Google token'}), 401
            
    except Exception as e:
        return jsonify({'error': f'Google authentication failed: {str(e)}'}), 500

@bp.route('/google-login', methods=['GET'])
def google_login():
    """Initiate Google OAuth login"""
    try:
        auth_url = GoogleOAuth.get_authorization_url()
        return jsonify({'auth_url': auth_url})
    except Exception as e:
        return jsonify({'error': f'Failed to initiate Google login: {str(e)}'}), 500

@bp.route('/google-callback')
def google_callback():
    """Handle Google OAuth callback"""
    try:
        # Get authorization code from query parameters
        code = request.args.get('code')
        if not code:
            return redirect('http://localhost:5173/login?error=google_auth_failed')
        
        # Exchange code for tokens
        token_response = GoogleOAuth.exchange_code_for_token(code)
        
        if 'error' in token_response:
            return redirect('http://localhost:5173/login?error=google_auth_failed')
        
        # Get user info using access token
        access_token = token_response.get('access_token')
        id_token_str = token_response.get('id_token')
        
        if id_token_str:
            # Verify ID token and get user info
            user_info = GoogleOAuth.verify_id_token(id_token_str)
        else:
            # Fallback to userinfo endpoint
            user_info = GoogleOAuth.get_user_info(access_token)
        
        if not user_info:
            return redirect('http://localhost:5173/login?error=google_auth_failed')
        
        # Create or update user
        user = GoogleOAuth.create_or_update_user(user_info)
        
        # Log in the user
        login_user(user)
        
        # Redirect to frontend with success
        return redirect('http://localhost:5173/dashboard')
        
    except Exception as e:
        return redirect(f'http://localhost:5173/login?error=google_auth_failed&details={str(e)}')

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