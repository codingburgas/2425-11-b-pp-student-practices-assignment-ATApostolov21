import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { banking } from '../api'

// Import enhanced components from ChurnAnalytics folder
import ChurnSummaryCards from './ChurnAnalytics/ChurnSummaryCards'
import RiskDistributionChart from './ChurnAnalytics/RiskDistributionChart'
import GeographyInsights from './ChurnAnalytics/GeographyInsights'
import RiskFactorsChart from './ChurnAnalytics/RiskFactorsChart'
import CustomerDataTable from './ChurnAnalytics/CustomerDataTable'
import NavigationBar from './ChurnAnalytics/NavigationBar'

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
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ChurnAnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [analysisName, setAnalysisName] = useState('')
  const [isViewingExisting, setIsViewingExisting] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [activeSection, setActiveSection] = useState('overview')

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
        try {
          console.log('Loading analysis with ID:', id)
          const response = await banking.getChurnAnalysis(parseInt(id))
          console.log('Analysis response:', response.data)
          
          if (response.data && response.data.results) {
            // Extract the results from the nested response structure
            const analysisResults = response.data.results
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
    }
  }, [id])

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
      setResult(response.data)
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
    if (!result) return null

    switch (activeSection) {
      case 'overview':
        return (
          <div id="overview" className="space-y-8">
            <ChurnSummaryCards summary={result.summary} />
        </div>
        )
      case 'distribution':
        return (
          <div id="distribution" className="space-y-8">
            <RiskDistributionChart 
              riskDistribution={result.risk_distribution}
              totalCustomers={result.summary?.total_customers || 0}
            />
          </div>
        )
      case 'geography':
        return (
          <div id="geography" className="space-y-8">
            <GeographyInsights geographyAnalysis={result.geography_analysis} />
          </div>
        )
      case 'factors':
        return (
          <div id="factors" className="space-y-8">
            <RiskFactorsChart riskFactors={result.risk_factors} />
          </div>
        )
      case 'customers':
        return (
          <div id="customers" className="space-y-8">
            <CustomerDataTable customers={result.customer_details} />
          </div>
        )
      default:
        return (
          <div id="overview" className="space-y-8">
            <ChurnSummaryCards summary={result.summary} />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-left">
              {result && analysisName ? (
                <>
                  <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                    {analysisName}
            </h1>
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-400 mt-2">
                    Customer Churn Analysis
                  </h2>
                </>
              ) : (
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Customer Churn Analysis
                </h1>
              )}
            </div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            {result 
                ? 'Detailed analysis results and customer insights from your churn prediction model'
                : 'AI-powered insights to predict and prevent customer churn with advanced machine learning'
              }
            </p>
        </div>

        {loading ? (
          // Loading Section
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
            </div>
                <h2 className="text-2xl font-bold text-white mb-4">Loading Analysis...</h2>
                <p className="text-gray-400">Please wait while we retrieve your analysis data</p>
                
                {error && (
                  <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
                    {error}
            </div>
          )}
        </div>
                </div>
          </div>
        ) : !result ? (
          // Upload Section
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                Upload Customer Data
                </h2>
                
                <div 
                className="border-2 border-dashed border-gray-600 rounded-2xl p-10 text-center hover:border-purple-400/60 transition-all duration-500 bg-gray-800/30"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="inline-flex items-center gap-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-5 rounded-2xl font-medium cursor-pointer transition-all duration-500 hover:scale-105 transform shadow-2xl"
                  >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  Choose CSV File
                  </label>
                  
                      <p className="text-gray-400 mt-6 text-xl">or drag and drop your CSV file here</p>
                      <p className="text-gray-500 text-sm mt-3">Maximum file size: 16MB</p>
                  
                  {file && (
                  <div className="mt-8 p-6 bg-gray-700/50 rounded-2xl border border-gray-600">
                          <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                              <p className="text-white font-semibold text-lg">{file.name}</p>
                              <p className="text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              {/* Analysis Name Input */}
                  <div className="mt-8">
                    <label htmlFor="analysis-name" className="block text-white font-semibold mb-4 text-xl">
                    Analysis Name
                  </label>
                  <input
                    type="text"
                    id="analysis-name"
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                  placeholder="Enter a name for this analysis"
                  className="w-full px-6 py-4 bg-gray-800/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
                  />
                    </div>

              {error && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300">
                  {error}
                  </div>
              )}

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleUpload}
                  disabled={!file || !analysisName.trim() || uploading}
                  className="px-12 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-2xl text-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-2xl disabled:cursor-not-allowed"
                >
                  {uploading ? 'Analyzing...' : 'Start Analysis'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Results Section
          <div className="space-y-8">
            {/* Navigation Bar */}
            <NavigationBar 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />

            {/* Dynamic Content Based on Active Section */}
            {renderSection()}

            {/* Actions */}
            <div className="flex gap-4">
              <button 
                onClick={downloadReport}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] transform shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3m0 0h3m-3 0H9" />
                </svg>
                Download Report
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
                className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] transform flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 