import { useState, useEffect } from 'react'

interface LoanAnalyticsChartsProps {
  loan: {
    amount: number
    purpose: string
    income: number
    employment_years: number
    credit_score: number
    status: string
    prediction: string
  }
  approvalProbability: number
}

export default function LoanAnalyticsCharts({ loan, approvalProbability }: LoanAnalyticsChartsProps) {
  const [animatedValues, setAnimatedValues] = useState({
    approvalPercentage: 0,
    creditScore: 0,
    incomeRatio: 0,
    employmentStability: 0
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        approvalPercentage: approvalProbability,
        creditScore: (loan.credit_score / 850) * 100,
        incomeRatio: Math.min((loan.income / 75000) * 100, 100),
        employmentStability: Math.min((loan.employment_years / 10) * 100, 100)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [loan, approvalProbability])

  const CircularProgress = ({ 
    percentage, 
    color, 
    size = 160, 
    strokeWidth = 12, 
    label, 
    value 
  }: {
    percentage: number
    color: string
    size?: number
    strokeWidth?: number
    label: string
    value: string
  }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-gray-700/50"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-2000 ease-out"
              style={{
                filter: `drop-shadow(0 0 8px ${color})`
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-white">{Math.round(percentage)}%</div>
            <div className="text-xs text-gray-400">{value}</div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm font-medium text-gray-300">{label}</div>
        </div>
      </div>
    )
  }

  const BarChart = ({ data, title }: { data: Array<{ label: string; value: number; color: string }>, title: string }) => {
    return (
      <div className="bg-gray-800/50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className="text-sm font-medium text-white">{item.value}%</span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-2000 ease-out"
                  style={{
                    width: `${item.value}%`,
                    backgroundColor: item.color,
                    boxShadow: `0 0 10px ${item.color}50`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Main Approval Probability Chart */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          AI Approval Analysis
        </h2>

        <div className="flex justify-center">
          <CircularProgress
            percentage={animatedValues.approvalPercentage}
            color={approvalProbability >= 70 ? '#10b981' : approvalProbability >= 40 ? '#f59e0b' : '#ef4444'}
            size={200}
            strokeWidth={16}
            label="Approval Probability"
            value={`${Math.round(approvalProbability)}%`}
          />
        </div>

        <div className="mt-8 text-center">
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-medium ${
            approvalProbability >= 70 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
            approvalProbability >= 40 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
            'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {approvalProbability >= 70 ? 'High Approval Chance' :
             approvalProbability >= 40 ? 'Moderate Approval Chance' :
             'Low Approval Chance'}
          </div>
        </div>
      </div>

      {/* Risk Factor Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Risk Factor Breakdown
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <CircularProgress
              percentage={animatedValues.creditScore}
              color="#3b82f6"
              size={120}
              strokeWidth={8}
              label="Credit Score"
              value={`${loan.credit_score}/850`}
            />
            <CircularProgress
              percentage={animatedValues.incomeRatio}
              color="#10b981"
              size={120}
              strokeWidth={8}
              label="Income Level"
              value={`$${(loan.income / 1000).toFixed(0)}k`}
            />
          </div>
        </div>

        <BarChart
          title="Qualification Metrics"
          data={[
            {
              label: 'Credit Score Impact',
              value: Math.round(animatedValues.creditScore),
              color: '#3b82f6'
            },
            {
              label: 'Income Adequacy',
              value: Math.round(animatedValues.incomeRatio),
              color: '#10b981'
            },
            {
              label: 'Employment Stability',
              value: Math.round(animatedValues.employmentStability),
              color: '#f59e0b'
            },
            {
              label: 'Debt-to-Income Ratio',
              value: Math.max(0, 100 - Math.round((loan.amount / loan.income) * 100)),
              color: '#8b5cf6'
            }
          ]}
        />
      </div>
    </div>
  )
} 