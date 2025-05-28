import { useState, useEffect } from 'react'
import { ChartBarIcon, UserGroupIcon, ShieldCheckIcon, CpuChipIcon, Bars3Icon, XMarkIcon, DocumentCheckIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline'

interface LandingPageProps {
  onNavigateToLogin: () => void
  onNavigateToRegister: () => void
}

export default function LandingPage({ onNavigateToLogin, onNavigateToRegister }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({
    banks: 0,
    loans: 0,
    accuracy: 0
  })

  useEffect(() => {
    setIsVisible(true)
    
    // Animate statistics
    const animateStats = () => {
      const duration = 2000
      const intervals = 60
      const stepTime = duration / intervals
      
      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        const progress = currentStep / intervals
        
        setAnimatedStats({
          banks: Math.floor(2000 * progress),
          loans: Math.floor(50 * progress),
          accuracy: Math.floor(99.7 * progress * 10) / 10
        })
        
        if (currentStep >= intervals) {
          clearInterval(timer)
          setAnimatedStats({ banks: 2000, loans: 50, accuracy: 99.7 })
        }
      }, stepTime)
    }
    
    const statsTimer = setTimeout(animateStats, 1000)
    return () => clearTimeout(statsTimer)
  }, [])

  const features = [
    {
      name: 'AI-Powered Loan Applications',
      description: 'Banking customers can submit loan applications with instant AI-driven approval decisions. Our machine learning models analyze credit scores, income, employment history, and purpose to provide real-time loan approvals.',
      icon: DocumentCheckIcon,
      gradient: 'from-blue-500 to-indigo-600',
      userType: 'Banking Users',
    },
    {
      name: 'Customer Churn Analysis',
      description: 'Banking employees can upload customer data files to analyze churn risk patterns. Advanced analytics identify customers likely to leave and provide actionable insights for retention strategies.',
      icon: ChartBarIcon,
      gradient: 'from-green-500 to-emerald-600',
      userType: 'Banking Employees',
    },
    {
      name: 'Real-time Loan Processing',
      description: 'Instant loan decision engine processes applications using advanced algorithms considering employment years, income levels, credit scores, and loan purposes to deliver immediate approval status.',
      icon: CpuChipIcon,
      gradient: 'from-purple-500 to-pink-600',
      userType: 'Banking Users',
    },
    {
      name: 'Advanced Data Analytics',
      description: 'Banking employees access comprehensive dashboards with customer behavior insights, risk assessments, and predictive analytics to make informed business decisions and improve customer experience.',
      icon: PresentationChartLineIcon,
      gradient: 'from-orange-500 to-red-600',
      userType: 'Banking Employees',
    },
  ]

  const stats = [
    { id: 1, name: 'Loan Applications Processed', value: '10,000+' },
    { id: 2, name: 'AI Approval Accuracy', value: '97.5%' },
    { id: 3, name: 'Churn Predictions', value: '95.2%' },
    { id: 4, name: 'Processing Speed', value: '<2 sec' },
  ]

  const userTypes = [
    {
      title: 'Banking Customers',
      description: 'Submit loan applications with instant AI-powered approvals',
      features: [
        'Quick loan application submission',
        'Instant AI-driven approval decisions', 
        'Real-time application status tracking',
        'Secure document upload and processing'
      ],
      cta: 'Apply for Loans',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Banking Employees',
      description: 'Analyze customer data and manage advanced banking analytics',
      features: [
        'Customer churn analysis and predictions',
        'Advanced data analytics dashboards',
        'Risk assessment and management tools',
        'Customer behavior insights and reports'
      ],
      cta: 'Access Analytics',
      gradient: 'from-purple-500 to-pink-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              BankTools_AI
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onNavigateToLogin}
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors duration-200 font-medium"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateToRegister}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></span>
            <span className="text-sm text-purple-200">AI-Powered Banking Revolution</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Banking Intelligence
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Redefined
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the future of financial technology with AI-driven loan approvals, 
            predictive churn analysis, and intelligent banking solutions that adapt to your needs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={onNavigateToRegister}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-2xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/30 flex items-center space-x-3"
            >
              <span>Start Your Journey</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={onNavigateToLogin}
              className="px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-2xl font-semibold text-lg hover:bg-gray-800/50 transition-all duration-300 backdrop-blur-sm"
            >
              View Demo
            </button>
          </div>
        </div>

        {/* Floating AI Cards */}
        <div className="mt-24 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Loan Approval AI Card */}
          <div className={`group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:scale-105 transition-all duration-500 transform ${isVisible ? 'animate-float' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">AI Loan Approval</h3>
              <p className="text-gray-400 mb-6">Get instant loan decisions powered by advanced machine learning algorithms. Our AI analyzes 100+ data points in seconds.</p>
              <div className="flex items-center text-green-400 font-medium">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
                Real-time Processing
              </div>
            </div>
          </div>

          {/* Churn Analysis Card */}
          <div className={`group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:scale-105 transition-all duration-500 transform ${isVisible ? 'animate-float-delayed' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Churn Prediction</h3>
              <p className="text-gray-400 mb-6">Identify at-risk customers before they leave. Our predictive analytics help you retain valuable relationships.</p>
              <div className="flex items-center text-blue-400 font-medium">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2"></span>
                Predictive Analytics
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Statistics */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Trusted by Industry Leaders
            </h2>
            <p className="text-gray-400 text-lg">Powering the future of financial technology</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                {animatedStats.banks.toLocaleString()}+
              </div>
              <div className="text-gray-400 font-medium">Partner Banks</div>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
            </div>
            
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-2">
                ${animatedStats.loans}B+
              </div>
              <div className="text-gray-400 font-medium">Loans Processed</div>
              <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
            </div>
            
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {animatedStats.accuracy}%
              </div>
              <div className="text-gray-400 font-medium">AI Accuracy</div>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-2 group-hover:w-20 transition-all duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Experience Banking Excellence
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover how our AI-powered solutions transform traditional banking into intelligent financial experiences
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Banking Users Features */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full backdrop-blur-sm">
              <svg className="w-4 h-4 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span className="text-sm text-blue-200">For Banking Customers</span>
            </div>
            
            <h3 className="text-3xl font-bold text-white">Smart Loan Solutions</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Apply for loans with confidence using our AI-powered approval system. Get instant decisions, 
              competitive rates, and personalized recommendations tailored to your financial profile.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Instant AI-powered loan approvals</span>
              </div>
              <div className="flex items-center space-x-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Real-time application processing</span>
              </div>
              <div className="flex items-center space-x-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Personalized financial insights</span>
              </div>
            </div>
          </div>

          {/* Banking Employees Features */}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full backdrop-blur-sm">
              <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-green-200">For Banking Professionals</span>
            </div>
            
            <h3 className="text-3xl font-bold text-white">Advanced Analytics</h3>
            <p className="text-gray-400 text-lg leading-relaxed">
              Leverage powerful churn prediction models and customer analytics to make data-driven decisions. 
              Identify risks early and optimize customer retention strategies.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Customer churn prediction</span>
              </div>
              <div className="flex items-center space-x-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Advanced behavioral analytics</span>
              </div>
              <div className="flex items-center space-x-3 group hover:translate-x-2 transition-transform duration-200">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Risk assessment tools</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-16 text-center">
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Ready to Transform Your Banking Experience?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and banking professionals who trust BankTools_AI 
            for their financial technology needs.
          </p>
          <button
            onClick={onNavigateToRegister}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-2xl font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/30"
          >
            Start Free Today
          </button>
        </div>
      </section>
    </div>
  )
} 