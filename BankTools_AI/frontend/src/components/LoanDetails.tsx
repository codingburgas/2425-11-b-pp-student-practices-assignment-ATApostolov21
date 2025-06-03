import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { banking } from '../api'
import type { User } from '../types'
import LoanAnalyticsCharts from './LoanAnalyticsCharts'
import LoanRecommendations from './LoanRecommendations'
import LoanTimeline from './LoanTimeline'

interface LoanApplication {
  id: number
  amount: number
  purpose: string
  income: number
  employment_years: number
  credit_score: number
  status: string
  prediction: string
  created_at: string
}

interface LoanDetailsProps {
  user?: User | null
}

export default function LoanDetails({ user }: LoanDetailsProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loan, setLoan] = useState<LoanApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsVisible(true)
    if (id) {
      loadLoanDetails(parseInt(id))
    }
  }, [id])

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const loadLoanDetails = async (loanId: number) => {
    try {
      const response = await banking.getLoanRequestDetails(loanId)
      setLoan(response.data.loan_request)
    } catch (error: any) {
      console.error('Error loading loan details:', error)
      if (error.response?.status === 404) {
        setError('Loan application not found or access denied.')
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this loan application.')
      } else {
        setError('Failed to load loan details. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate approval probability based on loan data
  const approvalProbability = useMemo(() => {
    if (!loan) return 0
    
    const { credit_score, income, employment_years, amount } = loan
    
    // More conservative algorithm matching the AI model
    let score = 0
    
    // Credit score impact (40% weight)
    if (credit_score >= 750) score += 25
    else if (credit_score >= 700) score += 20
    else if (credit_score >= 650) score += 15
    else if (credit_score >= 600) score += 10
    else score += 5
    
    // Income to loan ratio (30% weight)
    const incomeToLoanRatio = income / amount
    if (incomeToLoanRatio >= 3) score += 20
    else if (incomeToLoanRatio >= 2) score += 15
    else if (incomeToLoanRatio >= 1.5) score += 10
    else if (incomeToLoanRatio >= 1) score += 5
    
    // Employment stability (20% weight)
    if (employment_years >= 5) score += 15
    else if (employment_years >= 3) score += 10
    else if (employment_years >= 2) score += 7
    else if (employment_years >= 1) score += 3
    
    // Debt-to-income considerations (10% weight)
    const monthlyIncome = income / 12
    const estimatedPayment = (amount * 0.06) / 12
    const dtiRatio = monthlyIncome > 0 ? estimatedPayment / monthlyIncome : 0
    
    if (dtiRatio <= 0.28) score += 10
    else if (dtiRatio <= 0.36) score += 5
    else if (dtiRatio <= 0.43) score -= 5
    else score -= 15
    
    // Purpose adjustments
    if (loan.purpose === 'Home Purchase' || loan.purpose === 'Home Refinance') score += 5
    else if (loan.purpose === 'Education') score += 3
    else if (loan.purpose === 'Personal/Other') score -= 5
    
    return Math.min(85, Math.max(5, score))
  }, [loan])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'Rejected': return 'text-red-400 bg-red-500/20 border-red-500/30'
      default: return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading loan analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !loan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-red-400 mb-3">Error Loading Details</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => navigate('/loan-dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        
        {/* Animated gradient orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button
            onClick={() => navigate('/loan-dashboard')}
            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors group"
          >
            <svg className="w-5 h-5 mr-2 group-hover:translate-x-[-4px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3">
                Loan Application Insights
              </h1>
              <p className="text-gray-400 text-xl">
                Submitted on {formatDate(loan.created_at)} • {loan.purpose}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-8 py-4 rounded-2xl text-xl font-bold border-2 ${getStatusColor(loan.status)} backdrop-blur-sm`}>
                {loan.status}
              </span>
              <div className="mt-2 text-sm text-gray-400">
                Application ID: #{loan.id}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Details Card */}
        <div className={`mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:border-blue-500/40 transition-all duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Loan Amount */}
              <div className="group text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-gray-400 text-sm mb-2">Loan Amount</div>
                <div className="text-white text-3xl font-bold">{formatCurrency(loan.amount)}</div>
              </div>

              {/* Annual Income */}
              <div className="group text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-gray-400 text-sm mb-2">Annual Income</div>
                <div className="text-white text-2xl font-bold">{formatCurrency(loan.income)}</div>
              </div>

              {/* Credit Score */}
              <div className="group text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-gray-400 text-sm mb-2">Credit Score</div>
                <div className="text-white text-2xl font-bold">{loan.credit_score}</div>
                <div className={`text-sm mt-1 px-3 py-1 rounded-lg inline-block ${
                  loan.credit_score >= 750 ? 'bg-green-500/20 text-green-300' :
                  loan.credit_score >= 650 ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {loan.credit_score >= 750 ? 'Excellent' :
                   loan.credit_score >= 650 ? 'Good' : 'Fair'}
                </div>
              </div>

              {/* Employment */}
              <div className="group text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                  </svg>
                </div>
                <div className="text-gray-400 text-sm mb-2">Employment</div>
                <div className="text-white text-2xl font-bold">{loan.employment_years}</div>
                <div className="text-gray-400 text-sm">years</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className={`mb-12 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <LoanAnalyticsCharts loan={loan} approvalProbability={approvalProbability} />
        </div>

        {/* Timeline and Recommendations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline */}
          <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <LoanTimeline 
              status={loan.status} 
              createdAt={loan.created_at} 
              approvalProbability={approvalProbability} 
            />
          </div>

          {/* Recommendations */}
          <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <LoanRecommendations 
              loan={loan} 
              user={user ?? null} 
              approvalProbability={approvalProbability} 
            />
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className={`mt-12 flex items-center justify-center gap-6 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <button
            onClick={() => navigate('/loan-dashboard')}
            className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-2xl text-white font-medium transition-all duration-200 transform hover:scale-105"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/loan-request')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30"
          >
            Submit New Application
          </button>

          {user?.role === 'banking_employee' && (
            <button
              onClick={() => {/* Add admin actions */}}
              className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-2xl text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/30"
            >
              Admin Actions
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 