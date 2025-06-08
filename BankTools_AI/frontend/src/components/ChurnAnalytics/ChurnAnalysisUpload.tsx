import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { banking } from '../../api'

// Import enhanced components from ChurnAnalytics folder
import ChurnSummaryCards from './ChurnSummaryCards'
import RiskDistributionChart from './RiskDistributionChart'
import GeographyInsights from './GeographyInsights'
import RiskFactorsChart from './RiskFactorsChart'
import CustomerDataTable from './CustomerDataTable'
import NavigationBar from './NavigationBar'

interface Customer {
  customer_id: string
  customer_name: string
  churn_probability: number
  risk_level: 'High' | 'Medium' | 'Low'
  risk_color: string
  geography: string
  age: number
  tenure: number
  balance: number
  credit_score: number
  num_products: number
  is_active: boolean
  estimated_salary: number
  recommendations: string[]
}

interface RiskDistribution {
  high: { count: number; percentage: number }
  medium: { count: number; percentage: number }
  low: { count: number; percentage: number }
}

interface GeographyStats {
  [key: string]: {
    count: number
    avg_risk: number
  }
}

interface RiskFactor {
  factor: string
  importance: number
  description: string
}

interface ChurnAnalysisResult {
  summary: {
    total_customers: number
    avg_churn_risk: number
    churn_rate_percentage: number
    high_risk_customers: number
    medium_risk_customers: number
    low_risk_customers: number
  }
  risk_distribution: RiskDistribution
  geography_analysis: GeographyStats
  risk_factors: RiskFactor[]
  customer_details: Customer[]
  model_info: {
    model_type: string
    features_used: number
    processing_date: string
  }
}

export default function ChurnAnalysisUpload() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ChurnAnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [analysisName, setAnalysisName] = useState('')
  const [isViewingExisting, setIsViewingExisting] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeSection, setActiveSection] = useState('overview')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (id) {
      const loadExistingAnalysis = async () => {
        setLoading(true)
        setError('')
        setResult(null) // Clear previous data first
        try {
          console.log('Loading analysis with ID:', id)
          const response = await banking.getChurnAnalysis(parseInt(id))
          console.log('Analysis response:', response.data)
          
          if (response.data && response.data.results) {
            // Extract the results from the nested response structure
            const analysisResults = response.data.results
            console.log('Setting result data:', analysisResults)
            setResult(analysisResults)
            setIsViewingExisting(true)
            setAnalysisName(response.data.name || `Analysis ${id}`)
          } else {
            setError('No data found for this analysis')
          }
        } catch (error: any) {
          console.error('Error loading analysis:', error)
          setError(`Failed to load analysis: ${error.response?.data?.error || error.message || 'Unknown error'}`)
        } finally {
          setLoading(false)
        }
      }
      loadExistingAnalysis()
    } else {
      // Clear data when not viewing existing analysis
      setResult(null)
      setIsViewingExisting(false)
      setAnalysisName('')
      setLoading(false)
    }
  }, [id])

  // Reset active section when result changes
  useEffect(() => {
    if (result) {
      setActiveSection('overview')
    }
  }, [result])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile)
      setError('')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!file || !analysisName.trim()) {
      setError('Please select a file and enter an analysis name')
      return
    }

    setUploading(true)
    setError('')

    try {
      const response = await banking.uploadChurnAnalysis(file, analysisName.trim())
      console.log('Upload response:', response.data)
      
      // Check if response includes analysis_id for redirect
      if (response.data && response.data.analysis_id) {
        // Redirect to the new analysis page
        console.log('Redirecting to analysis:', response.data.analysis_id)
        navigate(`/churn-analysis/${response.data.analysis_id}`)
      } else if (response.data && response.data.results) {
        // Fallback: show results on current page if no analysis_id
        console.log('Showing results on current page')
        setResult(response.data.results)
      } else {
        setError('Analysis completed but no results received')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.response?.data?.error || 'Failed to analyze data. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const downloadReport = () => {
    if (!result || !result.summary) return

    const report = `
Customer Churn Analysis Report
Generated on: ${new Date().toLocaleString()}

EXECUTIVE SUMMARY
================
Total Customers Analyzed: ${result.summary.total_customers?.toLocaleString() || 'N/A'}
Average Churn Risk: ${result.summary.avg_churn_risk ? (result.summary.avg_churn_risk * 100).toFixed(1) : 'N/A'}%
Overall Churn Rate: ${result.summary.churn_rate_percentage ? result.summary.churn_rate_percentage.toFixed(1) : 'N/A'}%

RISK DISTRIBUTION
================
• High Risk: ${result.summary.high_risk_customers || 'N/A'} customers (${result.risk_distribution?.high?.percentage ? result.risk_distribution.high.percentage.toFixed(1) : 'N/A'}%)
• Medium Risk: ${result.summary.medium_risk_customers || 'N/A'} customers (${result.risk_distribution?.medium?.percentage ? result.risk_distribution.medium.percentage.toFixed(1) : 'N/A'}%)
• Low Risk: ${result.summary.low_risk_customers || 'N/A'} customers (${result.risk_distribution?.low?.percentage ? result.risk_distribution.low.percentage.toFixed(1) : 'N/A'}%)

GEOGRAPHY ANALYSIS
==================
${result.geography_analysis ? Object.entries(result.geography_analysis)
  .map(([geo, stats]) => `${geo}: ${stats.count} customers (Avg Risk: ${(stats.avg_risk * 100).toFixed(1)}%)`)
  .join('\n') : 'No geography data available'}

KEY RISK FACTORS
===============
${result.risk_factors ? result.risk_factors
  .sort((a, b) => b.importance - a.importance)
  .map((factor, index) => `${index + 1}. ${factor.factor} (${(factor.importance * 100).toFixed(1)}% importance)
   ${factor.description}`)
  .join('\n\n') : 'No risk factor data available'}

MODEL INFORMATION
================
Model Type: ${result.model_info?.model_type || 'N/A'}
Features Used: ${result.model_info?.features_used || 'N/A'}
Processing Date: ${result.model_info?.processing_date ? new Date(result.model_info.processing_date).toLocaleString() : 'N/A'}

RECOMMENDATIONS
==============
Based on the analysis, we recommend:

HIGH PRIORITY ACTIONS:
• Focus retention efforts on ${result.summary.high_risk_customers || '0'} high-risk customers
• Implement immediate intervention strategies for customers with churn probability > 70%
• Review pricing and service offerings in high-risk geographies

MEDIUM PRIORITY ACTIONS:
• Monitor ${result.summary.medium_risk_customers || '0'} medium-risk customers closely
• Enhance customer engagement programs
• Improve service quality metrics

LOW PRIORITY ACTIONS:
• Maintain excellent service for ${result.summary.low_risk_customers || '0'} low-risk customers
• Explore upselling opportunities
• Use as reference group for best practices

For detailed customer-level data and recommendations, please refer to the interactive dashboard.
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `churn_analysis_report_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderSection = () => {
    if (!result) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg">No analysis data available</p>
        </div>
      )
    }

    console.log('Rendering section:', activeSection, 'with result:', result)

    switch (activeSection) {
      case 'overview':
        return (
          <div id="overview" className="space-y-8">
            <ChurnSummaryCards 
              key={`summary-${id || 'new'}`}
              summary={result.summary} 
            />
          </div>
        )
      case 'distribution':
        return (
          <div id="distribution" className="space-y-8">
            <RiskDistributionChart 
              key={`distribution-${id || 'new'}`}
              riskDistribution={result.risk_distribution}
              totalCustomers={result.summary?.total_customers || 0}
            />
          </div>
        )
      case 'geography':
        return (
          <div id="geography" className="space-y-8">
            <GeographyInsights 
              key={`geography-${id || 'new'}`}
              geographyAnalysis={result.geography_analysis} 
            />
          </div>
        )
      case 'factors':
        return (
          <div id="factors" className="space-y-8">
            <RiskFactorsChart 
              key={`factors-${id || 'new'}`}
              riskFactors={result.risk_factors} 
            />
          </div>
        )
      case 'customers':
        return (
          <div id="customers" className="space-y-8">
            <CustomerDataTable 
              key={`customers-${id || 'new'}`}
              customers={result.customer_details} 
            />
          </div>
        )
      default:
        return (
          <div id="overview" className="space-y-8">
            <ChurnSummaryCards 
              key={`summary-default-${id || 'new'}`}
              summary={result.summary} 
            />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 z-0">
        {/* Primary gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        
        {/* Animated gradient orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${-mousePosition.x * 0.02}px, ${-mousePosition.y * 0.02}px)`
          }}
        ></div>
        <div 
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        ></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="text-center mb-12 relative">
          {/* Floating decorative elements */}
          <div className="absolute -top-10 left-1/4 w-20 h-20 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -top-5 right-1/4 w-16 h-16 bg-gradient-to-r from-green-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          
          <div className={`inline-flex items-center gap-4 mb-8 relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Enhanced icon with glow effect */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl blur-lg opacity-50 animate-pulse-glow"></div>
              <div className="relative w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500 hover:rotate-12">
                <svg className="w-10 h-10 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            
            {/* Enhanced title with gradient animation */}
            <div className="text-left">
              {result && analysisName ? (
                <>
                  <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
                    {analysisName}
                  </h1>
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-400 mt-2">
                    Customer Churn Analysis
                  </h2>
                </>
              ) : (
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent leading-tight">
                  AI-Powered Churn Analysis
                </h1>
              )}
            </div>
          </div>
          
          {/* Enhanced subtitle with shimmer effect */}
          <div className="relative">
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {result 
                ? 'Detailed analysis results and customer insights from your churn prediction model'
                : 'AI-powered insights to predict and prevent customer churn with advanced machine learning'
              }
            </p>
            
            {/* Decorative line with animation */}
            <div className="mt-6 flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-64 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {loading ? (
          // Enhanced Loading Section
          <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-purple-500/40 transition-all duration-500 overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
              
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 gradient-text">Loading Analysis...</h2>
                <p className="text-xl text-gray-300">Please wait while we retrieve your analysis data</p>
                
                {error && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/40 rounded-2xl backdrop-blur-sm animate-fade-in">
                    <div className="flex items-center gap-4">
                      <svg className="w-7 h-7 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-300 font-medium text-lg">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : !result ? (
          // Enhanced Upload Section
          <div className={`max-w-4xl mx-auto transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
                <div className="absolute top-8 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-300"></div>
                <div className="absolute bottom-6 left-8 w-1 h-1 bg-green-400 rounded-full animate-ping delay-600"></div>
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-900"></div>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <svg className="w-6 h-6 text-purple-400 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <span className="gradient-text">Upload Customer Data</span>
                </h2>
                
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-2xl p-10 text-center hover:border-purple-400/60 transition-all duration-500 bg-gray-800/30 relative overflow-hidden group/drop"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {/* Drop zone shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent -translate-x-full group-hover/drop:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative z-10">
                    <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover/drop:bg-purple-500/20 transition-all duration-300">
                      <svg className="w-12 h-12 text-gray-400 group-hover/drop:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="group/upload inline-flex items-center gap-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-5 rounded-2xl font-medium cursor-pointer transition-all duration-500 hover:scale-105 transform shadow-2xl relative overflow-hidden"
                    >
                      {/* Button shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/upload:translate-x-full transition-transform duration-1000"></div>
                      
                      <svg className="w-7 h-7 group-hover/upload:animate-bounce relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="relative z-10">Choose CSV File</span>
                    </label>
                    
                    <p className="text-gray-400 mt-6 text-xl">or drag and drop your CSV file here</p>
                    <p className="text-gray-500 text-sm mt-3">Maximum file size: 16MB • Supported format: CSV</p>
                  
                    {file && (
                      <div className="mt-8 p-6 bg-gray-700/50 rounded-2xl border border-gray-600 hover:border-green-500/40 transition-all duration-300 animate-fade-in">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-white font-semibold text-lg">{file.name}</p>
                            <p className="text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Analysis Name Input */}
                <div className="mt-8 group/field">
                  <label htmlFor="analysis-name" className="block text-white font-semibold mb-4 text-xl">
                    Analysis Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="analysis-name"
                      value={analysisName}
                      onChange={(e) => setAnalysisName(e.target.value)}
                      placeholder="Enter a descriptive name for this analysis"
                      className="w-full px-6 py-4 bg-gray-800/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 text-lg backdrop-blur-sm group-hover/field:border-gray-500"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Give your analysis a meaningful name for easy identification</p>
                </div>

                {/* Enhanced Error Message */}
                {error && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/40 rounded-2xl backdrop-blur-sm animate-fade-in">
                    <div className="flex items-center gap-4">
                      <svg className="w-7 h-7 text-red-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-300 font-medium text-lg">{error}</p>
                    </div>
                  </div>
                )}

                {/* Enhanced Submit Button */}
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={handleUpload}
                    disabled={!file || !analysisName.trim() || uploading}
                    className="group/submit bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-5 px-12 rounded-2xl font-semibold transition-all duration-500 flex items-center justify-center gap-4 text-xl hover:scale-[1.02] transform shadow-2xl hover:shadow-purple-500/30 relative overflow-hidden"
                  >
                    {/* Button shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/submit:translate-x-full transition-transform duration-1000"></div>
                    
                    {uploading ? (
                      <>
                        <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="relative z-10">Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-7 h-7 group-hover/submit:animate-bounce relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="relative z-10">Start AI Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Enhanced Results Section
          <div className={`space-y-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Show loading overlay while data is being processed */}
            {loading && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-gray-800/90 rounded-2xl p-8 flex items-center gap-4">
                  <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-white text-lg">Loading analysis data...</span>
                </div>
              </div>
            )}

            {/* Navigation Bar */}
            <NavigationBar 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />

            {/* Dynamic Content Based on Active Section */}
            <div className={`transition-opacity duration-300 ${result ? 'opacity-100' : 'opacity-50'}`}>
              {renderSection()}
            </div>

            {/* Enhanced Actions */}
            <div className="flex gap-4">
              <button 
                onClick={downloadReport}
                className="group flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] transform shadow-lg hover:shadow-purple-500/30 relative overflow-hidden"
              >
                {/* Button shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <svg className="w-6 h-6 group-hover:animate-bounce relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3m0 0h3m-3 0H9" />
                </svg>
                <span className="relative z-10">Download Report</span>
              </button>
              
              <button 
                onClick={() => {
                  setResult(null)
                  setFile(null)
                  setError('')
                  setAnalysisName('')
                  setIsViewingExisting(false)
                  setActiveSection('overview')
                }}
                className="group bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] transform flex items-center justify-center gap-3 relative overflow-hidden"
              >
                {/* Button shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <svg className="w-5 h-5 group-hover:animate-bounce relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="relative z-10">New Analysis</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* CSS Styles for enhanced animations */}
      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes animate-pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes animate-fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-pulse-glow {
          animation: animate-pulse-glow 2s infinite;
        }
        
        .animate-fade-in {
          animation: animate-fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
} 