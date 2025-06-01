import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { banking } from '../api'
import type { LoanPredictionResponse, User } from '../types'

interface LoanApplication {
  id: string
  amount: number
  purpose: string
  income: number
  employment_years: number
  credit_score: number
  status: 'Approved' | 'Rejected' | 'Pending'
  probability: number
  created_at: string
  ai_method: string
  result: LoanPredictionResponse
}

interface LoanDashboardProps {
  user?: User
}

export default function LoanDashboard({ user }: LoanDashboardProps) {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    averageApprovalRate: 0,
    totalLoanAmount: 0
  })

  useEffect(() => {
    setIsVisible(true)
    const loadApplications = () => {
      try {
        // Load applications from localStorage
        const savedApplications = JSON.parse(localStorage.getItem('loan_applications') || '[]')
        
        // Transform the data to match our interface
        const transformedApplications: LoanApplication[] = savedApplications.map((app: any) => ({
          id: app.id,
          amount: app.amount,
          purpose: app.purpose,
          income: app.income,
          employment_years: app.employment_years,
          credit_score: app.credit_score,
          status: app.result?.prediction?.approval_status || app.status || 'Pending',
          probability: app.result?.prediction?.approval_probability || 0,
          created_at: app.created_at,
          ai_method: app.result?.model_info?.prediction_method || 'rule_based',
          result: app.result
        }))

        setApplications(transformedApplications)
        
        // Calculate statistics
        const totalApps = transformedApplications.length
        const approvedApps = transformedApplications.filter(app => app.status === 'Approved').length
        const avgRate = totalApps > 0 ? transformedApplications.reduce((sum, app) => sum + app.probability, 0) / totalApps : 0
        const totalAmount = transformedApplications
          .filter(app => app.status === 'Approved')
          .reduce((sum, app) => sum + app.amount, 0)

        setStats({
          totalApplications: totalApps,
          approvedApplications: approvedApps,
          averageApprovalRate: avgRate,
          totalLoanAmount: totalAmount
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading loan applications:', error)
        setIsLoading(false)
      }
    }

    loadApplications()
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getMethodBadge = (method: string) => {
    return method === 'ai_model' 
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  }

  const handleViewApplication = (application: LoanApplication) => {
    // Save the result to localStorage with a specific key for viewing
    localStorage.setItem(`loan_result_${application.id}`, JSON.stringify(application.result))
    navigate(`/loan-results/${application.id}`)
  }

  const handleNewApplication = () => {
    navigate('/loan-request')
  }

  const StatCard = ({ title, value, subtitle, icon, color }: {
    title: string
    value: string
    subtitle: string
    icon: React.ReactNode
    color: string
  }) => (
    <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white group-hover:scale-105 transition-transform duration-300">{value}</div>
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
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading loan applications...</p>
            </div>
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
        <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mr-4 animate-float">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                {user ? (
                  <>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                      Welcome back, {user.email.split('@')[0]}
                    </h1>
                    <p className="text-gray-400 text-lg mb-2">
                      Your intelligent loan dashboard is ready
                    </p>
                    <p className="text-gray-500 text-sm">
                      Track your loan applications and AI insights
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Loan Dashboard
                    </h1>
                    <p className="text-gray-400 text-lg mt-2">Track your loan applications and AI insights</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden md:flex items-center space-x-4">
                  <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-green-300 font-medium">Account Active</span>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleNewApplication}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
              >
                + New Application
              </button>
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
            subtitle={`${stats.totalApplications > 0 ? ((stats.approvedApplications / stats.totalApplications) * 100).toFixed(0) : 0}% success rate`}
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
            <h2 className="text-2xl font-bold text-white">Loan Applications</h2>
            <div className="text-sm text-gray-400">
              {applications.length} total applications
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-6">Submit your first loan application to see it here</p>
              <button
                onClick={handleNewApplication}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
              >
                Submit Application
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Application</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Purpose</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">AI Score</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Method</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">#{application.id.slice(-4)}</span>
                          </div>
                          <div>
                            <div className="text-white font-medium">Application #{application.id.slice(-4)}</div>
                            <div className="text-gray-400 text-sm">Credit Score: {application.credit_score}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-white font-medium">{formatCurrency(application.amount)}</div>
                        <div className="text-gray-400 text-sm">Income: {formatCurrency(application.income)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-300">{application.purpose}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-700 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${
                                application.probability >= 0.7 ? 'bg-green-500' :
                                application.probability >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${application.probability * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white font-medium">{(application.probability * 100).toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getMethodBadge(application.ai_method)}`}>
                          {application.ai_method === 'ai_model' ? 'AI Model' : 'Rule-based'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-300">{formatDate(application.created_at)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleViewApplication(application)}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors border border-blue-500/30 hover:border-blue-500/50"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI Insights Section */}
        {applications.length > 0 && (
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Metrics */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                AI Performance
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                  <span className="text-gray-400">Model Accuracy</span>
                  <span className="text-green-400 font-bold">87.5%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                  <span className="text-gray-400">Avg Processing Time</span>
                  <span className="text-blue-400 font-bold">1.2s</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                  <span className="text-gray-400">Confidence Level</span>
                  <span className="text-purple-400 font-bold">High</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                Personalized Tips
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <h4 className="text-blue-300 font-semibold mb-2">Credit Improvement</h4>
                  <p className="text-blue-200/70 text-sm">Maintain low credit utilization and pay bills on time to improve your score</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <h4 className="text-green-300 font-semibold mb-2">Optimal Loan Amount</h4>
                  <p className="text-green-200/70 text-sm">Consider loan amounts between 2-3x your annual income for better approval odds</p>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <h4 className="text-purple-300 font-semibold mb-2">Employment History</h4>
                  <p className="text-purple-200/70 text-sm">Stable employment for 2+ years significantly improves approval chances</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 