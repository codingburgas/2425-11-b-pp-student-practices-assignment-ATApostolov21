import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import type { User } from '../types'
import { UserIcon, CogIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import Logo from './Logo'

interface LayoutProps {
  children: ReactNode
  user: User
  onLogout: () => void
}

export default function Layout({ children, user, onLogout }: LayoutProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Simplified Navbar */}
      <nav className="relative z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50" style={{ pointerEvents: 'auto' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8" style={{ pointerEvents: 'auto' }}>
              <Link 
                to="/" 
                className="flex items-center space-x-3 cursor-pointer" 
                style={{ pointerEvents: 'auto' }}
                onClick={() => console.log('Logo clicked')}
              >
                <Logo size="small" />
                <span className="text-xl font-semibold text-white">BankTools AI</span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden md:flex space-x-1" style={{ pointerEvents: 'auto' }}>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      location.pathname === item.href
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                    style={{ pointerEvents: 'auto' }}
                    onClick={() => console.log(`Nav clicked: ${item.name}`)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Desktop User Section */}
            <div className="hidden md:flex items-center space-x-4" style={{ pointerEvents: 'auto' }}>
              {/* User Navigation Icons */}
              <div className="flex items-center space-x-2">
                {userNavigation.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        location.pathname === item.href
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                      title={item.name}
                      style={{ pointerEvents: 'auto' }}
                      onClick={() => console.log(`User nav clicked: ${item.name}`)}
                    >
                      <IconComponent className="w-5 h-5" />
                    </Link>
                  )
                })}
              </div>
              
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-300">
                  {user.email.split('@')[0]}
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  user.role === 'banking_user' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.role === 'banking_user' ? 'Customer' : 'Employee'}
                </span>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => {
                  console.log('Logout clicked')
                  onLogout()
                }}
                className="px-3 py-2 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                Sign out
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden" style={{ pointerEvents: 'auto' }}>
              <button
                onClick={() => {
                  console.log('Mobile menu toggle clicked')
                  setMobileMenuOpen(!mobileMenuOpen)
                }}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700/50 relative z-50" style={{ pointerEvents: 'auto' }}>
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    console.log(`Mobile nav clicked: ${item.name}`)
                    closeMobileMenu()
                  }}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    location.pathname === item.href
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile User Navigation */}
              <div className="border-t border-gray-700/50 pt-2 mt-2">
                {userNavigation.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => {
                        console.log(`Mobile user nav clicked: ${item.name}`)
                        closeMobileMenu()
                      }}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        location.pathname === item.href
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                      style={{ pointerEvents: 'auto' }}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Mobile User Info & Logout */}
              <div className="border-t border-gray-700/50 pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-300">
                  Signed in as: {user.email.split('@')[0]}
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                    user.role === 'banking_user' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'banking_user' ? 'Customer' : 'Employee'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    console.log('Mobile logout clicked')
                    closeMobileMenu()
                    onLogout()
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        {children}
      </main>
    </div>
  )
} 