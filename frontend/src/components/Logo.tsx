interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  showPing?: boolean
  className?: string
}

export default function Logo({ size = 'medium', showPing = true, className = '' }: LogoProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16'
  }

  const iconSizes = {
    small: 'w-5 h-5',
    medium: 'w-7 h-7',
    large: 'w-8 h-8'
  }

  const dollarSizes = {
    small: 'w-3 h-3 text-[8px]',
    medium: 'w-4 h-4 text-[10px]',
    large: 'w-5 h-5 text-xs'
  }

  const pingSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Banking AI-related logo - Circuit brain with dollar sign */}
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-all duration-300 shadow-lg hover:shadow-purple-500/30 group-hover:scale-110`}>
        <div className="relative">
          {/* Brain/circuit pattern */}
          <svg className={`${iconSizes[size]} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          {/* Dollar sign overlay */}
          <div className={`absolute -top-1 -right-1 ${dollarSizes[size]} bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center font-bold text-white`}>
            $
          </div>
        </div>
      </div>
      
      {/* Animated indicators */}
      {showPing && (
        <>
          <div className={`absolute -top-1 -right-1 ${pingSizes[size]} bg-green-400 rounded-full animate-ping`}></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400/50 rounded-full animate-pulse delay-500"></div>
        </>
      )}
    </div>
  )
} 