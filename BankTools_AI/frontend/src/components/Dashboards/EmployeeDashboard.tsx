import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { banking } from '../../api'
import type { User, ChurnAnalysisListItem } from '../../types'

interface EmployeeDashboardProps {
  user: User
}

export default function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [recentAnalyses, setRecentAnalyses] = useState<ChurnAnalysisListItem[]>([])
  const [animatedStats, setAnimatedStats] = useState({
    activeCustomers: 0,
    loansProcessed: 0,
    churnRate: 0,
    aiAccuracy: 0
  })
  const [realStats, setRealStats] = useState({
    totalCustomers: 0,
    avgChurnRate: 0,
    highRiskCustomers: 0,
    aiAccuracy: 99.7,
    loansProcessed: 486
  })
  const [deletingAnalysisId, setDeletingAnalysisId] = useState<number | null>(null)

  useEffect(() => {
    setIsVisible(true)
    
    // Fetch recent churn analyses
    const fetchRecentAnalyses = async () => {
      try {
        const response = await banking.getChurnAnalyses()
        const analyses = response.data.analyses
        setRecentAnalyses(analyses) // Show all analyses, not just 3
        
        // Calculate real stats from most recent analysis
        if (analyses.length > 0) {
          const latest = analyses[0]
          setRealStats({
            totalCustomers: latest.total_customers,
            avgChurnRate: latest.avg_churn_risk * 100,
            highRiskCustomers: latest.high_risk_customers,
            aiAccuracy: 99.7,
            loansProcessed: Math.floor(latest.total_customers * 0.15) // Estimate 15% loan applications
          })
        }
      } catch (error) {
        console.error('Failed to fetch recent analyses:', error)
      }
    }

    fetchRecentAnalyses()
    
    // Animate analytics stats with real data
    const animateStats = () => {
      const duration = 2000
      const steps = 60
      const interval = duration / steps

      let step = 0
      const timer = setInterval(() => {
        step++
        const progress = step / steps

        setAnimatedStats({
          activeCustomers: Math.floor(realStats.totalCustomers * progress),
          loansProcessed: Math.floor(realStats.highRiskCustomers * progress),
          churnRate: Math.floor(realStats.avgChurnRate * progress),
          aiAccuracy: Math.floor(realStats.aiAccuracy * progress)
        })

        if (step >= steps) {
          clearInterval(timer)
          setAnimatedStats({
            activeCustomers: realStats.totalCustomers,
            loansProcessed: realStats.highRiskCustomers,
            churnRate: Math.floor(realStats.avgChurnRate),
            aiAccuracy: Math.floor(realStats.aiAccuracy)
          })
        }
      }, interval)

      return () => clearInterval(timer)
    }

    // Delay animation start to sync with visibility
    const animationTimeout = setTimeout(animateStats, 500)
    return () => clearTimeout(animationTimeout)
  }, [realStats.totalCustomers, realStats.avgChurnRate])

  // Enhanced delete analysis function
  const deleteAnalysis = async (analysisId: number, analysisName: string) => {
    if (!confirm(`Are you sure you want to delete the analysis "${analysisName}"? This action cannot be undone.`)) {
      return
    }

    setDeletingAnalysisId(analysisId)
    
    try {
      await banking.deleteChurnAnalysis(analysisId)
      
      // Remove from local state
      setRecentAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId))
      
      // Show success message
      const successMessage = document.createElement('div')
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
      successMessage.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Analysis "${analysisName}" deleted successfully!</span>
        </div>
      `
      document.body.appendChild(successMessage)
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage)
        }
      }, 3000)
      
    } catch (error) {
      console.error('Failed to delete analysis:', error)
      alert('Failed to delete analysis. Please try again.')
    } finally {
      setDeletingAnalysisId(null)
    }
  }

  const handleNewAnalysis = () => {
    window.location.href = '/churn-analysis'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRiskLevelBadge = (avgRisk: number, highRiskCount: number) => {
    const riskPercentage = avgRisk * 100
    let color, label
    
    if (riskPercentage >= 25 || highRiskCount > 50) {
      color = 'text-red-400 bg-red-500/20 border-red-500/30'
      label = 'High Risk'
    } else if (riskPercentage >= 15 || highRiskCount > 20) {
      color = 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      label = 'Medium Risk'
    } else {
      color = 'text-green-400 bg-green-500/20 border-green-500/30'
      label = 'Low Risk'
    }
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
        {label}
      </span>
    )
  }

  const analyticsTools = [
    {
      title: 'Customer Churn Analysis',
      description: 'Upload customer data and get AI-powered churn predictions with actionable insights',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      gradient: 'from-red-500 to-pink-500',
      link: '/churn-analysis',
      available: true
    },
    {
      title: 'Loan Management',
      description: 'Review and manage customer loan applications with AI recommendations',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-500',
      link: '#',
      available: false
    },
    {
      title: 'Risk Assessment',
      description: 'AI-powered risk evaluation and credit scoring for loan applications',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
      link: '#',
      available: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Welcome back, {user.email.split('@')[0]}
              </h1>
              <p className="text-gray-400 text-lg">
                Your analytics command center is ready
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-xl">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span className="text-green-300 font-medium">Analytics Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analytics Overview with Premium Animations */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Total Customers Card */}
          <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating particles on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-4 left-4 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-blue-300 rounded-full animate-ping delay-400"></div>
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-600"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-blue-500/50">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse mb-2 group-hover:animate-bounce"></div>
                  <span className="text-blue-400 text-xs font-bold tracking-wider">
                    {recentAnalyses.length > 0 ? 'ANALYZED' : 'ACTIVE'}
                  </span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                {animatedStats.activeCustomers.toLocaleString() || '2,847'}
              </div>
              <div className="text-gray-300 text-sm font-medium mb-4 group-hover:text-blue-200 transition-colors duration-300">
                {recentAnalyses.length > 0 ? 'Total Customers Analyzed' : 'Active Bank Customers'}
              </div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-3/4 transition-all duration-1000 group-hover:animate-pulse"></div>
                </div>
                <span className="text-xs text-blue-400 ml-3 font-bold group-hover:text-blue-300 transition-colors">75%</span>
              </div>
            </div>
          </div>

          {/* High Risk Customers Card */}
          <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-red-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating particles on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-4 left-4 w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-pink-300 rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-red-300 rounded-full animate-ping delay-400"></div>
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-600"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-red-500/50">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse mb-2 group-hover:animate-bounce"></div>
                  <span className="text-red-400 text-xs font-bold tracking-wider">
                    {recentAnalyses.length > 0 ? 'HIGH RISK' : 'ALERTS'}
                  </span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-red-300 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                {animatedStats.loansProcessed}
              </div>
              <div className="text-gray-300 text-sm font-medium mb-4 group-hover:text-red-200 transition-colors duration-300">
                {recentAnalyses.length > 0 ? 'High Risk Customers' : 'Risk Alerts Today'}
              </div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full w-1/4 transition-all duration-1000 group-hover:animate-pulse"></div>
                </div>
                <span className="text-xs text-red-400 ml-3 font-bold group-hover:text-red-300 transition-colors">25%</span>
              </div>
            </div>
          </div>

          {/* Average Churn Risk Card */}
          <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating particles on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-4 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-orange-300 rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping delay-400"></div>
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-600"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-yellow-500/50">
                  <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse mb-2 group-hover:animate-bounce"></div>
                  <span className="text-yellow-400 text-xs font-bold tracking-wider">
                    {recentAnalyses.length > 0 ? 'AVG RISK' : 'TRENDING'}
                  </span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                {animatedStats.churnRate}%
              </div>
              <div className="text-gray-300 text-sm font-medium mb-4 group-hover:text-yellow-200 transition-colors duration-300">Average Churn Risk Score</div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000 group-hover:animate-pulse"
                    style={{ width: `${Math.min(animatedStats.churnRate * 2, 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs text-yellow-400 ml-3 font-bold group-hover:text-yellow-300 transition-colors">
                  {animatedStats.churnRate > 30 ? 'HIGH' : animatedStats.churnRate > 15 ? 'MED' : 'LOW'}
                </span>
              </div>
            </div>
          </div>

          {/* Analysis Count / AI Accuracy Card */}
          <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-purple-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Floating particles on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute top-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
              <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-pink-300 rounded-full animate-ping delay-200"></div>
              <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-purple-300 rounded-full animate-ping delay-400"></div>
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-600"></div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-purple-500/50">
                  {recentAnalyses.length > 0 ? (
                    <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                </div>
                <div className="text-right">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse mb-2 group-hover:animate-bounce"></div>
                  <span className="text-purple-400 text-xs font-bold tracking-wider">
                    {recentAnalyses.length > 0 ? 'REPORTS' : 'AI MODEL'}
                  </span>
                </div>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent mb-3 group-hover:scale-105 transition-transform duration-300">
                {recentAnalyses.length > 0 ? recentAnalyses.length : animatedStats.aiAccuracy + '%'}
              </div>
              <div className="text-gray-300 text-sm font-medium mb-4 group-hover:text-purple-200 transition-colors duration-300">
                {recentAnalyses.length > 0 ? 'Completed Analyses' : 'AI Model Accuracy'}
              </div>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 group-hover:animate-pulse"
                    style={{ 
                      width: recentAnalyses.length > 0 
                        ? `${Math.min(recentAnalyses.length * 25, 100)}%` 
                        : `${animatedStats.aiAccuracy}%` 
                    }}
                  ></div>
                </div>
                <span className="text-xs text-purple-400 ml-3 font-bold group-hover:text-purple-300 transition-colors">
                  {recentAnalyses.length > 0 ? 'ACTIVE' : 'OPTIMAL'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Tools */}
        <div className={`mb-12 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-2xl font-bold text-white mb-6">Professional Analytics Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {analyticsTools.map((tool, index) => (
              tool.available ? (
                <Link
                  key={index}
                  to={tool.link}
                  className="group relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:scale-105 transition-all duration-300 text-left overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-r ${tool.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300`}>
                      {tool.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
                    <p className="text-gray-400 mb-4">{tool.description}</p>
                    <div className="flex items-center text-green-400 font-medium">
                      <span>Get Started</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ) : (
                <div
                  key={index}
                  className="group relative bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-3xl p-8 text-left overflow-hidden opacity-60"
                >
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-r ${tool.gradient} rounded-2xl flex items-center justify-center mb-6 opacity-50`}>
                      {tool.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
                    <p className="text-gray-400 mb-4">{tool.description}</p>
                    <span className="text-gray-500 font-medium">Coming Soon</span>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Comprehensive Churn Analyses Table */}
        <div className={`mb-12 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Churn Analysis History</h2>
            <Link 
              to="/churn-analysis" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Analysis
            </Link>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
            {recentAnalyses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/60 border-b border-gray-700/50">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Analysis Name</th>
                      <th className="text-left py-4 px-6 text-gray-300 font-medium">Date</th>
                      <th className="text-center py-4 px-6 text-gray-300 font-medium">Customers</th>
                      <th className="text-center py-4 px-6 text-gray-300 font-medium">Avg Risk</th>
                      <th className="text-center py-4 px-6 text-gray-300 font-medium">High Risk</th>
                      <th className="text-center py-4 px-6 text-gray-300 font-medium">Risk Level</th>
                      <th className="text-center py-4 px-6 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {recentAnalyses.map((analysis, index) => (
                      <tr key={analysis.id} className="group hover:bg-gray-900/40 transition-colors">
                        <td className="py-4 px-6">
                          <Link 
                            to={`/churn-analysis/${analysis.id}`} 
                            className="text-white font-medium hover:text-purple-300 transition-colors"
                          >
                            {analysis.name}
                          </Link>
                        </td>
                        <td className="py-4 px-6 text-gray-400">
                          {formatDate(analysis.created_at)}
                        </td>
                        <td className="py-4 px-6 text-center text-white">
                          {analysis.total_customers.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="text-white font-bold">
                            {(analysis.avg_churn_risk * 100).toFixed(1)}%
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-red-400 font-medium">
                            {analysis.high_risk_customers}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getRiskLevelBadge(analysis.avg_churn_risk, analysis.high_risk_customers)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/churn-analysis/${analysis.id}`}
                              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => deleteAnalysis(analysis.id, analysis.name)}
                              disabled={deletingAnalysisId === analysis.id}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Analysis"
                            >
                              {deletingAnalysisId === analysis.id ? (
                                <div className="w-4 h-4 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Churn Analyses Yet</h3>
                <p className="text-gray-400 mb-6">Start analyzing customer churn patterns by uploading your customer data</p>
                <Link 
                  to="/churn-analysis" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Upload Customer Data
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 