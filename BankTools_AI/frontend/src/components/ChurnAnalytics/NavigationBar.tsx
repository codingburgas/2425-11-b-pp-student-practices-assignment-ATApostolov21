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
      id: 'distribution',
      name: 'Risk Distribution',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      )
    },
    {
      id: 'geography',
      name: 'Geography',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'factors',
      name: 'Risk Factors',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'customers',
      name: 'Customer Data',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    }
  ]

  return (
    <div className={`sticky top-6 z-30 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-2 shadow-2xl">
        <nav className="flex items-center gap-2">
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