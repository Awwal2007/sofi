import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const BankingContext = createContext()

export const useBanking = () => useContext(BankingContext)

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('banking_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle token expiration
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error.response?.status === 401) {
//       // Token expired or invalid
//       localStorage.removeItem('banking_token')
//       localStorage.removeItem('banking_user')
//       window.location.href = '/login'
//     }
//     return Promise.reject(error)
//   }
// )

export const BankingProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load user from token on initial load
  useEffect(() => {
    const token = localStorage.getItem('banking_token')
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
      setError(null)
    } catch (err) {
      console.error('Failed to load user:', err)
      localStorage.removeItem('banking_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await api.post('/auth/login', { email, password })
      
      localStorage.setItem('banking_token', response.data.token)
      setUser(response.data.user)
      
      return {
        success: true,
        user: response.data.user
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      const response = await api.post('/auth/register', userData)
      
      localStorage.setItem('banking_token', response.data.token)
      setUser(response.data.user)
      
      return {
        success: true,
        user: response.data.user
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed'
      setError(errorMessage)
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('banking_token')
    localStorage.removeItem('banking_user')
    setUser(null)
    window.location.href = '/login'
  }

  const transferMoney = async (toAccount, amount, description) => {
    try {
      const response = await api.post('/transactions/transfer', {
        toAccount,
        amount: parseFloat(amount),
        description
      })
      
      // Refresh user data to get updated balance
      await loadUser()
      
      return {
        success: response.data.success,
        message: response.data.message,
        transaction: response.data.data,
        newBalance: response.data.newBalance
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Transfer failed'
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  const getDashboardData = async () => {
    try {
      const response = await api.get('/account/dashboard')
      return {
        success: true,
        data: response.data.data
      }
    } catch (err) {
      console.log(err);      
      return {
        success: false,
        message: 'Failed to load dashboard data'
      }
    }
  }

  const getTransactions = async (params = {}) => {
    try {
      const response = await api.get('/transactions', { params })
      return {
        success: true,
        data: response.data.data
      }
    } catch (err) {
      console.log(err)      
      return {
        success: false,
        message: 'Failed to load transactions'
      }
    }
  }

  const getTransactionDetails = async (transactionId) => {
    try {
      const response = await api.get(`/transactions/${transactionId}`)
      return {
        success: true,
        data: response.data.data
      }
    } catch (err) {
      console.log(err)      
      return {
        success: false,
        message: 'Failed to load transaction details'
      }
    }
  }

  const scheduleTransfer = async (toAccount, amount, scheduleDate, description) => {
    try {
      const response = await api.post('/transactions/schedule', {
        toAccount,
        amount: parseFloat(amount),
        scheduleDate,
        description
      })
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to schedule transfer'
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  const cancelTransaction = async (transactionId) => {
    try {
      const response = await api.post(`/transactions/${transactionId}/cancel`)
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to cancel transaction'
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/account/update', profileData)
      setUser(response.data.user)
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile'
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      })
      return {
        success: true,
        message: response.data.message
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to change password'
      return {
        success: false,
        message: errorMessage
      }
    }
  }

  const getAccountStatement = async (startDate, endDate, format = 'json') => {
    try {
      const response = await api.get('/account/statement', {
        params: { startDate, endDate, format }
      })
      return {
        success: true,
        data: response.data.data
      }
    } catch (err) {
      console.log(err)      
      return {
        success: false,
        message: 'Failed to generate statement'
      }
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    transferMoney,
    getDashboardData,
    getTransactions,
    getTransactionDetails,
    scheduleTransfer,
    cancelTransaction,
    updateProfile,
    changePassword,
    getAccountStatement,
    loadUser
  }

  return (
    <BankingContext.Provider value={value}>
      {children}
    </BankingContext.Provider>
  )
}