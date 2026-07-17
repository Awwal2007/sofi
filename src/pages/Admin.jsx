import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBanking } from '../contexts/BankingContext'
import { format } from 'date-fns'
import {
  FiUsers, FiDollarSign, FiActivity, FiTrendingUp, FiTrendingDown,
  FiSearch, FiPlus, FiCheck, FiX, FiChevronDown, FiRefreshCw,
  FiShield, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiClock,
  FiSend, FiArrowDown, FiArrowUp, FiEye, FiUser, FiBarChart2,
  FiToggleLeft, FiToggleRight, FiCalendar, FiEdit3, FiSave, FiUserPlus
} from 'react-icons/fi'
import { withProtectedRoute } from '../components/ProtectedRoute'

const CATEGORIES = ['transfer', 'deposit', 'withdrawal', 'payment', 'refund', 'fee', 'interest']

const Admin = () => {
  const navigate = useNavigate()
  const {
    user, getAdminStats, getAdminUsers, getAdminTransactions,
    updateTransactionStatus, updateUserStatus, createAdminTransaction, searchUsers,
    createAdminUser
  } = useBanking()

  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // Filters
  const [userSearch, setUserSearch] = useState('')
  const [txSearch, setTxSearch] = useState('')
  const [txStatus, setTxStatus] = useState('')
  const [txType, setTxType] = useState('')
  const [txStartDate, setTxStartDate] = useState('')
  const [txEndDate, setTxEndDate] = useState('')

  // Create Transaction state
  const [createForm, setCreateForm] = useState({
    accountNumber: '',
    type: 'credit',
    amount: '',
    description: '',
    category: 'deposit',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    status: 'completed',
    senderName: '',
    senderAccount: '',
    receiverName: '',
    receiverAccount: '',
    notes: ''
  })
  const [accountSearch, setAccountSearch] = useState('')
  const [accountResults, setAccountResults] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [createSuccess, setCreateSuccess] = useState(null)

  // Create User state
  const [createUserForm, setCreateUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    ssn: '',
    password: '',
    accountNumber: '',
    initialDeposit: '',
    accountType: 'checking',
    isAdmin: false,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  })
  const [createUserLoading, setCreateUserLoading] = useState(false)
  const [createUserSuccess, setCreateUserSuccess] = useState(null)

  // Redirect non-admins
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0)

  const loadStats = useCallback(async () => {
    const res = await getAdminStats()
    if (res.success) setStats(res.data)
  }, [getAdminStats])

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    const res = await getAdminUsers({ search: userSearch })
    if (res.success) setUsers(res.data || [])
    setIsLoading(false)
  }, [getAdminUsers, userSearch])

  const loadTransactions = useCallback(async () => {
    setIsLoading(true)
    const res = await getAdminTransactions({
      search: txSearch, status: txStatus, type: txType,
      startDate: txStartDate, endDate: txEndDate
    })
    if (res.success) setTransactions(res.data || [])
    setIsLoading(false)
  }, [getAdminTransactions, txSearch, txStatus, txType, txStartDate, txEndDate])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'create') {
      loadUsers()
    }
  }, [activeTab, loadUsers])
  useEffect(() => { if (activeTab === 'transactions') loadTransactions() }, [activeTab, loadTransactions])

  const handleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    const res = await updateUserStatus(userId, newStatus)
    if (res.success) {
      showToast(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`)
      loadUsers()
      loadStats()
    } else {
      showToast(res.message, 'error')
    }
  }

  const handleTxStatus = async (txId, newStatus) => {
    const res = await updateTransactionStatus(txId, newStatus)
    if (res.success) {
      showToast(`Transaction marked as ${newStatus}`)
      loadTransactions()
      loadStats()
    } else {
      showToast(res.message, 'error')
    }
  }

  // Handle target account selection dropdown
  const handleSelectAccountChange = (e) => {
    const accNum = e.target.value
    if (!accNum) {
      setSelectedAccount(null)
      setCreateForm(f => ({ ...f, accountNumber: '' }))
      return
    }
    const acc = users.find(u => u.accountNumber === accNum)
    if (acc) {
      setSelectedAccount(acc)
      setCreateForm(f => ({ ...f, accountNumber: acc.accountNumber }))
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    if (!createForm.accountNumber) {
      showToast('Please select a valid account', 'error')
      return
    }
    setCreateLoading(true)
    setCreateSuccess(null)
    const res = await createAdminTransaction(createForm)
    setCreateLoading(false)
    if (res.success) {
      setCreateSuccess(res)
      showToast('Transaction created successfully!')
      // Reset form
      setCreateForm({
        accountNumber: '',
        type: 'credit',
        amount: '',
        description: '',
        category: 'deposit',
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        status: 'completed',
        senderName: '',
        senderAccount: '',
        receiverName: '',
        receiverAccount: '',
        notes: ''
      })
      setSelectedAccount(null)
      setAccountSearch('')
      loadStats()
    } else {
      showToast(res.message, 'error')
    }
  }

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault()
    setCreateUserLoading(true)
    setCreateUserSuccess(null)
    
    const payload = {
      ...createUserForm,
      initialDeposit: parseFloat(createUserForm.initialDeposit) || 0
    }
    
    const res = await createAdminUser(payload)
    setCreateUserLoading(false)
    if (res.success) {
      setCreateUserSuccess(res.data)
      showToast('User account created successfully!')
      setCreateUserForm({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        ssn: '',
        password: '',
        accountNumber: '',
        initialDeposit: '',
        accountType: 'checking',
        isAdmin: false,
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        }
      })
      loadStats()
    } else {
      showToast(res.message, 'error')
    }
  }

  const getStatusBadge = (status) => {
    const map = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-700'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'create', label: 'Create Transaction', icon: FiPlus },
    { id: 'create_user', label: 'Add User', icon: FiUserPlus },
    { id: 'transactions', label: 'Transactions', icon: FiActivity },
    { id: 'users', label: 'Users', icon: FiUsers },
  ]

  // Helper function to get dynamic button colors
  const getButtonColorClass = (type, isActive) => {
    if (!isActive) return 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
    
    switch(type) {
      case 'credit': return 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
      case 'debit': return 'bg-red-500/20 border-red-500/60 text-red-300'
      case 'transfer': return 'bg-blue-500/20 border-blue-500/60 text-blue-300'
      default: return 'bg-amber-500/20 border-amber-500/60 text-amber-300'
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Toast - responsive positioning */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-5 z-50 px-4 py-3 sm:px-5 rounded-2xl shadow-2xl font-semibold flex items-center gap-2 transition-all text-sm sm:text-base
          ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.type === 'error' ? <FiAlertCircle className="flex-shrink-0" /> : <FiCheckCircle className="flex-shrink-0" />}
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      {/* Header - responsive padding */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/dashboard" className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-800 transition-colors flex-shrink-0">
              <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </Link>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <FiShield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">Admin Control Center</h1>
                <p className="text-xs text-slate-400 truncate hidden sm:block">SecureBank Management System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="text-right min-w-0">
              <p className="text-sm font-semibold text-white truncate hidden xs:block">{user?.name}</p>
              <p className="text-xs text-amber-400 truncate">Administrator</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Tabs - horizontal scroll on mobile */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-0.5 sm:gap-1 overflow-x-auto pb-px scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium rounded-t-xl whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? 'bg-slate-800 text-white border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{tab.label}</span>
              <span className="xs:hidden">{tab.id === 'overview' ? 'Overview' : tab.id === 'create' ? 'Tx' : tab.id === 'create_user' ? 'User' : tab.id === 'transactions' ? 'Txns' : 'Users'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">System Overview</h2>
                <p className="text-slate-400 text-sm sm:text-base mt-1">Live metrics across all accounts</p>
              </div>
              <button onClick={loadStats} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-sm transition-colors w-full sm:w-auto">
                <FiRefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
              {[
                { label: 'Total Accounts', value: stats?.totalUsers ?? '—', icon: FiUsers, color: 'from-blue-500 to-blue-600', sub: `${stats?.activeUsers ?? 0} active` },
                { label: 'Total Balance', value: stats ? formatCurrency(stats.totalBalance) : '—', icon: FiDollarSign, color: 'from-emerald-500 to-emerald-600', sub: 'Combined balances' },
                { label: "Today's Transactions", value: stats?.todaysTransactions ?? '—', icon: FiActivity, color: 'from-purple-500 to-purple-600', sub: 'Since midnight' },
                { label: "Today's Volume", value: stats ? formatCurrency(stats.todaysVolume) : '—', icon: FiTrendingUp, color: 'from-amber-500 to-orange-500', sub: 'Completed only' },
              ].map((card, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <card.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white mb-1 break-words">{card.value}</p>
                  <p className="text-xs sm:text-sm font-medium text-slate-300">{card.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-sm sm:text-base text-slate-300">Active Accounts</span>
                    </div>
                    <span className="font-bold text-white">{stats?.activeUsers ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="text-sm sm:text-base text-slate-300">Suspended Accounts</span>
                    </div>
                    <span className="font-bold text-white">{stats?.suspendedUsers ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-slate-400" />
                      <span className="text-sm sm:text-base text-slate-300">Total Accounts</span>
                    </div>
                    <span className="font-bold text-white">{stats?.totalUsers ?? '—'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setActiveTab('create')} className="w-full flex items-center gap-3 p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors">
                    <FiPlus className="w-5 h-5 text-amber-400" />
                    <span className="text-amber-300 font-medium text-sm sm:text-base">Create Transaction</span>
                  </button>
                  <button onClick={() => setActiveTab('users')} className="w-full flex items-center gap-3 p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-colors">
                    <FiUsers className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 font-medium text-sm sm:text-base">Manage Users</span>
                  </button>
                  <button onClick={() => setActiveTab('transactions')} className="w-full flex items-center gap-3 p-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-colors">
                    <FiActivity className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300 font-medium text-sm sm:text-base">Review Transactions</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE TRANSACTION ── */}
        {activeTab === 'create' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Create Transaction</h2>
              <p className="text-slate-400 text-sm sm:text-base mt-1">Manually inject a transaction statement into any account</p>
            </div>

            {createSuccess && (
              <div className="mb-5 sm:mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-3">
                  <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  <h3 className="text-emerald-300 font-bold text-base sm:text-lg">Transaction Created!</h3>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div><span className="text-slate-400">Transaction ID:</span> <span className="text-white font-mono break-all">{createSuccess.data?.transactionId}</span></div>
                  <div><span className="text-slate-400">New Balance:</span> <span className="text-emerald-400 font-bold">{formatCurrency(createSuccess.newBalance)}</span></div>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-5 sm:space-y-6">
              {/* Account Selector */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <FiUser className="w-4 h-4 text-amber-400" /> Target Account
                </h3>
                <div className="relative">
                  <select
                    value={createForm.accountNumber}
                    onChange={handleSelectAccountChange}
                    required
                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-sm sm:text-base"
                  >
                    <option value="" className="text-slate-500">-- Select Target User Account --</option>
                    {users.map(acc => (
                      <option key={acc._id} value={acc.accountNumber} className="bg-slate-900 text-white">
                        {acc.name} ({acc.accountNumber}) — Balance: {formatCurrency(acc.balance)} {acc.isAdmin ? '[Admin]' : ''}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                </div>
                {selectedAccount && (
                  <div className="mt-4 flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <FiCheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-amber-300 font-medium text-sm sm:text-base truncate">{selectedAccount.name} {selectedAccount.isAdmin && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold ml-1">Admin</span>}</p>
                      <p className="text-slate-400 text-xs sm:text-sm break-all">{selectedAccount.accountNumber} · {formatCurrency(selectedAccount.balance)} current balance</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Transaction Details */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <FiEdit3 className="w-4 h-4 text-amber-400" /> Transaction Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Type */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Transaction Type *</label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {[
                        { val: 'credit', label: 'Credit', icon: FiArrowDown, color: 'emerald' },
                        { val: 'debit', label: 'Debit', icon: FiArrowUp, color: 'red' },
                        { val: 'transfer', label: 'Transfer', icon: FiSend, color: 'blue' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setCreateForm(f => ({ ...f, type: opt.val }))}
                          className={`flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${getButtonColorClass(opt.val, createForm.type === opt.val)}`}
                        >
                          <opt.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Status *</label>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {[
                        { val: 'completed', label: 'Completed', icon: FiCheckCircle },
                        { val: 'pending', label: 'Pending', icon: FiClock },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setCreateForm(f => ({ ...f, status: opt.val }))}
                          className={`flex items-center justify-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all
                            ${createForm.status === opt.val
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
                        >
                          <opt.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Amount (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        value={createForm.amount}
                        onChange={e => setCreateForm(f => ({ ...f, amount: e.target.value }))}
                        placeholder="0.00"
                        className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Category *</label>
                    <div className="relative">
                      <select
                        required
                        value={createForm.category}
                        onChange={e => setCreateForm(f => ({ ...f, category: e.target.value }))}
                        className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Description *</label>
                    <input
                      type="text"
                      required
                      value={createForm.description}
                      onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="e.g. Monthly Salary Deposit, Utility Bill Payment..."
                      className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>

                  {/* Date */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">
                      <FiCalendar className="inline w-3.5 h-3.5 mr-1" />
                      Transaction Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={createForm.date}
                      onChange={e => setCreateForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                    <p className="text-xs text-slate-500 mt-1">You can backdate transactions to any date</p>
                  </div>
                </div>
              </div>

              {/* Sender / Receiver */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <FiSend className="w-4 h-4 text-amber-400" /> Sender & Receiver Info
                  <span className="text-xs text-slate-500 font-normal ml-1 hidden sm:inline">(optional — auto-filled from type)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Sender Name</label>
                    <input
                      type="text"
                      value={createForm.senderName}
                      onChange={e => setCreateForm(f => ({ ...f, senderName: e.target.value }))}
                      placeholder="e.g. Acme Corp Payroll"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Sender Account #</label>
                    <input
                      type="text"
                      value={createForm.senderAccount}
                      onChange={e => setCreateForm(f => ({ ...f, senderAccount: e.target.value }))}
                      placeholder="e.g. PAYROLL882"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Receiver Name</label>
                    <input
                      type="text"
                      value={createForm.receiverName}
                      onChange={e => setCreateForm(f => ({ ...f, receiverName: e.target.value }))}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Receiver Account #</label>
                    <input
                      type="text"
                      value={createForm.receiverAccount}
                      onChange={e => setCreateForm(f => ({ ...f, receiverAccount: e.target.value }))}
                      placeholder="e.g. 9306371946"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-slate-400 mb-2">Admin Notes</label>
                    <input
                      type="text"
                      value={createForm.notes}
                      onChange={e => setCreateForm(f => ({ ...f, notes: e.target.value }))}
                      placeholder="Internal note (not visible to user)"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createLoading || !createForm.accountNumber}
                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all text-base sm:text-lg"
              >
                {createLoading ? (
                  <><div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><FiSave className="w-4 h-4 sm:w-5 sm:h-5" /> Create Transaction</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── ADD USER ── */}
        {activeTab === 'create_user' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <FiUserPlus className="text-amber-400" /> Add New Bank User
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-1">Manually register a new client account in the banking system</p>
            </div>

            {createUserSuccess && (
              <div className="mb-5 sm:mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-3">
                  <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                  <h3 className="text-emerald-300 font-bold text-base sm:text-lg">User Account Created Successfully!</h3>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div><span className="text-slate-400">Full Name:</span> <span className="text-white font-medium break-words">{createUserSuccess.name}</span></div>
                  <div><span className="text-slate-400">Account Number:</span> <span className="text-amber-400 font-mono font-bold break-all">{createUserSuccess.accountNumber}</span></div>
                  <div><span className="text-slate-400">Email:</span> <span className="text-white break-all">{createUserSuccess.email}</span></div>
                  <div><span className="text-slate-400">Initial Balance:</span> <span className="text-emerald-400 font-bold">{formatCurrency(createUserSuccess.balance)}</span></div>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-5 sm:space-y-6">
              {/* Profile Details */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 border-b border-slate-800 pb-3 text-sm sm:text-base">
                  <FiUser className="w-4 h-4 text-amber-400" /> Personal Profile
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={createUserForm.name}
                      onChange={e => setCreateUserForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Samuel Jackson"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-sm sm:text-base"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={createUserForm.email}
                      onChange={e => setCreateUserForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="e.g. sam.jackson@gmail.com"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={createUserForm.phone}
                      onChange={e => setCreateUserForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={createUserForm.dateOfBirth}
                      onChange={e => setCreateUserForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>

                  {/* SSN */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">SSN (Social Security Number) *</label>
                    <input
                      type="text"
                      required
                      value={createUserForm.ssn}
                      onChange={e => setCreateUserForm(f => ({ ...f, ssn: e.target.value }))}
                      placeholder="e.g. XXX-XX-XXXX"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Initial Password</label>
                    <input
                      type="text"
                      value={createUserForm.password}
                      onChange={e => setCreateUserForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Default is 'password123'"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Banking & Finances */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 border-b border-slate-800 pb-3 text-sm sm:text-base">
                  <FiDollarSign className="w-4 h-4 text-amber-400" /> Banking Setup
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Account Number */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Custom Account Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={createUserForm.accountNumber}
                      onChange={e => setCreateUserForm(f => ({ ...f, accountNumber: e.target.value }))}
                      placeholder="Auto-generated if empty (10 digits)"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-sm sm:text-base"
                    />
                  </div>

                  {/* Initial Deposit */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Initial Opening Deposit (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={createUserForm.initialDeposit}
                        onChange={e => setCreateUserForm(f => ({ ...f, initialDeposit: e.target.value }))}
                        placeholder="0.00"
                        className="w-full pl-7 sm:pl-8 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* Account Type */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Account Type *</label>
                    <div className="relative">
                      <select
                        value={createUserForm.accountType}
                        onChange={e => setCreateUserForm(f => ({ ...f, accountType: e.target.value }))}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                      >
                        <option value="checking">Checking Account</option>
                        <option value="savings">Savings Account</option>
                        <option value="business">Business Account</option>
                      </select>
                      <FiChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">System Role *</label>
                    <div className="relative">
                      <select
                        value={createUserForm.isAdmin ? 'admin' : 'user'}
                        onChange={e => setCreateUserForm(f => ({ ...f, isAdmin: e.target.value === 'admin' }))}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                      >
                        <option value="user">Standard User (Banking Client)</option>
                        <option value="admin">System Administrator (Full Access)</option>
                      </select>
                      <FiChevronDown className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Address */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 border-b border-slate-800 pb-3 text-sm sm:text-base">
                  <FiCalendar className="w-4 h-4 text-amber-400" /> Physical Address
                </h3>

                <div className="space-y-4">
                  {/* Street Address */}
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={createUserForm.address.street}
                      onChange={e => setCreateUserForm(f => ({ ...f, address: { ...f.address, street: e.target.value } }))}
                      placeholder="e.g. 100 Broadway Ave, Apt 4B"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">City</label>
                      <input
                        type="text"
                        value={createUserForm.address.city}
                        onChange={e => setCreateUserForm(f => ({ ...f, address: { ...f.address, city: e.target.value } }))}
                        placeholder="e.g. Seattle"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">State</label>
                      <input
                        type="text"
                        value={createUserForm.address.state}
                        onChange={e => setCreateUserForm(f => ({ ...f, address: { ...f.address, state: e.target.value } }))}
                        placeholder="e.g. WA"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                      />
                    </div>

                    {/* Zip Code */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Zip Code</label>
                      <input
                        type="text"
                        value={createUserForm.address.zipCode}
                        onChange={e => setCreateUserForm(f => ({ ...f, address: { ...f.address, zipCode: e.target.value } }))}
                        placeholder="e.g. 98101"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createUserLoading}
                className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all text-base sm:text-lg"
              >
                {createUserLoading ? (
                  <><div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating Account...</>
                ) : (
                  <><FiUserPlus className="w-4 h-4 sm:w-5 sm:h-5" /> Register Bank Account</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── TRANSACTIONS ── */}
        {activeTab === 'transactions' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">All Transactions</h2>
                <p className="text-slate-400 text-sm sm:text-base mt-1">{transactions.length} records found</p>
              </div>
              <button onClick={loadTransactions} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-sm transition-colors w-full sm:w-auto">
                <FiRefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="relative sm:col-span-2">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={txSearch}
                    onChange={e => setTxSearch(e.target.value)}
                    className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  />
                </div>
                <div className="relative">
                  <select
                    value={txStatus}
                    onChange={e => setTxStatus(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  >
                    <option value="">All Statuses</option>
                    {['completed', 'pending', 'failed', 'cancelled', 'scheduled'].map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                </div>
                <div className="relative">
                  <select
                    value={txType}
                    onChange={e => setTxType(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  >
                    <option value="">All Types</option>
                    {['credit', 'debit', 'transfer'].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                </div>
                <button
                  onClick={loadTransactions}
                  className="py-2.5 sm:py-3 px-4 sm:px-5 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  Apply Filters
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">From Date</label>
                  <input
                    type="date"
                    value={txStartDate}
                    onChange={e => setTxStartDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">To Date</label>
                  <input
                    type="date"
                    value={txEndDate}
                    onChange={e => setTxEndDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['Date', 'Description', 'Account', 'Type', 'Amount', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left py-3 sm:py-4 px-3 sm:px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="py-2 sm:py-3 px-3 sm:px-4">
                            <div className="text-xs sm:text-sm text-white">{format(new Date(tx.createdAt), 'MMM dd, yyyy')}</div>
                            <div className="text-xs text-slate-500">{format(new Date(tx.createdAt), 'HH:mm')}</div>
                          </td>
                          <td className="py-2 sm:py-3 px-3 sm:px-4">
                            <div className="text-xs sm:text-sm text-white max-w-[150px] sm:max-w-xs truncate">{tx.description}</div>
                            <div className="text-xs text-slate-500 capitalize">{tx.category}</div>
                          </td>
                          <td className="py-2 sm:py-3 px-3 sm:px-4">
                            <div className="text-xs sm:text-sm text-white truncate max-w-[100px]">{tx.userId?.name || 'Unknown'}</div>
                            <div className="text-xs text-slate-500 font-mono truncate max-w-[100px]">{tx.userId?.accountNumber}</div>
                          </td>
                          <td className="py-2 sm:py-3 px-3 sm:px-4">
                            <span className={`text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg whitespace-nowrap
                              ${tx.type === 'credit' ? 'bg-emerald-500/20 text-emerald-400' : tx.type === 'debit' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-3 sm:px-4">
                            <div className={`font-bold text-xs sm:text-sm ${tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400'} whitespace-nowrap`}>
                              {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-3 sm:px-4 whitespace-nowrap">{getStatusBadge(tx.status)}</td>
                          <td className="py-2 sm:py-3 px-3 sm:px-4">
                            {tx.status === 'pending' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleTxStatus(tx._id, 'completed')}
                                  title="Approve"
                                  className="p-1 sm:p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg transition-colors"
                                >
                                  <FiCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                                </button>
                                <button
                                  onClick={() => handleTxStatus(tx._id, 'cancelled')}
                                  title="Cancel"
                                  className="p-1 sm:p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
                                >
                                  <FiX className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {transactions.length === 0 && !isLoading && (
                    <div className="py-12 sm:py-16 text-center text-slate-500 text-sm sm:text-base">No transactions found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">User Management</h2>
                <p className="text-slate-400 text-sm sm:text-base mt-1">{users.length} accounts registered</p>
              </div>
              <button onClick={loadUsers} className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-sm transition-colors w-full sm:w-auto">
                <FiRefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6">
              <div className="relative">
                <FiSearch className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users by name, email or account number..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm sm:text-base"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {['User', 'Account', 'Balance', 'Type', 'Status', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="text-left py-3 sm:py-4 px-3 sm:px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-800/50">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 sm:py-4 px-3 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm
                                ${u.isAdmin ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="text-white font-medium flex items-center gap-1.5 text-xs sm:text-sm">
                                  <span className="truncate max-w-[100px] sm:max-w-none">{u.name}</span>
                                  {u.isAdmin && <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-md whitespace-nowrap">Admin</span>}
                                </div>
                                <div className="text-slate-500 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4 font-mono text-xs sm:text-sm text-slate-300 whitespace-nowrap">{u.accountNumber}</td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4 font-bold text-emerald-400 text-sm sm:text-base whitespace-nowrap">{formatCurrency(u.balance)}</td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4">
                            <span className="text-xs text-slate-400 capitalize bg-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg whitespace-nowrap">{u.accountType}</span>
                          </td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4 whitespace-nowrap">{getStatusBadge(u.status)}</td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm text-slate-400 whitespace-nowrap">{u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : '—'}</td>
                          <td className="py-3 sm:py-4 px-3 sm:px-4">
                            {!u.isAdmin && (
                              <button
                                onClick={() => handleUserStatus(u._id, u.status)}
                                title={u.status === 'active' ? 'Suspend' : 'Activate'}
                                className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap
                                  ${u.status === 'active'
                                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'}`}
                              >
                                {u.status === 'active' ? <FiToggleLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <FiToggleRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                                <span className="hidden xs:inline">{u.status === 'active' ? 'Suspend' : 'Activate'}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && !isLoading && (
                    <div className="py-12 sm:py-16 text-center text-slate-500 text-sm sm:text-base">No users found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default withProtectedRoute(Admin, { requiredRoles: ['admin'] })