import React, { useState, useMemo, useEffect } from 'react'
import { useBanking } from '../contexts/BankingContext'
import { format } from 'date-fns'
import { 
  FiSearch, 
  FiFilter, 
  FiDownload, 
  FiEye, 
  FiChevronDown,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiArrowUp,
  FiArrowDown,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiHome,
  FiSend,
  FiBarChart2,
  FiSettings,
  FiFileText,
  FiPrinter,
  FiShare2
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { withProtectedRoute } from '../components/ProtectedRoute'
import { generateTransactionReceipt, downloadTransactionReceipt } from '../components/ReceiptGenerator' 

const Transactions = () => {
  const { user, loading, getTransactions, getTransactionDetails } = useBanking()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)


  const handleDownloadReceipt = async (transaction) => {
    try {
      // Show loading state
      const toast = window.toast || alert;
      
      // Try to use the detailed receipt generator first
      const result = await generateTransactionReceipt(transaction, user);
      
      if (result.success) {
        if (toast !== alert) {
          toast.success(`Receipt downloaded: ${result.filename}`);
        } else {
          alert(`Receipt downloaded: ${result.filename}`);
        }
      } else {
        // Fallback to simple receipt generator
        const fallbackResult = await downloadTransactionReceipt(transaction, user);
        if (fallbackResult.success) {
          if (toast !== alert) {
            toast.success(`Receipt downloaded: ${fallbackResult.filename}`);
          } else {
            alert(`Receipt downloaded: ${fallbackResult.filename}`);
          }
        } else {
          throw new Error(fallbackResult.error);
        }
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      const toast = window.toast || alert;
      if (toast !== alert) {
        toast.error('Failed to generate receipt. Please try again.');
      } else {
        alert('Failed to generate receipt. Please try again.');
      }
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: null },
    { value: 'completed', label: 'Completed', icon: <FiCheckCircle className="w-4 h-4 text-green-500" /> },
    { value: 'pending', label: 'Pending', icon: <FiClock className="w-4 h-4 text-yellow-500" /> },
    { value: 'failed', label: 'Failed', icon: <FiXCircle className="w-4 h-4 text-red-500" /> },
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'credit', label: 'Income' },
    { value: 'debit', label: 'Expense' },
    { value: 'transfer', label: 'Transfer' },
  ]

  // Load transactions
  useEffect(() => {
    loadTransactions()
  }, [page, filterStatus, filterType, sortBy, sortOrder])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const params = {
        page,
        limit: 20,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterType !== 'all' && { type: filterType }),
        ...(searchTerm && { search: searchTerm }),
        sortBy,
        sortOrder
      }

      const result = await getTransactions(params)

      
      if (result.success && result.data) {
        setTransactions(result.data)
        setTotalPages(result.data.totalPages || 1)
        setTotalCount(result.data.totalDocs || result.data.total || 0)
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh when filters change
  useEffect(() => {
    setPage(1)
    loadTransactions()
  }, [searchTerm, filterStatus, filterType, sortBy, sortOrder])

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Local search filter (as backup)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(t =>
        t.description?.toLowerCase().includes(term) ||
        t.receiver?.name?.toLowerCase().includes(term) ||
        t.sender?.name?.toLowerCase().includes(term) ||
        t.amount?.toString().includes(term)
      )
    }

    // Local status filter (as backup)
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus)
    }

    // Local type filter (as backup)
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType)
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch(sortBy) {
        case 'date':
          comparison = new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
          break
        case 'amount':
          comparison = b.amount - a.amount
          break
        case 'description':
          comparison = (a.description || '').localeCompare(b.description || '')
          break
      }
      
      return sortOrder === 'asc' ? -comparison : comparison
    })

    return filtered
  }, [transactions, searchTerm, filterStatus, filterType, sortBy, sortOrder])

  const getStatusBadge = (status) => {
    const config = {
      completed: { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <FiCheckCircle className="w-3 h-3" /> 
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <FiClock className="w-3 h-3" /> 
      },
      failed: { 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <FiXCircle className="w-3 h-3" /> 
      },
      cancelled: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: <FiXCircle className="w-3 h-3" /> 
      },
    }
    
    const { color, icon } = config[status] || { 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      icon: null
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
        {icon}
        {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
      </span>
    )
  }

  const getTypeIcon = (type) => {
    if (type === 'credit') {
      return <FiArrowDown className="w-4 h-4 text-green-500" />
    } else if (type === 'debit') {
      return <FiArrowUp className="w-4 h-4 text-red-500" />
    } else {
      return <FiSend className="w-4 h-4 text-blue-500" />
    }
  }

  const getTypeLabel = (type) => {
    switch(type) {
      case 'credit': return 'Income'
      case 'debit': return 'Expense'
      case 'transfer': return 'Transfer'
      default: return type?.charAt(0)?.toUpperCase() + type?.slice(1)
    }
  }

  const exportTransactions = () => {
    const exportData = filteredTransactions.map(t => ({
      Date: format(new Date(t.createdAt || t.date), 'yyyy-MM-dd HH:mm:ss'),
      Description: t.description,
      Type: getTypeLabel(t.type),
      Amount: t.amount,
      Status: t.status,
      Sender: t.sender?.name || t.sender,
      Receiver: t.receiver?.name || t.receiver,
      TransactionID: t.transactionId || t.id
    }))

    const csv = [
      Object.keys(exportData[0] || {}).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const credits = filteredTransactions.filter(t => t.type === 'credit')
    const debits = filteredTransactions.filter(t => t.type === 'debit')
    const transfers = filteredTransactions.filter(t => t.type === 'transfer')
    
    return {
      totalCount: filteredTransactions.length,
      totalCredits: credits.reduce((sum, t) => sum + (t.amount || 0), 0),
      totalDebits: debits.reduce((sum, t) => sum + (t.amount || 0), 0),
      totalTransfers: transfers.reduce((sum, t) => sum + (t.amount || 0), 0),
      averageAmount: filteredTransactions.length > 0 
        ? filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) / filteredTransactions.length 
        : 0,
      completedCount: filteredTransactions.filter(t => t.status === 'completed').length,
    }
  }, [filteredTransactions])

  const handleViewDetails = async (transaction) => {
    try {
      // Try to fetch full details from API
      if (transaction.transactionId || transaction._id) {
        const result = await getTransactionDetails(transaction.transactionId || transaction._id)
        if (result.success) {
          setSelectedTransaction(result.data)
        } else {
          setSelectedTransaction(transaction)
        }
      } else {
        setSelectedTransaction(transaction)
      }
    } catch (error) {
      console.error('Failed to fetch transaction details:', error)
      setSelectedTransaction(transaction)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-16 bg-gray-200 rounded-2xl mb-6"></div>
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
                <p className="text-gray-600 mt-2">Track and manage all your account activity</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'cards' : 'list')}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium flex items-center gap-2 transition-colors"
                >
                  <FiMenu className="w-4 h-4" />
                  {viewMode === 'list' ? 'Cards View' : 'List View'}
                </button>
                <button
                  onClick={exportTransactions}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-2 transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {/* Total Transactions */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                    <p className="text-xs text-gray-500 mt-1">transactions</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FiDollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Total Income */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Income</p>
                    <p className="text-2xl font-bold text-green-600">+{formatCurrency(summaryStats.totalCredits)}</p>
                    <p className="text-xs text-gray-500 mt-1">total credits</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiTrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Expenses</p>
                    <p className="text-2xl font-bold text-red-600">-{formatCurrency(summaryStats.totalDebits)}</p>
                    <p className="text-xs text-gray-500 mt-1">total debits</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <FiTrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Average Transaction */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(summaryStats.averageAmount)}</p>
                    <p className="text-xs text-gray-500 mt-1">per transaction</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <FiInfo className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Completed */}
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{summaryStats.completedCount}</p>
                    <p className="text-xs text-gray-500 mt-1">successful</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, amount, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <div className="relative">
                  <FiFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-11 pr-10 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {typeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>

              {/* Sort */}
              <div>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value)
                      setSortOrder('desc')
                    }}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="date">Sort by: Date</option>
                    <option value="amount">Sort by: Amount</option>
                    <option value="description">Sort by: Description</option>
                  </select>
                  <FiChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {(searchTerm || filterStatus !== 'all' || filterType !== 'all') && (
                <>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      Search: "{searchTerm}"
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="ml-1 text-blue-700 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filterStatus !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      Status: {statusOptions.find(s => s.value === filterStatus)?.label}
                      <button 
                        onClick={() => setFilterStatus('all')}
                        className="ml-1 text-blue-700 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  {filterType !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                      Type: {typeOptions.find(t => t.value === filterType)?.label}
                      <button 
                        onClick={() => setFilterType('all')}
                        className="ml-1 text-blue-700 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      setSearchTerm('')
                      setFilterStatus('all')
                      setFilterType('all')
                      setSortBy('date')
                      setSortOrder('desc')
                    }}
                    className="ml-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Transactions Display */}
          {isLoading ? (
            <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : viewMode === 'list' ? (
            /* List View */
            <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50">Date & Time</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50">Description</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50">From / To</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50">Amount</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr 
                        key={transaction._id || transaction.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetails(transaction)}
                      >
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <div className="font-medium text-gray-900">
                              {format(new Date(transaction.createdAt || transaction.date), 'MMM dd, yyyy')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(transaction.createdAt || transaction.date), 'hh:mm a')}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              transaction.type === 'credit' 
                                ? 'bg-green-100' 
                                : transaction.type === 'debit'
                                ? 'bg-red-100'
                                : 'bg-blue-100'
                            }`}>
                              {getTypeIcon(transaction.type)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{transaction.description}</div>
                              <div className="text-sm text-gray-500 capitalize">
                                {getTypeLabel(transaction.type)}
                                {transaction.category && ` • ${transaction.category}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-gray-500">From: </span>
                              <span className="font-medium">
                                {transaction?.sender?.name || transaction?.sender?.accountNumber || 'N/A'}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">To: </span>
                              <span className="font-medium">
                                {transaction?.receiver?.name || transaction?.receiver?.accountNumber || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className={`text-lg font-semibold ${
                            transaction.type === 'credit' 
                              ? 'text-green-600' 
                              : transaction.type === 'debit'
                              ? 'text-red-600'
                              : 'text-blue-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          {getStatusBadge(transaction.status)}
                        </td>
                        

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(transaction);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors"
                            >
                              <FiEye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadReceipt(transaction);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors"
                              title="Download Receipt"
                            >
                              <FiDownload className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FiSearch className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No transactions found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters to see results</p>
                </div>
              )}

              {/* Pagination */}
              {filteredTransactions.length > 0 && totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {filteredTransactions.length} of {totalCount} transactions
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-lg">{page}</span>
                    <span className="text-gray-600">of {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction._id || transaction.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetails(transaction)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        transaction.type === 'credit' 
                          ? 'bg-green-100' 
                          : transaction.type === 'debit'
                          ? 'bg-red-100'
                          : 'bg-blue-100'
                      }`}>
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {getTypeLabel(transaction.type)}
                          {transaction.category && ` • ${transaction.category}`}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className={`text-xl font-bold ${
                        transaction.type === 'credit' 
                          ? 'text-green-600' 
                          : transaction.type === 'debit'
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(transaction.createdAt || transaction.date), 'MMM dd, hh:mm a')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">From</span>
                      <span className="text-sm font-medium text-gray-900">
                        {transaction?.sender?.name || transaction?.sender?.accountNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">To</span>
                      <span className="text-sm font-medium text-gray-900">
                        {transaction?.receiver?.name || transaction?.receiver?.accountNumber || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(transaction);
                    }}
                    className="w-full py-3 text-blue-600 font-medium text-sm border-t border-gray-100 pt-4"
                  >
                    View Details
                  </button>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadReceipt(transaction);
                    }}
                    className="w-full py-2 text-green-600 font-medium text-sm hover:bg-green-50 rounded-xl flex items-center justify-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download Receipt
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Transaction Details Modal */}
          {selectedTransaction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Transaction Details</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        ID: {selectedTransaction.transactionId || selectedTransaction._id || selectedTransaction.id}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedTransaction(null)}
                      className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700"
                    >
                      <FiXCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Transaction Summary */}
                  <div className="mb-8">
                    <div className={`text-4xl font-bold text-center mb-4 ${
                      selectedTransaction.type === 'credit' 
                        ? 'text-green-600' 
                        : selectedTransaction.type === 'debit'
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}>
                      {selectedTransaction.type === 'credit' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                    </div>
                    <div className="text-center">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedTransaction.description}</h4>
                      <div className="flex items-center justify-center gap-3">
                        {getStatusBadge(selectedTransaction.status)}
                        <span className="text-sm text-gray-500 capitalize">
                          {getTypeLabel(selectedTransaction.type)}
                          {selectedTransaction.category && ` • ${selectedTransaction.category}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                        <p className="font-medium">
                          {format(new Date(selectedTransaction.createdAt || selectedTransaction.date), 'MMM dd, yyyy')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(selectedTransaction.createdAt || selectedTransaction.date), 'hh:mm a')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Transaction Type</p>
                        <p className="font-medium capitalize">{getTypeLabel(selectedTransaction.type)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">From Account</p>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="font-medium text-gray-900">
                            {selectedTransaction?.sender?.name || selectedTransaction?.sender?.accountNumber || 'N/A'}
                          </p>
                          {selectedTransaction.sender?.accountNumber && (
                            <p className="text-sm text-gray-500 mt-1">
                              Account: ••••{selectedTransaction.sender.accountNumber.slice(-4)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600 mb-2">To Account</p>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="font-medium text-gray-900">
                            {selectedTransaction?.receiver?.name || selectedTransaction?.receiver?.accountNumber || 'N/A'}
                          </p>
                          {selectedTransaction.receiver?.accountNumber && (
                            <p className="text-sm text-gray-500 mt-1">
                              Account: ••••{selectedTransaction?.receiver?.accountNumber.slice(-4)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-blue-600 mb-1">Fees</p>
                          <p className="font-medium text-blue-900">
                            {formatCurrency(selectedTransaction.fees || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-600 mb-1">Net Amount</p>
                          <p className="font-medium text-blue-900">
                            {formatCurrency(selectedTransaction.netAmount || selectedTransaction.amount)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedTransaction.description && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Description</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <p className="text-gray-900">{selectedTransaction.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-6 border-t border-gray-100">
                      <button
                        onClick={() => handleDownloadReceipt(selectedTransaction)}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl mb-4 transition-colors flex items-center justify-center gap-2"
                      >
                        <FiFileText className="w-5 h-5" />
                        Download Receipt
                      </button>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            // Print functionality
                            handleDownloadReceipt(selectedTransaction);
                            setTimeout(() => {
                              if (window.print) {
                                window.print();
                              } else {
                                alert('Print not available in this environment');
                              }
                            }, 1000);
                          }}
                          className="py-3 text-blue-600 font-medium text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiPrinter className="w-4 h-4" />
                          Print
                        </button>
                        <button
                          onClick={() => {
                            // Share functionality
                            if (navigator.share) {
                              handleDownloadReceipt(selectedTransaction).then(() => {
                                setTimeout(() => {
                                  navigator.share({
                                    title: 'Transaction Receipt',
                                    text: `Receipt for ${selectedTransaction.description} - ${selectedTransaction.type === 'credit' ? '+' : '-'}$${selectedTransaction.amount}`,
                                    url: window.location.href,
                                  });
                                }, 1500);
                              });
                            } else {
                              alert('Web Share API not supported in this browser');
                            }
                          }}
                          className="py-3 text-blue-600 font-medium text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <FiShare2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center h-20 px-2">
          {/* Home */}
          <Link to='/dashboard' className="flex flex-col items-center justify-center flex-1 h-full">
            <FiHome className="w-6 h-6 text-gray-500 mb-1" />
            <span className="text-xs font-medium text-gray-500 mt-1">Home</span>
          </Link>
          
          {/* Transfer */}
          <Link to='/transfer' className="flex flex-col items-center justify-center flex-1 h-full">
            <FiSend className="w-6 h-6 text-gray-500 mb-1" />
            <span className="text-xs font-medium text-gray-500 mt-1">Transfer</span>
          </Link>
          
          {/* Transactions - Active */}
          <Link to='/transactions' className="flex flex-col items-center justify-center flex-1 h-full">
            <div className="relative">
              <FiBarChart2 className="w-7 h-7 text-blue-600 mb-1" />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-xs font-medium text-blue-600 mt-1">Transactions</span>
          </Link>
          
          {/* Settings */}
          <Link to='/settings' className="flex flex-col items-center justify-center flex-1 h-full">
            <FiSettings className="w-6 h-6 text-gray-500 mb-1" />
            <span className="text-xs font-medium text-gray-500 mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default withProtectedRoute(Transactions) 