import { useState, useEffect, type FormEvent } from 'react'
import type { User } from '../types'
import { auth } from '../api'
import Logo from './Logo'

interface RegisterFormProps {
  onSuccess: (user: User) => void
  onNavigateToLogin: () => void
  onBackToLanding: () => void
}

export default function RegisterForm({ onNavigateToLogin, onBackToLanding }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<User['role']>('banking_user')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      await auth.register(email, password, role)
      setSuccess('✅ Registration successful! Please check your email for verification instructions. Redirecting to login...')
      
      // Start countdown
      let timeLeft = 3
      setCountdown(timeLeft)
      
      const timer = setInterval(() => {
        timeLeft--
        setCountdown(timeLeft)
        
        if (timeLeft === 0) {
          clearInterval(timer)
          onNavigateToLogin()
        }
      }, 1000)
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col justify-center px-6 py-12 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
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
            Join the Future
          </h3>
          <p className="text-gray-400">
            Create your account and experience intelligent banking
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 py-8 px-6 shadow-2xl rounded-3xl">
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-gray-900/50 py-4 px-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:bg-gray-900/70 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Create a password"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-xl border-0 bg-gray-900/50 py-4 px-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 focus:bg-gray-900/70 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                Account Type
              </label>
              <div className="space-y-3">
                <label className="group relative flex items-center p-4 rounded-xl border border-gray-700/50 bg-gray-900/30 hover:bg-gray-900/50 cursor-pointer transition-all duration-200">
                  <input
                    type="radio"
                    name="role"
                    value="banking_user"
                    checked={role === 'banking_user'}
                    onChange={(e) => setRole(e.target.value as User['role'])}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 transition-all duration-200 ${
                    role === 'banking_user' 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-500 group-hover:border-blue-400'
                  }`}>
                    {role === 'banking_user' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium">Banking Customer</div>
                      <div className="text-gray-400 text-sm">Apply for loans with AI assistance</div>
                    </div>
                  </div>
                </label>

                <label className="group relative flex items-center p-4 rounded-xl border border-gray-700/50 bg-gray-900/30 hover:bg-gray-900/50 cursor-pointer transition-all duration-200">
                  <input
                    type="radio"
                    name="role"
                    value="banking_employee"
                    checked={role === 'banking_employee'}
                    onChange={(e) => setRole(e.target.value as User['role'])}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 transition-all duration-200 ${
                    role === 'banking_employee' 
                      ? 'border-green-500 bg-green-500' 
                      : 'border-gray-500 group-hover:border-green-400'
                  }`}>
                    {role === 'banking_employee' && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-medium">Banking Employee</div>
                      <div className="text-gray-400 text-sm">Access analytics and churn prediction</div>
                    </div>
                  </div>
                </label>
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
              <div className="rounded-xl bg-green-500/20 border border-green-500/30 p-4 backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-green-200">
                      {success}
                      {countdown > 0 && (
                        <span className="block mt-1 font-medium">
                          Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
                        </span>
                      )}
                    </div>
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
                    Redirecting to Login...
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center relative z-10">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  <span className="relative z-10">Create Account</span>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-gray-400 hover:text-white transition-colors duration-200 font-medium"
              >
                Already have an account? <span className="text-purple-400 hover:text-purple-300">Sign in</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 