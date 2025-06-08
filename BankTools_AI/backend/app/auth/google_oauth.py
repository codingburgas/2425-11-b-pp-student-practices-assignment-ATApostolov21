"""
Google OAuth utility functions for BankTools_AI
"""

import json
import requests
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from flask import current_app, url_for
from app.models import User
from app import db

class GoogleOAuth:
    """Google OAuth handler class"""
    
    @staticmethod
    def get_google_provider_cfg():
        """Get Google's OAuth 2.0 configuration"""
        return requests.get(current_app.config['GOOGLE_DISCOVERY_URL']).json()
    
    @staticmethod
    def get_authorization_url():
        """Generate Google OAuth authorization URL"""
        google_provider_cfg = GoogleOAuth.get_google_provider_cfg()
        authorization_endpoint = google_provider_cfg["authorization_endpoint"]
        
        # Construct the authorization URL
        client_id = current_app.config['GOOGLE_CLIENT_ID']
        redirect_uri = url_for('auth.google_callback', _external=True)
        scope = "openid email profile"
        
        auth_url = (
            f"{authorization_endpoint}?"
            f"response_type=code&"
            f"client_id={client_id}&"
            f"redirect_uri={redirect_uri}&"
            f"scope={scope}&"
            f"access_type=offline&"
            f"prompt=consent"
        )
        
        return auth_url
    
    @staticmethod
    def exchange_code_for_token(code):
        """Exchange authorization code for access token"""
        google_provider_cfg = GoogleOAuth.get_google_provider_cfg()
        token_endpoint = google_provider_cfg["token_endpoint"]
        
        token_data = {
            'code': code,
            'client_id': current_app.config['GOOGLE_CLIENT_ID'],
            'client_secret': current_app.config['GOOGLE_CLIENT_SECRET'],
            'redirect_uri': url_for('auth.google_callback', _external=True),
            'grant_type': 'authorization_code'
        }
        
        token_response = requests.post(token_endpoint, data=token_data)
        return token_response.json()
    
    @staticmethod
    def get_user_info(access_token):
        """Get user information from Google using access token"""
        google_provider_cfg = GoogleOAuth.get_google_provider_cfg()
        userinfo_endpoint = google_provider_cfg["userinfo_endpoint"]
        
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(userinfo_endpoint, headers=headers)
        return user_response.json()
    
    @staticmethod
    def verify_id_token(id_token_str):
        """Verify Google ID token and extract user info"""
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                id_token_str, 
                google_requests.Request(), 
                current_app.config['GOOGLE_CLIENT_ID']
            )
            
            # Verify the issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')
            
            return idinfo
        except ValueError as e:
            current_app.logger.error(f"ID token verification failed: {e}")
            return None
    
    @staticmethod
    def create_or_update_user(user_info):
        """Create or update user from Google OAuth info"""
        google_id = user_info.get('sub')
        email = user_info.get('email')
        first_name = user_info.get('given_name', '')
        last_name = user_info.get('family_name', '')
        profile_picture = user_info.get('picture', '')
        email_verified = user_info.get('email_verified', False)
        
        # Check if user exists by Google ID
        user = User.query.filter_by(google_id=google_id).first()
        
        if user:
            # Update existing user info
            user.first_name = first_name
            user.last_name = last_name
            user.profile_picture = profile_picture
            if email_verified:
                user.is_verified = True
        else:
            # Check if user exists by email (for account linking)
            existing_user = User.query.filter_by(email=email).first()
            
            if existing_user:
                # Link Google account to existing user
                existing_user.google_id = google_id
                existing_user.first_name = first_name
                existing_user.last_name = last_name
                existing_user.profile_picture = profile_picture
                existing_user.auth_provider = 'google'
                if email_verified:
                    existing_user.is_verified = True
                user = existing_user
            else:
                # Create new user
                user = User(
                    email=email,
                    google_id=google_id,
                    first_name=first_name,
                    last_name=last_name,
                    profile_picture=profile_picture,
                    role='banking_user',  # Default role for Google users
                    auth_provider='google',
                    is_verified=email_verified
                )
                db.session.add(user)
        
        db.session.commit()
        return user 