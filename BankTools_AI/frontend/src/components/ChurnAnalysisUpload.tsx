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
    console.log('Download report clicked', { result, analysisName })
    
    if (!result) {
      console.error('No result data available for download')
      // Show error message
      const errorMessage = document.createElement('div')
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
      errorMessage.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>No analysis data available to download</span>
        </div>
      `
      document.body.appendChild(errorMessage)
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage)
        }
      }, 3000)
      return
    }

    try {
      console.log('Starting download process...')
      
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

      console.log('Report data prepared:', reportData)

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

      console.log('CSV content generated, length:', csvContent.length)

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

      console.log('Text report generated, length:', textReport.length)

      // Create filename base
      const fileNameBase = reportData.analysisName.replace(/[^a-z0-9]/gi, '_')
      console.log('Filename base:', fileNameBase)

      // Create and download the comprehensive report as a text file
      console.log('Creating text report blob...')
      const reportBlob = new Blob([textReport], { type: 'text/plain;charset=utf-8' })
      const reportUrl = URL.createObjectURL(reportBlob)
      const reportLink = document.createElement('a')
      reportLink.href = reportUrl
      reportLink.download = `${fileNameBase}_Report.txt`
      reportLink.style.display = 'none'
      document.body.appendChild(reportLink)
      console.log('Triggering text report download...')
      reportLink.click()
      document.body.removeChild(reportLink)
      URL.revokeObjectURL(reportUrl)

      // Small delay before second download
      setTimeout(() => {
        // Create and download the customer data as CSV
        console.log('Creating CSV blob...')
        const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
        const csvUrl = URL.createObjectURL(csvBlob)
        const csvLink = document.createElement('a')
        csvLink.href = csvUrl
        csvLink.download = `${fileNameBase}_CustomerData.csv`
        csvLink.style.display = 'none'
        document.body.appendChild(csvLink)
        console.log('Triggering CSV download...')
        csvLink.click()
        document.body.removeChild(csvLink)
        URL.revokeObjectURL(csvUrl)
        
        console.log('Downloads completed successfully')
      }, 500)

      // Show success message
      const successMessage = document.createElement('div')
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
      successMessage.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Report download started! Check your downloads folder.</span>
        </div>
      `
      document.body.appendChild(successMessage)
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage)
        }
      }, 4000)
      
    } catch (error) {
      console.error('Error during download:', error)
      
      // Show error message
      const errorMessage = document.createElement('div')
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
      errorMessage.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
          <span>Download failed. Please try again.</span>
        </div>
      `
      document.body.appendChild(errorMessage)
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage)
        }
      }, 3000)
    }
  }

  // Helper function to get churn reasons based on customer data
  const getChurnReasons = (customer: Customer) => {
    const reasons = []
    
    if (customer.balance < 50000) reasons.push("Low account balance")
    if (customer.tenure < 3) reasons.push("Short relationship duration")
    if (customer.age > 60) reasons.push("Retirement age concerns")
    if (customer.credit_score < 600) reasons.push("Credit score issues")
    if (customer.num_products === 1) reasons.push("Limited product usage")
    if (!customer.is_active) reasons.push("Inactive account status")
    if (customer.estimated_salary < 50000) reasons.push("Lower income bracket")
    
    return reasons.length > 0 ? reasons : ["General market factors"]
  }

  // Helper function to get retention strategies
  const getRetentionStrategy = (customer: Customer) => {
    if (customer.risk_level === 'High') {
      if (customer.balance > 100000) return "VIP retention program with dedicated manager"
      if (customer.num_products === 1) return "Cross-sell additional products with incentives"
      if (!customer.is_active) return "Re-engagement campaign with exclusive offers"
      return "Immediate personal outreach with retention offers"
    }
    
    if (customer.risk_level === 'Medium') {
      if (customer.tenure < 5) return "Loyalty program enrollment and engagement"
      if (customer.balance < 75000) return "Financial advisory services and product recommendations"
      return "Proactive communication and service enhancement"
    }
    
    return "Maintain excellent service and explore growth opportunities"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Enhanced Animated background elements with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary floating orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            animation: 'float 6s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * -0.015}px)`,
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        ></div>
        <div 
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-2000"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            animation: 'float 7s ease-in-out infinite'
          }}
        ></div>
        
        {/* Additional floating particles */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-blue-400/40 rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-green-400/30 rounded-full animate-ping delay-2000"></div>
        <div className="absolute bottom-10 right-10 w-1 h-1 bg-pink-400/40 rounded-full animate-ping delay-3000"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-5">
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
        {/* Header */}
        <div className="text-center mb-12 relative">
          {/* Floating decorative elements */}
          <div className="absolute -top-10 left-1/4 w-20 h-20 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute -top-5 right-1/4 w-16 h-16 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          
          <div className="inline-flex items-center gap-4 mb-8 relative">
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
            <h1 className="text-6xl md:text-7xl font-bold gradient-text leading-tight">
              {isViewingExisting ? analysisName : 'Customer Churn Analysis'}
            </h1>
          </div>
          
          {/* Enhanced subtitle with shimmer effect */}
          <div className="relative">
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {isViewingExisting 
                ? 'Detailed analysis results and customer insights from your churn prediction model'
                : 'AI-powered insights to predict and prevent customer churn with advanced machine learning'
              }
            </p>
            
            {/* Decorative line with animation */}
            <div className="mt-6 flex items-center justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent w-64 animate-shimmer"></div>
            </div>
          </div>
          
          {/* Floating status indicators */}
          {isViewingExisting && (
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl rounded-full border border-green-500/30 animate-pulse-glow">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                <span className="text-green-300 font-medium">Analysis Complete</span>
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping delay-500"></div>
              </div>
            </div>
          )}
        </div>

        {!result ? (
          // Enhanced Upload Section with Premium Animations
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Upload Area */}
              <div className="group relative bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                
                {/* Floating particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-6 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-300"></div>
                  <div className="absolute bottom-6 left-8 w-1 h-1 bg-pink-400 rounded-full animate-ping delay-600"></div>
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
                    className="relative border-2 border-dashed border-gray-600 rounded-2xl p-10 text-center hover:border-purple-400/60 transition-all duration-500 bg-gradient-to-br from-gray-800/30 to-gray-900/30 group-hover:from-purple-500/10 group-hover:to-blue-500/10 overflow-hidden"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 animate-pulse"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="w-24 h-24 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl">
                        <svg className="w-12 h-12 text-gray-400 group-hover:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="group/btn inline-flex items-center gap-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-10 py-5 rounded-2xl font-medium cursor-pointer transition-all duration-500 hover:scale-105 transform shadow-2xl hover:shadow-purple-500/30 relative overflow-hidden"
                  >
                        {/* Button shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                        
                        <svg className="w-7 h-7 group-hover/btn:animate-bounce relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                        <span className="relative z-10 text-lg">Choose CSV File</span>
                  </label>
                  
                      <p className="text-gray-400 mt-6 text-xl">or drag and drop your CSV file here</p>
                      <p className="text-gray-500 text-sm mt-3">Maximum file size: 16MB</p>
                  
                  {file && (
                        <div className="mt-8 p-6 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-2xl border border-gray-600 backdrop-blur-sm animate-fade-in">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-green-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                </div>

                  {/* Enhanced Analysis Name Input */}
                  <div className="mt-8">
                    <label htmlFor="analysis-name" className="block text-white font-semibold mb-4 text-xl">
                    Analysis Name
                  </label>
                    <div className="relative">
                  <input
                    type="text"
                    id="analysis-name"
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                    placeholder="Enter a name for this analysis (e.g., Q4 Customer Churn Review)"
                        className="w-full px-6 py-4 bg-gray-800/50 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 text-lg backdrop-blur-sm"
                    maxLength={100}
                  />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-gray-500">Give your analysis a descriptive name</p>
                      <p className="text-gray-500">{analysisName.length}/100</p>
                  </div>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!file || !analysisName.trim() || isLoading}
                    className="group/upload w-full mt-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-semibold transition-all duration-500 flex items-center justify-center gap-4 text-xl hover:scale-[1.02] transform shadow-2xl hover:shadow-green-500/30 relative overflow-hidden"
                >
                    {/* Button shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/upload:translate-x-full transition-transform duration-1000"></div>
                    
                  {isLoading ? (
                    <>
                        <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="relative z-10">Analyzing Customer Data...</span>
                    </>
                  ) : (
                    <>
                        <svg className="w-7 h-7 group-hover/upload:animate-bounce relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                        <span className="relative z-10">Start AI Analysis</span>
                    </>
                  )}
                </button>

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
              <div className="group bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
                {/* Floating particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute top-4 left-4 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-6 w-0.5 h-0.5 bg-pink-300 rounded-full animate-ping delay-200"></div>
                  <div className="absolute bottom-6 left-8 w-0.5 h-0.5 bg-purple-300 rounded-full animate-ping delay-400"></div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    </svg>
                  </div>
                  Risk Distribution
                </h3>
                
                {/* Enhanced Animated Donut Chart */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative w-56 h-56 group-hover:scale-105 transition-transform duration-500">
                    {/* Outer glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Background Circle */}
                    <svg className="w-56 h-56 transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-gray-700/50"
                      />
                      
                      {/* High Risk Arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="url(#redGradient)"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${result.risk_distribution.high.percentage * 2.2} 220`}
                        strokeDashoffset="0"
                        className="transition-all duration-3000 ease-out drop-shadow-lg"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' }}
                      />
                      
                      {/* Medium Risk Arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="url(#yellowGradient)"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${result.risk_distribution.medium.percentage * 2.2} 220`}
                        strokeDashoffset={`-${result.risk_distribution.high.percentage * 2.2}`}
                        className="transition-all duration-3000 ease-out delay-500 drop-shadow-lg"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))' }}
                      />
                      
                      {/* Low Risk Arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="url(#greenGradient)"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={`${result.risk_distribution.low.percentage * 2.2} 220`}
                        strokeDashoffset={`-${(result.risk_distribution.high.percentage + result.risk_distribution.medium.percentage) * 2.2}`}
                        className="transition-all duration-3000 ease-out delay-1000 drop-shadow-lg"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))' }}
                      />
                      
                      {/* Gradient Definitions */}
                      <defs>
                        <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                        <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#16a34a" />
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Enhanced Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                        {result.summary.total_customers.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400 font-medium">Total Customers</div>
                      <div className="mt-2 px-3 py-1 bg-purple-500/20 rounded-full">
                        <span className="text-xs text-purple-300 font-semibold">ANALYZED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Risk Legend with Animations */}
                <div className="space-y-4">
                  <div className="group/item flex items-center justify-between p-5 bg-gradient-to-r from-red-500/15 to-red-500/5 rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/40 group-hover/item:animate-pulse"></div>
                        <div className="absolute inset-0 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-20"></div>
                      </div>
                      <div>
                        <span className="text-red-300 font-semibold text-lg">High Risk</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="px-2 py-1 bg-red-500/30 rounded-full text-xs text-red-200 font-bold">
                            CRITICAL
                          </div>
                          <div className="text-xs text-red-400">Immediate Action Required</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent group-hover/item:scale-110 transition-transform duration-300">
                        {result.risk_distribution.high.count}
                      </p>
                      <p className="text-red-300 text-sm font-medium">{result.risk_distribution.high.percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>

                  <div className="group/item flex items-center justify-between p-5 bg-gradient-to-r from-yellow-500/15 to-yellow-500/5 rounded-xl border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/20">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/40 group-hover/item:animate-pulse"></div>
                        <div className="absolute inset-0 w-5 h-5 bg-yellow-500 rounded-full animate-ping opacity-20"></div>
                      </div>
                      <div>
                        <span className="text-yellow-300 font-semibold text-lg">Medium Risk</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="px-2 py-1 bg-yellow-500/30 rounded-full text-xs text-yellow-200 font-bold">
                            WATCH
                          </div>
                          <div className="text-xs text-yellow-400">Monitor Closely</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent group-hover/item:scale-110 transition-transform duration-300">
                        {result.risk_distribution.medium.count}
                      </p>
                      <p className="text-yellow-300 text-sm font-medium">{result.risk_distribution.medium.percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>

                  <div className="group/item flex items-center justify-between p-5 bg-gradient-to-r from-green-500/15 to-green-500/5 rounded-xl border border-green-500/30 hover:border-green-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg shadow-green-500/40 group-hover/item:animate-pulse"></div>
                        <div className="absolute inset-0 w-5 h-5 bg-green-500 rounded-full animate-ping opacity-20"></div>
                      </div>
                      <div>
                        <span className="text-green-300 font-semibold text-lg">Low Risk</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="px-2 py-1 bg-green-500/30 rounded-full text-xs text-green-200 font-bold">
                            STABLE
                          </div>
                          <div className="text-xs text-green-400">Retain & Grow</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent group-hover/item:scale-110 transition-transform duration-300">
                        {result.risk_distribution.low.count}
                      </p>
                      <p className="text-green-300 text-sm font-medium">{result.risk_distribution.low.percentage.toFixed(1)}% of total</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Geography Analysis with Visual Charts */}
              <div className="group bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/10">
                {/* Floating particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute top-4 right-4 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 left-6 w-0.5 h-0.5 bg-blue-300 rounded-full animate-ping delay-300"></div>
                  <div className="absolute bottom-6 right-8 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-ping delay-600"></div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Geographic Insights
                </h3>
                
                {/* Enhanced Country Risk Visualization */}
                <div className="space-y-5">
                  {Object.entries(result.geography_analysis)
                    .sort(([,a], [,b]) => b.avg_risk - a.avg_risk)
                    .map(([country, stats], index) => {
                      const riskLevel = stats.avg_risk > 0.3 ? 'high' : stats.avg_risk > 0.15 ? 'medium' : 'low'
                      const riskColor = riskLevel === 'high' ? 'from-red-500 to-red-600' : 
                                       riskLevel === 'medium' ? 'from-yellow-500 to-yellow-600' : 
                                       'from-green-500 to-green-600'
                      const borderColor = riskLevel === 'high' ? 'border-red-500/40' : 
                                         riskLevel === 'medium' ? 'border-yellow-500/40' : 
                                         'border-green-500/40'
                      const bgColor = riskLevel === 'high' ? 'from-red-500/10 to-red-500/5' : 
                                     riskLevel === 'medium' ? 'from-yellow-500/10 to-yellow-500/5' : 
                                     'from-green-500/10 to-green-500/5'
                      
                      return (
                        <div 
                          key={country} 
                          className={`group/country p-6 bg-gradient-to-r ${bgColor} rounded-xl border ${borderColor} hover:border-cyan-400/50 transition-all duration-500 hover:scale-[1.03] hover:shadow-lg transform`}
                          style={{ 
                            animationDelay: `${index * 200}ms`,
                            transform: `translateY(${index * 2}px)`
                          }}
                        >
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${riskColor} shadow-lg group-hover/country:animate-pulse`}></div>
                                <div className={`absolute inset-0 w-4 h-4 rounded-full bg-gradient-to-r ${riskColor} animate-ping opacity-30`}></div>
                              </div>
                              <div>
                                <h4 className="text-cyan-300 font-bold text-xl group-hover/country:text-cyan-200 transition-colors">{country}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="px-3 py-1 bg-gray-700/60 rounded-full text-xs text-gray-300 font-semibold">
                                    {stats.count.toLocaleString()} customers
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {((stats.count / result.summary.total_customers) * 100).toFixed(1)}% of total
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover/country:scale-110 transition-transform duration-300">
                                {(stats.avg_risk * 100).toFixed(1)}%
                              </div>
                              <div className="text-sm text-gray-400 font-medium">avg risk</div>
                            </div>
                          </div>
                          
                          {/* Enhanced Progress Bar with Animation */}
                          <div className="relative mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex-1 bg-gray-600/40 rounded-full h-5 overflow-hidden shadow-inner">
                                <div 
                                  className={`bg-gradient-to-r ${riskColor} h-5 rounded-full transition-all duration-3000 ease-out shadow-lg relative overflow-hidden`}
                                  style={{ 
                                    width: `${Math.max(stats.avg_risk * 100, 5)}%`,
                                    animationDelay: `${index * 300 + 800}ms`
                                  }}
                                >
                                  {/* Shimmer effect */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                </div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                                riskLevel === 'high' ? 'bg-red-500/30 text-red-200 border border-red-500/50' :
                                riskLevel === 'medium' ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-500/50' :
                                'bg-green-500/30 text-green-200 border border-green-500/50'
                              }`}>
                                {riskLevel.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced Risk Level Indicator */}
                          <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">
                                {riskLevel === 'high' ? 'Immediate attention required' :
                                 riskLevel === 'medium' ? 'Monitor closely' :
                                 'Stable customer base'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(3)].map((_, i) => (
                                <div 
                                  key={i}
                                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    i < (riskLevel === 'high' ? 3 : riskLevel === 'medium' ? 2 : 1) 
                                      ? riskLevel === 'high' ? 'bg-red-400' : riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                                      : 'bg-gray-600'
                                  }`}
                                  style={{ animationDelay: `${index * 100 + i * 100}ms` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
                
                {/* Fixed Geography Summary */}
                <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 rounded-xl border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 group-hover:shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-cyan-300 font-bold text-lg">Geographic Insights</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    <span className="font-semibold text-white">{Object.keys(result.geography_analysis).length} regions</span> analyzed with varying risk profiles. 
                    Focus retention efforts on <span className="text-red-300 font-semibold">higher-risk markets</span> for maximum impact and 
                    leverage <span className="text-green-300 font-semibold">stable regions</span> for growth opportunities.
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="text-lg font-bold text-red-300">
                        {(Math.max(...Object.values(result.geography_analysis).map(region => region.avg_risk)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Highest Risk</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="text-lg font-bold text-cyan-300">
                        {(Object.values(result.geography_analysis).reduce((sum, region) => sum + region.avg_risk, 0) / Object.keys(result.geography_analysis).length * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Average Risk</div>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div className="text-lg font-bold text-green-300">
                        {(Math.min(...Object.values(result.geography_analysis).map(region => region.avg_risk)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Lowest Risk</div>
                    </div>
                  </div>
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

            {/* Enhanced Customer Risk Analysis Table */}
            <div className="group bg-gray-900/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-500 overflow-hidden">
              {/* Floating background elements */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
              </div>

              {/* Enhanced Header */}
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <svg className="w-8 h-8 text-white group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                      Customer Risk Analysis
                    </h3>
                    <p className="text-gray-400 mt-1">Advanced insights with retention strategies</p>
                  </div>
                </div>
                
                {/* Enhanced Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 px-5 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/30 transition-all duration-300 hover:border-gray-500/70"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <select
                      value={filterRisk}
                      onChange={(e) => setFilterRisk(e.target.value as any)}
                      className="w-full sm:w-48 px-5 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-400/30 transition-all duration-300 hover:border-gray-500/70 appearance-none cursor-pointer"
                    >
                      <option value="all">All Risk Levels</option>
                      <option value="High">🔴 High Risk</option>
                      <option value="Medium">🟡 Medium Risk</option>
                      <option value="Low">🟢 Low Risk</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Statistics Bar */}
              <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="group/stat bg-gradient-to-r from-blue-500/15 to-cyan-500/15 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover/stat:animate-pulse">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-300 group-hover/stat:scale-110 transition-transform duration-300">
                        {filteredAndSortedCustomers.length}
                      </div>
                      <div className="text-xs text-blue-400 font-medium">Filtered Results</div>
                    </div>
                  </div>
                </div>

                <div className="group/stat bg-gradient-to-r from-red-500/15 to-pink-500/15 backdrop-blur-sm rounded-xl p-4 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center group-hover/stat:animate-pulse">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-300 group-hover/stat:scale-110 transition-transform duration-300">
                        {filteredAndSortedCustomers.filter(c => c.risk_level === 'High').length}
                      </div>
                      <div className="text-xs text-red-400 font-medium">High Risk</div>
                    </div>
                  </div>
                </div>

                <div className="group/stat bg-gradient-to-r from-yellow-500/15 to-orange-500/15 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center group-hover/stat:animate-pulse">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-300 group-hover/stat:scale-110 transition-transform duration-300">
                        {filteredAndSortedCustomers.filter(c => c.risk_level === 'Medium').length}
                      </div>
                      <div className="text-xs text-yellow-400 font-medium">Medium Risk</div>
                    </div>
                  </div>
                </div>

                <div className="group/stat bg-gradient-to-r from-green-500/15 to-emerald-500/15 backdrop-blur-sm rounded-xl p-4 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover/stat:animate-pulse">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-300 group-hover/stat:scale-110 transition-transform duration-300">
                        {filteredAndSortedCustomers.filter(c => c.risk_level === 'Low').length}
                      </div>
                      <div className="text-xs text-green-400 font-medium">Low Risk</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Table */}
              <div className="relative z-10 overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-800/30 backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 backdrop-blur-sm border-b border-gray-600/50">
                        <th 
                          className="text-left py-5 px-6 text-gray-300 font-semibold cursor-pointer hover:text-indigo-400 transition-all duration-300 group/header"
                          onClick={() => handleSort('customer_name')}
                        >
                          <div className="flex items-center gap-2">
                            <span>Customer</span>
                            <svg className={`w-4 h-4 transition-transform duration-300 ${sortField === 'customer_name' ? 'text-indigo-400' : 'text-gray-500'} group-hover/header:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'customer_name' && sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                            </svg>
                          </div>
                        </th>
                        <th 
                          className="text-left py-5 px-6 text-gray-300 font-semibold cursor-pointer hover:text-indigo-400 transition-all duration-300 group/header"
                          onClick={() => handleSort('churn_probability')}
                        >
                          <div className="flex items-center gap-2">
                            <span>Risk Score</span>
                            <svg className={`w-4 h-4 transition-transform duration-300 ${sortField === 'churn_probability' ? 'text-indigo-400' : 'text-gray-500'} group-hover/header:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'churn_probability' && sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                            </svg>
                          </div>
                        </th>
                        <th 
                          className="text-left py-5 px-6 text-gray-300 font-semibold cursor-pointer hover:text-indigo-400 transition-all duration-300 group/header"
                          onClick={() => handleSort('tenure')}
                        >
                          <div className="flex items-center gap-2">
                            <span>Tenure</span>
                            <svg className={`w-4 h-4 transition-transform duration-300 ${sortField === 'tenure' ? 'text-indigo-400' : 'text-gray-500'} group-hover/header:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'tenure' && sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                            </svg>
                          </div>
                        </th>
                        <th 
                          className="text-left py-5 px-6 text-gray-300 font-semibold cursor-pointer hover:text-indigo-400 transition-all duration-300 group/header"
                          onClick={() => handleSort('geography')}
                        >
                          <div className="flex items-center gap-2">
                            <span>Location</span>
                            <svg className={`w-4 h-4 transition-transform duration-300 ${sortField === 'geography' ? 'text-indigo-400' : 'text-gray-500'} group-hover/header:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'geography' && sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                            </svg>
                          </div>
                        </th>
                        <th 
                          className="text-left py-5 px-6 text-gray-300 font-semibold cursor-pointer hover:text-indigo-400 transition-all duration-300 group/header"
                          onClick={() => handleSort('balance')}
                        >
                          <div className="flex items-center gap-2">
                            <span>Balance</span>
                            <svg className={`w-4 h-4 transition-transform duration-300 ${sortField === 'balance' ? 'text-indigo-400' : 'text-gray-500'} group-hover/header:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortField === 'balance' && sortDirection === 'asc' ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                            </svg>
                          </div>
                        </th>
                        <th className="text-left py-5 px-6 text-gray-300 font-semibold">Churn Reasons</th>
                        <th className="text-left py-5 px-6 text-gray-300 font-semibold">Retention Strategy</th>
                        <th className="text-left py-5 px-6 text-gray-300 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedCustomers.slice(0, 50).map((customer, index) => (
                        <tr 
                          key={customer.customer_id} 
                          className="group/row border-b border-gray-700/30 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/30 transition-all duration-300 hover:scale-[1.01] transform"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover/row:scale-110 transition-transform duration-300">
                                <span className="text-indigo-300 font-bold text-lg">
                                  {customer.customer_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-semibold text-lg group-hover/row:text-indigo-200 transition-colors">
                                  {customer.customer_name}
                                </p>
                                <p className="text-gray-400 text-sm font-mono">{customer.customer_id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <span className="text-white font-bold text-xl mb-2 group-hover/row:scale-110 transition-transform duration-300">
                                  {(customer.churn_probability * 100).toFixed(1)}%
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-lg ${getRiskBadgeClass(customer.risk_level)} group-hover/row:scale-105 transition-transform duration-300`}>
                                    {customer.risk_level}
                                  </span>
                                  <div className="w-16 bg-gray-600/50 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-1000 ${
                                        customer.risk_level === 'High' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                        customer.risk_level === 'Medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                        'bg-gradient-to-r from-green-500 to-green-600'
                                      }`}
                                      style={{ width: `${customer.churn_probability * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-gray-300 font-medium">{customer.tenure} yrs</span>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-gray-300 font-medium">{customer.geography}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              <span className="text-gray-300 font-bold">€{customer.balance.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <div className="max-w-xs">
                              <div className="flex flex-wrap gap-1">
                                {getChurnReasons(customer).slice(0, 2).map((reason, idx) => (
                                  <span 
                                    key={idx}
                                    className="px-2 py-1 bg-red-500/20 text-red-300 rounded-md text-xs font-medium border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                  >
                                    {reason}
                                  </span>
                                ))}
                                {getChurnReasons(customer).length > 2 && (
                                  <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-md text-xs font-medium border border-gray-500/30">
                                    +{getChurnReasons(customer).length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <div className="max-w-sm">
                              <div className={`p-3 rounded-lg border text-sm font-medium ${
                                customer.risk_level === 'High' ? 'bg-orange-500/15 border-orange-500/30 text-orange-200' :
                                customer.risk_level === 'Medium' ? 'bg-blue-500/15 border-blue-500/30 text-blue-200' :
                                'bg-green-500/15 border-green-500/30 text-green-200'
                              }`}>
                                {getRetentionStrategy(customer)}
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6">
                            <div className="flex gap-2">
                              {customer.risk_level === 'High' && (
                                <button className="group/btn px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 rounded-lg text-sm font-medium hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 border border-orange-500/30 hover:border-orange-400/50 hover:scale-105 transform">
                                  <div className="flex items-center gap-2">
                                    <span>💬</span>
                                    <span className="group-hover/btn:tracking-wide transition-all duration-300">Offer</span>
                                  </div>
                                </button>
                              )}
                              <button className="group/btn px-4 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 rounded-lg text-sm font-medium hover:from-blue-500/30 hover:to-indigo-500/30 transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 hover:scale-105 transform">
                                <div className="flex items-center gap-2">
                                  <span>🔔</span>
                                  <span className="group-hover/btn:tracking-wide transition-all duration-300">Flag</span>
                                </div>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Enhanced Results Summary */}
              {filteredAndSortedCustomers.length > 50 && (
                <div className="relative z-10 mt-6 text-center">
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl border border-indigo-500/30">
                    <svg className="w-5 h-5 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-indigo-300 font-medium">
                      Showing top 50 of <span className="font-bold text-white">{filteredAndSortedCustomers.length}</span> customers
                    </span>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-ping"></div>
                  </div>
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