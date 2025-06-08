# Google OAuth Setup Guide

This guide will help you set up Google OAuth login for the BankTools_AI platform.

## Prerequisites

1. A Google Cloud Platform (GCP) account
2. Access to the Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "BankTools-AI-OAuth")
5. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" and click on it
3. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Click "Create"
4. Fill in the required information:
   - App name: "BankTools_AI"
   - User support email: Your email
   - Developer contact information: Your email
5. Click "Save and Continue"
6. Skip the "Scopes" section for now (click "Save and Continue")
7. Add test users if needed (for development)
8. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Enter a name (e.g., "BankTools_AI_Web_Client")
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (for development)
   - Your production domain (when deploying)
6. Add authorized redirect URIs:
   - `http://localhost:5001/api/auth/google-callback` (for development)
   - Your production callback URL (when deploying)
7. Click "Create"
8. Copy the Client ID and Client Secret

## Step 5: Configure Backend Environment

1. In the `backend` directory, create a `.env` file (or update existing one):

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///app.db

# Mail Configuration (existing)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Replace `your-google-client-id.apps.googleusercontent.com` and `your-google-client-secret` with the values from Step 4.

## Step 6: Configure Frontend Environment

1. In the `frontend` directory, create a `.env` file:

```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Replace `your-google-client-id.apps.googleusercontent.com` with the Client ID from Step 4.

## Step 7: Test the Integration

1. Start the backend server:
   ```bash
   cd backend
   python app.py
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:5173`
4. Go to the login page
5. You should see a "Sign in with Google" button
6. Click it to test the Google OAuth flow

## Troubleshooting

### Common Issues

1. **"Error 400: redirect_uri_mismatch"**
   - Make sure the redirect URI in your Google Cloud Console matches exactly with your backend callback URL
   - Check that you're using the correct port (5001 for backend)

2. **"Error 403: access_blocked"**
   - Make sure your OAuth consent screen is properly configured
   - Add your test email to the test users list if the app is in testing mode

3. **"Invalid client ID"**
   - Verify that the Client ID in your frontend `.env` file matches the one from Google Cloud Console
   - Make sure there are no extra spaces or characters

4. **Backend errors**
   - Check that all required Python packages are installed (`google-auth`, `google-auth-oauthlib`, etc.)
   - Verify that the backend `.env` file has the correct Google Client ID and Secret

### Security Notes

- Never commit your `.env` files to version control
- Keep your Client Secret secure and never expose it in frontend code
- Use HTTPS in production
- Regularly rotate your OAuth credentials

## Production Deployment

When deploying to production:

1. Update the authorized JavaScript origins and redirect URIs in Google Cloud Console
2. Update your environment variables with production values
3. Ensure HTTPS is enabled
4. Consider moving from "Testing" to "In production" status in the OAuth consent screen

## Features Implemented

- ✅ Google OAuth login integration
- ✅ Automatic user creation for new Google users
- ✅ Linking Google accounts to existing email accounts
- ✅ Profile information sync (name, profile picture)
- ✅ Secure token verification
- ✅ Seamless integration with existing authentication system

## User Experience

- Users can sign in with their Google account with one click
- New users are automatically created with the `banking_user` role
- Existing users can link their Google account to their existing account
- Google users are automatically verified (no email verification needed)
- Profile information is synced from Google (name, profile picture) 