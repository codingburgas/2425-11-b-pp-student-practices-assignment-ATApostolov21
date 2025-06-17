import { useState, type FormEvent } from 'react'
import type { User } from '../types'
import { auth } from '../api'
import Logo from './Logo'
import GoogleLoginButton from './GoogleLoginButton'

interface LoginFormProps {
  onSuccess: (user: User) => void
  onNavigateToRegister: () => void
  onBackToLanding: () => void
}

export default function LoginForm({ onSuccess, onNavigateToRegister, onBackToLanding }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Clear error when user starts typing
  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (error) setError('')
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (error) setError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const response = await auth.login(email, password)
      console.log('=== LOGIN RESPONSE DEBUG ===')
      console.log('Full response:', response)
      console.log('Response data:', response.data)
      console.log('Response data user:', response.data.user)
      console.log('============================')
      
      const user = response.data.user
      
      // Show success message with role-specific dashboard info
      const dashboardType = user.role === 'banking_user' ? 'Customer Dashboard' : 'Employee Analytics Dashboard'
      setSuccess(`✅ Login successful! Welcome ${user.email}. Redirecting to your ${dashboardType}...`)
      
      // Immediate redirect for debugging
      onSuccess(user)
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Invalid email or password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = (user: User) => {
    const dashboardType = user.role === 'banking_user' ? 'Customer Dashboard' : 'Employee Analytics Dashboard'
    setSuccess(`✅ Google login successful! Welcome ${user.email}. Redirecting to your ${dashboardType}...`)
    onSuccess(user)
  }

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col justify-center px-6 py-12 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Back button */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-sm mb-4">
        <button
          onClick={onBackToLanding}
          className="group flex items-center text-sm text-gray-400 hover:text-white transition-all duration-200"
        >
          <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </button>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="large" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
            BankTools_AI
          </h2>
          <h3 className="text-2xl font-bold text-white mb-4">
            Welcome Back
          </h3>
          <p className="text-gray-400">
            Sign in to access your intelligent banking platform
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 py-8 px-6 shadow-2xl rounded-3xl">
          {/* Google Login Button */}
          <div className="mb-6">
            <GoogleLoginButton 
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/50 text-gray-400">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-gray-900/50 py-4 px-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:bg-gray-900/70 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-gray-900/50 py-4 px-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:bg-gray-900/70 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-4 backdrop-blur-sm animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-red-200">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-xl bg-green-500/20 border border-green-500/30 p-4 backdrop-blur-sm animate-pulse">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-green-200">{success}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !!success}
                className="group relative w-full flex justify-center py-4 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                {success ? (
                  <div className="flex items-center relative z-10">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Redirecting to Dashboard...
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center relative z-10">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <span className="relative z-10">Sign in</span>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="text-gray-400 hover:text-white transition-colors duration-200 font-medium"
              >
                Don't have an account? <span className="text-purple-400 hover:text-purple-300">Sign up</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 