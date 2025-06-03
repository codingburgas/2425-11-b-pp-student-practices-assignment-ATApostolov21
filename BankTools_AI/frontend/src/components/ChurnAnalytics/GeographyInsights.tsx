import { useState, useEffect } from 'react'

interface GeographyStats {
  [key: string]: {
    count: number
    avg_risk: number
  }
}

interface GeographyInsightsProps {
  geographyAnalysis?: GeographyStats
}

export default function GeographyInsights({ geographyAnalysis }: GeographyInsightsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredGeo, setHoveredGeo] = useState<string | null>(null)
  const [animatedHeights, setAnimatedHeights] = useState<{ [key: string]: number }>({})

  // Early return if no data
  if (!geographyAnalysis || Object.keys(geographyAnalysis).length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-xl flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Geographic Risk Analysis
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="h-6 bg-gray-700 rounded animate-pulse mb-6"></div>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="p-4 rounded-2xl border border-gray-700/50 bg-gray-800/30 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-700 rounded"></div>
                    <div>
                      <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 w-16 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-6 w-12 bg-gray-700 rounded mb-1"></div>
                    <div className="h-3 w-10 bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-700 rounded animate-pulse mb-6"></div>
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="space-y-6">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-700 rounded"></div>
                        <div className="h-4 w-16 bg-gray-700 rounded"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 w-12 bg-gray-700 rounded mb-1"></div>
                        <div className="h-3 w-8 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-700 rounded"></div>
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

    // Get max values for scaling
    const maxCount = Math.max(...Object.values(geographyAnalysis).map(geo => geo.count))
    const maxRisk = Math.max(...Object.values(geographyAnalysis).map(geo => geo.avg_risk))

    // Animate bar heights
    const duration = 2000
    const steps = 60
    const stepTime = duration / steps

    let currentStep = 0
    
    const timer = setInterval(() => {
      const progress = currentStep / steps
      const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease-out cubic
      
      const newHeights: { [key: string]: number } = {}
      Object.entries(geographyAnalysis).forEach(([geo, stats]) => {
        newHeights[`${geo}_count`] = (stats.count / maxCount) * 100 * easeProgress
        newHeights[`${geo}_risk`] = (stats.avg_risk / maxRisk) * 100 * easeProgress
      })
      
      setAnimatedHeights(newHeights)
      
      currentStep++
      if (currentStep > steps) clearInterval(timer)
    }, stepTime)

    return () => clearInterval(timer)
  }, [geographyAnalysis])

  const getGeoIcon = (geo: string) => {
    const geoLower = geo.toLowerCase()
    if (geoLower.includes('france')) return '🇫🇷'
    if (geoLower.includes('spain')) return '🇪🇸'
    if (geoLower.includes('germany')) return '🇩🇪'
    if (geoLower.includes('uk') || geoLower.includes('britain')) return '🇬🇧'
    if (geoLower.includes('italy')) return '🇮🇹'
    if (geoLower.includes('netherlands')) return '🇳🇱'
    if (geoLower.includes('belgium')) return '🇧🇪'
    return '🌍'
  }

  const getRiskColor = (risk: number) => {
    if (risk >= 0.6) return { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' }
    if (risk >= 0.3) return { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30' }
    return { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' }
  }

  const sortedGeos = Object.entries(geographyAnalysis)
    .sort(([, a], [, b]) => b.avg_risk - a.avg_risk)

  return (
    <div className={`bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Geographic Risk Analysis
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk by Geography Chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-6">Average Churn Risk by Region</h3>
          
          <div className="space-y-4">
            {sortedGeos.map(([geo, stats], index) => {
              const riskColor = getRiskColor(stats.avg_risk)
              const isHovered = hoveredGeo === geo
              
              return (
                <div
                  key={geo}
                  className={`group p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${riskColor.border} ${isHovered ? 'bg-gray-700/50 scale-105' : 'bg-gray-800/30'}`}
                  onMouseEnter={() => setHoveredGeo(geo)}
                  onMouseLeave={() => setHoveredGeo(null)}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getGeoIcon(geo)}</span>
                      <div>
                        <h4 className="text-white font-semibold text-lg">{geo}</h4>
                        <p className="text-sm text-gray-400">{stats.count.toLocaleString()} customers</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${riskColor.text}`}>
                        {(stats.avg_risk * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Avg Risk</div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`${riskColor.bg} h-3 rounded-full transition-all duration-2000 relative`}
                        style={{ width: `${animatedHeights[`${geo}_risk`] || 0}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                    
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl z-10">
                        <div className="text-xs text-gray-300 space-y-1">
                          <div>Total Customers: <span className="text-white font-semibold">{stats.count.toLocaleString()}</span></div>
                          <div>Churn Risk: <span className={`font-semibold ${riskColor.text}`}>{(stats.avg_risk * 100).toFixed(2)}%</span></div>
                          <div>Risk Level: <span className={`font-semibold ${riskColor.text}`}>
                            {stats.avg_risk >= 0.6 ? 'HIGH' : stats.avg_risk >= 0.3 ? 'MEDIUM' : 'LOW'}
                          </span></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Customer Distribution Chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-300 mb-6">Customer Distribution by Region</h3>
          
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <div className="space-y-6">
              {sortedGeos.map(([geo, stats], index) => {
                const maxCount = Math.max(...Object.values(geographyAnalysis).map(g => g.count))
                const percentage = (stats.count / Object.values(geographyAnalysis).reduce((sum, g) => sum + g.count, 0)) * 100
                
                return (
                  <div key={geo} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getGeoIcon(geo)}</span>
                        <span className="text-white font-medium">{geo}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{stats.count.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-2000"
                          style={{ width: `${animatedHeights[`${geo}_count`] || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Regional Insights */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Insights
            </h4>
            
            <div className="space-y-3">
              {(() => {
                const highestRiskGeo = sortedGeos[0]
                const lowestRiskGeo = sortedGeos[sortedGeos.length - 1]
                const largestGeo = sortedGeos.sort(([, a], [, b]) => b.count - a.count)[0]
                
                return (
                  <>
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-sm">
                        <span className="text-red-300 font-semibold">{highestRiskGeo[0]}</span>
                        <span className="text-gray-300"> has the highest churn risk at </span>
                        <span className="text-red-300 font-semibold">{(highestRiskGeo[1].avg_risk * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-sm">
                        <span className="text-green-300 font-semibold">{lowestRiskGeo[0]}</span>
                        <span className="text-gray-300"> shows the best retention with </span>
                        <span className="text-green-300 font-semibold">{(lowestRiskGeo[1].avg_risk * 100).toFixed(1)}%</span>
                        <span className="text-gray-300"> churn risk</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="text-sm">
                        <span className="text-blue-300 font-semibold">{largestGeo[0]}</span>
                        <span className="text-gray-300"> represents our largest market with </span>
                        <span className="text-blue-300 font-semibold">{largestGeo[1].count.toLocaleString()}</span>
                        <span className="text-gray-300"> customers</span>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 