import type { LoanPredictionResponse } from '../../types'
import type { LoanApplication } from './types'
import LoanSummaryCards from './LoanSummaryCards'

interface OverviewSectionProps {
  result: LoanPredictionResponse
  loanApplication: LoanApplication | null
}

export default function OverviewSection({ result, loanApplication }: OverviewSectionProps) {
  if (!loanApplication) return null

  const isApproved = result.prediction.approval_status === 'Approved'
  const probabilityPercentage = (result.prediction.approval_probability * 100).toFixed(1)

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <LoanSummaryCards result={result} loanApplication={loanApplication} />

      {/* Application Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loan Details */}
        <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-blue-500/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              Loan Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                <span className="text-gray-400 font-medium">Amount</span>
                <span className="text-white font-bold text-lg">
                  ${loanApplication.amount?.toLocaleString() || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                <span className="text-gray-400 font-medium">Purpose</span>
                <span className="text-white font-medium">
                  {loanApplication.purpose || 'Personal'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                <span className="text-gray-400 font-medium">Application Date</span>
                <span className="text-white font-medium">
                  {loanApplication.created_at ? 
                    new Date(loanApplication.created_at).toLocaleDateString() : 
                    'Recent'
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                <span className="text-gray-400 font-medium">Status</span>
                <span className={`font-medium px-3 py-1 rounded-lg ${
                  isApproved 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {result.prediction.approval_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Applicant Profile */}
        <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/20 relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              Applicant Profile
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                <span className="text-gray-400 font-medium">Annual Income</span>
                <span className="text-white font-bold text-lg">
                  ${loanApplication.income?.toLocaleString() || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                <span className="text-gray-400 font-medium">Credit Score</span>
                <span className={`font-bold text-lg px-3 py-1 rounded-lg border ${
                  (loanApplication.credit_score || 0) >= 750 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  (loanApplication.credit_score || 0) >= 700 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  (loanApplication.credit_score || 0) >= 650 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  'bg-red-500/20 text-red-400 border-red-500/30'
                }`}>
                  {loanApplication.credit_score || 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                <span className="text-gray-400 font-medium">Employment Years</span>
                <span className="text-white font-medium">
                  {loanApplication.employment_years || 'N/A'} years
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                <span className="text-gray-400 font-medium">Debt-to-Income Ratio</span>
                <span className={`font-medium px-3 py-1 rounded-lg border ${
                  loanApplication.income ? 
                    Math.round((loanApplication.amount / loanApplication.income) * 100) <= 28 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    Math.round((loanApplication.amount / loanApplication.income) * 100) <= 36 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                  {loanApplication.income ? 
                    `${Math.round((loanApplication.amount / loanApplication.income) * 100)}%` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-green-500/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-green-500/20 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isApproved ? (
              <>
                <button className="group/action bg-green-500/10 border border-green-500/30 rounded-xl p-6 hover:bg-green-500/20 transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/action:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Upload Documents</h4>
                  <p className="text-gray-400 text-sm">Submit required documentation to finalize your loan</p>
                </button>

                <button className="group/action bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 hover:bg-blue-500/20 transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/action:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Contact Advisor</h4>
                  <p className="text-gray-400 text-sm">Speak with a loan specialist about your options</p>
                </button>

                <button className="group/action bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 hover:bg-purple-500/20 transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/action:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold mb-2">View Terms</h4>
                  <p className="text-gray-400 text-sm">Review detailed loan terms and conditions</p>
                </button>
              </>
            ) : (
              <>
                <button className="group/action bg-orange-500/10 border border-orange-500/30 rounded-xl p-6 hover:bg-orange-500/20 transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/action:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Track Status</h4>
                  <p className="text-gray-400 text-sm">Monitor your application progress in real-time</p>
                </button>

                <button className="group/action bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 hover:bg-blue-500/20 transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/action:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Improve Profile</h4>
                  <p className="text-gray-400 text-sm">See recommendations to strengthen your application</p>
                </button>

                <button className="group/action bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 hover:bg-purple-500/20 transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover/action:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Get Support</h4>
                  <p className="text-gray-400 text-sm">Chat with our support team for assistance</p>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 