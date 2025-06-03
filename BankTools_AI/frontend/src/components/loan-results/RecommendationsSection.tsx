import type { LoanPredictionResponse } from '../../types'
import type { LoanApplication } from './types'

interface RecommendationsSectionProps {
  result: LoanPredictionResponse
  loanApplication: LoanApplication | null
}

export default function RecommendationsSection({ result, loanApplication }: RecommendationsSectionProps) {
  const isApproved = result.prediction.approval_status === 'Approved'
  const probabilityPercentage = parseFloat((result.prediction.approval_probability * 100).toFixed(1))
  const currentCreditScore = loanApplication?.credit_score || 650

  const primaryRecommendations = [
    {
      title: isApproved ? 'Review Loan Terms Carefully' : 'Improve Credit Score',
      description: isApproved 
        ? 'Take time to understand interest rates, payment schedule, and all terms before signing'
        : 'Focus on raising your credit score by 50-75 points to significantly improve approval chances',
      impact: 'High',
      timeline: isApproved ? '1-2 days' : '3-6 months',
      priority: 1
    },
    {
      title: isApproved ? 'Set Up Automatic Payments' : 'Reduce Credit Utilization',
      description: isApproved
        ? 'Establish automatic payments to maintain perfect payment history on your new loan'
        : 'Pay down existing credit card balances to below 30% utilization, ideally under 10%',
      impact: 'High',
      timeline: isApproved ? '1 week' : '1-3 months',
      priority: 2
    },
    {
      title: isApproved ? 'Monitor Your Credit' : 'Increase Income Documentation',
      description: isApproved
        ? 'Keep track of your credit score and report to maintain your financial health'
        : 'Provide additional income documentation or consider a co-signer to strengthen your application',
      impact: 'Medium',
      timeline: isApproved ? 'Ongoing' : '2-4 weeks',
      priority: 3
    }
  ]

  const creditImprovementSteps = [
    { step: 'Check credit report for errors', timeframe: '1 week', impact: '+10-50 points' },
    { step: 'Pay down high-balance cards', timeframe: '1-2 months', impact: '+20-40 points' },
    { step: 'Keep old accounts open', timeframe: 'Ongoing', impact: '+10-20 points' },
    { step: 'Diversify credit types', timeframe: '3-6 months', impact: '+15-30 points' }
  ]

  const financialPlanningAdvice = [
    {
      category: 'Debt Management',
      advice: isApproved 
        ? 'Maintain low debt-to-income ratio by avoiding new major purchases'
        : 'Focus on paying down existing debt before taking on new loan obligations',
      actionItems: isApproved 
        ? ['Set monthly budget', 'Track spending', 'Avoid new debt']
        : ['List all debts', 'Create payoff plan', 'Consider debt consolidation']
    },
    {
      category: 'Income Optimization',
      advice: 'Diversify income sources and document all revenue streams for future applications',
      actionItems: ['Track all income', 'Consider side hustles', 'Document freelance work', 'Build emergency fund']
    },
    {
      category: 'Emergency Fund',
      advice: 'Maintain 3-6 months of expenses in savings to improve financial stability',
      actionItems: ['Calculate monthly expenses', 'Set savings target', 'Automate savings', 'Use high-yield account']
    }
  ]

  return (
    <div className="space-y-8">
      {/* Personalized AI Recommendations Header */}
      <div className="bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-indigo-900/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Personalized AI Recommendations</h3>
            <p className="text-blue-200">Tailored insights based on your financial profile and loan application</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-300">{probabilityPercentage}%</div>
            <div className="text-sm text-gray-400">Current Approval Rate</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-300">
              {isApproved ? 'Approved' : Math.min(probabilityPercentage + 25, 95) + '%'}
            </div>
            <div className="text-sm text-gray-400">
              {isApproved ? 'Status' : 'Potential Rate'}
            </div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-300">{currentCreditScore}</div>
            <div className="text-sm text-gray-400">Current Credit Score</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-300">
              {isApproved ? '3-7' : '90-180'}
            </div>
            <div className="text-sm text-gray-400">
              {isApproved ? 'Days to Fund' : 'Days to Improve'}
            </div>
          </div>
        </div>
      </div>

      {/* Primary Recommendations */}
      <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          Primary Recommendations
        </h4>
        
        <div className="space-y-6">
          {primaryRecommendations.map((rec, index) => (
            <div key={index} className="bg-gray-800/30 rounded-xl p-6 border-l-4 border-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-sm">{rec.priority}</span>
                  </div>
                  <h5 className="text-lg font-semibold text-white">{rec.title}</h5>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rec.impact === 'High' ? 'bg-red-500/20 text-red-300' :
                    rec.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {rec.impact} Impact
                  </span>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                    {rec.timeline}
                  </span>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Credit Improvement Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Credit Improvement Strategy
          </h4>
          
          {/* Current Score Analysis */}
          <div className="mb-6 p-4 bg-gray-800/30 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Current Score</span>
              <span className="text-white font-bold text-lg">{currentCreditScore}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-3 rounded-full"
                style={{ width: `${(currentCreditScore / 850) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>300</span>
              <span>500</span>
              <span>700</span>
              <span>850</span>
            </div>
          </div>

          {/* Improvement Steps */}
          <div className="space-y-4">
            {creditImprovementSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-800/20 rounded-lg">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-purple-400 font-bold text-xs">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-white font-medium">{step.step}</span>
                    <span className="text-green-400 text-sm font-medium">{step.impact}</span>
                  </div>
                  <span className="text-gray-400 text-sm">{step.timeframe}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Progress Tracker */}
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
            <h6 className="text-white font-semibold mb-3">Progress Tracking</h6>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Target Score</span>
                <span className="text-purple-300 font-medium">750+</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Estimated Timeline</span>
                <span className="text-purple-300 font-medium">6-12 months</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Improvement</span>
                <span className="text-green-400 font-medium">+{Math.min(25, 95 - probabilityPercentage)}% approval rate</span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Planning */}
        <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            Financial Planning Advice
          </h4>
          
          <div className="space-y-6">
            {financialPlanningAdvice.map((advice, index) => (
              <div key={index} className="bg-gray-800/30 rounded-xl p-6">
                <h5 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-red-400' : index === 1 ? 'bg-blue-400' : 'bg-green-400'
                  }`}></div>
                  {advice.category}
                </h5>
                <p className="text-gray-300 mb-4 leading-relaxed">{advice.advice}</p>
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-gray-400 mb-2">Action Items:</h6>
                  {advice.actionItems.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Plan Timeline */}
      <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {isApproved ? 'Loan Management Timeline' : 'Improvement Action Plan'}
        </h4>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
          
          <div className="space-y-8">
            {isApproved ? (
              /* Approved Timeline */
              <>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-300 font-bold">1</span>
                  </div>
                  <div className="flex-1 pb-8">
                    <h5 className="text-lg font-semibold text-white mb-2">Complete Documentation (Days 1-3)</h5>
                    <p className="text-gray-300 mb-3">Submit all required documents and finalize loan terms</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Upload documents</span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Review terms</span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">E-signature</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-blue-500/20 border-4 border-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-300 font-bold">2</span>
                  </div>
                  <div className="flex-1 pb-8">
                    <h5 className="text-lg font-semibold text-white mb-2">Fund Disbursement (Days 4-7)</h5>
                    <p className="text-gray-300 mb-3">Loan funds will be transferred to your designated account</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Account verification</span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Fund transfer</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-purple-500/20 border-4 border-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-300 font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-white mb-2">Ongoing Management</h5>
                    <p className="text-gray-300 mb-3">Set up payments and maintain good financial health</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Auto-pay setup</span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Credit monitoring</span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Financial planning</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Improvement Timeline */
              <>
                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-orange-500/20 border-4 border-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-300 font-bold">1</span>
                  </div>
                  <div className="flex-1 pb-8">
                    <h5 className="text-lg font-semibold text-white mb-2">Immediate Actions (Next 30 days)</h5>
                    <p className="text-gray-300 mb-3">Start with quick wins to improve your credit profile</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm">Credit report review</span>
                      <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">Pay down balances</span>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Dispute errors</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-blue-500/20 border-4 border-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-300 font-bold">2</span>
                  </div>
                  <div className="flex-1 pb-8">
                    <h5 className="text-lg font-semibold text-white mb-2">Short-term Improvements (2-6 months)</h5>
                    <p className="text-gray-300 mb-3">Focus on sustainable credit building strategies</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Utilization management</span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Payment history</span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Income documentation</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 items-start">
                  <div className="w-12 h-12 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-300 font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-white mb-2">Reapplication Ready (6+ months)</h5>
                    <p className="text-gray-300 mb-3">Prepare for a stronger loan application with improved profile</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Score verification</span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">New application</span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Better terms</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 