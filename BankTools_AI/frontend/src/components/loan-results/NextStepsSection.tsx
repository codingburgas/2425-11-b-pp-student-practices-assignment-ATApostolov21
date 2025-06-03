import type { LoanPredictionResponse } from '../../types'
import type { LoanApplication } from './types'

interface NextStepsSectionProps {
  result: LoanPredictionResponse
  loanApplication: LoanApplication | null
}

export default function NextStepsSection({ result, loanApplication }: NextStepsSectionProps) {
  const isApproved = result.prediction.approval_status === 'Approved'
  const probabilityPercentage = parseFloat((result.prediction.approval_probability * 100).toFixed(1))

  return (
    <div className="space-y-8">
      {/* Status Overview */}
      <div className={`bg-gradient-to-br backdrop-blur-xl border rounded-2xl p-8 ${
        isApproved 
          ? 'from-green-900/40 via-emerald-900/20 to-green-900/40 border-green-500/30'
          : 'from-orange-900/40 via-yellow-900/20 to-orange-900/40 border-orange-500/30'
      }`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isApproved 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-500'
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isApproved ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              {isApproved ? 'Loan Approved - Complete Your Application' : 'Application Under Review - Take Action'}
            </h3>
            <p className={`${isApproved ? 'text-green-200' : 'text-orange-200'}`}>
              {isApproved 
                ? 'Congratulations! Follow these steps to finalize your loan.'
                : 'Your application needs attention. Follow our improvement plan to increase approval chances.'
              }
            </p>
          </div>
          <div className={`px-4 py-2 rounded-xl ${
            isApproved 
              ? 'bg-green-500/20 text-green-300'
              : 'bg-orange-500/20 text-orange-300'
          }`}>
            <span className="text-sm font-semibold">
              {isApproved ? 'APPROVED' : 'PENDING'}
            </span>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl ${
            isApproved ? 'bg-green-500/10 border border-green-500/30' : 'bg-blue-500/10 border border-blue-500/30'
          }`}>
            <div className={`text-2xl font-bold ${isApproved ? 'text-green-300' : 'text-blue-300'}`}>
              {isApproved ? '3-7' : '30-90'}
            </div>
            <div className="text-sm text-gray-400">Days to complete</div>
          </div>
          <div className={`p-4 rounded-xl ${
            isApproved ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-purple-500/10 border border-purple-500/30'
          }`}>
            <div className={`text-2xl font-bold ${isApproved ? 'text-blue-300' : 'text-purple-300'}`}>
              {isApproved ? '4' : '6'}
            </div>
            <div className="text-sm text-gray-400">Action items</div>
          </div>
          <div className={`p-4 rounded-xl ${
            isApproved ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-orange-500/10 border border-orange-500/30'
          }`}>
            <div className={`text-2xl font-bold ${isApproved ? 'text-purple-300' : 'text-orange-300'}`}>
              {isApproved ? probabilityPercentage : Math.min(probabilityPercentage + 25, 95)}%
            </div>
            <div className="text-sm text-gray-400">{isApproved ? 'Current approval' : 'Potential approval'}</div>
          </div>
          <div className={`p-4 rounded-xl ${
            isApproved ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-green-500/10 border border-green-500/30'
          }`}>
            <div className={`text-2xl font-bold ${isApproved ? 'text-cyan-300' : 'text-green-300'}`}>
              {isApproved ? 'Active' : 'Building'}
            </div>
            <div className="text-sm text-gray-400">Status</div>
          </div>
        </div>
      </div>

      {isApproved ? (
        /* Approved Flow */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Checklist */}
          <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Required Documents
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Income Verification</h5>
                  <p className="text-gray-400 text-sm mb-2">Recent pay stubs (last 2-3 months) or employment letter</p>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Upload Documents →
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Bank Statements</h5>
                  <p className="text-gray-400 text-sm mb-2">Last 3 months of bank statements from primary account</p>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Upload Documents →
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Identification</h5>
                  <p className="text-gray-400 text-sm mb-2">Government-issued photo ID (driver's license or passport)</p>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Upload Documents →
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Proof of Address</h5>
                  <p className="text-gray-400 text-sm mb-2">Utility bill or lease agreement (within last 3 months)</p>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Upload Documents →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline & Communication */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Expected Timeline
              </h4>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold text-sm">1</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Document Submission</span>
                      <span className="text-sm text-green-400">1-2 days</span>
                    </div>
                    <p className="text-gray-400 text-sm">Upload all required documents</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-bold text-sm">2</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Verification Process</span>
                      <span className="text-sm text-blue-400">2-3 days</span>
                    </div>
                    <p className="text-gray-400 text-sm">Document review and verification</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-400 font-bold text-sm">3</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Final Approval</span>
                      <span className="text-sm text-purple-400">1-2 days</span>
                    </div>
                    <p className="text-gray-400 text-sm">Final underwriting and approval</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan-400 font-bold text-sm">4</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Fund Disbursement</span>
                      <span className="text-sm text-cyan-400">1 day</span>
                    </div>
                    <p className="text-gray-400 text-sm">Loan funds transferred to your account</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Communication Preferences */}
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                Stay Updated
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-white">Email Notifications</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-white">SMS Updates</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Improvement Flow */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Immediate Actions */}
          <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
            <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Immediate Actions (0-30 days)
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-400 font-bold text-xs">1</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Credit Report Review</h5>
                  <p className="text-gray-400 text-sm mb-2">Check for errors and dispute inaccuracies</p>
                  <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                    Get Free Credit Report →
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 font-bold text-xs">2</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Reduce Credit Utilization</h5>
                  <p className="text-gray-400 text-sm mb-2">Pay down credit card balances below 30%</p>
                  <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                    Calculate Payments →
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-400 font-bold text-xs">3</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-white mb-1">Set Up Auto-Pay</h5>
                  <p className="text-gray-400 text-sm mb-2">Ensure 100% on-time payment history</p>
                  <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                    Banking Setup Guide →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="space-y-6">
            {/* Credit Score Monitoring */}
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Credit Score Progress
              </h4>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Score</span>
                  <span className="text-white font-bold">{loanApplication?.credit_score || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Target Score</span>
                  <span className="text-green-400 font-bold">750+</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-green-500 h-3 rounded-full" 
                       style={{ width: `${Math.min(((loanApplication?.credit_score || 0) / 750) * 100, 100)}%` }}>
                  </div>
                </div>
                <button className="w-full bg-purple-500/20 border border-purple-500/30 text-purple-300 py-2 rounded-lg hover:bg-purple-500/30 transition-colors">
                  Enable Credit Monitoring
                </button>
              </div>
            </div>

            {/* Reapplication Timeline */}
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                Reapplication Strategy
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-white">Recommended wait time</span>
                  <span className="text-blue-400 font-medium">3-6 months</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                  <span className="text-white">Expected improvement</span>
                  <span className="text-green-400 font-medium">+{Math.min(25, 95 - probabilityPercentage)}% approval</span>
                </div>
                <button className="w-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 py-2 rounded-lg hover:bg-indigo-500/30 transition-colors">
                  Set Reapplication Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Support */}
      <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          Need Help? Contact Support
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/30 rounded-xl p-6 text-center hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h5 className="text-white font-semibold mb-2">Phone Support</h5>
            <p className="text-gray-400 text-sm mb-3">Speak with a loan specialist</p>
            <p className="text-green-400 font-medium">1-800-BANK-AID</p>
          </div>

          <div className="bg-gray-800/30 rounded-xl p-6 text-center hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h5 className="text-white font-semibold mb-2">Live Chat</h5>
            <p className="text-gray-400 text-sm mb-3">Instant messaging support</p>
            <p className="text-blue-400 font-medium">Available 24/7</p>
          </div>

          <div className="bg-gray-800/30 rounded-xl p-6 text-center hover:bg-gray-800/50 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h5 className="text-white font-semibold mb-2">Email Support</h5>
            <p className="text-gray-400 text-sm mb-3">Send us your questions</p>
            <p className="text-purple-400 font-medium">support@banktools.ai</p>
          </div>
        </div>
      </div>
    </div>
  )
} 