import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { User } from '../types'
import { UserIcon, CogIcon, SparklesIcon } from '@heroicons/react/24/outline'
import Logo from './Logo'

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

  const userNavigation = [
    { name: 'Profile', href: '/profile', icon: UserIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ]

  const handleNavClick = (name: string, href: string) => {
    console.log('🔥 Navigation clicked:', name, 'to', href)
    console.log('🔥 Current location:', location.pathname)
    console.log('🔥 User role:', user.role)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Enhanced Navbar with Gradient Background and Glass Effect */}
      <nav className="relative bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-2xl border-b border-purple-500/20 shadow-2xl shadow-purple-500/10">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 animate-pulse"></div>
        
        {/* Floating Particles Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1 left-1/4 w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"></div>
          <div className="absolute -top-1 left-3/4 w-1 h-1 bg-cyan-400/40 rounded-full animate-ping"></div>
          <div className="absolute top-2 right-1/3 w-1.5 h-1.5 bg-blue-400/20 rounded-full animate-bounce"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 justify-between items-center">
            <div className="flex items-center">
              {/* Enhanced Logo Section */}
              <div className="flex flex-shrink-0 items-center group">
                <div className="flex items-center space-x-3 p-2 rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
                  <div className="relative">
                    <Logo size="small" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-cyan-300 transition-all duration-300">
                      BankTools_AI
                    </span>
                    <span className="text-xs text-purple-300/70 font-medium tracking-wider">
                      INTELLIGENT BANKING
                    </span>
                  </div>
                  <SparklesIcon className="w-4 h-4 text-cyan-400/70 animate-pulse" />
                </div>
              </div>
              
              {/* Enhanced Navigation Links */}
              <div className="hidden sm:-my-px sm:ml-12 sm:flex sm:space-x-2">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => handleNavClick(item.name, item.href)}
                    className={`group relative inline-flex items-center px-6 py-3 text-sm font-medium transition-all duration-300 rounded-2xl cursor-pointer pointer-events-auto transform hover:scale-105 ${
                      location.pathname === item.href
                        ? 'text-white bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-cyan-500/30 border border-purple-400/50 shadow-lg shadow-purple-500/25'
                        : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 border border-transparent hover:border-gray-500/30'
                    }`}
                    style={{ 
                      pointerEvents: 'auto',
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Active State Glow */}
                    {location.pathname === item.href && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-cyan-400/20 rounded-2xl blur-lg animate-pulse"></div>
                    )}
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <span className="relative z-10 font-semibold tracking-wide">{item.name}</span>
                    
                    {/* Active Indicator Dot */}
                    {location.pathname === item.href && (
                      <div className="absolute -top-1 right-2 w-2 h-2 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Enhanced Right Section */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-6">
              {/* Enhanced User Navigation Icons */}
              <div className="flex items-center space-x-3">
                {userNavigation.map((item, index) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => handleNavClick(item.name, item.href)}
                      className={`group relative p-3 rounded-2xl transition-all duration-300 transform hover:scale-110 ${
                        location.pathname === item.href
                          ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-200 border border-purple-400/50 shadow-lg shadow-purple-500/25'
                          : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 border border-transparent hover:border-gray-500/30'
                      }`}
                      title={item.name}
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      {/* Glow Effect for Active State */}
                      {location.pathname === item.href && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-2xl blur-md animate-pulse"></div>
                      )}
                      
                      <IconComponent className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                      
                      {/* Tooltip */}
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border border-gray-600/50 shadow-lg whitespace-nowrap">
                        {item.name}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800/90 rotate-45 border-l border-t border-gray-600/50"></div>
                      </div>
                    </Link>
                  )
                })}
              </div>
              
              {/* Enhanced User Info */}
              <div className="flex items-center space-x-4 px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300">
                <div className="text-sm">
                  <span className="font-semibold text-white tracking-wide">{user.email}</span>
                  <span className={`ml-3 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold tracking-wider border ${
                    user.role === 'banking_user' 
                      ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400/30 text-blue-200' 
                      : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-200'
                  } shadow-lg`}>
                    {user.role === 'banking_user' ? '🏛️ CUSTOMER' : '👔 EMPLOYEE'}
                  </span>
                </div>
              </div>
              
              {/* Enhanced Logout Button */}
              <button
                onClick={() => {
                  console.log('🔥 Logout clicked')
                  onLogout()
                }}
                className="group relative px-6 py-3 bg-gradient-to-r from-red-600/20 to-pink-600/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 hover:border-red-400/50 rounded-2xl text-sm font-semibold text-red-300 hover:text-red-200 transition-all duration-300 backdrop-blur-sm pointer-events-auto transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 tracking-wide">Sign out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile menu */}
        <div className="sm:hidden">
          <div className="space-y-2 pb-4 pt-3 bg-gradient-to-r from-gray-800/40 via-gray-700/40 to-gray-800/40 backdrop-blur-xl border-t border-purple-500/20">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => handleNavClick(item.name, item.href)}
                className={`group mx-4 flex items-center rounded-2xl py-4 pl-6 pr-4 text-base font-semibold transition-all duration-300 cursor-pointer pointer-events-auto border ${
                  location.pathname === item.href
                    ? 'border-purple-400/50 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 text-white shadow-lg shadow-purple-500/25'
                    : 'border-transparent text-gray-300 hover:border-gray-500/30 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 hover:text-white'
                }`}
                style={{ 
                  pointerEvents: 'auto',
                  animationDelay: `${index * 100}ms`
                }}
              >
                {location.pathname === item.href && (
                  <div className="absolute left-6 w-1 h-6 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
                )}
                <span className="relative z-10 ml-3 tracking-wide">{item.name}</span>
              </Link>
            ))}
            
            {/* Enhanced Mobile User Navigation */}
            <div className="border-t border-purple-500/20 pt-4 mt-4">
              {userNavigation.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => handleNavClick(item.name, item.href)}
                    className={`group mx-4 flex items-center rounded-2xl py-4 pl-6 pr-4 text-base font-semibold transition-all duration-300 cursor-pointer pointer-events-auto border ${
                      location.pathname === item.href
                        ? 'border-purple-400/50 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white shadow-lg shadow-purple-500/25'
                        : 'border-transparent text-gray-300 hover:border-gray-500/30 hover:bg-gradient-to-r hover:from-gray-700/50 hover:to-gray-600/50 hover:text-white'
                    }`}
                    style={{ 
                      pointerEvents: 'auto',
                      animationDelay: `${index * 150}ms`
                    }}
                  >
                    {location.pathname === item.href && (
                      <div className="absolute left-6 w-1 h-6 bg-gradient-to-b from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                    )}
                    <IconComponent className="w-6 h-6 mr-4 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="tracking-wide">{item.name}</span>
                  </Link>
                )
              })}
            </div>
            
            {/* Enhanced Mobile User Info & Logout */}
            <div className="border-t border-purple-500/20 pt-4 mt-4">
              <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-2xl border border-gray-600/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-semibold text-white tracking-wide">{user.email}</div>
                    <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider border ${
                      user.role === 'banking_user' 
                        ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-400/30 text-blue-200' 
                        : 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-400/30 text-green-200'
                    }`}>
                      {user.role === 'banking_user' ? '🏛️ CUSTOMER' : '👔 EMPLOYEE'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mx-4">
                <button
                  onClick={() => {
                    console.log('🔥 Mobile logout clicked')
                    onLogout()
                  }}
                  className="group w-full text-left px-6 py-4 text-base font-semibold text-red-300 hover:text-red-200 rounded-2xl transition-all duration-300 bg-gradient-to-r from-red-600/20 to-pink-600/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 hover:border-red-400/50 shadow-lg hover:shadow-red-500/25"
                >
                  <div className="flex items-center">
                    <span className="tracking-wide">Sign out</span>
                    <div className="ml-auto w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Glow Effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      </nav>

      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
} 