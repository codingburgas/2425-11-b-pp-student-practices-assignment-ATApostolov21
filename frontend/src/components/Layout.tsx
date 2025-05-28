import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { User } from '../types'

interface LayoutProps {
  children: ReactNode
  user: User
  onLogout: () => void
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/' },
    ...(user.role === 'banking_user' 
      ? [{ name: 'Loan Request', href: '/loan-request' }]
      : []
    ),
    ...(user.role === 'banking_employee' 
      ? [{ name: 'Churn Analysis', href: '/churn-analysis' }]
      : []
    ),
  ]

  const handleNavClick = (name: string, href: string) => {
    console.log('🔥 Navigation clicked:', name, 'to', href)
    console.log('🔥 Current location:', location.pathname)
    console.log('🔥 User role:', user.role)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <nav className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 relative z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    BankTools_AI
                  </span>
                </div>
              </div>
              <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => handleNavClick(item.name, item.href)}
                    className={`${
                      location.pathname === item.href
                        ? 'border-purple-500 text-white bg-purple-500/10'
                        : 'border-transparent text-gray-300 hover:border-gray-500 hover:text-white hover:bg-gray-700/50'
                    } inline-flex items-center border-b-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg cursor-pointer pointer-events-auto relative z-10`}
                    style={{ pointerEvents: 'auto' }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <div className="text-sm text-gray-300">
                <span className="font-medium text-white">{user.email}</span>
                <span className={`ml-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                  user.role === 'banking_user' 
                    ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300' 
                    : 'bg-green-500/20 border border-green-500/30 text-green-300'
                }`}>
                  {user.role === 'banking_user' ? 'Customer' : 'Employee'}
                </span>
              </div>
              <button
                onClick={() => {
                  console.log('🔥 Logout clicked')
                  onLogout()
                }}
                className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-gray-500 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200 backdrop-blur-sm pointer-events-auto"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2 bg-gray-800/30 backdrop-blur-sm">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => handleNavClick(item.name, item.href)}
                className={`${
                  location.pathname === item.href
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-transparent text-gray-300 hover:border-gray-500 hover:bg-gray-700/50 hover:text-white'
                } block border-l-4 py-3 pl-4 pr-4 text-base font-medium transition-all duration-200 cursor-pointer pointer-events-auto`}
                style={{ pointerEvents: 'auto' }}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-gray-700 pb-3 pt-4">
              <div className="flex items-center px-4 mb-3">
                <div className="text-base font-medium text-white">{user.email}</div>
                <div className={`ml-3 text-xs font-medium px-2 py-1 rounded-full ${
                  user.role === 'banking_user' 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-green-500/20 text-green-300'
                }`}>
                  {user.role === 'banking_user' ? 'Customer' : 'Employee'}
                </div>
              </div>
              <div className="px-4">
                <button
                  onClick={() => {
                    console.log('🔥 Mobile logout clicked')
                    onLogout()
                  }}
                  className="w-full text-left px-4 py-3 text-base font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white rounded-xl transition-all duration-200"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
} 