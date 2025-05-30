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
          setAnalysisName(`Analysis from ${new Date(response.data.created_at).toLocaleDateString()}`)
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
              Customer Churn Analysis
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            AI-powered insights to predict and prevent customer churn with advanced machine learning
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-blue-400/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Customers</p>
                    <p className="text-4xl font-bold text-white mt-2">{animatedCounts.totalCustomers.toLocaleString()}</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-red-400/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Churn Rate</p>
                    <p className="text-4xl font-bold text-red-400 mt-2">{animatedCounts.churnRate}%</p>
                  </div>
                  <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-red-400/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">High Risk</p>
                    <p className="text-4xl font-bold text-red-400 mt-2">{animatedCounts.highRisk}</p>
                  </div>
                  <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-green-400/30 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Avg Risk Score</p>
                    <p className="text-4xl font-bold text-green-400 mt-2">
                      {(result.summary.avg_churn_risk * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Distribution & Geography */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                  </div>
                  Risk Distribution
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-red-300 font-medium">High Risk</span>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold text-xl">{result.risk_distribution.high.count}</p>
                      <p className="text-red-300 text-sm">{result.risk_distribution.high.percentage.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-yellow-300 font-medium">Medium Risk</span>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold text-xl">{result.risk_distribution.medium.count}</p>
                      <p className="text-yellow-300 text-sm">{result.risk_distribution.medium.percentage.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/20 hover:bg-green-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-green-300 font-medium">Low Risk</span>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-xl">{result.risk_distribution.low.count}</p>
                      <p className="text-green-300 text-sm">{result.risk_distribution.low.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Geography Analysis
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(result.geography_analysis).map(([country, stats]) => (
                    <div key={country} className="p-4 bg-gray-800/50 rounded-xl border border-gray-600/50 hover:border-cyan-400/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-cyan-300 font-semibold text-lg">{country}</h4>
                        <span className="text-gray-300 text-sm bg-gray-700/50 px-3 py-1 rounded-full">{stats.count} customers</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-600 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full h-3 transition-all duration-1000"
                            style={{ width: `${(stats.avg_risk * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-cyan-300 font-bold text-sm min-w-[3rem]">
                          {(stats.avg_risk * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
              <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02] transform">
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
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] transform"
              >
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