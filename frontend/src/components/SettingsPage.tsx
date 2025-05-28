import { useState } from 'react'
import type { User } from '../types'
import { 
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  MoonIcon,
  SunIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  KeyIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface SettingsPageProps {
  user: User
}

export default function SettingsPage({ user }: SettingsPageProps) {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      security: true,
      loanUpdates: true,
      analyticsReports: user.role === 'banking_employee'
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analytics: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: '30',
      loginAlerts: true
    },
    display: {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC-5'
    }
  })

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }))
    setMessage({ type: 'success', text: 'Setting updated successfully!' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSaveAll = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage({ type: 'success', text: 'All settings saved successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setMessage({ type: 'success', text: 'Account deletion request submitted.' })
      setShowDeleteDialog(false)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to process deletion request.' })
    } finally {
      setIsLoading(false)
    }
  }

  const ToggleSwitch = ({ enabled, onChange, disabled = false }: { enabled: boolean, onChange: (value: boolean) => void, disabled?: boolean }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
        enabled ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
            Settings & Preferences
          </h1>
          <p className="text-gray-400">Customize your banking experience and manage your account preferences</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 rounded-xl p-4 backdrop-blur-sm animate-pulse ${
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
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Notifications Settings */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
                  <BellIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Notifications</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Email Notifications</h3>
                    <p className="text-gray-400 text-sm">Receive updates via email</p>
                  </div>
                  <ToggleSwitch 
                    enabled={settings.notifications.email} 
                    onChange={(value) => handleSettingChange('notifications', 'email', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">SMS Alerts</h3>
                    <p className="text-gray-400 text-sm">Important alerts via text message</p>
                  </div>
                  <ToggleSwitch 
                    enabled={settings.notifications.sms} 
                    onChange={(value) => handleSettingChange('notifications', 'sms', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Push Notifications</h3>
                    <p className="text-gray-400 text-sm">Real-time browser notifications</p>
                  </div>
                  <ToggleSwitch 
                    enabled={settings.notifications.push} 
                    onChange={(value) => handleSettingChange('notifications', 'push', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Marketing Communications</h3>
                    <p className="text-gray-400 text-sm">Product updates and offers</p>
                  </div>
                  <ToggleSwitch 
                    enabled={settings.notifications.marketing} 
                    onChange={(value) => handleSettingChange('notifications', 'marketing', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Security Alerts</h3>
                    <p className="text-gray-400 text-sm">Login attempts and security events</p>
                  </div>
                  <ToggleSwitch 
                    enabled={settings.notifications.security} 
                    onChange={(value) => handleSettingChange('notifications', 'security', value)}
                  />
                </div>

                {user.role === 'banking_user' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Loan Updates</h3>
                      <p className="text-gray-400 text-sm">Application status and approvals</p>
                    </div>
                    <ToggleSwitch 
                      enabled={settings.notifications.loanUpdates} 
                      onChange={(value) => handleSettingChange('notifications', 'loanUpdates', value)}
                    />
                  </div>
                )}

                {user.role === 'banking_employee' && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">Analytics Reports</h3>
                      <p className="text-gray-400 text-sm">Weekly churn analysis reports</p>
                    </div>
                    <ToggleSwitch 
                      enabled={settings.notifications.analyticsReports} 
                      onChange={(value) => handleSettingChange('notifications', 'analyticsReports', value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-4">
                  <ShieldCheckIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Security & Privacy</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Two-Factor Authentication</h3>
                    <p className="text-gray-400 text-sm">Add an extra layer of security</p>
                  </div>
                  <ToggleSwitch 
                    enabled={settings.security.twoFactor} 
                    onChange={(value) => handleSettingChange('security', 'twoFactor', value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Login Alerts</h3>
                    <p className="text-gray-400 text-sm">Notify when account is accessed</p>
                  </div>
                  <ToggleSwitch 
                    enabled={settings.security.loginAlerts} 
                    onChange={(value) => handleSettingChange('security', 'loginAlerts', value)}
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Session Timeout</label>
                  <select 
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:bg-gray-900/70 transition-all duration-200"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Data Analytics</h3>
                    <p className="text-gray-400 text-sm">Help improve our services</p>
                  </div>
                  <ToggleSwitch 
                    enabled={settings.privacy.analytics} 
                    onChange={(value) => handleSettingChange('privacy', 'analytics', value)}
                  />
                </div>
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                  <CogIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Display & Accessibility</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Theme Preference</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSettingChange('display', 'theme', 'dark')}
                      className={`flex items-center justify-center px-4 py-3 rounded-xl border transition-all duration-200 ${
                        settings.display.theme === 'dark' 
                          ? 'bg-gray-900 border-purple-500 text-white' 
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <MoonIcon className="w-5 h-5 mr-2" />
                      Dark
                    </button>
                    <button
                      onClick={() => handleSettingChange('display', 'theme', 'light')}
                      className={`flex items-center justify-center px-4 py-3 rounded-xl border transition-all duration-200 ${
                        settings.display.theme === 'light' 
                          ? 'bg-gray-900 border-purple-500 text-white' 
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <SunIcon className="w-5 h-5 mr-2" />
                      Light
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Language</label>
                  <select 
                    value={settings.display.language}
                    onChange={(e) => handleSettingChange('display', 'language', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:bg-gray-900/70 transition-all duration-200"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">Timezone</label>
                  <select 
                    value={settings.display.timezone}
                    onChange={(e) => handleSettingChange('display', 'timezone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:bg-gray-900/70 transition-all duration-200"
                  >
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-7">Mountain Time (UTC-7)</option>
                    <option value="UTC-6">Central Time (UTC-6)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">UTC</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="group w-full flex items-center px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 rounded-xl text-white transition-all duration-200">
                  <KeyIcon className="w-5 h-5 mr-3 text-purple-400" />
                  Change Password
                </button>
                <button className="group w-full flex items-center px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 rounded-xl text-white transition-all duration-200">
                  <DevicePhoneMobileIcon className="w-5 h-5 mr-3 text-blue-400" />
                  Manage Devices
                </button>
                <button className="group w-full flex items-center px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 rounded-xl text-white transition-all duration-200">
                  <EnvelopeIcon className="w-5 h-5 mr-3 text-green-400" />
                  Email Preferences
                </button>
              </div>
            </div>

            {/* Save All Button */}
            <button
              onClick={handleSaveAll}
              disabled={isLoading}
              className="group w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-2xl font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isLoading ? (
                <div className="flex items-center justify-center relative z-10">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </div>
              ) : (
                <span className="relative z-10">Save All Settings</span>
              )}
            </button>

            {/* Danger Zone */}
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500">
              <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Danger Zone
              </h3>
              <p className="text-red-200 text-sm mb-4">
                This action cannot be undone. This will permanently delete your account and all associated data.
              </p>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 hover:border-red-500 rounded-xl text-red-300 hover:text-red-200 font-medium transition-all duration-200"
              >
                <TrashIcon className="w-4 h-4 inline mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-md w-full">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400 mr-3" />
                <h3 className="text-xl font-bold text-white">Delete Account</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and you will lose access to all your data.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 