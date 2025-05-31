import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '../types'

interface CustomerDashboardProps {
  user: User
}

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({
    creditScore: 0,
    availableCredit: 0,
    totalSavings: 0,
    monthlySpending: 0
  })

  useEffect(() => {
    setIsVisible(true)
    
    // Animate personal stats
    const animateStats = () => {
      const duration = 2000
      const intervals = 60
      const stepTime = duration / intervals
      
      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        const progress = currentStep / intervals
        
        setAnimatedStats({
          creditScore: Math.floor(785 * progress),
          availableCredit: Math.floor(50000 * progress),
          totalSavings: Math.floor(125000 * progress),
          monthlySpending: Math.floor(3200 * progress)
        })
        
        if (currentStep >= intervals) {
          clearInterval(timer)
          setAnimatedStats({
            creditScore: 785,
            availableCredit: 50000,
            totalSavings: 125000,
            monthlySpending: 3200
          })
        }
      }, stepTime)
    }
    
    const statsTimer = setTimeout(animateStats, 500)
    return () => clearTimeout(statsTimer)
  }, [])

  const quickActions = [
    {
      title: 'Apply for Loan',
      description: 'Get instant AI-powered loan decisions',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      gradient: 'from-blue-500 to-purple-500',
      action: 'loan'
    },
    {
      title: 'Credit Analysis',
      description: 'AI-powered credit score insights',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
        </svg>
      ),
      gradient: 'from-green-500 to-blue-500',
      action: 'analysis'
    },
    {
      title: 'Financial Advisor',
      description: 'Personalized AI recommendations',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
      action: 'advisor'
    }
  ]

  const loanApplications = [
    {
      id: 'LOAN-001',
      type: 'Personal Loan',
      amount: 25000,
      status: 'Approved',
      date: '2024-01-15',
      rate: '4.2%',
      statusColor: 'green'
    },
    {
      id: 'LOAN-002',
      type: 'Auto Loan',
      amount: 45000,
      status: 'Under Review',
      date: '2024-01-20',
      rate: '3.8%',
      statusColor: 'yellow'
    },
    {
      id: 'LOAN-003',
      type: 'Mortgage Pre-approval',
      amount: 350000,
      status: 'In Progress',
      date: '2024-01-22',
      rate: '6.5%',
      statusColor: 'blue'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Welcome back, {user.email.split('@')[0]}
              </h1>
              <p className="text-gray-400 text-lg">
                Your intelligent banking dashboard is ready
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-xl">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-green-300 font-medium">Account Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-green-400 text-sm font-medium">Excellent</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
              {animatedStats.creditScore}
            </div>
            <div className="text-gray-400 text-sm">Credit Score</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${(animatedStats.creditScore / 850) * 100}%` }}></div>
            </div>
          </div>

          <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-green-400 text-sm font-medium">Available</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-1">
              ${animatedStats.availableCredit.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Credit Limit</div>
          </div>

          <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-purple-400 text-sm font-medium">Growing</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              ${animatedStats.totalSavings.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Total Savings</div>
          </div>

          <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-orange-400 text-sm font-medium">This Month</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-1">
              ${animatedStats.monthlySpending.toLocaleString()}
            </div>
            <div className="text-gray-400 text-sm">Monthly Spending</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`mb-12 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl font-bold text-white mb-6">AI Banking Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="group relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:scale-105 transition-all duration-300 text-left overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className={`w-16 h-16 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                  <p className="text-gray-400 mb-4">{action.description}</p>
                  <div className="flex items-center text-blue-400 font-medium">
                    <span>Get Started</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Loan Applications */}
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl font-bold text-white mb-6">Loan Applications</h2>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Applications</h3>
                <button className="text-blue-400 hover:text-blue-300 font-medium">View All</button>
              </div>
              
              <div className="space-y-4">
                {loanApplications.map((loan, index) => (
                  <div
                    key={loan.id}
                    className="group flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl hover:bg-gray-900/70 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${
                        loan.statusColor === 'green' ? 'from-green-500 to-emerald-500' :
                        loan.statusColor === 'yellow' ? 'from-yellow-500 to-orange-500' :
                        'from-blue-500 to-purple-500'
                      } rounded-xl flex items-center justify-center`}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-white">{loan.type}</div>
                        <div className="text-sm text-gray-400">{loan.id} • {loan.date}</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-white">${loan.amount.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">at {loan.rate}</div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      loan.statusColor === 'green' ? 'bg-green-500/20 text-green-300' :
                      loan.statusColor === 'yellow' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {loan.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 