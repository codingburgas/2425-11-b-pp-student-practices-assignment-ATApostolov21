import { useState, useEffect } from 'react'

interface LoanTimelineProps {
  status: string
  createdAt: string
  approvalProbability: number
}

export default function LoanTimeline({ status, createdAt, approvalProbability }: LoanTimelineProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getTimelineSteps = () => {
    const steps = [
      {
        id: 1,
        title: 'Application Submitted',
        description: 'Your loan application has been received',
        status: 'completed',
        date: createdAt,
        icon: '📝'
      },
      {
        id: 2,
        title: 'AI Analysis',
        description: 'Advanced AI algorithms are analyzing your application',
        status: 'completed',
        date: createdAt,
        icon: '🤖'
      },
      {
        id: 3,
        title: 'Risk Assessment',
        description: 'Comprehensive risk evaluation completed',
        status: status === 'Pending' ? 'current' : 'completed',
        date: null,
        icon: '📊'
      },
      {
        id: 4,
        title: 'Final Review',
        description: 'Final verification and approval process',
        status: status === 'Approved' || status === 'Rejected' ? 'completed' : 
                status === 'Pending' && approvalProbability > 70 ? 'current' : 'pending',
        date: null,
        icon: '🔍'
      },
      {
        id: 5,
        title: 'Decision',
        description: status === 'Approved' ? 'Loan Approved! 🎉' :
                    status === 'Rejected' ? 'Application Declined' :
                    'Awaiting final decision',
        status: status === 'Approved' || status === 'Rejected' ? 'completed' : 'pending',
        date: status === 'Approved' || status === 'Rejected' ? createdAt : null,
        icon: status === 'Approved' ? '✅' : status === 'Rejected' ? '❌' : '⏳'
      }
    ]

    return steps
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed': return 'text-green-400 border-green-500/50 bg-green-500/20'
      case 'current': return 'text-blue-400 border-blue-500/50 bg-blue-500/20'
      case 'pending': return 'text-gray-400 border-gray-600/50 bg-gray-600/20'
      default: return 'text-gray-400 border-gray-600/50 bg-gray-600/20'
    }
  }

  const getConnectorColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed': return 'bg-green-500'
      case 'current': return 'bg-blue-500'
      default: return 'bg-gray-600'
    }
  }

  const steps = getTimelineSteps()

  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          Application Timeline
        </h2>

        <div className="relative">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex items-start">
              {/* Timeline connector */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-6 top-16 w-0.5 h-16 ${getConnectorColor(step.status)} transition-all duration-1000`}
                  style={{ 
                    animationDelay: `${index * 200}ms`,
                    opacity: step.status === 'completed' ? 1 : 0.3
                  }}
                />
              )}

              {/* Step content */}
              <div className="flex items-start w-full mb-8">
                {/* Step icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-500 ${getStatusColor(step.status)}`}>
                  <span className="text-lg">{step.icon}</span>
                </div>

                {/* Step details */}
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    {step.date && (
                      <span className="text-sm text-gray-400">{formatDate(step.date)}</span>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mt-1">{step.description}</p>
                  
                  {/* Progress indicator for current step */}
                  {step.status === 'current' && (
                    <div className="mt-3 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      <span className="text-sm text-blue-400">In Progress...</span>
                    </div>
                  )}

                  {/* Special content for specific steps */}
                  {step.id === 3 && step.status === 'completed' && (
                    <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className="text-sm text-gray-300">
                        Approval Probability: <span className={`font-bold ${
                          approvalProbability >= 70 ? 'text-green-400' :
                          approvalProbability >= 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>{approvalProbability.toFixed(1)}%</span>
                      </div>
                    </div>
                  )}

                  {step.id === 5 && status === 'Approved' && (
                    <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="text-sm text-green-300">
                        🎉 Congratulations! Your loan has been approved. You will receive further instructions via email.
                      </div>
                    </div>
                  )}

                  {step.id === 5 && status === 'Rejected' && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="text-sm text-red-300">
                        We're sorry, but your application was not approved at this time. Please review our recommendations for improvement.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estimated completion time */}
        {status === 'Pending' && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-300 font-medium">
                Estimated completion: {approvalProbability > 70 ? '1-2 business days' : '3-5 business days'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 