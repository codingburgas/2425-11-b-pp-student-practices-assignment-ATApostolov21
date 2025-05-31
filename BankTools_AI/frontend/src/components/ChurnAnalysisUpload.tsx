import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { banking } from '../api'

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
  const [analysisName, setAnalysisName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ChurnAnalysisResult | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Customer>('churn_probability')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterRisk, setFilterRisk] = useState<'all' | 'High' | 'Medium' | 'Low'>('all')
  const [animatedCounts, setAnimatedCounts] = useState({
    totalCustomers: 0,
    churnRate: 0,
    highRisk: 0
  })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isViewingExisting, setIsViewingExisting] = useState(false)

  // Load existing analysis if ID is provided
  useEffect(() => {
    if (id) {
      const loadExistingAnalysis = async () => {
        try {
          setIsLoading(true)
          const response = await banking.getChurnAnalysis(parseInt(id))
          setResult(response.data.results)
          setAnalysisName(response.data.name || `Analysis from ${new Date(response.data.created_at).toLocaleDateString()}`)
          setIsViewingExisting(true)
        } catch (error) {
          console.error('Failed to load analysis:', error)
          setError('Failed to load analysis')
        } finally {
          setIsLoading(false)
        }
      }
      loadExistingAnalysis()
    }
  }, [id])

  // Mouse tracking for parallax effects
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

  // Animate numbers on result load
  useEffect(() => {
    if (result) {
      const duration = 1500
      const steps = 60
      const interval = duration / steps

      let step = 0
      const timer = setInterval(() => {
        step++
        const progress = step / steps

        setAnimatedCounts({
          totalCustomers: Math.floor(result.summary.total_customers * progress),
          churnRate: Math.floor(result.summary.churn_rate_percentage * progress),
          highRisk: Math.floor(result.summary.high_risk_customers * progress)
        })

        if (step >= steps) {
          clearInterval(timer)
          setAnimatedCounts({
            totalCustomers: result.summary.total_customers,
            churnRate: Math.floor(result.summary.churn_rate_percentage),
            highRisk: result.summary.high_risk_customers
          })
        }
      }, interval)

      return () => clearInterval(timer)
    }
  }, [result])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile)
      setError('')
    } else {
      setError('Please drop a valid CSV file')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file')
      return
    }

    if (!analysisName.trim()) {
      setError('Please enter an analysis name')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await banking.uploadChurnAnalysis(file, analysisName.trim())
      setResult(response.data.results)
    } catch (err: any) {
      console.error('Upload error:', err)
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Failed to analyze churn data. Please check your file format and try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const filteredAndSortedCustomers = result?.customer_details
    ?.filter(customer => {
      const matchesSearch = customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.geography.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRisk = filterRisk === 'all' || customer.risk_level === filterRisk
      return matchesSearch && matchesRisk
    })
    ?.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const modifier = sortDirection === 'asc' ? 1 : -1
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * modifier
      }
      return String(aValue).localeCompare(String(bValue)) * modifier
    }) || []

  const getRiskBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  // Download report functionality
  const downloadReport = () => {
    if (!result) return

    // Create comprehensive report data
    const reportData = {
      analysisName: analysisName || `Churn Analysis - ${new Date().toLocaleDateString()}`,
      generatedDate: new Date().toLocaleString(),
      summary: result.summary,
      riskDistribution: result.risk_distribution,
      geographyAnalysis: result.geography_analysis,
      riskFactors: result.risk_factors,
      customerDetails: result.customer_details,
      modelInfo: result.model_info
    }

    // Generate CSV content for customer details
    const csvHeaders = [
      'Customer ID',
      'Customer Name', 
      'Churn Probability (%)',
      'Risk Level',
      'Geography',
      'Age',
      'Tenure (Years)',
      'Balance (€)',
      'Credit Score',
      'Number of Products',
      'Is Active',
      'Estimated Salary (€)',
      'Recommendations'
    ]

    const csvRows = result.customer_details.map(customer => [
      customer.customer_id,
      customer.customer_name,
      (customer.churn_probability * 100).toFixed(2),
      customer.risk_level,
      customer.geography,
      customer.age,
      customer.tenure,
      customer.balance,
      customer.credit_score,
      customer.num_products,
      customer.is_active ? 'Yes' : 'No',
      customer.estimated_salary,
      customer.recommendations.join('; ')
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Generate comprehensive text report
    const textReport = `
CUSTOMER CHURN ANALYSIS REPORT
${reportData.analysisName}
Generated: ${reportData.generatedDate}

═══════════════════════════════════════════════════════════════

EXECUTIVE SUMMARY
═══════════════════════════════════════════════════════════════

Total Customers Analyzed: ${result.summary.total_customers.toLocaleString()}
Average Churn Risk: ${(result.summary.avg_churn_risk * 100).toFixed(1)}%
Overall Churn Rate: ${result.summary.churn_rate_percentage.toFixed(1)}%

Risk Distribution:
• High Risk: ${result.summary.high_risk_customers} customers (${result.risk_distribution.high.percentage.toFixed(1)}%)
• Medium Risk: ${result.summary.medium_risk_customers} customers (${result.risk_distribution.medium.percentage.toFixed(1)}%)
• Low Risk: ${result.summary.low_risk_customers} customers (${result.risk_distribution.low.percentage.toFixed(1)}%)

═══════════════════════════════════════════════════════════════

GEOGRAPHIC ANALYSIS
═══════════════════════════════════════════════════════════════

${Object.entries(result.geography_analysis)
  .sort(([,a], [,b]) => b.avg_risk - a.avg_risk)
  .map(([country, stats]) => 
    `${country}: ${stats.count} customers, ${(stats.avg_risk * 100).toFixed(1)}% avg risk`
  ).join('\n')}

═══════════════════════════════════════════════════════════════

KEY RISK FACTORS
═══════════════════════════════════════════════════════════════

${result.risk_factors
  .sort((a, b) => b.importance - a.importance)
  .map((factor, index) => 
    `${index + 1}. ${factor.factor} (${(factor.importance * 100).toFixed(1)}% importance)
   ${factor.description}`
  ).join('\n\n')}

═══════════════════════════════════════════════════════════════

MODEL INFORMATION
═══════════════════════════════════════════════════════════════

Model Type: ${result.model_info.model_type}
Features Used: ${result.model_info.features_used}
Processing Date: ${new Date(result.model_info.processing_date).toLocaleString()}

═══════════════════════════════════════════════════════════════

RECOMMENDATIONS
═══════════════════════════════════════════════════════════════

Based on the analysis, we recommend:

1. IMMEDIATE ACTIONS (High Risk Customers):
   • Focus retention efforts on ${result.summary.high_risk_customers} high-risk customers
   • Implement personalized offers and engagement campaigns
   • Assign dedicated relationship managers for top-tier customers

2. MONITORING (Medium Risk Customers):
   • Monitor ${result.summary.medium_risk_customers} medium-risk customers closely
   • Implement early warning systems and proactive communication
   • Enhance customer experience and service quality

3. GEOGRAPHIC FOCUS:
   • Prioritize retention efforts in high-risk regions
   • Develop region-specific retention strategies
   • Analyze local market conditions and competition

4. PRODUCT & SERVICE IMPROVEMENTS:
   • Address key risk factors identified in the analysis
   • Enhance product offerings based on customer needs
   • Improve customer onboarding and engagement processes

═══════════════════════════════════════════════════════════════

This report was generated by BankTools AI - Advanced Customer Analytics
For more information, contact your analytics team.
`

    // Create and download the comprehensive report as a text file
    const reportBlob = new Blob([textReport], { type: 'text/plain' })
    const reportUrl = URL.createObjectURL(reportBlob)
    const reportLink = document.createElement('a')
    reportLink.href = reportUrl
    reportLink.download = `${reportData.analysisName.replace(/[^a-z0-9]/gi, '_')}_Report.txt`
    document.body.appendChild(reportLink)
    reportLink.click()
    document.body.removeChild(reportLink)
    URL.revokeObjectURL(reportUrl)

    // Create and download the customer data as CSV
    const csvBlob = new Blob([csvContent], { type: 'text/csv' })
    const csvUrl = URL.createObjectURL(csvBlob)
    const csvLink = document.createElement('a')
    csvLink.href = csvUrl
    csvLink.download = `${reportData.analysisName.replace(/[^a-z0-9]/gi, '_')}_CustomerData.csv`
    document.body.appendChild(csvLink)
    csvLink.click()
    document.body.removeChild(csvLink)
    URL.revokeObjectURL(csvUrl)

    // Show success message
    const successMessage = document.createElement('div')
    successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
    successMessage.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Report downloaded successfully!</span>
      </div>
    `
    document.body.appendChild(successMessage)
    setTimeout(() => {
      document.body.removeChild(successMessage)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Animated background elements with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`
          }}
        ></div>
        <div 
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              {isViewingExisting ? analysisName : 'Customer Churn Analysis'}
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {isViewingExisting 
              ? 'Detailed analysis results and customer insights from your churn prediction model'
              : 'AI-powered insights to predict and prevent customer churn with advanced machine learning'
            }
          </p>
        </div>

        {!result ? (
          // Upload Section
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Area */}
              <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  Upload Customer Data
                </h2>
                
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-400/50 transition-all duration-300 bg-gray-800/30"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 rounded-xl font-medium cursor-pointer transition-all duration-300 hover:scale-105 transform shadow-lg hover:shadow-purple-500/25"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Choose CSV File
                  </label>
                  
                  <p className="text-gray-400 mt-4 text-lg">or drag and drop your CSV file here</p>
                  <p className="text-gray-500 text-sm mt-2">Maximum file size: 16MB</p>
                  
                  {file && (
                    <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Name Input */}
                <div className="mt-6">
                  <label htmlFor="analysis-name" className="block text-white font-medium mb-3 text-lg">
                    Analysis Name
                  </label>
                  <input
                    type="text"
                    id="analysis-name"
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                    placeholder="Enter a name for this analysis (e.g., Q4 Customer Churn Review)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                    maxLength={100}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-gray-500 text-sm">Give your analysis a descriptive name</p>
                    <p className="text-gray-500 text-sm">{analysisName.length}/100</p>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!file || !analysisName.trim() || isLoading}
                  className="w-full mt-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 text-lg hover:scale-[1.02] transform shadow-lg"
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Analyzing Customer Data...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Start AI Analysis
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-300 font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  CSV Format Requirements
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-purple-400 font-medium mb-3 text-lg">Required Columns:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        'CreditScore', 'Geography', 'Gender', 'Age', 'Tenure',
                        'Balance', 'NumOfProducts', 'HasCrCard', 'IsActiveMember', 'EstimatedSalary'
                      ].map((col) => (
                        <div key={col} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <code className="text-purple-300 font-mono">{col}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-green-400 font-medium mb-3 text-lg">Optional Columns:</h4>
                    <div className="space-y-2">
                      {['CustomerName', 'CustomerId'].map((col) => (
                        <div key={col} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <code className="text-green-300 font-mono">{col}</code>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/50">
                    <h4 className="text-cyan-400 font-medium mb-3">Sample Format:</h4>
                    <pre className="text-sm text-gray-300 overflow-x-auto font-mono">
{`CreditScore,Geography,Gender,Age,Tenure,Balance
650,France,Female,35,5,50000
720,Germany,Male,42,8,75000
580,Spain,Female,28,2,25000`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Results Section
          <div className="space-y-8">
            {/* Enhanced Summary Cards with Cool Hover Animations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Customers Card */}
              <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-blue-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
                {/* Floating particles on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
                  <div className="absolute top-4 right-6 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-300"></div>
                  <div className="absolute bottom-6 left-4 w-1 h-1 bg-blue-300 rounded-full animate-ping delay-700"></div>
                  <div className="absolute bottom-2 right-2 w-1 h-1 bg-cyan-300 rounded-full animate-ping delay-1000"></div>
                </div>
                
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50">
                      <svg className="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-right group-hover:translate-x-1 transition-transform duration-300">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse mb-1 shadow-lg shadow-blue-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-blue-400 text-xs font-bold tracking-wider">ANALYZED</span>
                    </div>
                  </div>
                  <div className="mb-3 group-hover:translate-y-[-2px] transition-transform duration-300">
                    <p className="text-gray-400 text-sm font-medium mb-2">Total Customers</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-500">
                      {animatedCounts.totalCustomers.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-700/50 rounded-full h-2 mr-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full w-full transition-all duration-2000 shadow-lg group-hover:animate-pulse"></div>
                    </div>
                    <span className="text-xs text-blue-400 font-bold group-hover:scale-110 transition-transform duration-300">100%</span>
                  </div>
                </div>
              </div>

              {/* Churn Rate Card */}
              <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-red-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 overflow-hidden">
                {/* Floating particles on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-3 left-3 w-1 h-1 bg-red-400 rounded-full animate-ping"></div>
                  <div className="absolute top-6 right-4 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-200"></div>
                  <div className="absolute bottom-4 left-6 w-1 h-1 bg-red-300 rounded-full animate-ping delay-500"></div>
                  <div className="absolute bottom-3 right-3 w-1 h-1 bg-pink-300 rounded-full animate-ping delay-800"></div>
                </div>
                
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50">
                      <svg className="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    </div>
                    <div className="text-right group-hover:translate-x-1 transition-transform duration-300">
                      <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse mb-1 shadow-lg shadow-red-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-red-400 text-xs font-bold tracking-wider">RISK RATE</span>
                    </div>
                  </div>
                  <div className="mb-3 group-hover:translate-y-[-2px] transition-transform duration-300">
                    <p className="text-gray-400 text-sm font-medium mb-2">Churn Rate</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent group-hover:from-pink-300 group-hover:to-red-300 transition-all duration-500">
                      {animatedCounts.churnRate}%
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-700/50 rounded-full h-2 mr-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-2000 shadow-lg group-hover:animate-pulse"
                        style={{ width: `${Math.min(animatedCounts.churnRate * 2, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-red-400 font-bold group-hover:scale-110 transition-transform duration-300">
                      {animatedCounts.churnRate > 25 ? 'HIGH' : animatedCounts.churnRate > 15 ? 'MED' : 'LOW'}
                    </span>
                  </div>
                </div>
              </div>

              {/* High Risk Customers Card */}
              <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-orange-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 overflow-hidden">
                {/* Floating particles on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-2 left-4 w-1 h-1 bg-orange-400 rounded-full animate-ping"></div>
                  <div className="absolute top-5 right-3 w-1 h-1 bg-red-400 rounded-full animate-ping delay-400"></div>
                  <div className="absolute bottom-5 left-2 w-1 h-1 bg-orange-300 rounded-full animate-ping delay-600"></div>
                  <div className="absolute bottom-2 right-5 w-1 h-1 bg-red-300 rounded-full animate-ping delay-900"></div>
                </div>
                
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50">
                      <svg className="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="text-right group-hover:translate-x-1 transition-transform duration-300">
                      <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse mb-1 shadow-lg shadow-orange-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-orange-400 text-xs font-bold tracking-wider">CRITICAL</span>
                    </div>
                  </div>
                  <div className="mb-3 group-hover:translate-y-[-2px] transition-transform duration-300">
                    <p className="text-gray-400 text-sm font-medium mb-2">High Risk Customers</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent group-hover:from-red-300 group-hover:to-orange-300 transition-all duration-500">
                      {animatedCounts.highRisk}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-700/50 rounded-full h-2 mr-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-2000 shadow-lg group-hover:animate-pulse"
                        style={{ width: `${(animatedCounts.highRisk / animatedCounts.totalCustomers) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-orange-400 font-bold group-hover:scale-110 transition-transform duration-300">
                      {((animatedCounts.highRisk / animatedCounts.totalCustomers) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Average Risk Score Card */}
              <div className="group relative bg-gradient-to-br from-gray-900/80 to-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-green-400/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 overflow-hidden">
                {/* Floating particles on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-4 left-2 w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
                  <div className="absolute top-2 right-5 w-1 h-1 bg-emerald-400 rounded-full animate-ping delay-300"></div>
                  <div className="absolute bottom-3 left-5 w-1 h-1 bg-green-300 rounded-full animate-ping delay-600"></div>
                  <div className="absolute bottom-5 right-2 w-1 h-1 bg-emerald-300 rounded-full animate-ping delay-900"></div>
                </div>
                
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-green-500/30 group-hover:shadow-green-500/50">
                      <svg className="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="text-right group-hover:translate-x-1 transition-transform duration-300">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mb-1 shadow-lg shadow-green-400/50 group-hover:scale-125 transition-transform duration-300"></div>
                      <span className="text-green-400 text-xs font-bold tracking-wider">AVG SCORE</span>
                    </div>
                  </div>
                  <div className="mb-3 group-hover:translate-y-[-2px] transition-transform duration-300">
                    <p className="text-gray-400 text-sm font-medium mb-2">Average Risk Score</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-green-300 transition-all duration-500">
                      {(result.summary.avg_churn_risk * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-700/50 rounded-full h-2 mr-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-2000 shadow-lg group-hover:animate-pulse"
                        style={{ width: `${result.summary.avg_churn_risk * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-green-400 font-bold group-hover:scale-110 transition-transform duration-300">
                      {result.summary.avg_churn_risk < 0.2 ? 'GOOD' : result.summary.avg_churn_risk < 0.4 ? 'FAIR' : 'POOR'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Risk Distribution & Geography with Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Risk Distribution with Animated Donut Chart */}
              <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                  </div>
                  Risk Distribution
                </h3>
                
                {/* Animated Donut Chart */}
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-48 h-48">
                    {/* Background Circle */}
                    <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-700"
                      />
                      
                      {/* High Risk Arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${result.risk_distribution.high.percentage * 2.51} 251.2`}
                        strokeDashoffset="0"
                        className="text-red-500 transition-all duration-2000 ease-out"
                        strokeLinecap="round"
                      />
                      
                      {/* Medium Risk Arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${result.risk_distribution.medium.percentage * 2.51} 251.2`}
                        strokeDashoffset={`-${result.risk_distribution.high.percentage * 2.51}`}
                        className="text-yellow-500 transition-all duration-2000 ease-out delay-300"
                        strokeLinecap="round"
                      />
                      
                      {/* Low Risk Arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${result.risk_distribution.low.percentage * 2.51} 251.2`}
                        strokeDashoffset={`-${(result.risk_distribution.high.percentage + result.risk_distribution.medium.percentage) * 2.51}`}
                        className="text-green-500 transition-all duration-2000 ease-out delay-600"
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-white">{result.summary.total_customers}</div>
                      <div className="text-sm text-gray-400">Total Customers</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Risk Legend */}
                <div className="space-y-3">
                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-500/10 to-red-500/5 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/30"></div>
                      <span className="text-red-300 font-medium">High Risk</span>
                      <div className="px-2 py-1 bg-red-500/20 rounded-full text-xs text-red-300 font-semibold">
                        CRITICAL
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold text-xl">{result.risk_distribution.high.count}</p>
                      <p className="text-red-300 text-sm">{result.risk_distribution.high.percentage.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/30"></div>
                      <span className="text-yellow-300 font-medium">Medium Risk</span>
                      <div className="px-2 py-1 bg-yellow-500/20 rounded-full text-xs text-yellow-300 font-semibold">
                        WATCH
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold text-xl">{result.risk_distribution.medium.count}</p>
                      <p className="text-yellow-300 text-sm">{result.risk_distribution.medium.percentage.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg shadow-green-500/30"></div>
                      <span className="text-green-300 font-medium">Low Risk</span>
                      <div className="px-2 py-1 bg-green-500/20 rounded-full text-xs text-green-300 font-semibold">
                        STABLE
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-xl">{result.risk_distribution.low.count}</p>
                      <p className="text-green-300 text-sm">{result.risk_distribution.low.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Geography Analysis with Visual Charts */}
              <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Geography Analysis
                </h3>
                
                {/* Country Risk Visualization */}
                <div className="space-y-4">
                  {Object.entries(result.geography_analysis)
                    .sort(([,a], [,b]) => b.avg_risk - a.avg_risk)
                    .map(([country, stats], index) => {
                      const riskLevel = stats.avg_risk > 0.3 ? 'high' : stats.avg_risk > 0.15 ? 'medium' : 'low'
                      const riskColor = riskLevel === 'high' ? 'from-red-500 to-red-600' : 
                                       riskLevel === 'medium' ? 'from-yellow-500 to-yellow-600' : 
                                       'from-green-500 to-green-600'
                      const borderColor = riskLevel === 'high' ? 'border-red-500/30' : 
                                         riskLevel === 'medium' ? 'border-yellow-500/30' : 
                                         'border-green-500/30'
                      
                      return (
                        <div 
                          key={country} 
                          className={`group p-5 bg-gray-800/50 rounded-xl border ${borderColor} hover:border-cyan-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                          style={{ animationDelay: `${index * 200}ms` }}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${riskColor} shadow-lg`}></div>
                              <h4 className="text-cyan-300 font-semibold text-lg">{country}</h4>
                              <div className="px-3 py-1 bg-gray-700/50 rounded-full text-xs text-gray-300 font-medium">
                                {stats.count} customers
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-white">
                                {(stats.avg_risk * 100).toFixed(1)}%
                              </div>
                              <div className="text-xs text-gray-400">avg risk</div>
                            </div>
                          </div>
                          
                          {/* Enhanced Progress Bar */}
                          <div className="relative">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-600/50 rounded-full h-4 overflow-hidden">
                                <div 
                                  className={`bg-gradient-to-r ${riskColor} h-4 rounded-full transition-all duration-2000 ease-out shadow-lg`}
                                  style={{ 
                                    width: `${(stats.avg_risk * 100)}%`,
                                    animationDelay: `${index * 300 + 500}ms`
                                  }}
                                ></div>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                riskLevel === 'high' ? 'bg-red-500/20 text-red-300' :
                                riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-green-500/20 text-green-300'
                              }`}>
                                {riskLevel.toUpperCase()}
                              </div>
                            </div>
                            
                            {/* Risk Level Indicator */}
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>
                                {riskLevel === 'high' ? 'Immediate attention required' :
                                 riskLevel === 'medium' ? 'Monitor closely' :
                                 'Stable customer base'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
                
                {/* Geography Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-cyan-300 font-semibold">Geographic Insights</span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {Object.keys(result.geography_analysis).length} regions analyzed with varying risk profiles. 
                    Focus retention efforts on higher-risk markets for maximum impact.
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Factors Visualization */}
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Key Risk Factors
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.risk_factors.map((factor, index) => (
                  <div 
                    key={index}
                    className="group p-5 bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-xl border border-gray-600/50 hover:border-indigo-400/50 transition-all duration-300 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold">{factor.factor}</h4>
                      <div className="text-indigo-400 font-bold text-lg">
                        {(factor.importance * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    {/* Importance Bar */}
                    <div className="mb-3">
                      <div className="bg-gray-600/50 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-2000 ease-out"
                          style={{ 
                            width: `${factor.importance * 100}%`,
                            animationDelay: `${index * 200 + 800}ms`
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm">{factor.description}</p>
                    
                    {/* Impact Level */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        factor.importance > 0.2 ? 'bg-red-500' :
                        factor.importance > 0.15 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></div>
                      <span className="text-xs text-gray-400 font-medium">
                        {factor.importance > 0.2 ? 'High Impact' :
                         factor.importance > 0.15 ? 'Medium Impact' :
                         'Low Impact'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Table */}
            <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  Customer Risk Analysis
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  />
                  
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value as any)}
                    className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-colors"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="High">High Risk</option>
                    <option value="Medium">Medium Risk</option>
                    <option value="Low">Low Risk</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th 
                        className="text-left py-4 px-4 text-gray-300 font-medium cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => handleSort('customer_name')}
                      >
                        Customer {sortField === 'customer_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-left py-4 px-4 text-gray-300 font-medium cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => handleSort('churn_probability')}
                      >
                        Risk Score {sortField === 'churn_probability' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-left py-4 px-4 text-gray-300 font-medium cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => handleSort('tenure')}
                      >
                        Tenure {sortField === 'tenure' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-left py-4 px-4 text-gray-300 font-medium cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => handleSort('geography')}
                      >
                        Location {sortField === 'geography' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="text-left py-4 px-4 text-gray-300 font-medium cursor-pointer hover:text-purple-400 transition-colors"
                        onClick={() => handleSort('balance')}
                      >
                        Balance {sortField === 'balance' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="text-left py-4 px-4 text-gray-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedCustomers.slice(0, 50).map((customer) => (
                      <tr key={customer.customer_id} className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-white font-medium">{customer.customer_name}</p>
                            <p className="text-gray-400 text-sm">{customer.customer_id}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold text-lg">
                              {(customer.churn_probability * 100).toFixed(1)}%
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskBadgeClass(customer.risk_level)}`}>
                              {customer.risk_level}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300">{customer.tenure} yrs</td>
                        <td className="py-4 px-4 text-gray-300">{customer.geography}</td>
                        <td className="py-4 px-4 text-gray-300">€{customer.balance.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {customer.risk_level === 'High' && (
                              <button className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-lg text-xs hover:bg-orange-500/30 transition-colors">
                                💬 Offer
                              </button>
                            )}
                            <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs hover:bg-blue-500/30 transition-colors">
                              🔔 Flag
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAndSortedCustomers.length > 50 && (
                <div className="mt-4 text-center text-gray-400">
                  Showing top 50 of {filteredAndSortedCustomers.length} customers
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={downloadReport}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] transform shadow-lg hover:shadow-purple-500/25 group"
              >
                <svg className="w-6 h-6 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3m0 0h3m-3 0H9" />
                </svg>
                <span className="group-hover:tracking-wide transition-all duration-300">Download Complete Report</span>
                <div className="w-2 h-2 bg-white/30 rounded-full group-hover:animate-ping"></div>
              </button>
              
              <button 
                onClick={() => {
                  setResult(null)
                  setFile(null)
                  setError('')
                  setAnalysisName('')
                  setIsViewingExisting(false)
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] transform flex items-center justify-center gap-3 group"
              >
                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                New Analysis
              </button>
            </div>

            {/* Model Info */}
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-600/50">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Model: {result.model_info.model_type}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Features: {result.model_info.features_used}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Processed: {new Date(result.model_info.processing_date).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 