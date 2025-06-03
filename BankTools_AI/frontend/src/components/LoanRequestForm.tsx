import { useState, useEffect, useMemo } from 'react'
import type { FormEvent } from 'react'
import { banking } from '../api'
import type { LoanRequest, LoanPredictionResponse, RiskAssessment } from '../types'
import { useNavigate } from 'react-router-dom'

export default function LoanRequestForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoanRequest>({
    name: '',
    amount: 0,
    purpose: '',
    income: 0,
    employment_years: 0,
    credit_score: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<LoanPredictionResponse | null>(null)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsVisible(true)
  }, [])

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

  // Calculate comprehensive risk assessment
  const riskAssessment = useMemo((): RiskAssessment => {
    const creditScore = formData.credit_score || 0
    const income = formData.income || 0
    const employment = formData.employment_years || 0
    const loanAmount = formData.amount || 0
    
    // Calculate debt-to-income ratio
    const monthlyIncome = income / 12
    const estimatedMonthlyPayment = (loanAmount * 0.05) / 12 // Rough 5% annual rate
    const debtToIncomeRatio = monthlyIncome > 0 ? estimatedMonthlyPayment / monthlyIncome : 0

    return {
      creditScore: {
        score: creditScore,
        rating: creditScore >= 750 ? 'Excellent' : 
                creditScore >= 700 ? 'Good' : 
                creditScore >= 650 ? 'Fair' : 'Poor',
        impact: creditScore >= 700 ? 'Positive' : 
                creditScore >= 650 ? 'Neutral' : 'Negative',
        weight: 40
      },
      income: {
        amount: income,
        adequacy: income >= 75000 ? 'High' : 
                  income >= 50000 ? 'Medium' : 'Low',
        impact: income >= 50000 ? 'Positive' : 
                income >= 30000 ? 'Neutral' : 'Negative',
        weight: 30
      },
      employment: {
        years: employment,
        stability: employment >= 5 ? 'Excellent' : 
                   employment >= 2 ? 'Good' : 
                   employment >= 1 ? 'Fair' : 'Poor',
        impact: employment >= 2 ? 'Positive' : 
                employment >= 1 ? 'Neutral' : 'Negative',
        weight: 20
      },
      debtToIncome: {
        ratio: debtToIncomeRatio,
        level: debtToIncomeRatio <= 0.28 ? 'Low' : 
               debtToIncomeRatio <= 0.36 ? 'Moderate' : 
               debtToIncomeRatio <= 0.43 ? 'High' : 'Very High',
        impact: debtToIncomeRatio <= 0.36 ? 'Positive' : 
                debtToIncomeRatio <= 0.43 ? 'Neutral' : 'Negative',
        weight: 10
      }
    }
  }, [formData])

  // Updated approval probability calculation to better match backend AI model
  const approvalProbability = useMemo(() => {
    if (!formData.credit_score || !formData.income) return 0
    
    // More conservative algorithm that better matches the AI model
    const creditScore = formData.credit_score
    const income = formData.income
    const employment = formData.employment_years
    const loanAmount = formData.amount
    
    // Base score from credit score (more conservative)
    let score = 0
    if (creditScore >= 750) score += 25
    else if (creditScore >= 700) score += 20
    else if (creditScore >= 650) score += 15
    else if (creditScore >= 600) score += 10
    else score += 5
    
    // Income factor (more conservative)
    const incomeToLoanRatio = income / (loanAmount || 1)
    if (incomeToLoanRatio >= 3) score += 20
    else if (incomeToLoanRatio >= 2) score += 15
    else if (incomeToLoanRatio >= 1.5) score += 10
    else if (incomeToLoanRatio >= 1) score += 5
    
    // Employment stability (more conservative)
    if (employment >= 5) score += 15
    else if (employment >= 3) score += 10
    else if (employment >= 2) score += 7
    else if (employment >= 1) score += 3
    
    // Debt-to-income penalty (more strict)
    const monthlyIncome = income / 12
    const estimatedPayment = (loanAmount * 0.06) / 12 // Higher rate assumption
    const dtiRatio = monthlyIncome > 0 ? estimatedPayment / monthlyIncome : 0
    
    if (dtiRatio <= 0.28) score += 10
    else if (dtiRatio <= 0.36) score += 5
    else if (dtiRatio <= 0.43) score -= 5
    else score -= 15
    
    // Loan amount penalty for large loans
    if (loanAmount > 100000) score -= 10
    else if (loanAmount > 50000) score -= 5
    
    // Purpose bonus/penalty
    const purpose = formData.purpose
    if (purpose === 'Home Purchase' || purpose === 'Home Refinance') score += 5
    else if (purpose === 'Education') score += 3
    else if (purpose === 'Personal/Other') score -= 5
    
    // Cap the score and convert to percentage (more conservative range)
    const finalScore = Math.min(85, Math.max(5, score))
    return finalScore
  }, [formData])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    setResult(null)

    // Validate required fields
    const requiredFields = ['name', 'amount', 'purpose', 'income', 'employment_years', 'credit_score']
    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof LoanRequest]
      return !value || (typeof value === 'number' && value <= 0) || (typeof value === 'string' && value.trim() === '')
    })

    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`)
      setIsLoading(false)
      return
    }

    try {
      console.log('Submitting loan request with data:', formData)
      const response = await banking.submitLoanRequest(formData)
      console.log('Loan request response:', response.data)
      
      // No need to save to localStorage anymore - data is persisted in database
      // and will be retrieved via the API when needed
      
      setResult(response.data)
      if (response.data && response.data.request_id) {
        navigate(`/loan-results/${response.data.request_id}`)
      } else {
        console.error('No application ID in response')
        alert('Application submitted but could not retrieve details. Please check your dashboard.')
        navigate('/loan-dashboard')
      }
    } catch (err: any) {
      console.error('Loan request error:', err)
      console.error('Error response:', err.response)
      console.error('Error status:', err.response?.status)
      console.error('Error data:', err.response?.data)
      
      let errorMessage = 'Failed to process loan request. Please try again.'
      
      if (err.response?.status === 401) {
        errorMessage = 'Please log in to submit a loan request.'
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to submit loan requests. Please ensure you are logged in as a banking user.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'income' || name === 'employment_years' || name === 'credit_score' 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getImpactColor = (impact: 'Positive' | 'Neutral' | 'Negative') => {
    switch (impact) {
      case 'Positive': return 'text-green-400'
      case 'Neutral': return 'text-yellow-400'
      case 'Negative': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const RiskFactorCard = ({ title, factor, icon }: { 
    title: string, 
    factor: any, 
    icon: React.ReactNode 
  }) => (
    <div className="group bg-gray-700/30 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:bg-gray-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {icon}
          <span className="text-sm font-medium text-gray-300 ml-2">{title}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-lg ${getImpactColor(factor.impact)} bg-gray-800/50`}>
          {factor.impact}
        </span>
      </div>
      <div className="text-xs text-gray-400">
        {title === 'Credit Score' && `${factor.score} - ${factor.rating}`}
        {title === 'Income Level' && `${formatCurrency(factor.amount)} - ${factor.adequacy}`}
        {title === 'Employment' && `${factor.years} years - ${factor.stability}`}
        {title === 'Debt-to-Income' && `${formatPercentage(factor.ratio * 100)} - ${factor.level}`}
      </div>
    </div>
  )

  const loanPurposes = [
    'Home Purchase',
    'Home Refinance',
    'Auto Loan',
    'Personal Loan',
    'Business Loan',
    'Education',
    'Debt Consolidation',
    'Personal/Other'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 z-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        
        {/* Animated gradient orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`
          }}
        ></div>
        <div 
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        ></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="text-center mb-12 relative">
          {/* Floating decorative elements */}
          <div className="absolute -top-10 left-1/4 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -top-5 right-1/4 w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          
          <div className={`inline-flex items-center gap-4 mb-8 relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Enhanced icon with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 animate-pulse-glow"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500 hover:rotate-12">
                <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            
            {/* Enhanced title with gradient animation */}
            <h1 className="text-6xl md:text-7xl font-bold gradient-text leading-tight">
              AI-Powered Loan Application
            </h1>
          </div>
          
          {/* Enhanced subtitle with shimmer effect */}
          <div className="relative">
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Get instant approval decisions with detailed AI analysis and personalized recommendations
            </p>
            
            {/* Decorative line with animation */}
            <div className="mt-6 flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent w-64 animate-shimmer"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Main Form */}
          <div className={`lg:col-span-2 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-4 left-4 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
                <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-300"></div>
                <div className="absolute bottom-6 left-8 w-1 h-1 bg-green-400 rounded-full animate-ping delay-600"></div>
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-900"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <svg className="w-6 h-6 text-blue-400 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="gradient-text">Loan Application Form</span>
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Enhanced Application Name */}
                    <div className="group/field md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-3">
                        Application Name *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          id="name"
                          required
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-lg backdrop-blur-sm group-hover/field:border-gray-500"
                          placeholder="e.g., Home Purchase Loan, Car Financing, etc."
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">Give your loan application a descriptive name for easy identification</p>
                    </div>

                    {/* Enhanced Loan Amount */}
                    <div className="group/field">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-3">
                        Loan Amount *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-lg">$</span>
                        </div>
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          required
                          min="1000"
                          max="1000000"
                          step="1000"
                          value={formData.amount || ''}
                          onChange={handleInputChange}
                          className="block w-full pl-8 pr-4 py-4 bg-gray-800/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-lg backdrop-blur-sm group-hover/field:border-gray-500"
                          placeholder="0"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                      {formData.amount > 0 && (
                        <p className="text-sm text-blue-400 mt-2">≈ {formatCurrency(formData.amount * 0.05)}/month estimated payment</p>
                      )}
                    </div>

                    {/* Enhanced Purpose */}
                    <div className="group/field">
                      <label htmlFor="purpose" className="block text-sm font-medium text-gray-300 mb-3">
                        Loan Purpose
                      </label>
                      <div className="relative">
                        <select
                          name="purpose"
                          id="purpose"
                          required
                          value={formData.purpose}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-lg backdrop-blur-sm group-hover/field:border-gray-500"
                        >
                          <option value="">Select purpose</option>
                          {loanPurposes.map((purpose) => (
                            <option key={purpose} value={purpose} className="bg-gray-800">
                              {purpose}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Enhanced Annual Income */}
                    <div className="group/field">
                      <label htmlFor="income" className="block text-sm font-medium text-gray-300 mb-3">
                        Annual Income
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-lg">$</span>
                        </div>
                        <input
                          type="number"
                          name="income"
                          id="income"
                          required
                          min="10000"
                          step="1000"
                          value={formData.income || ''}
                          onChange={handleInputChange}
                          className="block w-full pl-8 pr-4 py-4 bg-gray-800/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-lg backdrop-blur-sm group-hover/field:border-gray-500"
                          placeholder="0"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                      {formData.income > 0 && (
                        <p className="text-sm text-blue-400 mt-2">≈ {formatCurrency(formData.income / 12)}/month gross income</p>
                      )}
                    </div>

                    {/* Enhanced Years Employed */}
                    <div className="group/field">
                      <label htmlFor="employment_years" className="block text-sm font-medium text-gray-300 mb-3">
                        Years Employed
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="employment_years"
                          id="employment_years"
                          required
                          min="0"
                          max="50"
                          step="0.5"
                          value={formData.employment_years || ''}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-lg backdrop-blur-sm group-hover/field:border-gray-500"
                          placeholder="0"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Enhanced Credit Score */}
                    <div className="group/field md:col-span-2">
                      <label htmlFor="credit_score" className="block text-sm font-medium text-gray-300 mb-3">
                        Credit Score
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="credit_score"
                          id="credit_score"
                          min="300"
                          max="850"
                          required
                          value={formData.credit_score || ''}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 text-lg backdrop-blur-sm group-hover/field:border-gray-500"
                          placeholder="300-850"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        {formData.credit_score > 0 && (
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <span className={`text-sm font-medium px-3 py-1 rounded-lg ${
                              formData.credit_score >= 750 ? 'bg-green-500/20 text-green-300' :
                              formData.credit_score >= 700 ? 'bg-blue-500/20 text-blue-300' :
                              formData.credit_score >= 650 ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {riskAssessment.creditScore.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Error Message */}
                  {error && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/40 rounded-2xl backdrop-blur-sm animate-fade-in">
                      <div className="flex items-center gap-4">
                        <svg className="w-7 h-7 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-300 font-medium text-lg">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group/submit w-full mt-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-semibold transition-all duration-500 flex items-center justify-center gap-4 text-xl hover:scale-[1.02] transform shadow-2xl hover:shadow-blue-500/30 relative overflow-hidden"
                  >
                    {/* Button shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/submit:translate-x-full transition-transform duration-1000"></div>
                    
                    {isLoading ? (
                      <>
                        <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="relative z-10">Processing with AI...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-7 h-7 group-hover/submit:animate-bounce relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="relative z-10">Submit AI Application</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Enhanced Real-time Analysis Sidebar */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Enhanced Risk Factors Analysis */}
            {(formData.credit_score > 0 || formData.income > 0) && (
              <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50 hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center mr-3 group-hover:rotate-12 transition-transform duration-500">
                      <svg className="w-5 h-5 text-purple-400 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="gradient-text">Risk Assessment</span>
                  </h3>

                  <div className="space-y-4">
                    {formData.credit_score > 0 && (
                      <RiskFactorCard
                        title="Credit Score"
                        factor={riskAssessment.creditScore}
                        icon={<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                      />
                    )}
                    
                    {formData.income > 0 && (
                      <RiskFactorCard
                        title="Income Level"
                        factor={riskAssessment.income}
                        icon={<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
                      />
                    )}
                    
                    {formData.employment_years > 0 && (
                      <RiskFactorCard
                        title="Employment"
                        factor={riskAssessment.employment}
                        icon={<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" /></svg>}
                      />
                    )}
                    
                    {formData.amount > 0 && formData.income > 0 && (
                      <RiskFactorCard
                        title="Debt-to-Income"
                        factor={riskAssessment.debtToIncome}
                        icon={<svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 