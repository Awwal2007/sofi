// ProtectedRoute.jsx
import React, { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useBanking } from '../contexts/BankingContext'
import { 
  FiShield, 
  FiLock, 
  FiAlertCircle, 
  FiCheckCircle,
  FiRefreshCw,
  FiHome,
  FiLogOut,
  FiTrendingUp
} from 'react-icons/fi'

const ProtectedRoute = ({ children, requiresAuth = true, redirectTo = '/login', requiredRoles = [] }) => {
  const { user, loading, loadUser } = useBanking()
  const location = useLocation()
  const navigate = useNavigate()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [isSessionValid, setIsSessionValid] = useState(false)
  const [remainingTime, setRemainingTime] = useState(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)

  // Session timeout (15 minutes for banking)
  const SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes in milliseconds
  const WARNING_THRESHOLD = 2 * 60 * 1000 // Warn 2 minutes before timeout

  // Function to check if user has required roles
  const hasRequiredRoles = () => {
    if (requiredRoles.length === 0) return true
    
    // In a real app, you would check user.roles against requiredRoles
    // For demo, we'll assume all authenticated users have basic access
    return true
  }

  // Function to validate session
  const validateSession = () => {
    const token = localStorage.getItem('banking_token')
    const lastActivity = localStorage.getItem('last_activity')
    
    if (!token) {
      setIsSessionValid(false)
      return false
    }

    // Check if session has expired
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10)
      
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        setIsSessionValid(false)
        
        // Clear expired session
        localStorage.removeItem('banking_token')
        localStorage.removeItem('banking_user')
        localStorage.removeItem('last_activity')
        
        return false
      } else if (timeSinceLastActivity > SESSION_TIMEOUT - WARNING_THRESHOLD) {
        setShowSessionWarning(true)
        setRemainingTime(SESSION_TIMEOUT - timeSinceLastActivity)
      }
    }

    setIsSessionValid(true)
    return true
  }

  // Update last activity timestamp
  const updateLastActivity = () => {
    localStorage.setItem('last_activity', Date.now().toString())
  }

  // Handle user activity
  useEffect(() => {
    const handleUserActivity = () => {
      updateLastActivity()
      setShowSessionWarning(false)
    }

    // Update activity on mount
    updateLastActivity()

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)
    window.addEventListener('click', handleUserActivity)
    window.addEventListener('scroll', handleUserActivity)

    // Check session periodically
    const activityCheckInterval = setInterval(() => {
      if (validateSession()) {
        const lastActivity = localStorage.getItem('last_activity')
        if (lastActivity) {
          const timeSinceLastActivity = Date.now() - parseInt(lastActivity, 10)
          if (timeSinceLastActivity > SESSION_TIMEOUT - WARNING_THRESHOLD) {
            setShowSessionWarning(true)
            setRemainingTime(SESSION_TIMEOUT - timeSinceLastActivity)
          }
        }
      }
    }, 30000) // Check every 30 seconds

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleUserActivity)
      window.removeEventListener('keydown', handleUserActivity)
      window.removeEventListener('click', handleUserActivity)
      window.removeEventListener('scroll', handleUserActivity)
      clearInterval(activityCheckInterval)
    }
  }, [])

  // Format remaining time
  const formatRemainingTime = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Main authentication check
  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true)

      try {
        // First validate the session
        const sessionValid = validateSession()
        
        if (!sessionValid) {
          setAuthChecked(true)
          setIsCheckingAuth(false)
          return
        }

        // If we have a token but no user data, try to load user
        const token = localStorage.getItem('banking_token')
        if (token && !user) {
          await loadUser()
        }

        setAuthChecked(true)
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid session
        localStorage.removeItem('banking_token')
        localStorage.removeItem('banking_user')
        localStorage.removeItem('last_activity')
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [user, loadUser, location])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('banking_token')
    localStorage.removeItem('banking_user')
    localStorage.removeItem('last_activity')
    navigate('/login', { 
      state: { 
        from: location.pathname,
        message: 'Session expired. Please login again.'
      }
    })
  }

  // Handle session extension
  const extendSession = () => {
    updateLastActivity()
    setShowSessionWarning(false)
  }

  // Render loading state
  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <Link className='w-full flex justify-center gap-2' to='/'>
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FiTrendingUp className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white text-center mb-4">$SoFi</h1>
            </Link>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Securing Your Session</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Please wait while we verify your authentication and load your account information.
          </p>
          <div className="mt-6">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <FiLock className="w-4 h-4" />
              <span>Bank-Level Security • 256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check if authentication is required
  if (requiresAuth && !isSessionValid) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
  }

  // Check if user has required roles
  if (requiresAuth && !hasRequiredRoles()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h2>
            <p className="text-gray-600">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FiHome className="w-5 h-5" />
              Go to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-3 px-6 border border-red-300 text-red-600 hover:bg-red-50 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FiLogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    )
  }

  // If auth isn't required but user is authenticated and trying to access login/register
  if (!requiresAuth && isSessionValid) {
    // Redirect authenticated users away from login/register pages
    if (['/login', '/register'].includes(location.pathname)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  // Session warning modal
  if (showSessionWarning && remainingTime) {
    return (
      <>
        {children}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Session About to Expire</h3>
                <p className="text-gray-600">
                  Your session will expire in{' '}
                  <span className="font-bold text-yellow-600">
                    {formatRemainingTime(remainingTime)}
                  </span>
                  . For security reasons, you'll be logged out automatically.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={extendSession}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <FiRefreshCw className="w-5 h-5" />
                  Continue Session
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 text-blue-600 font-medium hover:text-blue-700"
                >
                  Log Out Now
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiShield className="w-4 h-4" />
                  <span>For your security, sessions automatically expire after 15 minutes of inactivity.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // All checks passed, render children
  return children
}

// Higher Order Component for protected routes
export const withProtectedRoute = (Component, options = {}) => {
  return function WithProtectedRouteWrapper(props) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Public route component (for login/register pages)
export const PublicRoute = ({ children }) => {
  return (
    <ProtectedRoute requiresAuth={false}>
      {children}
    </ProtectedRoute>
  )
}

// Admin route component (requires admin role)
export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      {children}
    </ProtectedRoute>
  )
}

// Route with specific permissions
export const RoleBasedRoute = ({ children, roles }) => {
  return (
    <ProtectedRoute requiredRoles={roles}>
      {children}
    </ProtectedRoute>
  )
}

export default ProtectedRoute