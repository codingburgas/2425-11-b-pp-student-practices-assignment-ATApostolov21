import { useState, useRef, useEffect } from 'react'
import type { FormEvent, ChangeEvent, DragEvent } from 'react'
import { banking } from '../api'
import type { ChurnAnalysis } from '../types'

export default function ChurnAnalysisUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ChurnAnalysis | null>(null)
  const [error, setError] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
      setResult(null)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0]
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile)
        setError('')
        setResult(null)
      } else {
        setError('Please select a CSV file')
      }
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const response = await banking.uploadChurnAnalysis(file)
      setUploadProgress(100)
      setTimeout(() => {
        setResult(response.data.results)
      }, 500)
    } catch (err) {
      setError('Failed to process churn analysis. Please check your file format and try again.')
    } finally {
      clearInterval(progressInterval)
      setIsLoading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setFile(null)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'from-red-500 to-pink-500'
      case 'medium': return 'from-yellow-500 to-orange-500'
      case 'low': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl flex items-center justify-center mr-4 animate-float">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Customer Churn Analysis
              </h1>
              <p className="text-gray-400 text-lg mt-2">AI-powered insights to predict and prevent customer churn</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Upload Customer Data</h2>
              
              {/* File Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-3xl p-8 transition-all duration-300 ${
                  isDragOver 
                    ? 'border-green-500 bg-green-500/10' 
                    : file 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 hover:border-gray-500 bg-gray-900/30'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-center">
                  {file ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{file.name}</p>
                        <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="text-red-400 hover:text-red-300 text-sm underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 ${
                        isDragOver ? 'bg-green-500/30' : 'bg-gray-700/50'
                      }`}>
                        <svg className={`w-8 h-8 transition-colors duration-300 ${
                          isDragOver ? 'text-green-400' : 'text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <label
                          htmlFor="file-upload"
                          className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Choose CSV File
                        </label>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          ref={fileInputRef}
                          accept=".csv"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </div>
                      <p className="text-gray-400 text-sm">or drag and drop your CSV file here</p>
                      <p className="text-gray-500 text-xs">Maximum file size: 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {isLoading && (
                <div className="mt-6 p-4 bg-gray-900/50 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Processing...</span>
                    <span className="text-blue-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-300">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={isLoading || !file}
                  className="group w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-2xl text-white font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Customer Data...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Analyze Churn Risk
                      <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info & Results Section */}
          <div className={`space-y-6 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            
            {/* CSV Format Guide */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">CSV Format Requirements</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-gray-300">customer_id, age, tenure, balance</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-gray-300">num_products, has_credit_card, is_active</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  <span className="text-gray-300">estimated_salary, geography, gender</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-900/50 rounded-xl">
                <p className="text-xs text-gray-400 font-mono">
                  customer_id,age,tenure,balance,num_products<br/>
                  1001,35,3,50000,2<br/>
                  1002,42,7,75000,1
                </p>
              </div>
            </div>

            {/* Analysis Results */}
            {result && (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 animate-pulse-slow">
                <h3 className="text-xl font-bold text-white mb-6">Analysis Results</h3>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-900/50 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{result.total_customers}</div>
                    <div className="text-gray-400 text-sm">Total Customers</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {((result.churn_risk_high / result.total_customers) * 100).toFixed(1)}%
                    </div>
                    <div className="text-gray-400 text-sm">Avg Churn Risk</div>
                  </div>
                </div>

                {/* Risk Distribution */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Risk Distribution</h4>
                  
                  {[
                    { label: 'High Risk', value: result.churn_risk_high, color: 'red', bgColor: 'bg-red-500/20', textColor: 'text-red-300' },
                    { label: 'Medium Risk', value: result.churn_risk_medium, color: 'yellow', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300' },
                    { label: 'Low Risk', value: result.churn_risk_low, color: 'green', bgColor: 'bg-green-500/20', textColor: 'text-green-300' }
                  ].map((risk, index) => (
                    <div key={index} className={`p-4 ${risk.bgColor} rounded-2xl`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${risk.textColor}`}>{risk.label}</span>
                        <span className={`font-bold ${risk.textColor}`}>{risk.value} customers</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${getRiskColor(risk.color.toLowerCase())} h-2 rounded-full transition-all duration-1000`}
                          style={{ width: `${(risk.value / result.total_customers) * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {((risk.value / result.total_customers) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Factors */}
                <div className="mt-6">
                  <h4 className="font-semibold text-white mb-4">Key Churn Factors</h4>
                  <div className="grid gap-2">
                    {result.key_factors.map((factor, index) => (
                      <div
                        key={index}
                        className="group flex items-center p-3 bg-gray-900/50 rounded-xl hover:bg-gray-900/70 transition-all duration-200"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <span className="text-gray-300 group-hover:text-white transition-colors duration-200">
                          {factor}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download Report Button */}
                <div className="mt-6">
                  <button className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-105">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Detailed Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 