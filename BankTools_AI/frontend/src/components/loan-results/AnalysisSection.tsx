import { useState, useEffect } from 'react'
import type { LoanPredictionResponse } from '../../types'
import type { LoanApplication } from './types'

interface AnalysisSectionProps {
  result: LoanPredictionResponse
  loanApplication: LoanApplication | null
}

export default function AnalysisSection({ result, loanApplication }: AnalysisSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValues, setAnimatedValues] = useState({
    approvalProbability: 0,
    riskLevel: 0,
    creditScore: 0,
    debtRatio: 0
  })

  useEffect(() => {
    setIsVisible(true)
    
    // Calculate animated values
    const approvalTarget = (result.prediction.approval_probability || 0) * 100
    const creditTarget = loanApplication?.credit_score || 0
    const debtTarget = loanApplication?.income ? 
      Math.min((loanApplication.amount / loanApplication.income) * 100, 100) : 0
    const riskTarget = 100 - approvalTarget

    const duration = 2000
    const steps = 60
    const stepTime = duration / steps

    let currentStep = 0
    
    const timer = setInterval(() => {
      const progress = currentStep / steps
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      setAnimatedValues({
        approvalProbability: approvalTarget * easeProgress,
        riskLevel: riskTarget * easeProgress,
        creditScore: creditTarget * easeProgress,
        debtRatio: debtTarget * easeProgress
      })
      
      currentStep++
      if (currentStep > steps) clearInterval(timer)
    }, stepTime)

    return () => clearInterval(timer)
  }, [result, loanApplication])

  if (!loanApplication) return null

  const isApproved = result.prediction.approval_status === 'Approved'
  
  // Risk factors analysis
  const riskFactors = [
    {
      name: 'Credit Score',
      value: animatedValues.creditScore,
      max: 850,
      risk: animatedValues.creditScore < 650 ? 'high' : animatedValues.creditScore < 700 ? 'medium' : 'low',
      description: 'Your credit score affects approval probability'
    },
    {
      name: 'Debt-to-Income',
      value: animatedValues.debtRatio,
      max: 100,
      risk: animatedValues.debtRatio > 36 ? 'high' : animatedValues.debtRatio > 28 ? 'medium' : 'low',
      description: 'Lower ratios indicate better financial health'
    },
    {
      name: 'Employment History',
      value: (loanApplication.employment_years || 0) * 10,
      max: 100,
      risk: (loanApplication.employment_years || 0) < 2 ? 'high' : (loanApplication.employment_years || 0) < 5 ? 'medium' : 'low',
      description: 'Stable employment reduces lending risk'
    },
    {
      name: 'Loan Amount',
      value: Math.min((loanApplication.amount / 100000) * 100, 100),
      max: 100,
      risk: loanApplication.amount > 50000 ? 'high' : loanApplication.amount > 25000 ? 'medium' : 'low',
      description: 'Higher amounts may require stricter criteria'
    }
  ]

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', fill: 'from-green-500 to-emerald-500' }
      case 'medium': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', fill: 'from-yellow-500 to-orange-500' }
      case 'high': return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', fill: 'from-red-500 to-pink-500' }
      default: return { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400', fill: 'from-gray-500 to-gray-600' }
    }
  }

  return (
    <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Analysis Header */}
      <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Risk Analysis Report
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            AI-powered insights into your loan application assessment
          </p>
          
          {/* Overall Risk Score */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Background circle */}
              <div className="absolute inset-0 rounded-full border-4 border-gray-700/30"></div>
              
              {/* Progress circle */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#approvalGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${animatedValues.approvalProbability * 2.64} 264`}
                  className="transition-all duration-2000 ease-out"
                />
                <defs>
                  <linearGradient id="approvalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isApproved ? "#10B981" : "#F59E0B"} />
                    <stop offset="100%" stopColor={isApproved ? "#059669" : "#D97706"} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${isApproved ? 'text-green-300' : 'text-orange-300'}`}>
                    {animatedValues.approvalProbability.toFixed(1)}%
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    APPROVAL PROBABILITY
                  </div>
                </div>
              </div>
              
              {/* Glow effect */}
              <div className={`absolute inset-6 rounded-full ${
                isApproved ? 'bg-green-500/20' : 'bg-orange-500/20'
              } blur-xl animate-pulse`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {riskFactors.map((factor, index) => {
          const colors = getRiskColor(factor.risk)
          const percentage = (factor.value / factor.max) * 100
          
          return (
            <div 
              key={factor.name}
              className={`group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl relative overflow-hidden`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 via-gray-400/5 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{factor.name}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.border} ${colors.text} border`}>
                    {factor.risk.toUpperCase()} RISK
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-white mb-2">
                  {factor.name === 'Credit Score' ? Math.round(factor.value) :
                   factor.name === 'Debt-to-Income' ? `${factor.value.toFixed(1)}%` :
                   factor.name === 'Employment History' ? `${loanApplication.employment_years || 0} years` :
                   `$${loanApplication.amount.toLocaleString()}`}
                </div>
                
                <p className="text-gray-400 text-sm mb-4">{factor.description}</p>
                
                {/* Progress bar */}
                <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${colors.fill} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0</span>
                  <span>{factor.name === 'Credit Score' ? '850' : 
                          factor.name === 'Debt-to-Income' ? '100%' : 
                          factor.name === 'Employment History' ? '10+ years' : 
                          '$100K+'}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Decision Factors */}
      <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            Key Decision Factors
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Positive Factors */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-green-400 flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                Positive Factors
              </h4>
              
              <div className="space-y-3">
                {[
                  { text: 'Stable employment history', active: (loanApplication.employment_years || 0) >= 2 },
                  { text: 'Good credit score', active: (loanApplication.credit_score || 0) >= 650 },
                  { text: 'Reasonable loan amount', active: loanApplication.amount <= 50000 },
                  { text: 'Sufficient income', active: (loanApplication.income || 0) >= loanApplication.amount * 0.3 }
                ].map((factor, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      factor.active
                        ? 'bg-green-500/10 border-green-500/30 text-green-300'
                        : 'bg-gray-800/30 border-gray-700/30 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        factor.active ? 'bg-green-500' : 'bg-gray-600'
                      }`}></div>
                      <span className="text-sm">{factor.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neutral Factors */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                Areas to Monitor
              </h4>
              
              <div className="space-y-3">
                {[
                  { text: 'Market conditions', impact: 'External factor' },
                  { text: 'Loan purpose verification', impact: 'Documentation' },
                  { text: 'Interest rate environment', impact: 'Economic factor' },
                  { text: 'Banking relationship', impact: 'Customer history' }
                ].map((factor, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg border bg-yellow-500/10 border-yellow-500/30 text-yellow-300 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{factor.text}</div>
                        <div className="text-xs text-yellow-400/70">{factor.impact}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                Risk Factors
              </h4>
              
              <div className="space-y-3">
                {[
                  { text: 'High debt-to-income ratio', active: animatedValues.debtRatio > 36 },
                  { text: 'Limited employment history', active: (loanApplication.employment_years || 0) < 2 },
                  { text: 'Low credit score', active: (loanApplication.credit_score || 0) < 650 },
                  { text: 'Large loan amount', active: loanApplication.amount > 75000 }
                ].map((factor, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border transition-all duration-300 ${
                      factor.active
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : 'bg-gray-800/30 border-gray-700/30 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        factor.active ? 'bg-red-500' : 'bg-gray-600'
                      }`}></div>
                      <span className="text-sm">{factor.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Information */}
      <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-orange-500/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-orange-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500/30 to-yellow-500/30 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            AI Model Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
              <h4 className="text-lg font-semibold text-white mb-3">Model Type</h4>
              <p className="text-gray-300">
                {result.model_info?.prediction_method || 'Advanced Machine Learning'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Multi-factor risk assessment algorithm
              </p>
            </div>
            
            <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
              <h4 className="text-lg font-semibold text-white mb-3">Confidence Level</h4>
              <p className="text-2xl font-bold text-orange-300">
                {result.prediction.confidence_level || 'High'}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Model prediction reliability
              </p>
            </div>
            
            <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
              <h4 className="text-lg font-semibold text-white mb-3">Analysis Date</h4>
              <p className="text-gray-300">
                {new Date().toLocaleDateString()}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Real-time assessment completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 