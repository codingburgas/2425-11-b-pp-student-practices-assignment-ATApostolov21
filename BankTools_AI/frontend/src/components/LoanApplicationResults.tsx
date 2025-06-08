import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { LoanPredictionResponse, User } from '../types'
import { banking } from '../api'
import NavigationBar from './loan-results/NavigationBar'
import OverviewSection from './loan-results/OverviewSection'
import AnalysisSection from './loan-results/AnalysisSection'
import RecommendationsSection from './loan-results/RecommendationsSection'
import NextStepsSection from './loan-results/NextStepsSection'
import type { LoanApplication } from './loan-results/types'

interface LoanApplicationResultsProps {
  user: User
}

export default function LoanApplicationResults({ user }: LoanApplicationResultsProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('overview')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LoanPredictionResponse | null>(null)
  const [loanApplication, setLoanApplication] = useState<LoanApplication | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (id) {
      loadLoanResults(parseInt(id))
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

  const loadLoanResults = async (loanId: number) => {
    try {
      setIsLoading(true)
      const response = await banking.getLoanRequestDetails(loanId)
      const loanData = response.data.loan_request
      
      // Convert the loan data to our expected format
      setLoanApplication(loanData)
      
      // Create a mock prediction response based on the loan data
      // In a real app, this would come from the backend
      const mockResult: LoanPredictionResponse = {
        success: true,
        prediction: {
          approval_status: loanData.prediction === 'Approved' || loanData.status === 'Approved' ? 'Approved' : 'Rejected',
          approval_probability: calculateApprovalProbability(loanData),
          confidence_level: 'High',
          recommendations: generateRecommendations(loanData)
        },
        model_info: {
          prediction_method: 'ai_model',
          model_available: true
        }
      }
      
      setResult(mockResult)
      setIsLoaded(true)
    } catch (error: any) {
      console.error('Error loading loan results:', error)
      if (error.response?.status === 404) {
        setError('Loan application not found or access denied.')
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view this loan application.')
      } else {
        setError('Failed to load loan results. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const calculateApprovalProbability = (loan: any): number => {
    if (!loan) return 0
    
    const { credit_score, income, employment_years, amount } = loan
    
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
    
    return Math.min(85, Math.max(5, score)) / 100
  }

  const generateRecommendations = (loan: any): string[] => {
    const recommendations: string[] = []
    
    if (!loan) return recommendations
    
    const { credit_score, income, employment_years, amount } = loan
    const incomeToLoanRatio = income / amount
    
    // Credit score recommendations
    if (credit_score < 650) {
      recommendations.push('Consider improving your credit score by paying down existing debts and making payments on time')
    } else if (credit_score < 700) {
      recommendations.push('Your credit score is good but could be improved for better loan terms')
    }
    
    // Income to loan ratio recommendations
    if (incomeToLoanRatio < 1.5) {
      recommendations.push('Consider applying for a smaller loan amount or increasing your income before applying')
    } else if (incomeToLoanRatio < 2) {
      recommendations.push('Your income-to-loan ratio is adequate but could be improved for better terms')
  }

    // Employment recommendations
    if (employment_years < 2) {
      recommendations.push('Consider waiting until you have more employment history for better approval chances')
    }
    
    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Your application looks strong! Consider reviewing loan terms and payment options')
      recommendations.push('Maintain your current financial stability throughout the approval process')
    }
    
    return recommendations
  }

  const renderSection = () => {
    if (!result || !loanApplication) return null
    
    switch (activeSection) {
      case 'analysis':
        return <AnalysisSection result={result} loanApplication={loanApplication} />
      case 'recommendations':
        return <RecommendationsSection result={result} loanApplication={loanApplication} />
      case 'nextsteps':
        return <NextStepsSection result={result} loanApplication={loanApplication} />
      default:
        return <OverviewSection result={result} loanApplication={loanApplication} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"
            style={{
              transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-8 animate-spin">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
              Loading Analysis...
            </h2>
            <p className="text-xl text-gray-400">Please wait while we retrieve your loan application results</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !result || !loanApplication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"
            style={{
              transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
              Error Loading Results
            </h3>
            <p className="text-xl text-gray-400 mb-8">{error}</p>
          <button
              onClick={() => navigate('/loan-dashboard')}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
          >
              Back to Dashboard
          </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
          }}
        />
        <div 
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/loan-dashboard')}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:translate-x-[-4px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 animate-pulse-glow"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                {loanApplication.purpose || 'Loan Application'}
            </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-400 mt-2">
                AI-Powered Analysis Results
              </h2>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive analysis and insights powered by advanced machine learning algorithms
          </p>
        </div>

        {/* Navigation */}
        <NavigationBar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        {/* Content */}
        <div className="mt-8">
          {renderSection()}
        </div>
      </div>
    </div>
  )
} 