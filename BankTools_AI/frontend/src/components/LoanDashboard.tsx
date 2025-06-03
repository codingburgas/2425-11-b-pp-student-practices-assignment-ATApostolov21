import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { banking } from '../api'
import type { User } from '../types'

interface LoanApplication {
  id: number
  amount: number
  purpose: string
  income: number
  employment_years: number
  credit_score: number
  status: 'Approved' | 'Rejected' | 'Pending'
  prediction: string
  created_at: string
}

interface LoanDashboardProps {
  user?: User | null
}

export default function LoanDashboard({ user }: LoanDashboardProps) {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [deletingApplicationId, setDeletingApplicationId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [animatedStats, setAnimatedStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    avgApprovalRate: 0,
    totalLoanAmount: 0
  })

  useEffect(() => {
    setIsVisible(true)
    loadApplications()
  }, [])

  const loadApplications = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

      try {
      setError(null)
      const response = await banking.getUserLoanRequests()
      const loanData = response.data.loan_requests || []
        
        // Transform the data to match our interface
      const transformedApplications: LoanApplication[] = loanData.map((loan: any) => ({
        id: loan.id,
        amount: loan.amount,
        purpose: loan.purpose,
        income: loan.income,
        employment_years: loan.employment_years,
        credit_score: loan.credit_score,
        status: loan.status || 'Pending',
        prediction: loan.prediction,
        created_at: loan.created_at
        }))

        setApplications(transformedApplications)
        
      // Calculate real statistics
        const totalApps = transformedApplications.length
        const approvedApps = transformedApplications.filter(app => app.status === 'Approved').length
      const avgRate = totalApps > 0 ? (approvedApps / totalApps) * 100 : 0
        const totalAmount = transformedApplications
          .filter(app => app.status === 'Approved')
          .reduce((sum, app) => sum + app.amount, 0)

      // Animate statistics
      const animateStats = () => {
        const duration = 2000
        const steps = 60
        const interval = duration / steps

        let step = 0
        const timer = setInterval(() => {
          step++
          const progress = step / steps

          setAnimatedStats({
            totalApplications: Math.floor(totalApps * progress),
            approvedApplications: Math.floor(approvedApps * progress),
            avgApprovalRate: Math.floor(avgRate * progress),
            totalLoanAmount: Math.floor(totalAmount * progress)
          })

          if (step >= steps) {
            clearInterval(timer)
            setAnimatedStats({
          totalApplications: totalApps,
          approvedApplications: approvedApps,
              avgApprovalRate: Math.floor(avgRate),
          totalLoanAmount: totalAmount
        })
          }
        }, interval)
      }

      // Start animation after a delay
      setTimeout(animateStats, 500)
      
    } catch (error: any) {
        console.error('Error loading loan applications:', error)
      if (error.response?.status === 401) {
        setError('Please log in to view your loan applications.')
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view loan applications.')
      } else {
        setError('Failed to load loan applications. Please try again.')
      }
    } finally {
        setIsLoading(false)
      }
    }

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

  const handleViewApplication = (application: LoanApplication) => {
    navigate(`/loan-details/${application.id}`)
  }

  const handleDeleteApplication = async (applicationId: number) => {
    const application = applications.find(app => app.id === applicationId)
    if (!application) return

    const confirmed = window.confirm(
      `Are you sure you want to delete this loan application?\n\nAmount: ${formatCurrency(application.amount)}\nPurpose: ${application.purpose}\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    setDeletingApplicationId(applicationId)

    try {
      await banking.deleteLoanRequest(applicationId)
      await loadApplications()

      // Show success message
      const successMessage = document.createElement('div')
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
      successMessage.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Loan application deleted successfully!</span>
        </div>
      `
      document.body.appendChild(successMessage)
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage)
        }
      }, 3000)

    } catch (error: any) {
      console.error('Failed to delete application:', error)
      
      let errorMessage = 'Failed to delete application. Please try again.'
      if (error.response?.status === 404) {
        errorMessage = 'Application not found or access denied.'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      
      // Show error message
      const errorDiv = document.createElement('div')
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
      errorDiv.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>${errorMessage}</span>
        </div>
      `
      document.body.appendChild(errorDiv)
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv)
        }
      }, 3000)
    } finally {
      setDeletingApplicationId(null)
    }
  }

  const handleNewApplication = () => {
    navigate('/loan-request')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your loan applications...</p>
        </div>
    </div>
  )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
            <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-red-400 mb-3">Error Loading Applications</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

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
                {user ? (
                  <>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                      Welcome back, {user.email.split('@')[0]}
                    </h1>
                  <p className="text-gray-400 text-lg">
                      Your intelligent loan dashboard is ready
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

        {/* Enhanced Statistics Cards with Premium Animations */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Total Applications Card */}
          <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-4 left-4 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-blue-300 rounded-full animate-ping delay-400"></div>
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-600"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-blue-500/50">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse mb-2 group-hover:animate-bounce"></div>
                  <span className="text-blue-400 text-xs font-bold tracking-wider">APPLICATIONS</span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                {animatedStats.totalApplications}
              </div>
              <div className="text-gray-300 text-sm font-medium mb-4 group-hover:text-blue-200 transition-colors duration-300">Total Applications</div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-full transition-all duration-1000 group-hover:animate-pulse"></div>
                </div>
                <span className="text-xs text-blue-400 ml-3 font-bold group-hover:text-blue-300 transition-colors">ALL</span>
              </div>
            </div>
          </div>

          {/* Approved Applications Card */}
          <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-green-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-4 left-4 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-emerald-300 rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-green-300 rounded-full animate-ping delay-400"></div>
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-emerald-400 rounded-full animate-ping delay-600"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-green-500/50">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mb-2 group-hover:animate-bounce"></div>
                  <span className="text-green-400 text-xs font-bold tracking-wider">APPROVED</span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-300 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                {animatedStats.approvedApplications}
              </div>
              <div className="text-gray-300 text-sm font-medium mb-4 group-hover:text-green-200 transition-colors duration-300">Approved Loans</div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 group-hover:animate-pulse"
                    style={{ width: `${animatedStats.totalApplications > 0 ? (animatedStats.approvedApplications / animatedStats.totalApplications) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-xs text-green-400 ml-3 font-bold group-hover:text-green-300 transition-colors">
                  {animatedStats.totalApplications > 0 ? Math.round((animatedStats.approvedApplications / animatedStats.totalApplications) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Approval Rate Card */}
          <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-pink-300 rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-purple-300 rounded-full animate-ping delay-400"></div>
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-600"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-purple-500/50">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse mb-2 group-hover:animate-bounce"></div>
                  <span className="text-purple-400 text-xs font-bold tracking-wider">AI SCORE</span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                {animatedStats.avgApprovalRate}%
              </div>
              <div className="text-gray-300 text-sm font-medium mb-4 group-hover:text-purple-200 transition-colors duration-300">AI Success Rate</div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 group-hover:animate-pulse"
                    style={{ width: `${Math.min(animatedStats.avgApprovalRate, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-purple-400 ml-3 font-bold group-hover:text-purple-300 transition-colors">
                  {animatedStats.avgApprovalRate > 70 ? 'HIGH' : animatedStats.avgApprovalRate > 40 ? 'MED' : 'LOW'}
                </span>
              </div>
            </div>
          </div>

          {/* Total Loan Amount Card */}
          <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-4 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-orange-300 rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping delay-400"></div>
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-600"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-yellow-500/50">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mb-2 group-hover:animate-bounce"></div>
                  <span className="text-yellow-400 text-xs font-bold tracking-wider">VALUE</span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                {formatCurrency(animatedStats.totalLoanAmount).replace('$', '$').replace('.00', '')}
              </div>
              <div className="text-gray-300 text-sm font-medium mb-4 group-hover:text-yellow-200 transition-colors duration-300">Total Approved Amount</div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full w-3/4 transition-all duration-1000 group-hover:animate-pulse"></div>
                </div>
                <span className="text-xs text-yellow-400 ml-3 font-bold group-hover:text-yellow-300 transition-colors">75%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Loan Applications
            </h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-400">
                {applications.length} total applications
              </div>
              <button
                onClick={handleNewApplication}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105 text-sm"
              >
                + New Application
              </button>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-400 mb-3">No Applications Yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Submit your first loan application to see it here. Our AI will provide instant analysis and approval decisions.</p>
              <button
                onClick={handleNewApplication}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105 text-lg"
              >
                Submit Your First Application
              </button>
            </div>
          ) : (
              <div className="space-y-4">
                      {applications.map((application, index) => (
                  <div key={application.id} className="group flex items-center p-6 bg-gray-900/40 rounded-xl hover:bg-gray-900/60 transition-all duration-300 border border-gray-700/30 hover:border-blue-500/40">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-6 bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center">
                      <div className="flex-1">
                        <div className="text-lg text-white font-semibold group-hover:text-blue-300 transition-colors mb-2">
                          {application.purpose} - {formatCurrency(application.amount)}
                          </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-gray-400">Credit Score: {application.credit_score}</span>
                          <span className="text-gray-400">Income: {formatCurrency(application.income)}</span>
                          <span className="text-gray-500">{formatDate(application.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="text-right mr-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewApplication(application)}
                          className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 hover:scale-105"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(application.id)}
                          disabled={deletingApplicationId === application.id}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all duration-200 border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingApplicationId === application.id ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin"></div>
                              <span>Deleting...</span>
                            </div>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            </div>
        </div>

        {/* AI Insights Section */}
        {applications.length > 0 && (
          <div className={`mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* AI Performance */}
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
                  <span className="text-green-400 font-bold">94.2%</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-xl">
                  <span className="text-gray-400">Avg Processing Time</span>
                  <span className="text-blue-400 font-bold">0.8s</span>
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