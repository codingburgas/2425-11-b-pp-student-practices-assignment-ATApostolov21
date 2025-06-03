import { useState, useEffect } from 'react'
import type { LoanPredictionResponse } from '../../types'
import type { LoanApplication } from './types'

interface LoanSummaryCardsProps {
  result: LoanPredictionResponse
  loanApplication: LoanApplication
}

export default function LoanSummaryCards({ result, loanApplication }: LoanSummaryCardsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValues, setAnimatedValues] = useState({
    approvalProbability: 0,
    loanAmount: 0,
    creditScore: 0,
    monthlyPayment: 0
  })

  useEffect(() => {
    setIsVisible(true)
    
    // Calculate targets
    const approvalTarget = (result.prediction.approval_probability || 0) * 100
    const loanTarget = loanApplication.amount || 0
    const creditTarget = loanApplication.credit_score || 0
    const monthlyTarget = (loanTarget * 0.05) / 12 // Rough 5% annual rate estimate

    const duration = 2000
    const steps = 60
    const stepTime = duration / steps

    let currentStep = 0
    
    const timer = setInterval(() => {
      const progress = currentStep / steps
      const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease-out cubic
      
      setAnimatedValues({
        approvalProbability: approvalTarget * easeProgress,
        loanAmount: loanTarget * easeProgress,
        creditScore: creditTarget * easeProgress,
        monthlyPayment: monthlyTarget * easeProgress
      })
      
      currentStep++
      if (currentStep > steps) clearInterval(timer)
    }, stepTime)

    return () => clearInterval(timer)
  }, [result, loanApplication])

  const getApprovalLevel = (percentage: number) => {
    if (percentage >= 75) return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'EXCELLENT' }
    if (percentage >= 60) return { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'GOOD' }
    if (percentage >= 40) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'MODERATE' }
    return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'LOW' }
  }

  const getCreditLevel = (score: number) => {
    if (score >= 750) return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'EXCELLENT' }
    if (score >= 700) return { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'GOOD' }
    if (score >= 650) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'FAIR' }
    return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'POOR' }
  }

  const approvalLevel = getApprovalLevel(animatedValues.approvalProbability)
  const creditLevel = getCreditLevel(animatedValues.creditScore)
  const isApproved = result.prediction.approval_status === 'Approved'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Application Status Header */}
      <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 mb-8 relative overflow-hidden hover:border-blue-500/40 transition-all duration-500">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl ${
              isApproved 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-orange-500 to-yellow-500'
            }`}>
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isApproved ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                {loanApplication.purpose || 'Loan Application'}
              </h2>
              <p className="text-xl text-gray-300">
                {isApproved ? 'Congratulations! Your application has been approved.' : 'Your application is being processed.'}
              </p>
            </div>
          </div>
          <div className={`px-6 py-3 rounded-xl border font-bold text-lg ${
            isApproved 
              ? 'bg-green-500/20 border-green-500/30 text-green-300'
              : 'bg-orange-500/20 border-orange-500/30 text-orange-300'
          }`}>
            {isApproved ? 'APPROVED' : 'UNDER REVIEW'}
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Approval Probability Card */}
        <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden hover:border-blue-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20">
          {/* Floating particles */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-ping delay-300"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg className="w-8 h-8 text-blue-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 ${approvalLevel.bg} rounded-full text-xs ${approvalLevel.color} font-bold`}>
                  {approvalLevel.label}
                </div>
              </div>
            </div>
            
            <div className="text-4xl font-bold text-white mb-2">
              {animatedValues.approvalProbability.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400 font-medium">Approval Probability</div>
            
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${animatedValues.approvalProbability}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Loan Amount Card */}
        <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden hover:border-green-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-2 right-2 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-emerald-300 rounded-full animate-ping delay-300"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg className="w-8 h-8 text-green-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-right">
                <div className="px-3 py-1 bg-green-500/20 rounded-full text-xs text-green-300 font-bold">
                  REQUESTED
                </div>
              </div>
            </div>
            
            <div className="text-4xl font-bold text-white mb-2">
              {formatCurrency(animatedValues.loanAmount)}
            </div>
            <div className="text-sm text-gray-400 font-medium">Loan Amount</div>
            
            {/* Monthly payment estimate */}
            <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-sm text-green-300">
                ≈ {formatCurrency(animatedValues.monthlyPayment)}/month
              </div>
            </div>
          </div>
        </div>

        {/* Credit Score Card */}
        <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-2 right-2 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-pink-300 rounded-full animate-ping delay-300"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg className="w-8 h-8 text-purple-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className={`px-3 py-1 ${creditLevel.bg} rounded-full text-xs ${creditLevel.color} font-bold`}>
                  {creditLevel.label}
                </div>
              </div>
            </div>
            
            <div className="text-4xl font-bold text-white mb-2">
              {Math.round(animatedValues.creditScore)}
            </div>
            <div className="text-sm text-gray-400 font-medium">Credit Score</div>
            
            {/* Credit score bar */}
            <div className="mt-4 h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${(animatedValues.creditScore / 850) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Confidence Level Card */}
        <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden hover:border-orange-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-500/20">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-2 right-2 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping delay-300"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500/30 to-yellow-500/30 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg className="w-8 h-8 text-orange-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="px-3 py-1 bg-orange-500/20 rounded-full text-xs text-orange-300 font-bold">
                  AI MODEL
                </div>
              </div>
            </div>
            
            <div className="text-4xl font-bold text-white mb-2">
              {result.prediction.confidence_level || 'High'}
            </div>
            <div className="text-sm text-gray-400 font-medium">Model Confidence</div>
            
            {/* Confidence indicator */}
            <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="text-sm text-orange-300">
                AI Analysis Complete
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 