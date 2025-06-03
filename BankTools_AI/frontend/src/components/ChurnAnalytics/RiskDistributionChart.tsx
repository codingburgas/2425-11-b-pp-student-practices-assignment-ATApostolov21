import { useState, useEffect } from 'react'

interface RiskDistribution {
  high: { count: number; percentage: number }
  medium: { count: number; percentage: number }
  low: { count: number; percentage: number }
}

interface RiskDistributionChartProps {
  riskDistribution?: RiskDistribution
  totalCustomers: number
}

export default function RiskDistributionChart({ riskDistribution, totalCustomers }: RiskDistributionChartProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)

  // Early return if no data
  if (!riskDistribution) {
    return (
      <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/90 backdrop-blur-xl border border-gray-700/40 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 bg-gray-600 rounded-full"></div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
            Risk Distribution Analysis
          </h2>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="bg-gray-800/40 rounded-3xl p-8 animate-pulse">
            <div className="w-80 h-80 bg-gray-700/50 rounded-full mx-auto mb-4"></div>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="bg-gray-800/40 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-700/50 rounded mb-4"></div>
                <div className="h-12 bg-gray-700/50 rounded mb-4"></div>
                <div className="h-3 bg-gray-700/50 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    setIsVisible(true)

    // Simple progressive animation
    const duration = 1500
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Smooth easing function
      const eased = 1 - Math.pow(1 - progress, 2)
      setAnimationProgress(eased)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [riskDistribution])

  // Create clean pie segments
  const createPieSegment = (startAngle: number, endAngle: number, innerRadius: number = 60, outerRadius: number = 120) => {
    const centerX = 150
    const centerY = 150
    
    const startAngleRad = (startAngle - 90) * Math.PI / 180
    const endAngleRad = (endAngle - 90) * Math.PI / 180
    
    const x1 = centerX + innerRadius * Math.cos(startAngleRad)
    const y1 = centerY + innerRadius * Math.sin(startAngleRad)
    const x2 = centerX + outerRadius * Math.cos(startAngleRad)
    const y2 = centerY + outerRadius * Math.sin(startAngleRad)
    
    const x3 = centerX + outerRadius * Math.cos(endAngleRad)
    const y3 = centerY + outerRadius * Math.sin(endAngleRad)
    const x4 = centerX + innerRadius * Math.cos(endAngleRad)
    const y4 = centerY + innerRadius * Math.sin(endAngleRad)
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    
    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`
  }

  // Calculate angles with animation
  const highAngle = (riskDistribution.high.percentage / 100) * 360 * animationProgress
  const mediumAngle = (riskDistribution.medium.percentage / 100) * 360 * animationProgress
  const lowAngle = (riskDistribution.low.percentage / 100) * 360 * animationProgress

  let currentAngle = 0
  const highStart = currentAngle
  const highEnd = currentAngle + highAngle
  currentAngle = highEnd
  
  const mediumStart = currentAngle
  const mediumEnd = currentAngle + mediumAngle
  currentAngle = mediumEnd
  
  const lowStart = currentAngle
  const lowEnd = currentAngle + lowAngle

  return (
    <div className={`bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-gray-900/90 backdrop-blur-xl border border-gray-700/40 rounded-3xl p-8 shadow-2xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      {/* Enhanced Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-200 bg-clip-text text-transparent">
            Risk Distribution Analysis
          </h2>
          <p className="text-gray-400 mt-1">Customer segmentation by churn probability</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Enhanced Pie Chart */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg viewBox="0 0 300 300" className="w-80 h-80 drop-shadow-lg">
              {/* Background circle */}
              <circle
                cx="150"
                cy="150"
                r="120"
                fill="none"
                stroke="rgb(55, 65, 81)"
                strokeWidth="1"
                opacity="0.2"
              />
              
              {/* High Risk Segment */}
              {highAngle > 0 && (
                <path
                  d={createPieSegment(highStart, highEnd)}
                  fill="url(#redGradient)"
                  className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                  stroke="rgb(17, 24, 39)"
                  strokeWidth="2"
                />
              )}
              
              {/* Medium Risk Segment */}
              {mediumAngle > 0 && (
                <path
                  d={createPieSegment(mediumStart, mediumEnd)}
                  fill="url(#yellowGradient)"
                  className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                  stroke="rgb(17, 24, 39)"
                  strokeWidth="2"
                />
              )}
              
              {/* Low Risk Segment */}
              {lowAngle > 0 && (
                <path
                  d={createPieSegment(lowStart, lowEnd)}
                  fill="url(#greenGradient)"
                  className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                  stroke="rgb(17, 24, 39)"
                  strokeWidth="2"
                />
              )}

              {/* Enhanced Gradients */}
              <defs>
                <radialGradient id="redGradient" cx="0.5" cy="0.3">
                  <stop offset="0%" stopColor="rgb(254, 202, 202)" />
                  <stop offset="50%" stopColor="rgb(248, 113, 113)" />
                  <stop offset="100%" stopColor="rgb(220, 38, 38)" />
                </radialGradient>
                <radialGradient id="yellowGradient" cx="0.5" cy="0.3">
                  <stop offset="0%" stopColor="rgb(254, 240, 138)" />
                  <stop offset="50%" stopColor="rgb(251, 191, 36)" />
                  <stop offset="100%" stopColor="rgb(245, 158, 11)" />
                </radialGradient>
                <radialGradient id="greenGradient" cx="0.5" cy="0.3">
                  <stop offset="0%" stopColor="rgb(187, 247, 208)" />
                  <stop offset="50%" stopColor="rgb(34, 197, 94)" />
                  <stop offset="100%" stopColor="rgb(21, 128, 61)" />
                </radialGradient>
              </defs>
            </svg>
            
            {/* Enhanced Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center bg-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30">
                <div className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  {totalCustomers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400 font-medium">Total Customers</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
              <span className="text-sm text-gray-300 font-medium">High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
              <span className="text-sm text-gray-300 font-medium">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
              <span className="text-sm text-gray-300 font-medium">Low Risk</span>
            </div>
          </div>
        </div>

        {/* Enhanced Risk Cards */}
        <div className="space-y-6">
          {/* High Risk Card */}
          <div className="group bg-gradient-to-br from-red-900/20 via-red-800/10 to-red-900/20 rounded-2xl p-6 border border-red-500/20 hover:border-red-400/40 transition-all duration-300 hover:scale-[1.02] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">High Risk</h3>
                  <p className="text-red-300 text-sm">Immediate attention required</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-red-500/30 rounded-full text-xs text-red-200 font-bold border border-red-500/40">
                CRITICAL
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-3xl font-bold text-red-300 mb-1">
                  {Math.round(riskDistribution.high.count * animationProgress).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-300 mb-1">
                  {(riskDistribution.high.percentage * animationProgress).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">of Portfolio</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${riskDistribution.high.percentage * animationProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Medium Risk Card */}
          <div className="group bg-gradient-to-br from-yellow-900/20 via-yellow-800/10 to-yellow-900/20 rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300 hover:scale-[1.02] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Medium Risk</h3>
                  <p className="text-yellow-300 text-sm">Monitor closely</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-yellow-500/30 rounded-full text-xs text-yellow-200 font-bold border border-yellow-500/40">
                WATCH
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-3xl font-bold text-yellow-300 mb-1">
                  {Math.round(riskDistribution.medium.count * animationProgress).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300 mb-1">
                  {(riskDistribution.medium.percentage * animationProgress).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">of Portfolio</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${riskDistribution.medium.percentage * animationProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Low Risk Card */}
          <div className="group bg-gradient-to-br from-green-900/20 via-green-800/10 to-green-900/20 rounded-2xl p-6 border border-green-500/20 hover:border-green-400/40 transition-all duration-300 hover:scale-[1.02] shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Low Risk</h3>
                  <p className="text-green-300 text-sm">Stable and loyal</p>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-500/30 rounded-full text-xs text-green-200 font-bold border border-green-500/40">
                STABLE
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-3xl font-bold text-green-300 mb-1">
                  {Math.round(riskDistribution.low.count * animationProgress).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-300 mb-1">
                  {(riskDistribution.low.percentage * animationProgress).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400">of Portfolio</div>
              </div>
            </div>
            
            <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${riskDistribution.low.percentage * animationProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 