import { useState, useEffect, useMemo } from 'react'
import type { FormEvent } from 'react'
import { banking } from '../api'
import type { LoanRequest, LoanPredictionResponse, RiskAssessment } from '../types'
import LoanApplicationResults from './LoanApplicationResults'

export default function LoanRequestForm() {
  const [formData, setFormData] = useState<LoanRequest>({
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
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    setIsVisible(true)
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
    const requiredFields = ['amount', 'purpose', 'income', 'employment_years', 'credit_score']
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
      
      // Save result to localStorage for persistence
      const resultId = Date.now().toString()
      localStorage.setItem(`loan_result_${resultId}`, JSON.stringify(response.data))
      
      // Save to loan applications history
      const existingApplications = JSON.parse(localStorage.getItem('loan_applications') || '[]')
      const newApplication = {
        id: resultId,
        ...formData,
        result: response.data,
        created_at: new Date().toISOString(),
        status: response.data.prediction.approval_status
      }
      existingApplications.unshift(newApplication)
      localStorage.setItem('loan_applications', JSON.stringify(existingApplications))
      
      setResult(response.data)
      setShowResults(true)
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

  const testConnection = async () => {
    try {
      console.log('Testing API connection...')
      const response = await fetch('http://localhost:5001/api/model-status', {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('API connection test:', response.status, data)
      
      if (response.status === 401) {
        setError('Not authenticated. Please log in first.')
      } else if (response.ok) {
        setError('API connection successful! Check console for details.')
      } else {
        setError(`API connection failed: ${response.status}`)
      }
    } catch (err) {
      console.error('Connection test error:', err)
      setError('Cannot connect to backend server. Please ensure it is running.')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'purpose' ? value : Number(value)
    }))
  }

  const handleBackToForm = () => {
    setShowResults(false)
    setResult(null)
  }

  // If showing results, render the results page
  if (showResults && result) {
    return <LoanApplicationResults result={result} onBack={handleBackToForm} />
  }

  const loanPurposes = [
    'Home Purchase',
    'Home Refinance', 
    'Car Purchase',
    'Business Investment',
    'Education',
    'Personal/Other'
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getImpactColor = (impact: 'Positive' | 'Neutral' | 'Negative') => {
    switch (impact) {
      case 'Positive': return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'Neutral': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'Negative': return 'text-red-400 bg-red-500/20 border-red-500/30'
    }
  }

  const RiskFactorCard = ({ title, factor, icon }: { 
    title: string, 
    factor: any, 
    icon: React.ReactNode 
  }) => (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
            {icon}
          </div>
          <h4 className="font-medium text-white">{title}</h4>
        </div>
        <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getImpactColor(factor.impact)}`}>
          {factor.impact}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Rating:</span>
          <span className="text-white font-medium">{factor.rating || factor.adequacy || factor.stability || factor.level}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Weight:</span>
          <span className="text-white font-medium">{factor.weight}%</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mr-4 animate-float">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI-Powered Loan Application
              </h1>
              <p className="text-gray-400 text-lg mt-2">Get instant approval decisions with detailed AI analysis</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className={`lg:col-span-2 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Amount */}
                <div className="group">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                    Loan Amount
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
                      className="block w-full pl-8 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500"
                      placeholder="0"
                    />
                  </div>
                  {formData.amount > 0 && (
                    <p className="text-sm text-blue-400 mt-2">≈ {formatCurrency(formData.amount * 0.05)}/month estimated payment</p>
                  )}
                </div>

                {/* Purpose */}
                <div className="group">
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-300 mb-2">
                    Loan Purpose
                  </label>
                  <select
                    name="purpose"
                    id="purpose"
                    required
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500"
                  >
                    <option value="">Select purpose</option>
                    {loanPurposes.map((purpose) => (
                      <option key={purpose} value={purpose} className="bg-gray-800">
                        {purpose}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Annual Income */}
                <div className="group">
                  <label htmlFor="income" className="block text-sm font-medium text-gray-300 mb-2">
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
                      className="block w-full pl-8 pr-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500"
                      placeholder="0"
                    />
                  </div>
                  {formData.income > 0 && (
                    <p className="text-sm text-blue-400 mt-2">≈ {formatCurrency(formData.income / 12)}/month gross income</p>
                  )}
                </div>

                {/* Years Employed */}
                <div className="group">
                  <label htmlFor="employment_years" className="block text-sm font-medium text-gray-300 mb-2">
                    Years Employed
                  </label>
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
                    className="block w-full px-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500"
                    placeholder="0"
                  />
                </div>

                {/* Credit Score */}
                <div className="group md:col-span-2">
                  <label htmlFor="credit_score" className="block text-sm font-medium text-gray-300 mb-2">
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
                      className="block w-full px-4 py-4 bg-gray-900/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-500"
                      placeholder="300-850"
                    />
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

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-300">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={testConnection}
                  className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-200"
                >
                  Test Connection
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl text-white font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing with AI...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Real-time Analysis Sidebar */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Live Approval Prediction */}
            {(formData.credit_score > 0 && formData.income > 0) && (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Live AI Prediction
                </h3>
                
                <div className="text-center mb-6">
                  <div className={`text-4xl font-bold mb-2 ${
                    approvalProbability >= 70 ? 'text-green-400' :
                    approvalProbability >= 40 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {approvalProbability}%
                  </div>
                  <p className="text-gray-400">Approval Probability</p>
                </div>

                <div className="w-full bg-gray-700/50 rounded-full h-4 mb-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-1000 ${
                      approvalProbability >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      approvalProbability >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${approvalProbability}%` }}
                  ></div>
                </div>

                <div className={`px-4 py-3 rounded-xl font-medium text-center ${
                  approvalProbability >= 70 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                  approvalProbability >= 40 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {approvalProbability >= 70 ? 'Likely Approved' :
                   approvalProbability >= 40 ? 'Under Review' :
                   'Likely Declined'}
                </div>
              </div>
            )}

            {/* Risk Factors Analysis */}
            {(formData.credit_score > 0 || formData.income > 0) && (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Risk Assessment
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
            )}
          </div>
        </div>

        {/* Debug Information */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Debug Information</h3>
            <div className="text-xs text-gray-500 space-y-1">
              <div>API Base URL: {import.meta.env.VITE_API_URL || 'http://localhost:5001'}</div>
              <div>Endpoint: /user/loan-request</div>
              <div>Form Data: {JSON.stringify(formData, null, 2)}</div>
            </div>
          </div>
        )}

        {/* Enhanced Results Display */}
        {result && (
          <div className={`mt-8 transition-all duration-1000 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className={`p-8 rounded-3xl border backdrop-blur-sm ${
              result.prediction.approval_status === 'Approved' 
                ? 'bg-green-500/10 border-green-500/30' 
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              
              {/* Main Result Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mr-6 ${
                    result.prediction.approval_status === 'Approved' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {result.prediction.approval_status === 'Approved' ? (
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className={`text-3xl font-bold ${
                      result.prediction.approval_status === 'Approved' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.prediction.approval_status === 'Approved' ? 'Loan Approved!' : 'Loan Declined'}
                    </h2>
                    <p className="text-gray-400 text-lg">
                      AI Confidence: {result.prediction.confidence_level} • Method: {result.model_info.prediction_method === 'ai_model' ? 'AI Model' : 'Rule-based'}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-4xl font-bold ${
                    result.prediction.approval_status === 'Approved' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {(result.prediction.approval_probability * 100).toFixed(1)}%
                  </div>
                  <p className="text-gray-400">AI Probability</p>
                </div>
              </div>

              {/* AI Analysis Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Model Information */}
                <div className="bg-gray-800/30 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Analysis Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Model Status:</span>
                      <span className={`font-medium ${result.model_info.model_available ? 'text-green-400' : 'text-yellow-400'}`}>
                        {result.model_info.model_available ? 'AI Model Active' : 'Fallback Mode'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prediction Method:</span>
                      <span className="text-white font-medium">
                        {result.model_info.prediction_method === 'ai_model' ? 'Machine Learning' : 'Rule-based'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence Level:</span>
                      <span className={`font-medium ${
                        result.prediction.confidence_level === 'High' ? 'text-green-400' :
                        result.prediction.confidence_level === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {result.prediction.confidence_level}
                      </span>
                    </div>
                    {result.request_id && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Request ID:</span>
                        <span className="text-white font-medium">#{result.request_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="bg-gray-800/30 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Recommendations
                  </h3>
                  
                  <div className="space-y-3">
                    {result.prediction.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mt-8 p-6 bg-gray-800/30 rounded-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.prediction.approval_status === 'Approved' ? (
                    <>
                      <button className="flex items-center justify-center px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Review Loan Terms
                      </button>
                      <button className="flex items-center justify-center px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                        Upload Documents
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex items-center justify-center px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 hover:bg-yellow-500/30 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Improve Credit Score
                      </button>
                      <button className="flex items-center justify-center px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/30 transition-colors">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Contact Advisor
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 