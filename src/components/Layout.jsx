// Layout.jsx
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  FiHome, 
  FiCreditCard, 
  FiSend, 
  FiBarChart2, 
  FiSettings, 
  FiBell, 
  FiMenu, 
  FiLogOut,
  FiDollarSign,
  FiTrendingUp,
  FiShield
} from 'react-icons/fi'
import { useBanking } from '../contexts/BankingContext'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useBanking()

  const menuItems = [
    { name: 'Dashboard', icon: <FiHome />, path: '/dashboard' },
    // { name: 'Balance', icon: <FiCreditCard />, path: '/balance' },
    { name: 'Transfer Money', icon: <FiSend />, path: '/transfer' },
    { name: 'Transactions', icon: <FiBarChart2 />, path: '/transactions' },
    { name: 'Settings', icon: <FiSettings />, path: '/settings' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('banking_user')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-primary-700">SoFi</h1>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <FiBell className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-xl transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-primary-700">SoFi</h1>
            <p className="text-sm text-gray-600 mt-1">Online Banking</p>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-bold text-lg">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{user?.name || 'User'}</h3>
                <p className="text-sm text-gray-600">Member ID: {user?.accountNumber || '••••••'}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-600">Available Balance</span>
                <FiDollarSign className="w-4 h-4 text-gray-600" />
              </div>
              <p className="text-xl font-bold text-gray-900">$40.46</p>
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full w-1/3"></div>
                </div>
                <span className="text-xs text-gray-600 ml-2">33%</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Insurance Section */}
          <div className="p-4 border-t">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Life Insurance</span>
                <FiShield className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Starting at $5/month</p>
              <button className="w-full mt-3 py-2 text-sm font-medium text-blue-700 bg-white rounded-lg hover:bg-blue-50 transition-colors duration-200">
                Learn More
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <FiLogOut className="text-lg" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout