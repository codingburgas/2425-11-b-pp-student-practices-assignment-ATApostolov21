import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { banking } from '../api'

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

export default function LoanDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loan, setLoan] = useState<LoanApplication | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadLoanDetails(parseInt(id))
    }
  }, [id])

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
          <p className="text-gray-400">Loading loan details...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/loan-dashboard')}
            className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Loan Application Details
              </h1>
              <p className="text-gray-400 text-lg">
                Application submitted on {formatDate(loan.created_at)}
              </p>
            </div>
            <span className={`px-6 py-3 rounded-full text-lg font-medium border ${getStatusColor(loan.status)}`}>
              {loan.status}
            </span>
          </div>
        </div>

        {/* Main Details Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Loan Information */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                Loan Information
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Loan Amount</div>
                  <div className="text-white text-2xl font-bold">{formatCurrency(loan.amount)}</div>
                </div>
                
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Purpose</div>
                  <div className="text-white font-medium">{loan.purpose}</div>
                </div>
                
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">AI Prediction</div>
                  <div className="text-white font-medium">{loan.prediction || 'Pending'}</div>
                </div>
              </div>
            </div>

            {/* Applicant Information */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Applicant Information
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Annual Income</div>
                  <div className="text-white text-xl font-bold">{formatCurrency(loan.income)}</div>
                </div>
                
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Employment Years</div>
                  <div className="text-white font-medium">{loan.employment_years} years</div>
                </div>
                
                <div className="p-4 bg-gray-700/30 rounded-xl">
                  <div className="text-gray-400 text-sm mb-1">Credit Score</div>
                  <div className="flex items-center">
                    <div className="text-white text-xl font-bold mr-3">{loan.credit_score}</div>
                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      loan.credit_score >= 750 ? 'bg-green-500/20 text-green-300' :
                      loan.credit_score >= 650 ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {loan.credit_score >= 750 ? 'Excellent' :
                       loan.credit_score >= 650 ? 'Good' : 'Fair'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/loan-dashboard')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-all duration-200"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={() => navigate('/loan-request')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
          >
            Submit New Application
          </button>
        </div>
      </div>
    </div>
  )
} 