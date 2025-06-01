import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { LoanPredictionResponse } from '../types'

interface LoanApplicationResultsProps {
  result?: LoanPredictionResponse
  onBack?: () => void
}

export default function LoanApplicationResults({ result: propResult, onBack }: LoanApplicationResultsProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<LoanPredictionResponse | null>(propResult || null)
  const [isLoading, setIsLoading] = useState(!propResult)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (id && !propResult) {
      // In a real app, this would fetch the loan application by ID
      // For now, we'll use localStorage or show an error
      const savedResult = localStorage.getItem(`loan_result_${id}`)
      if (savedResult) {
        setResult(JSON.parse(savedResult))
      }
      setIsLoading(false)
    }
  }, [id, propResult])

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/loan-request')
    }
  }

  const handleNewApplication = () => {
    navigate('/loan-request')
  }

  const handleViewDashboard = () => {
    navigate('/loan-dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading loan application results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Results Not Found</h2>
          <p className="text-gray-400 mb-6">The loan application results could not be loaded.</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const isApproved = result.prediction.approval_status === 'Approved'
  const probabilityPercentage = (result.prediction.approval_probability * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Enhanced Animated background elements with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary floating orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        ></div>
        <div 
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            animation: 'float 7s ease-in-out infinite'
          }}
        ></div>
        
        {/* Additional floating particles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400/40 rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-green-400/30 rounded-full animate-ping delay-2000"></div>
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-pink-400/40 rounded-full animate-ping delay-3000"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-5">
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
        {/* Header */}
        <div className="text-center mb-12 relative">
          {/* Floating decorative elements */}
          <div className="absolute -top-10 left-1/4 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -top-5 right-1/4 w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          
          <div className="inline-flex items-center gap-4 mb-8 relative">
            {/* Enhanced icon with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 animate-pulse-glow"></div>
              <div className={`relative w-20 h-20 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500 hover:rotate-12 ${
                isApproved 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-red-500 to-pink-600'
              }`}>
                {isApproved ? (
                  <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </div>
            
            {/* Enhanced title with gradient animation */}
            <h1 className={`text-6xl md:text-7xl font-bold leading-tight ${
              isApproved 
                ? 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent'
            }`}>
              {isApproved ? 'Loan Approved!' : 'Application Review'}
            </h1>
          </div>
          
          {/* Enhanced subtitle with shimmer effect */}
          <div className="relative">
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {isApproved 
                ? 'Congratulations! Your loan application has been approved by our AI system'
                : 'Your loan application has been reviewed. See detailed analysis and recommendations below'
              }
            </p>
            
            {/* Decorative line with animation */}
            <div className="mt-6 flex items-center justify-center">
              <div className={`h-px w-64 animate-shimmer ${
                isApproved 
                  ? 'bg-gradient-to-r from-transparent via-green-500 to-transparent'
                  : 'bg-gradient-to-r from-transparent via-red-500 to-transparent'
              }`}></div>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium rounded-xl border border-gray-600 hover:border-gray-500 transition-all duration-200"
            >
              ← Back to Form
            </button>
            <button
              onClick={handleViewDashboard}
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium rounded-xl border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
            >
              View Dashboard
            </button>
            <button
              onClick={handleNewApplication}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
            >
              New Application
            </button>
          </div>
        </div>

        {/* Main Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* AI Decision Summary */}
          <div className={`group bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
            isApproved 
              ? 'border-green-500/30 hover:border-green-500/50 hover:shadow-green-500/10'
              : 'border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/10'
          }`}>
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 ${
                isApproved 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              AI Decision Analysis
            </h3>
            
            {/* Probability Circle */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative w-48 h-48 group-hover:scale-105 transition-transform duration-500">
                {/* Outer glow effect */}
                <div className={`absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  isApproved ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-r from-red-500/20 to-pink-500/20'
                }`}></div>
                
                {/* Background Circle */}
                <svg className="w-48 h-48 transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-gray-700/50"
                  />
                  
                  {/* Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r="35"
                    stroke={isApproved ? "url(#greenGradient)" : "url(#redGradient)"}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${result.prediction.approval_probability * 220} 220`}
                    strokeDashoffset="0"
                    className="transition-all duration-3000 ease-out drop-shadow-lg"
                    strokeLinecap="round"
                    style={{ 
                      filter: `drop-shadow(0 0 8px ${isApproved ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'})`
                    }}
                  />
                  
                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-4xl font-bold group-hover:scale-110 transition-transform duration-300 ${
                    isApproved ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {probabilityPercentage}%
                  </div>
                  <div className="text-sm text-gray-400 font-medium">AI Probability</div>
                  <div className={`mt-2 px-3 py-1 rounded-full ${
                    isApproved ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                  }`}>
                    <span className="text-xs font-semibold">
                      {result.prediction.confidence_level.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Details */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl">
                <span className="text-gray-400">Decision Status:</span>
                <span className={`font-bold text-lg ${isApproved ? 'text-green-400' : 'text-red-400'}`}>
                  {result.prediction.approval_status}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl">
                <span className="text-gray-400">AI Confidence:</span>
                <span className={`font-medium ${
                  result.prediction.confidence_level === 'High' ? 'text-green-400' :
                  result.prediction.confidence_level === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {result.prediction.confidence_level}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl">
                <span className="text-gray-400">Analysis Method:</span>
                <span className="text-white font-medium">
                  {result.model_info.prediction_method === 'ai_model' ? 'Machine Learning' : 'Rule-based'}
                </span>
              </div>
              
              {result.request_id && (
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400">Request ID:</span>
                  <span className="text-white font-medium">#{result.request_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="group bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              AI Recommendations
            </h3>
            
            <div className="space-y-4">
              {result.prediction.recommendations.map((recommendation, index) => (
                <div key={index} className="group/item flex items-start p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-all duration-300">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mr-4 mt-0.5 group-hover/item:scale-110 transition-transform duration-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps Section */}
        <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            Next Steps
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isApproved ? (
              <>
                <button className="group flex flex-col items-center p-6 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-green-300 font-semibold mb-2">Review Loan Terms</h4>
                  <p className="text-green-200/70 text-sm text-center">Review and accept your loan terms and conditions</p>
                </button>
                
                <button className="group flex flex-col items-center p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h4 className="text-blue-300 font-semibold mb-2">Upload Documents</h4>
                  <p className="text-blue-200/70 text-sm text-center">Submit required documentation for final approval</p>
                </button>
                
                <button className="group flex flex-col items-center p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-purple-300 font-semibold mb-2">Contact Advisor</h4>
                  <p className="text-purple-200/70 text-sm text-center">Speak with a loan specialist about your options</p>
                </button>
              </>
            ) : (
              <>
                <button className="group flex flex-col items-center p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/20 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="text-yellow-300 font-semibold mb-2">Improve Credit Score</h4>
                  <p className="text-yellow-200/70 text-sm text-center">Work on improving your credit score for better approval chances</p>
                </button>
                
                <button className="group flex flex-col items-center p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h4 className="text-blue-300 font-semibold mb-2">Consider Smaller Amount</h4>
                  <p className="text-blue-200/70 text-sm text-center">Try applying for a smaller loan amount</p>
                </button>
                
                <button className="group flex flex-col items-center p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl hover:bg-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-purple-300 font-semibold mb-2">Get Financial Advice</h4>
                  <p className="text-purple-200/70 text-sm text-center">Consult with our financial advisors for personalized guidance</p>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 