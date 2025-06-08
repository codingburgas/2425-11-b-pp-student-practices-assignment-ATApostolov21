import { useState } from 'react'
import type { User } from '../types'
import { user as userAPI } from '../api'
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface ProfilePageProps {
  user: User
  onUpdateProfile?: (updatedUser: Partial<User>) => void
}

export default function ProfilePage({ user, onUpdateProfile }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    email: user.email
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleEdit = () => {
    setIsEditing(true)
    setEditForm({ email: user.email })
    setMessage(null)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditForm({ email: user.email })
    setMessage(null)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await userAPI.updateEmail(editForm.email)
      
      // Call parent update function with the new user data
      if (onUpdateProfile && response.data.user) {
        onUpdateProfile(response.data.user)
      }
      
      setMessage({ type: 'success', text: 'Email updated successfully!' })
      setIsEditing(false)
    } catch (error: any) {
      let errorMessage = 'Failed to update email. Please try again.'
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const isCustomer = user.role === 'banking_user'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
            Profile
          </h1>
          <p className="text-gray-400">Manage your account information</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 rounded-xl p-4 backdrop-blur-sm ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/30' 
              : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {message.type === 'success' ? (
                  <CheckIcon className="h-5 w-5 text-green-400" />
                ) : (
                  <XMarkIcon className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <div className={`text-sm ${message.type === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                  {message.text}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Account Information</h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl text-white font-medium transition-all duration-200"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 hover:text-white font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="w-full pl-12 pr-4 py-3 bg-gray-900/30 border border-gray-700/50 rounded-xl text-gray-400 font-mono">
                      #{user.id.toString().padStart(6, '0')}
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white placeholder:text-gray-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="w-full pl-12 pr-4 py-3 bg-gray-900/30 border border-gray-700/50 rounded-xl text-white">
                        {user.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Account Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="w-full pl-12 pr-4 py-3 bg-gray-900/30 border border-gray-700/50 rounded-xl text-white flex items-center justify-between">
                      <span>{isCustomer ? 'Banking Customer' : 'Banking Employee'}</span>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        isCustomer 
                          ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' 
                          : 'bg-green-500/20 border border-green-500/30 text-green-300'
                      }`}>
                        {isCustomer ? 'Customer' : 'Employee'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Information Sidebar */}
          <div className="space-y-6">
            {/* Role Features Card */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6">
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${isCustomer ? 'from-blue-500 to-blue-600' : 'from-green-500 to-green-600'} rounded-2xl flex items-center justify-center mr-4`}>
                  {isCustomer ? (
                    <BanknotesIcon className="w-6 h-6 text-white" />
                  ) : (
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{isCustomer ? 'Banking Customer' : 'Banking Employee'}</h3>
                  <p className="text-sm text-gray-400">{isCustomer ? 'Loan applications & services' : 'Analytics & admin tools'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Available Features:</h4>
                {isCustomer ? (
                  <>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/30">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Apply for loans with AI assistance</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/30">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Real-time application tracking</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/30">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Personalized insights</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Customer churn analysis</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Advanced analytics tools</span>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-gray-300 text-sm">Risk assessment dashboard</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 