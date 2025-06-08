import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import Layout from './components/Layout'
import LandingPage from './components/LandingPage'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import LoanRequestForm from './components/LoanRequestForm'
import LoanDashboard from './components/LoanDashboard'
import EmployeeDashboard from './components/Dashboards/EmployeeDashboard'
import LoanApplicationResults from './components/LoanApplicationResults'
import LoanDetails from './components/LoanDetails'
import ChurnAnalysisUpload from './components/ChurnAnalytics/ChurnAnalysisUpload'
import OnboardingFlow from './components/OnboardingFlow'
import ProfilePage from './components/ProfilePage'
import SettingsPage from './components/SettingsPage'
import { auth } from './api'
import type { User } from './types'

// Google Client ID - you'll need to replace this with your actual client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id.apps.googleusercontent.com"

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'dashboard'>('landing')
  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleLogin = (userData: User) => {
    console.log('=== DASHBOARD RENDERING DEBUG ===')
    console.log('Full user object:', JSON.stringify(userData, null, 2))
    console.log('User role:', userData.role)
    console.log('Role type check:', typeof userData.role)
    console.log('Is banking_user?', userData.role === 'banking_user')
    console.log('Is banking_employee?', userData.role === 'banking_employee')
    console.log('Dashboard choice:', userData.role === 'banking_employee' ? 'EmployeeDashboard' : 'LoanDashboard')
    console.log('==================================')
    
    setUser(userData)
    setCurrentView('dashboard')
    setShowOnboarding(true) // Show onboarding every time user logs in
  }

  const handleLogout = async () => {
    try {
      await auth.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setCurrentView('landing')
      setShowOnboarding(false)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
  }

  const handleUpdateProfile = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser })
    }
  }

  // Show onboarding overlay if user is logged in and onboarding should be shown
  if (user && showOnboarding) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {/* Main app content (blurred in background) */}
        <div className="filter blur-sm pointer-events-none">
          <Router>
            <Layout user={user} onLogout={handleLogout}>
              <Routes>
                <Route
                  path="/"
                  element={user.role === 'banking_employee' ? <EmployeeDashboard user={user} /> : <LoanDashboard user={user} />}
                />
                <Route path="/loan-request" element={<LoanRequestForm />} />
                <Route path="/loan-dashboard" element={<LoanDashboard user={user} />} />
                <Route path="/loan-details/:id" element={<LoanDetails user={user} />} />
                <Route path="/employee-dashboard" element={<EmployeeDashboard user={user} />} />
                <Route path="/loan-results/:id" element={<LoanApplicationResults user={user} />} />
                <Route path="/churn-analysis" element={<ChurnAnalysisUpload />} />
                <Route path="/churn-analysis/:id" element={<ChurnAnalysisUpload />} />
                <Route path="/profile" element={<ProfilePage user={user} onUpdateProfile={handleUpdateProfile} />} />
                <Route path="/settings" element={<SettingsPage user={user} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Router>
        </div>
        
        {/* Onboarding overlay */}
        <div className="fixed inset-0 z-[100] pointer-events-auto">
          <OnboardingFlow 
            user={user} 
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        </div>
      </GoogleOAuthProvider>
    )
  }

  // If user is logged in, show the dashboard
  if (user && currentView === 'dashboard') {
    console.log('=== DASHBOARD RENDERING DEBUG ===')
    console.log('Full user object:', JSON.stringify(user, null, 2))
    console.log('User role:', user.role)
    console.log('Role type check:', typeof user.role)
    console.log('Is banking_user?', user.role === 'banking_user')
    console.log('Is banking_employee?', user.role === 'banking_employee')
    console.log('Dashboard choice:', user.role === 'banking_employee' ? 'EmployeeDashboard' : 'LoanDashboard')
    console.log('==================================')
    
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Router>
          <Layout user={user} onLogout={handleLogout}>
            <Routes>
              <Route
                path="/"
                element={user.role === 'banking_employee' ? <EmployeeDashboard user={user} /> : <LoanDashboard user={user} />}
              />
              <Route path="/loan-request" element={<LoanRequestForm />} />
              <Route path="/loan-dashboard" element={<LoanDashboard user={user} />} />
              <Route path="/loan-details/:id" element={<LoanDetails user={user} />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard user={user} />} />
              <Route path="/loan-results/:id" element={<LoanApplicationResults user={user} />} />
              <Route path="/churn-analysis" element={<ChurnAnalysisUpload />} />
              <Route path="/churn-analysis/:id" element={<ChurnAnalysisUpload />} />
              <Route path="/profile" element={<ProfilePage user={user} onUpdateProfile={handleUpdateProfile} />} />
              <Route path="/settings" element={<SettingsPage user={user} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </GoogleOAuthProvider>
    )
  }

  // Show auth forms or landing page
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div>
        {currentView === 'landing' && (
          <LandingPage
            onNavigateToLogin={() => setCurrentView('login')}
            onNavigateToRegister={() => setCurrentView('register')}
          />
        )}
        {currentView === 'login' && (
          <LoginForm
            onSuccess={handleLogin}
            onNavigateToRegister={() => setCurrentView('register')}
            onBackToLanding={() => setCurrentView('landing')}
          />
        )}
        {currentView === 'register' && (
          <RegisterForm
            onSuccess={handleLogin}
            onNavigateToLogin={() => setCurrentView('login')}
            onBackToLanding={() => setCurrentView('landing')}
          />
        )}
      </div>
    </GoogleOAuthProvider>
  )
}

export default App
