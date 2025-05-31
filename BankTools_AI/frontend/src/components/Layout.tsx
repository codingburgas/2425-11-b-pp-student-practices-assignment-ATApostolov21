import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { User } from '../types'

interface LayoutProps {
  children: React.ReactNode
  user: User
  onLogout: () => void
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(false) // Close mobile sidebar when switching to desktop
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.getElementById('mobile-sidebar')
        const menuButton = document.getElementById('mobile-menu-button')
        if (sidebar && !sidebar.contains(event.target as Node) && 
            menuButton && !menuButton.contains(event.target as Node)) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobile, sidebarOpen])

  const getUserDisplayName = () => {
    return user.email.split('@')[0]
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Overview & Analytics'
    },
    {
      name: 'Churn Analysis',
      path: '/churn-analysis',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
      description: 'Customer Retention'
    },
    ...(user.role === 'banking_user' ? [{
      name: 'Loan Request',
      path: '/loan-request',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500',
      description: 'Apply for Loans'
    }] : []),
    {
      name: 'Profile',
      path: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'from-indigo-500 to-purple-500',
      description: 'Account Settings'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: 'from-gray-500 to-gray-600',
      description: 'System Preferences'
    }
  ]

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white relative">
      {/* Primary background layer */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-[-10]"></div>
      
      {/* Secondary background layer for extra coverage */}
      <div className="absolute inset-0 min-h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 z-[-5]"></div>
      
      {/* Subtle background effects */}
      {!isMobile && (
        <>
          <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-500/2 rounded-full blur-3xl animate-pulse pointer-events-none z-0"></div>
          <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/2 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none z-0"></div>
          <div className="fixed top-3/4 left-1/2 w-64 h-64 bg-green-500/2 rounded-full blur-3xl animate-pulse delay-2000 pointer-events-none z-0"></div>
        </>
      )}

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"></div>
      )}

      {/* Desktop Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-72'} hidden lg:flex lg:flex-col bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-300`}>
        {/* Header with Logo and Toggle */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-gray-700/50">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  BankTools AI
                </h1>
                <p className="text-xs text-gray-400">Analytics Platform</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`${sidebarCollapsed ? 'w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500' : 'w-8 h-8 bg-gray-700/50 hover:bg-gray-600/50'} rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg`}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg 
              className={`${sidebarCollapsed ? 'w-5 h-5 text-white' : 'w-4 h-4 text-gray-400'} transition-transform duration-200 ${sidebarCollapsed ? '' : 'rotate-180'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* User Profile */}
        <div className={`${sidebarCollapsed ? 'px-2 py-4' : 'px-6 py-4'} border-b border-gray-700/50`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">
                  {getUserDisplayName().charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user.role.replace('banking_', '')} • Online
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-4 space-y-2 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/30 hover:text-white border border-transparent hover:border-gray-600/50'
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full"></div>
                )}
                
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? `bg-gradient-to-r ${item.gradient} shadow-lg`
                    : 'bg-gray-700/50 group-hover:bg-gray-600/50'
                }`}>
                  <div className={`transition-all duration-200 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}>
                    {item.icon}
                  </div>
                </div>
                
                {/* Content */}
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300">
                      {item.description}
                    </div>
                  </div>
                )}
                
                {/* Arrow */}
                {!sidebarCollapsed && (
                  <div className={`transition-all duration-200 ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                  }`}>
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className={`py-4 border-t border-gray-700/50 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
          <button
            onClick={onLogout}
            className={`group w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} rounded-xl px-3 py-3 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-300 hover:text-red-200 transition-all duration-200 hover:scale-[1.02]`}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
          >
            <div className="w-10 h-10 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 flex items-center justify-center transition-all duration-200 flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 text-left">
                <div className="font-medium">Sign Out</div>
                <div className="text-xs text-red-400">End Session</div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        id="mobile-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Mobile Header */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  BankTools AI
                </h1>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-6 py-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700/30 hover:text-white border border-transparent hover:border-gray-600/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${item.gradient} shadow-lg`
                      : 'bg-gray-700/50 group-hover:bg-gray-600/50'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Mobile Logout */}
          <div className="px-6 py-4 border-t border-gray-700/50">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'} transition-all duration-300 relative z-10 bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen`}>
        {/* Mobile Top Bar */}
        <div className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-xl px-4 shadow-xl">
          <button
            id="mobile-menu-button"
            type="button"
            className="-m-2.5 p-2.5 text-gray-400"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              BankTools AI
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6 sm:py-10 relative z-10 bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 