import { useState, useEffect } from 'react'
import { banking } from '../api'
import type { LoanPredictionResponse } from '../types'

interface LoanApplication {
  id: number
  amount: number
  purpose: string
  status: 'Approved' | 'Rejected' | 'Pending'
  probability: number
  created_at: string
  ai_method: string
}

export default function LoanDashboard() {
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    averageApprovalRate: 0,
    totalLoanAmount: 0
  })

  useEffect(() => {
    // Mock data for demonstration - in real app this would come from API
    const mockApplications: LoanApplication[] = [
      {
        id: 1,
        amount: 50000,
        purpose: 'Home Purchase',
        status: 'Approved',
        probability: 0.85,
        created_at: '2024-01-15T10:30:00Z',
        ai_method: 'ai_model'
      },
      {
        id: 2,
        amount: 25000,
        purpose: 'Car Purchase',
        status: 'Approved',
        probability: 0.72,
        created_at: '2024-01-10T14:20:00Z',
        ai_method: 'ai_model'
      },
      {
        id: 3,
        amount: 75000,
        purpose: 'Business Investment',
        status: 'Rejected',
        probability: 0.35,
        created_at: '2024-01-05T09:15:00Z',
        ai_method: 'rule_based'
      }
    ]

    setTimeout(() => {
      setApplications(mockApplications)
      setStats({
        totalApplications: mockApplications.length,
        approvedApplications: mockApplications.filter(app => app.status === 'Approved').length,
        averageApprovalRate: mockApplications.reduce((sum, app) => sum + app.probability, 0) / mockApplications.length,
        totalLoanAmount: mockApplications.filter(app => app.status === 'Approved').reduce((sum, app) => sum + app.amount, 0)
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'Rejected': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'Pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const StatCard = ({ title, value, subtitle, icon, color }: {
    title: string
    value: string
    subtitle: string
    icon: React.ReactNode
    color: string
  }) => (
    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-gray-400">{subtitle}</div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Loan Dashboard
              </h1>
              <p className="text-gray-400 text-lg mt-2">Track your loan applications and AI insights</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Applications"
            value={stats.totalApplications.toString()}
            subtitle="All time"
            icon={<svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            color="bg-blue-500/20"
          />
          
          <StatCard
            title="Approved Loans"
            value={stats.approvedApplications.toString()}
            subtitle={`${((stats.approvedApplications / stats.totalApplications) * 100).toFixed(0)}% success rate`}
            icon={<svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="bg-green-500/20"
          />
          
          <StatCard
            title="Average AI Score"
            value={`${(stats.averageApprovalRate * 100).toFixed(0)}%`}
            subtitle="AI confidence"
            icon={<svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
            color="bg-purple-500/20"
          />
          
          <StatCard
            title="Total Approved"
            value={formatCurrency(stats.totalLoanAmount)}
            subtitle="Loan amount"
            icon={<svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
            color="bg-yellow-500/20"
          />
        </div>

        {/* Applications Table */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Applications</h2>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105">
              New Application
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Application</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Amount</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Purpose</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">AI Score</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Date</th>
                  <th className="text-left py-4 px-6 text-gray-400 font-medium">Method</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                          <span className="text-white font-bold">#{app.id}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">Application #{app.id}</div>
                          <div className="text-gray-400 text-sm">Loan Request</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white font-medium">{formatCurrency(app.amount)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white">{app.purpose}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className={`w-full bg-gray-700/50 rounded-full h-2 mr-3`}>
                          <div 
                            className={`h-2 rounded-full ${
                              app.probability >= 0.7 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                              app.probability >= 0.4 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                              'bg-gradient-to-r from-red-500 to-pink-500'
                            }`}
                            style={{ width: `${app.probability * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-medium min-w-[3rem]">
                          {(app.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-white">{formatDate(app.created_at)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {app.ai_method === 'ai_model' ? (
                          <div className="flex items-center text-green-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="text-sm">AI Model</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-yellow-400">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-sm">Rule-based</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {applications.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Applications Yet</h3>
              <p className="text-gray-500">Start by submitting your first loan application</p>
            </div>
          )}
        </div>

        {/* AI Insights Section */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Performance Metrics */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              AI Performance Insights
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                <span className="text-gray-300">AI Model Accuracy</span>
                <span className="text-green-400 font-bold">87.5%</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                <span className="text-gray-300">Average Processing Time</span>
                <span className="text-blue-400 font-bold">1.2s</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                <span className="text-gray-300">Model Confidence</span>
                <span className="text-purple-400 font-bold">High</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Recommendations
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-green-300 font-medium mb-1">Credit Score Improvement</h4>
                    <p className="text-gray-300 text-sm">Your credit score has improved by 15 points since your last application</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-blue-300 font-medium mb-1">Optimal Loan Amount</h4>
                    <p className="text-gray-300 text-sm">Based on your income, consider loan amounts between $40K-$60K for best approval odds</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-yellow-300 font-medium mb-1">Employment History</h4>
                    <p className="text-gray-300 text-sm">Longer employment history will significantly improve your approval chances</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 