import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { banking } from '../api'
import type { LoanRequest } from '../types'

export default function LoanRequestForm() {
  const [formData, setFormData] = useState<LoanRequest>({
    amount: 0,
    purpose: '',
    income: 0,
    employment_years: 0,
    credit_score: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ prediction: string } | null>(null)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    setResult(null)

    try {
      const response = await banking.submitLoanRequest(formData)
      setResult(response.data)
    } catch (err) {
      setError('Failed to process loan request. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'purpose' ? value : Number(value)
    }))
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

  const getApprovalChance = () => {
    if (!formData.credit_score || !formData.income) return 0
    let score = 0
    if (formData.credit_score >= 750) score += 40
    else if (formData.credit_score >= 700) score += 30
    else if (formData.credit_score >= 650) score += 20
    else score += 10

    if (formData.income >= 100000) score += 30
    else if (formData.income >= 75000) score += 25
    else if (formData.income >= 50000) score += 20
    else score += 10

    if (formData.employment_years >= 5) score += 20
    else if (formData.employment_years >= 2) score += 15
    else score += 10

    const debtToIncome = (formData.amount * 0.05) / (formData.income / 12) // Approximate monthly payment
    if (debtToIncome <= 0.28) score += 10
    else if (debtToIncome <= 0.36) score += 5

    return Math.min(95, Math.max(15, score))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mr-4 animate-float">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                AI Loan Application
              </h1>
              <p className="text-gray-400 text-lg mt-2">Get instant approval decisions powered by AI</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
            
            {/* Approval Chance Indicator */}
            {(formData.credit_score > 0 && formData.income > 0) && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">AI Approval Prediction</h3>
                  <div className={`px-4 py-2 rounded-xl font-medium ${
                    getApprovalChance() >= 70 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    getApprovalChance() >= 40 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {getApprovalChance()}% Approval Chance
                  </div>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      getApprovalChance() >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                      getApprovalChance() >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${getApprovalChance()}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <div className="group lg:col-span-2">
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
                        {formData.credit_score >= 750 ? 'Excellent' :
                         formData.credit_score >= 700 ? 'Good' :
                         formData.credit_score >= 650 ? 'Fair' : 'Poor'}
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

            {/* Result */}
            {result && (
              <div className={`mt-6 p-6 rounded-2xl border backdrop-blur-sm animate-pulse-slow ${
                result.prediction === 'approved' 
                  ? 'bg-green-500/20 border-green-500/50' 
                  : 'bg-red-500/20 border-red-500/50'
              }`}>
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 ${
                    result.prediction === 'approved' ? 'bg-green-500/30' : 'bg-red-500/30'
                  }`}>
                    {result.prediction === 'approved' ? (
                      <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${
                      result.prediction === 'approved' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {result.prediction === 'approved' ? 'Loan Approved!' : 'Loan Declined'}
                    </h3>
                    <p className="text-gray-400">
                      {result.prediction === 'approved' 
                        ? 'Congratulations! Your loan has been approved.'
                        : 'Your application needs review. Please improve your credit profile.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
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
                    Processing Application...
                  </>
                ) : (
                  <>
                    Submit Loan Application
                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 