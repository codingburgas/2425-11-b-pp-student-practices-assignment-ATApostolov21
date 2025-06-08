import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import type { User } from '../types'

interface GoogleLoginButtonProps {
  onSuccess: (user: User) => void
  onError?: (error: string) => void
}

export default function GoogleLoginButton({ onSuccess, onError }: GoogleLoginButtonProps) {
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google')
      }

      // Send the Google credential to our backend for verification
      // Note: We'll need to add this method to the auth API
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })

      if (!response.ok) {
        throw new Error('Google login failed')
      }

      const data = await response.json()
      
      if (data.user) {
        onSuccess(data.user)
      } else {
        throw new Error('No user data received from server')
      }
    } catch (error: any) {
      console.error('Google login error:', error)
      const errorMessage = error.message || 'Google login failed'
      onError?.(errorMessage)
    }
  }

  const handleGoogleError = () => {
    console.error('Google login failed')
    onError?.('Google login failed. Please try again.')
  }

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="filled_black"
        size="large"
        text="signin_with"
        shape="rectangular"
        width="100%"
        useOneTap={false}
      />
    </div>
  )
} 