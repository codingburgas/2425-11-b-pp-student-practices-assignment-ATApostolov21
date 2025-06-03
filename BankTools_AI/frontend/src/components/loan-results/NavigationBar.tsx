import { useState, useEffect } from 'react'

interface NavigationBarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function NavigationBar({ activeSection, onSectionChange }: NavigationBarProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const sections = [
    {
      id: 'overview',
      name: 'Overview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'analysis',
      name: 'Risk Analysis',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      )
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'nextsteps',
      name: 'Next Steps',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ]

  return (
    <div className={`sticky top-6 z-30 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-2 shadow-2xl">
        <nav className="flex flex-wrap justify-center gap-2">
          {sections.map((section, index) => {
            const isActive = activeSection === section.id
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                  {section.icon}
                </div>
                
                <span className={`text-sm transition-all duration-300 ${
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                }`}>
                  {section.name}
                </span>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl ring-2 ring-blue-400/50 ring-offset-2 ring-offset-gray-900"></div>
                )}
                
                {/* Hover effect */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isActive ? 'opacity-0' : ''}`}></div>
              </button>
            )
          })}
        </nav>
        
        {/* Progress indicator */}
        <div className="mt-2 h-1 bg-gray-700/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${((sections.findIndex(s => s.id === activeSection) + 1) / sections.length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  )
} 