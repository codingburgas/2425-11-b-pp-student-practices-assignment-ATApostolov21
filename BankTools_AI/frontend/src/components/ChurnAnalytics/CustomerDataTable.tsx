import { useState, useEffect } from 'react'

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

interface CustomerDataTableProps {
  customers?: Customer[]
}

export default function CustomerDataTable({ customers }: CustomerDataTableProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [sortField, setSortField] = useState<keyof Customer>('churn_probability')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState({
    riskLevel: 'all',
    geography: 'all',
    searchTerm: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const itemsPerPage = 10

  // Early return if no data
  if (!customers || customers.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-xl flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 bg-gray-600 rounded"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Customer Risk Analysis
          </h2>
          <div className="ml-auto text-sm text-gray-400">
            Loading...
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i}>
              <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
              <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                {Array.from({ length: 6 }, (_, i) => (
                  <th key={i} className="text-left py-4 px-4">
                    <div className="h-5 w-20 bg-gray-700 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }, (_, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  {Array.from({ length: 6 }, (_, j) => (
                    <td key={j} className="py-4 px-4">
                      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
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

  // Filter and sort customers
  const filteredCustomers = customers.filter(customer => {
    const matchesRisk = filter.riskLevel === 'all' || customer.risk_level === filter.riskLevel
    const matchesGeo = filter.geography === 'all' || customer.geography === filter.geography
    const matchesSearch = filter.searchTerm === '' || 
      customer.customer_name.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
      customer.customer_id.toLowerCase().includes(filter.searchTerm.toLowerCase())
    
    return matchesRisk && matchesGeo && matchesSearch
  })

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    const modifier = sortDirection === 'asc' ? 1 : -1
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier
    }
    
    return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * modifier
  })

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCustomers = sortedCustomers.slice(startIndex, startIndex + itemsPerPage)

  // Get unique values for filters
  const uniqueGeographies = [...new Set(customers.map(c => c.geography))].sort()
  const uniqueRiskLevels = ['High', 'Medium', 'Low']

  return (
    <div className={`bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Customer Risk Analysis
        </h2>
        <div className="ml-auto text-sm text-gray-400">
          {filteredCustomers.length.toLocaleString()} customers
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Search Customers</label>
          <input
            type="text"
            placeholder="Name or ID..."
            value={filter.searchTerm}
            onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
          <select
            value={filter.riskLevel}
            onChange={(e) => setFilter({ ...filter, riskLevel: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Risk Levels</option>
            {uniqueRiskLevels.map(level => (
              <option key={level} value={level}>{level} Risk</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Geography</label>
          <select
            value={filter.geography}
            onChange={(e) => setFilter({ ...filter, geography: e.target.value })}
            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="all">All Regions</option>
            {uniqueGeographies.map(geo => (
              <option key={geo} value={geo}>{geo}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={() => {
              setFilter({ riskLevel: 'all', geography: 'all', searchTerm: '' })
              setCurrentPage(1)
            }}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th 
                className="text-left py-4 px-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('customer_name')}
              >
                <div className="flex items-center gap-2">
                  Customer
                  {sortField === 'customer_name' && (
                    <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                className="text-left py-4 px-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('churn_probability')}
              >
                <div className="flex items-center gap-2">
                  Churn Risk
                  {sortField === 'churn_probability' && (
                    <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                className="text-left py-4 px-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('geography')}
              >
                <div className="flex items-center gap-2">
                  Geography
                  {sortField === 'geography' && (
                    <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                className="text-left py-4 px-4 text-gray-300 font-semibold cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('balance')}
              >
                <div className="flex items-center gap-2">
                  Balance
                  {sortField === 'balance' && (
                    <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th className="text-left py-4 px-4 text-gray-300 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer, index) => (
                <tr 
                  key={customer.customer_id} 
                  className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-all duration-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${customer.risk_level === 'High' ? 'bg-red-500/20 text-red-300' : customer.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                        {customer.customer_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{customer.customer_name}</div>
                        <div className="text-sm text-gray-400">ID: {customer.customer_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">
                          {(customer.churn_probability * 100).toFixed(1)}%
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadgeClass(customer.risk_level)}`}>
                          {customer.risk_level}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-gray-300">
                      <div className="font-medium">{customer.geography}</div>
                      <div className="text-sm text-gray-400">Age: {customer.age}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-white font-semibold">€{customer.balance.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">Credit: {customer.credit_score}</div>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 px-4 text-center">
                  <div className="text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.239 0-4.236-.18-5.536-.509C7.797 14.09 9.094 13 10.5 13h3c1.406 0 2.703 1.09 3.964 1.491z" />
                    </svg>
                    <div className="text-lg font-medium">No customers found</div>
                    <div className="text-sm">Try adjusting your filters</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors duration-200"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg transition-colors duration-200 ${currentPage === page ? 'bg-emerald-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Customer Details</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Customer Name</div>
                  <div className="text-lg font-semibold text-white">{selectedCustomer.customer_name}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Customer ID</div>
                  <div className="text-lg font-semibold text-white">{selectedCustomer.customer_id}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Churn Probability</div>
                  <div className="text-2xl font-bold text-red-400">{(selectedCustomer.churn_probability * 100).toFixed(1)}%</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Risk Level</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getRiskBadgeClass(selectedCustomer.risk_level)}`}>
                    {selectedCustomer.risk_level}
                  </span>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Geography</div>
                  <div className="text-lg font-semibold text-white">{selectedCustomer.geography}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Balance</div>
                  <div className="text-xl font-bold text-green-400">€{selectedCustomer.balance.toLocaleString()}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Estimated Salary</div>
                  <div className="text-xl font-bold text-blue-400">€{selectedCustomer.estimated_salary.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Age</div>
                  <div className="text-lg font-semibold text-white">{selectedCustomer.age}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Tenure</div>
                  <div className="text-lg font-semibold text-white">{selectedCustomer.tenure} years</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Credit Score</div>
                  <div className="text-lg font-semibold text-white">{selectedCustomer.credit_score}</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Products</div>
                  <div className="text-lg font-semibold text-white">{selectedCustomer.num_products}</div>
                </div>
              </div>
              
              {selectedCustomer.recommendations && selectedCustomer.recommendations.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <div className="text-sm text-gray-400 mb-3">Recommendations</div>
                  <div className="space-y-2">
                    {selectedCustomer.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div>{rec}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 