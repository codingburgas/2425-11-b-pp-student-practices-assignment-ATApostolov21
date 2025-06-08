import { useState, useEffect } from 'react'

interface ChurnSummaryCardsProps {
  summary?: {
    total_customers: number
    avg_churn_risk: number
    high_risk_customers: number
    medium_risk_customers: number
    low_risk_customers: number
    churn_rate_percentage: number
  }
}

export default function ChurnSummaryCards({ summary }: ChurnSummaryCardsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedValues, setAnimatedValues] = useState({
    totalCustomers: 0,
    avgChurnRisk: 0,
    highRiskCustomers: 0,
    churnRate: 0
  })

  useEffect(() => {
    if (!summary) return
    
    setIsVisible(true)
    
    // Reset animated values before starting new animation
    setAnimatedValues({
      totalCustomers: 0,
      avgChurnRisk: 0,
      highRiskCustomers: 0,
      churnRate: 0
    })
    
    // Small delay to ensure reset is applied
    const resetTimeout = setTimeout(() => {
      // Animate numbers with safe defaults
      const totalTarget = summary.total_customers || 0
      const avgTarget = (summary.avg_churn_risk || 0) * 100
      const highTarget = summary.high_risk_customers || 0
      const churnTarget = summary.churn_rate_percentage || 0

      const duration = 2000
      const steps = 60
      const stepTime = duration / steps

      let currentStep = 0
      
      const timer = setInterval(() => {
        const progress = currentStep / steps
        const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease-out cubic
        
        setAnimatedValues({
          totalCustomers: Math.floor(totalTarget * easeProgress),
          avgChurnRisk: avgTarget * easeProgress,
          highRiskCustomers: Math.floor(highTarget * easeProgress),
          churnRate: churnTarget * easeProgress
        })
        
        currentStep++
        if (currentStep > steps) clearInterval(timer)
      }, stepTime)

      return () => clearInterval(timer)
    }, 100)

    return () => {
      clearTimeout(resetTimeout)
    }
  }, [summary])

  const getRiskLevel = (percentage: number) => {
    if (percentage >= 60) return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'HIGH RISK' }
    if (percentage >= 30) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'MODERATE' }
    return { color: 'text-green-400', bg: 'bg-green-500/20', label: 'LOW RISK' }
  }

  const riskLevel = getRiskLevel(animatedValues.avgChurnRisk)

  // Early return if no summary data is available
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 animate-pulse">
            <div className="h-6 bg-gray-700 rounded mb-4"></div>
            <div className="h-10 bg-gray-700 rounded mb-4"></div>
            <div className="h-2 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Total Customers */}
      <div className={`group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:border-blue-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative">
          {/* Floating particles */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-2 right-2 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-ping delay-300"></div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-8 h-8 text-blue-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 bg-blue-500/20 rounded-full text-xs text-blue-300 font-bold">
                ANALYZED
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-gray-400 text-sm font-medium">Total Customers</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              {animatedValues.totalCustomers.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-2000"
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Average Churn Risk */}
      <div className={`group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:border-yellow-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} delay-200`}>
        <div className="relative">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-orange-300 rounded-full animate-ping delay-300"></div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-8 h-8 text-yellow-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 ${riskLevel.bg} rounded-full text-xs ${riskLevel.color} font-bold`}>
                {riskLevel.label}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-gray-400 text-sm font-medium">Average Churn Risk</h3>
            <p className={`text-4xl font-bold bg-gradient-to-r ${riskLevel.color === 'text-red-400' ? 'from-red-400 to-red-200' : riskLevel.color === 'text-yellow-400' ? 'from-yellow-400 to-yellow-200' : 'from-green-400 to-green-200'} bg-clip-text text-transparent`}>
              {animatedValues.avgChurnRisk.toFixed(1)}%
            </p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-2000 ${riskLevel.color === 'text-red-400' ? 'bg-gradient-to-r from-red-500 to-red-400' : riskLevel.color === 'text-yellow-400' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                  style={{ width: `${Math.min(animatedValues.avgChurnRisk, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High Risk Customers */}
      <div className={`group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:border-red-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} delay-400`}>
        <div className="relative">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-2 right-2 w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-pink-300 rounded-full animate-ping delay-300"></div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-8 h-8 text-red-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 bg-red-500/20 rounded-full text-xs text-red-300 font-bold">
                URGENT
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-gray-400 text-sm font-medium">High Risk Customers</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">
              {animatedValues.highRiskCustomers.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-2000"
                  style={{ width: `${summary && summary.total_customers ? (animatedValues.highRiskCustomers / summary.total_customers) * 100 : 0}%` }}
                ></div>
              </div>
              <span className="text-xs text-red-400 font-bold">
                {summary && summary.total_customers ? ((animatedValues.highRiskCustomers / summary.total_customers) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Churn Rate */}
      <div className={`group bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:border-purple-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} delay-600`}>
        <div className="relative">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-2 right-2 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-indigo-300 rounded-full animate-ping delay-300"></div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500/30 to-indigo-500/30 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <svg className="w-8 h-8 text-purple-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300 font-bold">
                PREDICTED
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-gray-400 text-sm font-medium">Predicted Churn Rate</h3>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
              {animatedValues.churnRate.toFixed(1)}%
            </p>
            <div className="flex items-center gap-2">
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-2000"
                  style={{ width: `${Math.min(animatedValues.churnRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 