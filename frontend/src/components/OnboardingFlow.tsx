import React, { useState, useEffect } from 'react'
import type { User } from '../types'

interface OnboardingFlowProps {
  user: User
  onComplete: () => void
  onSkip: () => void
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactElement
  animation: string
}

export default function OnboardingFlow({ user, onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const customerSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to BankTools_AI',
      description: 'Experience the future of banking with AI-powered loan approvals and personalized financial insights.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
        </svg>
      ),
      animation: 'animate-pulse'
    },
    {
      id: 'ai-loans',
      title: 'AI-Powered Loan Applications',
      description: 'Apply for loans with instant AI decisions. Our advanced algorithms analyze 100+ data points in seconds for accurate approvals.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      animation: 'animate-bounce'
    },
    {
      id: 'dashboard',
      title: 'Your Personal Dashboard',
      description: 'Track your applications, view loan status, and get personalized financial recommendations all in one place.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
        </svg>
      ),
      animation: 'animate-float'
    },
    {
      id: 'security',
      title: 'Bank-Grade Security',
      description: 'Your data is protected with military-grade encryption and advanced security protocols. Banking has never been safer.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      animation: 'animate-pulse'
    }
  ]

  const employeeSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to BankTools_AI',
      description: 'Access powerful analytics and AI-driven insights to optimize banking operations and customer relationships.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
        </svg>
      ),
      animation: 'animate-pulse'
    },
    {
      id: 'churn-analysis',
      title: 'Customer Churn Prediction',
      description: 'Identify at-risk customers before they leave. Upload customer data and get AI-powered churn predictions with actionable insights.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      animation: 'animate-bounce'
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics Suite',
      description: 'Access comprehensive dashboards with real-time metrics, customer insights, and predictive analytics to drive business decisions.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
        </svg>
      ),
      animation: 'animate-float'
    },
    {
      id: 'tools',
      title: 'Professional Banking Tools',
      description: 'Leverage AI-powered tools for risk assessment, loan processing oversight, and customer relationship management.',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      animation: 'animate-pulse'
    }
  ]

  const steps = user.role === 'banking_user' ? customerSteps : employeeSteps
  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const nextStep = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const roleColor = user.role === 'banking_user' ? 'blue' : 'green'
  const gradientColors = user.role === 'banking_user' 
    ? 'from-blue-500 to-purple-500' 
    : 'from-green-500 to-blue-500'

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`relative w-full max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-3xl overflow-hidden transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-6 right-6 z-10 text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800/50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
          <div 
            className={`h-full bg-gradient-to-r ${gradientColors} transition-all duration-500 ease-out`}
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 pt-16">
          {/* Step indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? `bg-${roleColor}-500 scale-125`
                      : index < currentStep
                      ? `bg-${roleColor}-600`
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 bg-gradient-to-r ${gradientColors} rounded-2xl flex items-center justify-center ${currentStepData.animation} shadow-2xl`}>
                {currentStepData.icon}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white mb-4">
              {currentStepData.title}
            </h2>

            {/* Description */}
            <p className="text-gray-300 text-lg leading-relaxed max-w-xl mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Role-specific tips */}
          <div className={`bg-${roleColor}-500/10 border border-${roleColor}-500/20 rounded-2xl p-6 mb-8`}>
            <div className="flex items-start space-x-3">
              <div className={`w-6 h-6 bg-${roleColor}-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className={`text-${roleColor}-300 font-semibold mb-1`}>
                  {user.role === 'banking_user' ? 'Pro Tip for Banking Customers' : 'Pro Tip for Banking Professionals'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {currentStep === 0 && user.role === 'banking_user' && "Start with small loan applications to build your AI credit profile and improve approval rates."}
                  {currentStep === 1 && user.role === 'banking_user' && "Upload accurate financial documents for faster AI processing and better loan terms."}
                  {currentStep === 2 && user.role === 'banking_user' && "Check your dashboard regularly for personalized financial insights and recommendations."}
                  {currentStep === 3 && user.role === 'banking_user' && "Enable two-factor authentication for maximum account security."}
                  
                  {currentStep === 0 && user.role === 'banking_employee' && "Bookmark key analytics dashboards for quick access to customer insights."}
                  {currentStep === 1 && user.role === 'banking_employee' && "Upload customer data in CSV format for best churn prediction accuracy."}
                  {currentStep === 2 && user.role === 'banking_employee' && "Set up automated alerts for high-risk customer segments."}
                  {currentStep === 3 && user.role === 'banking_employee' && "Use batch processing for analyzing large customer datasets efficiently."}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Previous
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={onSkip}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium"
              >
                Skip Tutorial
              </button>
              
              <button
                onClick={nextStep}
                className={`px-8 py-3 bg-gradient-to-r ${gradientColors} hover:scale-105 rounded-xl font-semibold text-white shadow-2xl transition-all duration-200`}
              >
                {isLastStep ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 w-32 h-32 bg-${roleColor}-500/5 rounded-full blur-2xl animate-pulse`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-1000`}></div>
        </div>
      </div>
    </div>
  )
} 