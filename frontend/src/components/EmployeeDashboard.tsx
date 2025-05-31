import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { banking } from '../api'
import type { User, ChurnAnalysisListItem } from '../types'

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

  useEffect(() => {
    setIsVisible(true)
    
    // Fetch recent churn analyses
    const fetchRecentAnalyses = async () => {
      try {
        const response = await banking.getChurnAnalyses()
        const analyses = response.data.analyses.slice(0, 3)
        setRecentAnalyses(analyses)
        
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

        {/* Analytics Overview */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Total Customers Card */}
          <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 hover:scale-105 transition-all duration-300 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mb-1"></div>
                <span className="text-blue-400 text-xs font-semibold block">
                  {recentAnalyses.length > 0 ? 'ANALYZED' : 'ACTIVE'}
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              {animatedStats.activeCustomers.toLocaleString() || '2,847'}
            </div>
            <div className="text-gray-400 text-sm font-medium">
              {recentAnalyses.length > 0 ? 'Total Customers Analyzed' : 'Active Bank Customers'}
            </div>
            <div className="mt-3 flex items-center">
              <div className="flex-1 bg-gray-700/50 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full w-3/4 transition-all duration-1000"></div>
              </div>
              <span className="text-xs text-blue-400 ml-2 font-medium">75%</span>
            </div>
          </div>

          {/* High Risk Customers Card */}
          <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 hover:scale-105 transition-all duration-300 hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mb-1"></div>
                <span className="text-red-400 text-xs font-semibold block">
                  {recentAnalyses.length > 0 ? 'HIGH RISK' : 'ALERTS'}
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {animatedStats.loansProcessed}
            </div>
            <div className="text-gray-400 text-sm font-medium">
              {recentAnalyses.length > 0 ? 'High Risk Customers' : 'Risk Alerts Today'}
            </div>
            <div className="mt-3 flex items-center">
              <div className="flex-1 bg-gray-700/50 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-red-500 to-pink-500 h-1.5 rounded-full w-1/4 transition-all duration-1000"></div>
              </div>
              <span className="text-xs text-red-400 ml-2 font-medium">25%</span>
            </div>
          </div>

          {/* Average Churn Risk Card */}
          <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 hover:scale-105 transition-all duration-300 hover:border-yellow-500/30 hover:shadow-2xl hover:shadow-yellow-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse mb-1"></div>
                <span className="text-yellow-400 text-xs font-semibold block">
                  {recentAnalyses.length > 0 ? 'AVG RISK' : 'TRENDING'}
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
              {animatedStats.churnRate}%
            </div>
            <div className="text-gray-400 text-sm font-medium">Average Churn Risk Score</div>
            <div className="mt-3 flex items-center">
              <div className="flex-1 bg-gray-700/50 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(animatedStats.churnRate * 2, 100)}%` }}
                ></div>
              </div>
              <span className="text-xs text-yellow-400 ml-2 font-medium">
                {animatedStats.churnRate > 30 ? 'HIGH' : animatedStats.churnRate > 15 ? 'MED' : 'LOW'}
              </span>
            </div>
          </div>

          {/* Analysis Count / AI Accuracy Card */}
          <div className="group bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 hover:scale-105 transition-all duration-300 hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                {recentAnalyses.length > 0 ? (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
              </div>
              <div className="text-right">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mb-1"></div>
                <span className="text-purple-400 text-xs font-semibold block">
                  {recentAnalyses.length > 0 ? 'REPORTS' : 'AI MODEL'}
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              {recentAnalyses.length > 0 ? recentAnalyses.length : animatedStats.aiAccuracy + '%'}
            </div>
            <div className="text-gray-400 text-sm font-medium">
              {recentAnalyses.length > 0 ? 'Completed Analyses' : 'AI Model Accuracy'}
            </div>
            <div className="mt-3 flex items-center">
              <div className="flex-1 bg-gray-700/50 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-1000"
                  style={{ 
                    width: recentAnalyses.length > 0 
                      ? `${Math.min(recentAnalyses.length * 25, 100)}%` 
                      : `${animatedStats.aiAccuracy}%` 
                  }}
                ></div>
              </div>
              <span className="text-xs text-purple-400 ml-2 font-medium">
                {recentAnalyses.length > 0 ? 'ACTIVE' : 'OPTIMAL'}
              </span>
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

        {/* Recent Activity & Advanced Analytics */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className={`transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Churn Analyses</h2>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 hover:border-purple-500/30 transition-all duration-300">
              <div className="space-y-4">
                {recentAnalyses.length > 0 ? (
                  recentAnalyses.map((analysis, index) => (
                    <Link
                      key={analysis.id}
                      to={`/churn-analysis/${analysis.id}`}
                      className={`group relative flex items-center p-5 bg-gradient-to-r from-gray-900/50 to-gray-900/30 rounded-2xl hover:from-purple-900/30 hover:to-blue-900/30 transition-all duration-500 cursor-pointer border border-gray-700/50 hover:border-purple-500/50 hover:scale-[1.02] overflow-hidden transform hover:shadow-xl hover:shadow-purple-500/10`}
                      style={{
                        animation: `slideInUp 0.6s ease-out ${600 + index * 150}ms both`
                      }}
                    >
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Floating particles effect */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute w-2 h-2 bg-purple-400/20 rounded-full top-4 left-4 animate-pulse"></div>
                        <div className="absolute w-1 h-1 bg-blue-400/30 rounded-full top-8 right-8 animate-pulse delay-300"></div>
                        <div className="absolute w-1.5 h-1.5 bg-purple-300/20 rounded-full bottom-6 left-12 animate-pulse delay-700"></div>
                      </div>

                      <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mr-5 bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 group-hover:from-purple-500/30 group-hover:to-blue-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <svg className="w-6 h-6 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      
                      <div className="flex-1 relative z-10">
                        <div className="text-white text-base font-semibold group-hover:text-purple-300 transition-colors duration-300 mb-2">
                          {analysis.name}
                        </div>
                        <div className="flex items-center gap-5 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {analysis.total_customers.toLocaleString()} customers
                          </span>
                          <span className="flex items-center gap-1 text-red-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            {analysis.high_risk_customers} high risk
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative z-10 text-right mr-2">
                        <div className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                          {(analysis.avg_churn_risk * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">avg risk</div>
                      </div>

                      {/* Hover arrow indicator */}
                      <div className="relative z-10 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div 
                    className="text-center py-12"
                    style={{ animation: 'fadeIn 1s ease-out 1s both' }}
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-700/50 to-gray-600/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 font-semibold text-lg mb-2">No churn analyses yet</p>
                    <p className="text-gray-500 text-sm mb-6">Upload customer data to see powerful AI insights</p>
                    <Link 
                      to="/churn-analysis" 
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 border border-purple-500/20 hover:border-purple-400/40"
                    >
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:rotate-180 transition-transform duration-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      Create First Analysis
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Analytics Suite */}
          <div className={`transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-2xl font-bold text-white mb-6">Analytics Suite</h2>
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl border border-green-500/30 rounded-3xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">🔬 Advanced Analytics</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Leverage cutting-edge AI tools to gain deep insights into customer behavior, optimize loan processes, and predict market trends.
              </p>
              <div className="grid gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm font-medium text-white">Predictive Modeling</div>
                  <div className="text-xs text-gray-300">Forecast customer behavior patterns</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm font-medium text-white">Risk Assessment</div>
                  <div className="text-xs text-gray-300">Real-time risk evaluation engine</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="text-sm font-medium text-white">Data Visualization</div>
                  <div className="text-xs text-gray-300">Interactive charts and insights</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 