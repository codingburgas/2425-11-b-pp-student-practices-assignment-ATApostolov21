import { useState, useEffect } from 'react'

interface RiskFactor {
  factor: string
  importance: number
  description: string
}

interface RiskFactorsChartProps {
  riskFactors?: RiskFactor[]
}

export default function RiskFactorsChart({ riskFactors }: RiskFactorsChartProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedWidths, setAnimatedWidths] = useState<{ [key: string]: number }>({})

  // Early return if no data
  if (!riskFactors || riskFactors.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Risk Factor Analysis
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-6 w-40 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
            </div>
            
            <div className="space-y-4">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="p-5 rounded-2xl border border-gray-700/50 bg-gray-800/30 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-700 rounded"></div>
                      <div>
                        <div className="h-5 w-24 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 w-16 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-6 w-12 bg-gray-700 rounded mb-2"></div>
                      <div className="h-5 w-16 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="h-6 w-28 bg-gray-700 rounded mb-4"></div>
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 w-16 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    setIsVisible(true)

    // Animate bar widths
    const duration = 2500
    const steps = 60
    const stepTime = duration / steps

    let currentStep = 0
    
    const timer = setInterval(() => {
      const progress = currentStep / steps
      const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease-out cubic
      
      const newWidths: { [key: string]: number } = {}
      riskFactors.forEach((factor, index) => {
        // Add staggered delay for each bar
        const staggerDelay = index * 0.1
        const adjustedProgress = Math.max(0, Math.min(1, (progress - staggerDelay) / (1 - staggerDelay)))
        newWidths[factor.factor] = factor.importance * 100 * adjustedProgress
      })
      
      setAnimatedWidths(newWidths)
      
      currentStep++
      if (currentStep > steps) clearInterval(timer)
    }, stepTime)

    return () => clearInterval(timer)
  }, [riskFactors])

  const getImportanceLevel = (importance: number) => {
    if (importance >= 0.8) return { 
      level: 'CRITICAL', 
      color: 'text-red-400', 
      bg: 'bg-red-500', 
      borderColor: 'border-red-500/30',
      bgClass: 'bg-red-500/10'
    }
    if (importance >= 0.6) return { 
      level: 'HIGH', 
      color: 'text-orange-400', 
      bg: 'bg-orange-500', 
      borderColor: 'border-orange-500/30',
      bgClass: 'bg-orange-500/10'
    }
    if (importance >= 0.4) return { 
      level: 'MEDIUM', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500', 
      borderColor: 'border-yellow-500/30',
      bgClass: 'bg-yellow-500/10'
    }
    return { 
      level: 'LOW', 
      color: 'text-green-400', 
      bg: 'bg-green-500', 
      borderColor: 'border-green-500/30',
      bgClass: 'bg-green-500/10'
    }
  }

  const getFactorIcon = (factor: string) => {
    const factorLower = factor.toLowerCase()
    if (factorLower.includes('age')) return '👤'
    if (factorLower.includes('balance')) return '💰'
    if (factorLower.includes('credit') || factorLower.includes('score')) return '📊'
    if (factorLower.includes('geography') || factorLower.includes('location')) return '🌍'
    if (factorLower.includes('tenure') || factorLower.includes('time')) return '⏰'
    if (factorLower.includes('product') || factorLower.includes('service')) return '📦'
    if (factorLower.includes('salary') || factorLower.includes('income')) return '💵'
    if (factorLower.includes('active') || factorLower.includes('activity')) return '🔄'
    return '📈'
  }

  // Sort factors by importance (descending)
  const sortedFactors = [...riskFactors].sort((a, b) => b.importance - a.importance)

  return (
    <div className={`bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Risk Factor Analysis
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Factors Chart */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-300">Factor Importance Rankings</h3>
            <div className="text-sm text-gray-400">Sorted by impact</div>
          </div>
          
          <div className="space-y-4">
            {sortedFactors.map((factor, index) => {
              const importance = getImportanceLevel(factor.importance)
              
              return (
                <div
                  key={factor.factor}
                  className={`group p-5 rounded-2xl border transition-all duration-500 hover:scale-[1.02] ${importance.borderColor} ${importance.bgClass}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFactorIcon(factor.factor)}</span>
                      <div>
                        <h4 className="text-white font-semibold text-lg">{factor.factor}</h4>
                        <p className="text-sm text-gray-400">Rank #{index + 1}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${importance.color}`}>
                        {(factor.importance * 100).toFixed(1)}%
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${importance.color} border ${importance.borderColor}`}>
                        {importance.level}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
                      <div 
                        className={`${importance.bg} h-4 rounded-full transition-all duration-2000 relative`}
                        style={{ width: `${animatedWidths[factor.factor] || 0}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-bold text-white">
                          {(factor.importance * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {factor.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary & Insights */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-300">Impact Analysis</h3>
          
          {/* Top 3 Factors Summary */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Top Risk Drivers
            </h4>
            
            <div className="space-y-4">
              {sortedFactors.slice(0, 3).map((factor, index) => {
                const importance = getImportanceLevel(factor.importance)
                
                return (
                  <div key={factor.factor} className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
                    <div className={`w-8 h-8 rounded-full ${importance.bg} flex items-center justify-center text-white font-bold text-sm`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{factor.factor}</div>
                      <div className={`text-sm ${importance.color}`}>
                        {(factor.importance * 100).toFixed(1)}% importance
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Impact Categories */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold text-white mb-4">Impact Categories</h4>
            
            <div className="space-y-4">
              {[
                { level: 'CRITICAL', range: '80-100%', count: sortedFactors.filter(f => f.importance >= 0.8).length, color: 'red' },
                { level: 'HIGH', range: '60-79%', count: sortedFactors.filter(f => f.importance >= 0.6 && f.importance < 0.8).length, color: 'orange' },
                { level: 'MEDIUM', range: '40-59%', count: sortedFactors.filter(f => f.importance >= 0.4 && f.importance < 0.6).length, color: 'yellow' },
                { level: 'LOW', range: '0-39%', count: sortedFactors.filter(f => f.importance < 0.4).length, color: 'green' }
              ].map((category) => (
                <div key={category.level} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${category.color}-500`}></div>
                    <div>
                      <div className={`text-${category.color}-400 font-semibold`}>{category.level}</div>
                      <div className="text-xs text-gray-400">{category.range}</div>
                    </div>
                  </div>
                  <div className={`text-${category.color}-400 font-bold`}>
                    {category.count} factors
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Strategic Recommendations
            </h4>
            
            <div className="space-y-3">
              {sortedFactors.slice(0, 2).map((factor, index) => (
                <div key={factor.factor} className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="text-sm text-blue-300">
                    <span className="font-semibold">Focus on {factor.factor}:</span> This factor shows {(factor.importance * 100).toFixed(1)}% importance in churn prediction. Consider targeted interventions to address this risk area.
                  </div>
                </div>
              ))}
              
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                <div className="text-sm text-purple-300">
                  <span className="font-semibold">Overall Strategy:</span> The top {Math.min(3, sortedFactors.length)} factors account for {(sortedFactors.slice(0, 3).reduce((sum, f) => sum + f.importance, 0) * 100).toFixed(1)}% of the churn risk model. Prioritize these areas for maximum impact.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 