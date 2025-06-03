import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { banking } from '../api'
import type { LoanPredictionResponse } from '../types'
import '../styles/LoanApplicationResults.css'

interface LoanApplication {
  id: number
  amount: number
  purpose: string
  income: number
  employment_years: number
  credit_score: number
  status: string
  prediction: string
  created_at: string
}

interface LoanApplicationResultsProps {
  result?: LoanPredictionResponse
  onBack?: () => void
}

// Navigation Bar Component
interface NavigationBarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

function NavigationBar({ activeSection, onSectionChange }: NavigationBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const sections = [
    {
      id: 'overview',
      name: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'analysis',
      name: 'AI Analysis',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'next-steps',
      name: 'Next Steps',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      )
    }
  ]

  return (
    <div className={`sticky top-6 z-30 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-2 shadow-2xl">
        <nav className="flex items-center gap-2">
          {sections.map((section, index) => {
            const isActive = activeSection === section.id
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  {section.icon}
                </div>
                
                <span className={`text-sm transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {section.name}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl ring-2 ring-blue-400/50 ring-offset-2 ring-offset-gray-900"></div>
                )}
                
                {/* Hover effect */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isActive ? 'opacity-0' : ''}`}></div>
              </button>
            )
          })}
        </nav>
        
        {/* Progress indicator */}
        <div className="mt-2 h-1 bg-gray-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default function LoanApplicationResults({ result: propResult, onBack }: LoanApplicationResultsProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<LoanPredictionResponse | null>(propResult || null)
  const [loanApplication, setLoanApplication] = useState<LoanApplication | null>(null)
  const [isLoading, setIsLoading] = useState(!propResult)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeSection, setActiveSection] = useState('overview')

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (id && !propResult) {
      loadLoanApplication()
    }
  }, [id, propResult])

  const loadLoanApplication = async () => {
    if (!id) return
    
    setIsLoading(true)
    try {
      const response = await banking.getLoanRequestDetails(parseInt(id))
      const loanData = response.data.loan_request
      setLoanApplication(loanData)
      
      // Create a prediction result from the loan data
      const predictionResult: LoanPredictionResponse = {
        success: true,
        request_id: loanData.id,
        prediction: {
          approval_status: loanData.status === 'Approved' ? 'Approved' : 'Rejected',
          approval_probability: loanData.status === 'Approved' ? 0.85 : 0.35, // Estimated based on status
          confidence_level: 'High',
          recommendations: [
            loanData.status === 'Approved' 
              ? 'Congratulations! Your application meets our lending criteria'
              : 'Consider improving your credit score for better approval chances',
            'Review loan terms and conditions carefully',
            'Contact our loan specialists for personalized advice'
          ]
        },
        model_info: {
          prediction_method: 'ai_model',
          model_available: true
        }
      }
      
      setResult(predictionResult)
    } catch (error) {
      console.error('Error loading loan application:', error)
      // Fall back to localStorage for backward compatibility
      const savedResult = localStorage.getItem(`loan_result_${id}`)
      if (savedResult) {
        setResult(JSON.parse(savedResult))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate('/loan-dashboard')
    }
  }

  const handleViewDashboard = () => {
    navigate('/loan-dashboard')
  }

  const handleNewApplication = () => {
    navigate('/loan-request')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-xl text-gray-300">Loading loan application details...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl text-gray-300 mb-4">Loan application not found</p>
          <button 
            onClick={handleBack}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const isApproved = result.prediction.approval_status === 'Approved'
  const probabilityPercentage = (result.prediction.approval_probability * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-2 h-2 bg-green-400/30 rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-20 right-10 w-4 h-4 bg-pink-400/30 rounded-full animate-pulse delay-500"></div>
        
        {/* Gradient orbs that follow mouse */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl transition-all duration-1000 ease-out pointer-events-none"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transform: 'translate(-50%, -50%)'
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:translate-x-[-4px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Enhanced Header */}
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
            
            {/* Enhanced title with loan purpose */}
            <div className="text-left">
              <h1 className={`text-5xl md:text-6xl font-bold leading-tight mb-2 ${
                isApproved 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent'
              }`}>
                {loanApplication?.purpose || 'Loan Application'}
              </h1>
              <p className="text-xl text-gray-300">
                {loanApplication?.created_at && `Submitted on ${formatDate(loanApplication.created_at)}`}
                {loanApplication?.id && ` • Application ID: #${loanApplication.id}`}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className="text-right ml-auto">
              <span className={`px-8 py-4 rounded-2xl text-xl font-bold border-2 backdrop-blur-sm ${
                isApproved 
                  ? 'bg-green-500/20 text-green-300 border-green-500/40' 
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}>
                {isApproved ? 'APPROVED' : 'UNDER REVIEW'}
              </span>
            </div>
          </div>
          
          {/* Enhanced subtitle */}
          <div className="relative">
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
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
        </div>

        {/* Navigation Bar */}
        <div className="mb-12">
          <NavigationBar 
            activeSection={activeSection} 
            onSectionChange={scrollToSection} 
          />
        </div>

        {/* Overview Section */}
        <div id="overview" className="mb-16">
          {/* Application Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-900/40 via-blue-800/20 to-blue-900/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Loan Amount</h3>
              </div>
              <div className="text-3xl font-bold text-blue-300 mb-2">
                ${loanApplication?.amount?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Requested Amount</div>
            </div>

            <div className="bg-gradient-to-br from-green-900/40 via-green-800/20 to-green-900/40 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Annual Income</h3>
              </div>
              <div className="text-3xl font-bold text-green-300 mb-2">
                ${loanApplication?.income?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Verified Income</div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/40 via-purple-800/20 to-purple-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Credit Score</h3>
              </div>
              <div className="text-3xl font-bold text-purple-300 mb-2">
                {loanApplication?.credit_score || 'N/A'}
              </div>
              <div className={`text-sm font-medium ${
                (loanApplication?.credit_score || 0) >= 750 ? 'text-green-400' :
                (loanApplication?.credit_score || 0) >= 700 ? 'text-blue-400' :
                (loanApplication?.credit_score || 0) >= 650 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {(loanApplication?.credit_score || 0) >= 750 ? 'Excellent' :
                 (loanApplication?.credit_score || 0) >= 700 ? 'Good' :
                 (loanApplication?.credit_score || 0) >= 650 ? 'Fair' : 'Poor'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/40 via-orange-800/20 to-orange-900/40 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">Employment</h3>
              </div>
              <div className="text-3xl font-bold text-orange-300 mb-2">
                {loanApplication?.employment_years || 'N/A'}
              </div>
              <div className="text-sm text-gray-400">Years Experience</div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div id="analysis" className="mb-16">
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
        </div>

        {/* Recommendations Section */}
        <div id="recommendations" className="mb-16">
          {/* AI Recommendations (existing content) */}
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
        <div id="next-steps" className="mb-16">
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

        {/* Enhanced Navigation Buttons */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={handleViewDashboard}
            className="px-8 py-4 bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium rounded-2xl border border-gray-600 hover:border-gray-500 transition-all duration-200 transform hover:scale-105"
          >
            ← Back to Dashboard
          </button>
          
          <button
            onClick={handleNewApplication}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-blue-500/30"
          >
            Submit New Application
          </button>
        </div>
      </div>
    </div>
  )
} 