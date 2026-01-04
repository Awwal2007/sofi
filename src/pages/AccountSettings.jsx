import React, { useState, useEffect } from 'react'
import { useBanking } from '../contexts/BankingContext'
import { 
  FiUser, 
  FiShield, 
  FiBell, 
  FiCreditCard, 
  FiGlobe,  
  FiHome,
  FiSend,
  FiBarChart2,
  FiSettings,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiLogOut,
  FiTrash2,
  FiKey,
  FiSmartphone,
  FiGlobe as FiLanguage,
  FiDollarSign,
  FiClock
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { withProtectedRoute } from '../components/ProtectedRoute'

const AccountSettings = () => {
  const { user, loading, updateProfile, changePassword, logout } = useBanking()
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        }
      })
    }
  }, [user])

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <FiShield className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <FiBell className="w-5 h-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <FiGlobe className="w-5 h-5" /> },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validatePassword = () => {
    const newErrors = {}
    
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required'
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required'
    if (passwordData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters'
    if (!passwordData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    return newErrors
  }

  const handleSaveProfile = async () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    setSuccess('')
    
    try {
      const result = await updateProfile(formData)
      
      if (result.success) {
        setSuccess('Profile updated successfully')
        setIsEditing(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setErrors({ general: result.message })
      }
    } catch (err) {
      setErrors({ general: 'Failed to update profile. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async () => {
    const passwordErrors = validatePassword()
    
    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors)
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    setSuccess('')
    
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      if (result.success) {
        setSuccess('Password changed successfully')
        setIsChangingPassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setErrors({ general: result.message })
      }
    } catch (err) {
      setErrors({ general: 'Failed to change password. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, label: 'None', color: 'gray' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/(?=.*[A-Z])/.test(password)) score++
    if (/(?=.*\d)/.test(password)) score++
    if (/(?=.*[!@#$%^&*])/.test(password)) score++
    if (password.length >= 12) score++
    
    const strengths = [
      { label: 'Very Weak', color: 'red' },
      { label: 'Weak', color: 'orange' },
      { label: 'Fair', color: 'yellow' },
      { label: 'Good', color: 'lightgreen' },
      { label: 'Strong', color: 'green' },
      { label: 'Very Strong', color: 'darkgreen' }
    ]
    
    return strengths[score] || strengths[0]
  }

  const passwordStrength = getPasswordStrength(passwordData.newPassword)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-64 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
                <div className="lg:col-span-3">
                  <div className="h-96 bg-gray-200 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account preferences and security</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800">{errors.general}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Tabs */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 sticky top-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setIsEditing(false)
                        setIsChangingPassword(false)
                        setErrors({})
                        setSuccess('')
                      }}
                      className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Account Actions */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSubmitting}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-8">
                    {/* Account Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <p className="text-sm text-gray-600">Account Number</p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {user?.accountNumber ? '••••' + user.accountNumber.slice(-4) : '••••••••••'}
                          </p>
                        </div>
                        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
                          <FiCreditCard className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-4">
                          <p className="text-sm text-gray-600">Current Balance</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(user?.balance || 0)}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4">
                          <p className="text-sm text-gray-600">Account Type</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {user?.accountType?.toUpperCase() || 'CHECKING'}
                          </p>
                        </div>
                        
                        <div className="bg-white rounded-xl p-4">
                          <p className="text-sm text-gray-600">Member Since</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {user?.createdAt ? format(new Date(user.createdAt), 'yyyy') : new Date().getFullYear()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Full Name
                          </label>
                          {isEditing ? (
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <FiUser className="w-5 h-5 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${
                                  errors.name ? 'border-red-300' : 'border-gray-200'
                                } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                              />
                              {errors.name && (
                                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="font-medium text-gray-900">{user?.name || 'Not set'}</p>
                            </div>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Email Address
                          </label>
                          {isEditing ? (
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <FiMail className="w-5 h-5 text-gray-400" />
                              </div>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${
                                  errors.email ? 'border-red-300' : 'border-gray-200'
                                } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                              />
                              {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="font-medium text-gray-900">{user?.email || 'Not set'}</p>
                            </div>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Phone Number
                          </label>
                          {isEditing ? (
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <FiPhone className="w-5 h-5 text-gray-400" />
                              </div>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${
                                  errors.phone ? 'border-red-300' : 'border-gray-200'
                                } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                placeholder="(555) 123-4567"
                              />
                              {errors.phone && (
                                <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-xl p-4">
                              <p className="font-medium text-gray-900">{user?.phone || 'Not set'}</p>
                            </div>
                          )}
                        </div>

                        {/* Account Status */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Account Status
                          </label>
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">
                                {user?.status?.toUpperCase() || 'ACTIVE'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                user?.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : user?.status === 'suspended'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user?.status?.toUpperCase() || 'ACTIVE'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      {isEditing && (
                        <div className="space-y-6">
                          <h4 className="text-lg font-semibold text-gray-900">Address Information</h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Street */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Street Address
                              </label>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                  <FiMapPin className="w-5 h-5 text-gray-400" />
                                </div>
                                <input
                                  type="text"
                                  name="address.street"
                                  value={formData.address.street}
                                  onChange={handleInputChange}
                                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  placeholder="123 Main St"
                                />
                              </div>
                            </div>

                            {/* City */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                City
                              </label>
                              <input
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="New York"
                              />
                            </div>

                            {/* State */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                State
                              </label>
                              <select
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              >
                                <option value="">Select State</option>
                                <option value="NY">New York</option>
                                <option value="CA">California</option>
                                <option value="TX">Texas</option>
                                <option value="FL">Florida</option>
                                <option value="IL">Illinois</option>
                              </select>
                            </div>

                            {/* Zip Code */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                ZIP Code
                              </label>
                              <input
                                type="text"
                                name="address.zipCode"
                                value={formData.address.zipCode}
                                onChange={handleInputChange}
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="10001"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Security Settings</h2>
                  
                  <div className="space-y-8">
                    {/* Password */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Password</h3>
                          <p className="text-gray-600 mt-2">
                            Change your password to keep your account secure
                          </p>
                        </div>
                        <button
                          onClick={() => setIsChangingPassword(!isChangingPassword)}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                        >
                          {isChangingPassword ? 'Cancel' : 'Change Password'}
                        </button>
                      </div>
                      
                      {isChangingPassword ? (
                        <div className="space-y-6">
                          {/* Current Password */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                              Current Password
                            </label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <FiLock className="w-5 h-5 text-gray-400" />
                              </div>
                              <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className={`w-full pl-12 pr-12 py-4 bg-gray-50 border ${
                                  errors.currentPassword ? 'border-red-300' : 'border-gray-200'
                                } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showCurrentPassword ? (
                                  <FiEyeOff className="w-5 h-5" />
                                ) : (
                                  <FiEye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            {errors.currentPassword && (
                              <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>
                            )}
                          </div>

                          {/* New Password */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                              New Password
                            </label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <FiKey className="w-5 h-5 text-gray-400" />
                              </div>
                              <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className={`w-full pl-12 pr-12 py-4 bg-gray-50 border ${
                                  errors.newPassword ? 'border-red-300' : 'border-gray-200'
                                } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                placeholder="Enter new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showNewPassword ? (
                                  <FiEyeOff className="w-5 h-5" />
                                ) : (
                                  <FiEye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            {errors.newPassword && (
                              <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
                            )}

                            {/* Password Strength */}
                            {passwordData.newPassword && (
                              <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-700">Password strength:</span>
                                  <span className={`text-sm font-medium text-${passwordStrength.color}-600`}>
                                    {passwordStrength.label}
                                  </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Confirm Password */}
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                <FiLock className="w-5 h-5 text-gray-400" />
                              </div>
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className={`w-full pl-12 pr-12 py-4 bg-gray-50 border ${
                                  errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                                } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? (
                                  <FiEyeOff className="w-5 h-5" />
                                ) : (
                                  <FiEye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                            {errors.confirmPassword && (
                              <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                          </div>

                          <button
                            onClick={handleChangePassword}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'Changing Password...' : 'Update Password'}
                          </button>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                          <p className="text-blue-800">
                            Your password was last changed on {user?.updatedAt ? format(new Date(user.updatedAt), 'MMM d, yyyy') : 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h3>
                          <p className="text-gray-600 mt-2">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
                          Enabled
                        </span>
                      </div>
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                        Manage 2FA
                      </button>
                    </div>

                    {/* Security Audit */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Security Audit</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Strong password', status: true },
                          { label: 'Two-factor authentication', status: true },
                          { label: 'Email verified', status: true },
                          { label: 'Phone verified', status: false },
                          { label: 'Recent activity monitoring', status: true },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {item.status ? (
                                <FiCheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <FiAlertCircle className="w-5 h-5 text-yellow-500" />
                              )}
                              <span className="font-medium text-gray-900">{item.label}</span>
                            </div>
                            {item.status ? (
                              <span className="text-sm text-green-600 font-medium">Secure</span>
                            ) : (
                              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                                Enable
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { 
                          label: 'Email Notifications', 
                          description: 'Receive important account updates via email',
                          icon: <FiMail className="w-5 h-5" />,
                          enabled: true 
                        },
                        { 
                          label: 'SMS Alerts', 
                          description: 'Get transaction alerts and security codes via SMS',
                          icon: <FiSmartphone className="w-5 h-5" />,
                          enabled: true 
                        },
                        { 
                          label: 'Push Notifications', 
                          description: 'Receive real-time notifications on your device',
                          icon: <FiBell className="w-5 h-5" />,
                          enabled: false 
                        },
                        { 
                          label: 'Marketing Communications', 
                          description: 'Receive promotions, offers, and financial tips',
                          icon: <FiDollarSign className="w-5 h-5" />,
                          enabled: false 
                        },
                        { 
                          label: 'Security Alerts', 
                          description: 'Get notified about important security events',
                          icon: <FiShield className="w-5 h-5" />,
                          enabled: true 
                        },
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              item.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {item.icon}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked={item.enabled}
                              className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-6 border-t border-gray-100">
                      <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                        Save Notification Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">Account Preferences</h2>
                  
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Currency */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FiDollarSign className="w-5 h-5 text-gray-500" />
                            Default Currency
                          </div>
                        </label>
                        <select className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                          <option>USD - US Dollar</option>
                          <option>EUR - Euro</option>
                          <option>GBP - British Pound</option>
                          <option>JPY - Japanese Yen</option>
                        </select>
                      </div>

                      {/* Language */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FiLanguage className="w-5 h-5 text-gray-500" />
                            Language
                          </div>
                        </label>
                        <select className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FiClock className="w-5 h-5 text-gray-500" />
                            Timezone
                          </div>
                        </label>
                        <select className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                          <option>(UTC-05:00) Eastern Time</option>
                          <option>(UTC-08:00) Pacific Time</option>
                          <option>(UTC+00:00) Greenwich Mean Time</option>
                          <option>(UTC+01:00) Central European Time</option>
                        </select>
                      </div>

                      {/* Date Format */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                          Date Format
                        </label>
                        <select className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>

                    {/* Transaction Limits */}
                    <div className="border border-gray-200 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Transaction Limits</h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Daily Transfer Limit
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 text-xl font-bold">$</span>
                            <input
                              type="number"
                              defaultValue="10000"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Maximum amount you can transfer in a single day
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Max Single Transaction
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 text-xl font-bold">$</span>
                            <input
                              type="number"
                              defaultValue="5000"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-2">
                            Maximum amount per single transaction
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="border border-gray-200 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Personalized Offers</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Receive offers based on your transaction history
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Data Analytics</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Help us improve our services with anonymized data
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
          
          {/* Transactions */}
          <Link to="/transactions" className="flex flex-col items-center justify-center flex-1 h-full">
            <FiBarChart2 className="w-6 h-6 text-gray-500 mb-1" />
            <span className="text-xs font-medium text-gray-500 mt-1">Transactions</span>
          </Link>
          
          {/* Settings - Active */}
          <Link to='/settings' className="flex flex-col items-center justify-center flex-1 h-full">
            <div className="relative">
              <FiSettings className="w-7 h-7 text-blue-600 mb-1" />
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"></div>
            </div>
            <span className="text-xs font-medium text-blue-600 mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default withProtectedRoute(AccountSettings) 