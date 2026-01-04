// Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { 
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
  FiBarChart2,
  FiAlertCircle,
  FiHome,
  FiCreditCard as FiCard,
  FiTrendingUp as FiInvest,
  FiDollarSign as FiLoan,
  FiChevronRight,
  FiTrendingDown,
  FiDollarSign,
  FiSend,
  FiSettings,
  FiArrowDown,
  FiArrowUp,
  FiClock,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi'
import { useBanking } from '../contexts/BankingContext'
import { Link, Navigate } from 'react-router-dom'
import { format } from 'date-fns'
import { withProtectedRoute } from '../components/ProtectedRoute'

const Dashboard = () => {
  const { user, loading, getDashboardData, loadUser } = useBanking()
  const [refreshing, setRefreshing] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [recentTransactions, setRecentTransactions] = useState([])

  // Load dashboard data on component mount
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      const result = await getDashboardData()
      if (result.success) {
        setDashboardData(result.data)
        setRecentTransactions(result.data.recentTransactions || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    // Also refresh user data
    await loadUser()
    setRefreshing(false)
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      completed: { 
        color: 'bg-green-100 text-green-800',
        icon: <FiCheckCircle className="w-3 h-3" />
      },
      pending: { 
        color: 'bg-yellow-100 text-yellow-800',
        icon: <FiClock className="w-3 h-3" />
      },
      failed: { 
        color: 'bg-red-100 text-red-800',
        icon: <FiXCircle className="w-3 h-3" />
      },
    }
    
    const { color, icon } = config[status] || { 
      color: 'bg-gray-100 text-gray-800', 
      icon: null 
    }
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${color}`}>
        {icon}
        {status?.charAt(0)?.toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    )
  }

  // Get transaction icon
  const getTransactionIcon = (type) => {
    if (type === 'credit') {
      return <FiArrowDown className="w-4 h-4 text-green-500" />
    } else {
      return <FiArrowUp className="w-4 h-4 text-red-500" />
    }
  }

  // Calculate transactions today
  const getTransactionsToday = () => {
    if (!recentTransactions.length) return 0
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return recentTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt)
      return transactionDate >= today
    }).length
  }

  

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="animate-pulse">
                <div className="h-7 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="p-2">
                  <FiRefreshCw className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className=' bg-blue-700 py-10 md:px-4'>
        <div>
            <Link className='w-full flex justify-center gap-2' to='/'>
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FiTrendingUp className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white text-center mb-4">$SoFi</h1>
            </Link>
            <p className='text-center font-bold text-white mb-10'>Online Banking</p>
        </div>
        <div className="min-h-screen bg-gray-50 pb-20 p-4 md:p-10 rounded-t-3xl">
            {/* Top Header */}
            <div className="bg-white border-b rounded-2xl">
                <div className="md:px-6 px-4 py-4">
                <div className="flex justify-between items-center">
                    <div>
                    <h1 className="md:text-2xl text-xl font-bold text-gray-900">
                        Banking <span className="text-lg text-gray-500">.2</span>
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {getTransactionsToday()} transactions today
                    </p>
                    </div>
                    <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="md:text-3xl text-2xl font-bold text-gray-900">
                        {formatCurrency(user?.balance || 0)}
                        </p>
                        <p className="text-sm text-gray-500">
                        Account: { user?.accountNumber || '••••'}
                        </p>
                    </div>
                    <button 
                        onClick={handleRefresh}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                        disabled={refreshing}
                    >
                        <FiRefreshCw className="w-5 h-5 text-gray-600" />
                    </button>
                    </div>
                </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mt-6 md:p-6 space-y-6">
                {/* Life Insurance Card */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200">
                <div className="flex justify-between items-center">
                    <div>
                    <h3 className="text-lg font-semibold text-gray-900">Life Insurance</h3>
                    <p className="text-sm text-gray-600 mt-1">Starts at $5/mo</p>
                    </div>
                    <FiShield className="w-8 h-8 text-blue-600" />
                </div>
                <Link className="w-full block text-center mt-4 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
                    Get Protected
                </Link>
                </div>

                {/* Investing Card */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-5 border border-green-200">
                <div className="flex justify-between items-center">
                    <div>
                    <h3 className="text-lg font-semibold text-gray-900">Investing</h3>
                    <p className="text-sm text-gray-600 mt-1">Buy and sell stocks</p>
                    </div>
                    <FiTrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <button className="w-full mt-4 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-colors">
                    Start Investing
                </button>
                </div>

                {/* Relay Insights */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                    <h3 className="text-lg font-semibold text-gray-900">Relay Insights</h3>
                    <p className="text-sm text-blue-600 font-medium mt-1 flex items-center">
                        View dashboard <FiChevronRight className="w-4 h-4 ml-1" />
                    </p>
                    </div>
                    <FiBarChart2 className="w-6 h-6 text-gray-400" />
                </div>
                </div>

                {/* Metrics Grid - 2 columns */}
                <div className="grid grid-cols-2 gap-4">
                {/* Spending Card */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">SPENDING</p>
                        <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData?.stats?.totalSpent || 0)}
                        <sup className="text-sm text-gray-500 ml-1">30d</sup>
                        </p>
                        <p className={`text-xs font-medium mt-2 flex items-center ${
                        (dashboardData?.stats?.totalSpent || 0) > 1000 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                        {(dashboardData?.stats?.totalSpent || 0) > 1000 ? (
                            <>
                            <FiTrendingDown className="w-3 h-3 mr-1" />
                            Higher than average
                            </>
                        ) : (
                            <>
                            <FiTrendingUp className="w-3 h-3 mr-1" />
                            Below average
                            </>
                        )}
                        </p>
                    </div>
                    </div>
                </div>

                {/* Net Worth Card */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">NET WORTH</p>
                        <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(dashboardData?.netWorth || user?.balance || 0)}
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                        {user?.accountNumber ? 'Account: ' + user.accountNumber.slice(0, 4) + '...' : 'Loading...'}
                        </p>
                    </div>
                    <FiDollarSign className="w-5 h-5 text-gray-400 mt-1" />
                    </div>
                </div>
                </div>

                {/* Credit Score Card */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">CREDIT SCORE</p>
                    <div className="flex items-center justify-between">
                    <div>
                        <p className="text-4xl font-bold text-gray-900">
                        {dashboardData?.creditScore || 750}
                        </p>
                        <p className={`text-sm font-medium mt-2 ${
                        (dashboardData?.creditScore || 0) >= 700 
                            ? 'text-green-600' 
                            : (dashboardData?.creditScore || 0) >= 600 
                            ? 'text-yellow-600' 
                            : 'text-red-600'
                        }`}>
                        {(dashboardData?.creditScore || 0) >= 700 
                            ? 'Good' 
                            : (dashboardData?.creditScore || 0) >= 600 
                            ? 'Fair' 
                            : 'Poor'} | Updated {format(new Date(), 'MMM d')}
                        </p>
                    </div>
                    <div className="flex items-center">
                        <FiAlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
                        <span className="text-sm font-medium text-yellow-600">pts</span>
                    </div>
                    </div>
                </div>
                
                {/* Credit Alert */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex items-start">
                    <FiAlertCircle className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-yellow-800 font-medium mb-1">
                        Credit Monitoring Active
                        </p>
                        <p className="text-xs text-yellow-700">
                        {dashboardData?.creditScore && dashboardData.creditScore < 700 
                            ? 'You have opportunities to improve your credit score. Consider paying down balances.' 
                            : 'Your credit is in good shape. Keep up the good work!'}
                        </p>
                    </div>
                    </div>
                </div>
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                    <Link 
                        to="/transactions" 
                        className="text-sm text-blue-600 font-medium hover:text-blue-700"
                    >
                        View All
                    </Link>
                    </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {recentTransactions.length > 0 ? (
                    recentTransactions.slice(0, 5).map((transaction) => (
                        <div 
                        key={transaction._id || transaction.id} 
                        className="px-5 py-4 hover:bg-gray-50 transition-colors duration-150"
                        >
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mt-1 ${
                                transaction.type === 'credit' 
                                ? 'bg-green-100' 
                                : 'bg-red-100'
                            }`}>
                                {getTransactionIcon(transaction.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                <p className="font-medium text-gray-900">
                                    {transaction.description || 'Transaction'}
                                </p>
                                <p className={`font-semibold text-sm ${
                                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {transaction.type === 'credit' ? '+' : '-'}
                                    {formatCurrency(transaction.amount || 0)}
                                </p>
                                </div>
                                <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    {transaction.receiver?.name || transaction.receiver?.accountNumber 
                                    ? `To: ${transaction.receiver.name || transaction.receiver.accountNumber}` 
                                    : transaction.sender?.name 
                                    ? `From: ${transaction.sender.name}` 
                                    : 'Bank Transaction'}
                                    <span className="mx-2">•</span>
                                    {transaction.createdAt 
                                    ? format(new Date(transaction.createdAt), 'MMM d, yyyy')
                                    : 'Recently'
                                    }
                                </div>
                                {getStatusBadge(transaction.status)}
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    ))
                    ) : (
                    <div className="px-5 py-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiBarChart2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No recent transactions</p>
                        <Link 
                        to="/transfer" 
                        className="mt-3 inline-block text-blue-600 font-medium hover:text-blue-700"
                        >
                        Make your first transfer →
                        </Link>
                    </div>
                    )}
                </div>
                
                {recentTransactions.length > 0 && (
                    <Link 
                    to="/transactions" 
                    className="block w-full py-4 text-center text-blue-600 font-medium text-sm border-t border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                    >
                    View All Transactions
                    <FiChevronRight className="w-4 h-4 ml-1 inline" />
                    </Link>
                )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Link 
                    to="/transfer" 
                    className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                    >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <FiSend className="w-5 h-5 text-white" />
                        </div>
                        <div>
                        <p className="font-medium text-gray-900">Send Money</p>
                        <p className="text-xs text-gray-500">Transfer to anyone</p>
                        </div>
                    </div>
                    </Link>
                    
                    <button className="p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                        <FiTrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                        <p className="font-medium text-gray-900">Invest</p>
                        <p className="text-xs text-gray-500">Grow your money</p>
                        </div>
                    </div>
                    </button>
                    
                    <Link to='/settings' className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-left">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                        <FiShield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                        <p className="font-medium text-gray-900">Insurance</p>
                        <p className="text-xs text-gray-500">Get protected</p>
                        </div>
                    </div>
                    </Link>
                    
                    <Link 
                    to="/settings" 
                    className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                    >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center">
                        <FiSettings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                        <p className="font-medium text-gray-900">Settings</p>
                        <p className="text-xs text-gray-500">Manage account</p>
                        </div>
                    </div>
                    </Link>
                </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
                <div className="flex justify-around items-center h-20 px-2">
                {/* Home - Active */}
                <Link to='/dashboard' className="flex flex-col items-center justify-center flex-1 h-full">
                    <div className="relative">
                    <FiHome className="w-7 h-7 text-blue-600 mb-1" />
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"></div>
                    </div>
                    <span className="text-xs font-medium text-blue-600 mt-1">Home</span>
                </Link>
                
                {/* Transfer */}
                <Link to='/transfer' className="flex flex-col items-center justify-center flex-1 h-full">
                    <FiSend className="w-6 h-6 text-gray-500 mb-1" />
                    <span className="text-xs font-medium text-gray-500 mt-1">Transfer</span>
                </Link>
                
                {/* Transactions */}
                <Link to="/transactions" className="flex flex-col items-center justify-center flex-1 h-full">
                    <FiBarChart2 className="w-6 h-6 text-gray-500 mb-1" />
                    <span className="text-xs font-medium text-gray-500 mt-1">Transactions</span>
                </Link>
                
                {/* Settings */}
                <Link to='/settings' className="flex flex-col items-center justify-center flex-1 h-full">
                    <FiSettings className="w-6 h-6 text-gray-500 mb-1" />
                    <span className="text-xs font-medium text-gray-500 mt-1">Settings</span>
                </Link>
                </div>
            </div>
        </div>
    </div>
  )
}

export default withProtectedRoute(Dashboard)