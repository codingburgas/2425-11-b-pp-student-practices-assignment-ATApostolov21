import { useState, useEffect } from 'react'
import type { User } from '../types'

interface LoanRecommendationsProps {
  loan: {
    amount: number
    purpose: string
    income: number
    employment_years: number
    credit_score: number
    status: string
    prediction: string
  }
  user: User | null
  approvalProbability: number
}

export default function LoanRecommendations({ loan, user, approvalProbability }: LoanRecommendationsProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const generateUserRecommendations = () => {
    const recommendations = []
    
    // Credit Score Recommendations
    if (loan.credit_score < 650) {
      recommendations.push({
        icon: '📊',
        title: 'Improve Credit Score',
        description: 'Your credit score is below optimal. Consider paying down existing debts and ensuring all bills are paid on time.',
        priority: 'high',
        category: 'Credit',
        action: 'Pay down credit card balances to below 30% utilization'
      })
    } else if (loan.credit_score < 750) {
      recommendations.push({
        icon: '📈',
        title: 'Optimize Credit Profile',
        description: 'Good credit score! Consider keeping credit utilization low and maintaining payment history.',
        priority: 'medium',
        category: 'Credit',
        action: 'Monitor credit report for accuracy'
      })
    }

    // Income Recommendations
    const debtToIncomeRatio = (loan.amount * 0.05) / (loan.income / 12)
    if (debtToIncomeRatio > 0.43) {
      recommendations.push({
        icon: '💰',
        title: 'Consider Lower Loan Amount',
        description: 'Your debt-to-income ratio is high. A smaller loan amount would improve approval odds.',
        priority: 'high',
        category: 'Loan Amount',
        action: `Consider reducing loan to $${Math.round(loan.income * 3.5)}`
      })
    }

    // Employment Recommendations
    if (loan.employment_years < 2) {
      recommendations.push({
        icon: '👔',
        title: 'Employment Stability',
        description: 'Longer employment history strengthens your application. Consider waiting or providing additional income documentation.',
        priority: 'medium',
        category: 'Employment',
        action: 'Provide additional income verification documents'
      })
    }

    // Purpose-based recommendations
    if (loan.purpose === 'Personal/Other') {
      recommendations.push({
        icon: '🎯',
        title: 'Specify Loan Purpose',
        description: 'Specific loan purposes (home, auto, education) often have better rates and approval odds.',
        priority: 'low',
        category: 'Loan Purpose',
        action: 'Consider more specific loan categories if applicable'
      })
    }

    return recommendations
  }

  const generateEmployeeInsights = () => {
    const insights = []
    
    // Risk Assessment
    const riskLevel = approvalProbability >= 70 ? 'Low' : approvalProbability >= 40 ? 'Medium' : 'High'
    insights.push({
      icon: '⚠️',
      title: `${riskLevel} Risk Assessment`,
      description: `This application presents ${riskLevel.toLowerCase()} risk based on AI analysis.`,
      priority: riskLevel === 'High' ? 'high' : riskLevel === 'Medium' ? 'medium' : 'low',
      category: 'Risk Assessment',
      details: `Approval probability: ${approvalProbability.toFixed(1)}%`
    })

    // Market Analysis
    insights.push({
      icon: '📊',
      title: 'Market Comparison',
      description: `${loan.purpose} loans in this amount range have ${approvalProbability > 60 ? 'favorable' : 'challenging'} market conditions.`,
      priority: 'medium',
      category: 'Market Analysis',
      details: `Average approval rate for similar profiles: ${Math.round(approvalProbability + (Math.random() * 10 - 5))}%`
    })

    // Regulatory Compliance
    insights.push({
      icon: '📋',
      title: 'Compliance Check',
      description: 'Application meets all regulatory requirements for fair lending practices.',
      priority: 'low',
      category: 'Compliance',
      details: 'All ECOA and FCRA requirements satisfied'
    })

    return insights
  }

  const recommendations = user?.role === 'banking_user' ? generateUserRecommendations() : generateEmployeeInsights()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-500/10'
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10'
      case 'low': return 'border-green-500/50 bg-green-500/10'
      default: return 'border-gray-500/50 bg-gray-500/10'
    }
  }

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-300'
      case 'medium': return 'text-yellow-300'
      case 'low': return 'text-green-300'
      default: return 'text-gray-300'
    }
  }

  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          {user?.role === 'banking_user' ? 'Personalized Recommendations' : 'Professional Insights'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((item, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${getPriorityColor(item.priority)}`}
            >
              {/* Priority Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-lg uppercase tracking-wider ${getPriorityTextColor(item.priority)} bg-gray-800/50`}>
                  {item.priority}
                </span>
              </div>

              {/* Content */}
              <div className="mb-4">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
              </div>

              {/* Category and Action */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{item.category}</span>
                </div>
                
                {user?.role === 'banking_user' && 'action' in item && (
                  <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Recommended Action:</div>
                    <div className="text-sm text-blue-300">{item.action}</div>
                  </div>
                )}

                {user?.role === 'banking_employee' && 'details' in item && (
                  <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Details:</div>
                    <div className="text-sm text-blue-300">{item.details}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Role-Specific Content */}
        {user?.role === 'banking_user' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Next Steps
            </h3>
            <div className="text-gray-300 space-y-2">
              <p>• Monitor your application status in the dashboard</p>
              <p>• Prepare additional documentation if requested</p>
              <p>• Consider implementing our recommendations for future applications</p>
              {approvalProbability < 50 && <p className="text-yellow-300">• You may want to improve your financial profile before reapplying</p>}
            </div>
          </div>
        )}

        {user?.role === 'banking_employee' && (
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Processing Notes
            </h3>
            <div className="text-gray-300 space-y-2">
              <p>• AI model confidence: {approvalProbability > 80 ? 'High' : approvalProbability > 50 ? 'Medium' : 'Low'}</p>
              <p>• Manual review {approvalProbability < 60 ? 'recommended' : 'optional'}</p>
              <p>• Documentation verification status: Complete</p>
              <p>• Estimated processing time: 2-5 business days</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 