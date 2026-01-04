// Register.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBanking } from '../contexts/BankingContext'
import { 
  FiEye, 
  FiEyeOff, 
  FiLock, 
  FiMail, 
  FiAlertCircle, 
  FiCheckCircle,
  FiUser,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiShield,
  FiCreditCard,
  FiArrowLeft,
  FiTrendingUp,
  FiDollarSign,
  FiPercent
} from 'react-icons/fi'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

const Register = () => {
  const navigate = useNavigate()
  const { register, user, loading } = useBanking()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    dateOfBirth: null,
    ssn: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: Personal, 2: Security, 3: Verify
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Redirect if user is already logged in
  // useEffect(() => {
  //   if (user) {
  //     navigate('/dashboard')
  //   }
  // }, [user, navigate])

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
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))
  }

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      dateOfBirth: date
    }))
    setErrors(prev => ({
      ...prev,
      dateOfBirth: ''
    }))
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (formData.dateOfBirth) {
      const age = new Date().getFullYear() - formData.dateOfBirth.getFullYear()
      if (age < 18) newErrors.dateOfBirth = 'You must be at least 18 years old'
    }
    
    return newErrors
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required'
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required'
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required'
    if (!formData.address.zipCode.trim()) newErrors['address.zipCode'] = 'Zip code is required'
    if (!formData.ssn.trim()) newErrors.ssn = 'SSN is required'
    if (formData.ssn && !/^\d{3}-?\d{2}-?\d{4}$/.test(formData.ssn)) {
      newErrors.ssn = 'Please enter a valid SSN (XXX-XX-XXXX)'
    }
    
    return newErrors
  }

  const validateStep3 = () => {
    const newErrors = {}
    
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (!/(?=.*[A-Z])/.test(formData.password)) newErrors.password = 'Password must contain at least one uppercase letter'
    if (!/(?=.*\d)/.test(formData.password)) newErrors.password = 'Password must contain at least one number'
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!acceptedTerms) newErrors.terms = 'You must accept the terms and conditions'
    
    return newErrors
  }

  const handleNextStep = () => {
    let validationErrors = {}
    
    if (currentStep === 1) {
      validationErrors = validateStep1()
    } else if (currentStep === 2) {
      validationErrors = validateStep2()
    }
    
    if (Object.keys(validationErrors).length === 0) {
      setCurrentStep(prev => prev + 1)
      setErrors({})
    } else {
      setErrors(validationErrors)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1)
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const step3Errors = validateStep3()
    if (Object.keys(step3Errors).length > 0) {
      setErrors(step3Errors)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    setSuccess('')

    try {
      const registrationData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : null
      }

      const result = await register(registrationData)
      
      if (result.success) {
        setSuccess('Account created successfully! Redirecting to login...')
        // Redirect to login with success message
        setTimeout(() => {
          navigate('/login', { state: { fromRegistration: true } })
        }, 2000)
      } else {
        setErrors({ general: result.message || 'Registration failed. Please try again.' })
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Password strength indicator
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

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to login</span>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">SoFi</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Progress & Benefits */}
            <div className="lg:col-span-1 space-y-8">
              {/* Progress Steps */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-6">Account Setup</h3>
                <div className="space-y-6">
                  {[
                    { number: 1, label: 'Personal Info', description: 'Basic information' },
                    { number: 2, label: 'Address & Identity', description: 'Verification details' },
                    { number: 3, label: 'Security', description: 'Password & terms' }
                  ].map((step) => (
                    <div key={step.number} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${
                        currentStep === step.number 
                          ? 'bg-blue-600 text-white border-4 border-blue-100' 
                          : currentStep > step.number
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {currentStep > step.number ? '✓' : step.number}
                      </div>
                      <div>
                        <p className={`font-medium ${
                          currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="font-semibold text-lg mb-4">Why Choose SoFi?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <FiDollarSign className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">No Account Fees</p>
                      <p className="text-sm opacity-90">No monthly fees or minimums</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiPercent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">High-Yield Savings</p>
                      <p className="text-sm opacity-90">Earn up to 4.60% APY*</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiShield className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">FDIC Insured</p>
                      <p className="text-sm opacity-90">Up to $2M per account</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiCreditCard className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Instant Transfers</p>
                      <p className="text-sm opacity-90">Send money in seconds</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <FiShield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Bank-Level Security</h4>
                    <p className="text-sm text-blue-800">
                      Your information is protected with 256-bit encryption and multi-factor authentication.
                      We never share your personal data with third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                  <p className="text-gray-600">Join 6+ million members banking with SoFi</p>
                </div>

                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-green-800">{success}</p>
                    </div>
                  </div>
                )}

                {/* General Error Message */}
                {errors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-red-800">{errors.general}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                      
                      {/* Full Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Legal Name
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <FiUser className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${
                              errors.name ? 'border-red-300' : 'border-gray-200'
                            } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          />
                        </div>
                        {errors.name && (
                          <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <FiMail className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="you@example.com"
                            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${
                              errors.email ? 'border-red-300' : 'border-gray-200'
                            } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          />
                        </div>
                        {errors.email && (
                          <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <FiPhone className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(555) 123-4567"
                            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${
                              errors.phone ? 'border-red-300' : 'border-gray-200'
                            } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                        )}
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                            <FiCalendar className="w-5 h-5 text-gray-400" />
                          </div>
                          <DatePicker
                            selected={formData.dateOfBirth}
                            onChange={handleDateChange}
                            dateFormat="MM/dd/yyyy"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            maxDate={new Date()}
                            minDate={new Date('1900-01-01')}
                            placeholderText="MM/DD/YYYY"
                            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${
                              errors.dateOfBirth ? 'border-red-300' : 'border-gray-200'
                            } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          />
                        </div>
                        {errors.dateOfBirth && (
                          <p className="mt-2 text-sm text-red-600">{errors.dateOfBirth}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Address & Identity */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Address & Identity Verification</h3>
                      
                      {/* Street Address */}
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
                            placeholder="123 Main St"
                            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border ${
                              errors['address.street'] ? 'border-red-300' : 'border-gray-200'
                            } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          />
                        </div>
                        {errors['address.street'] && (
                          <p className="mt-2 text-sm text-red-600">{errors['address.street']}</p>
                        )}
                      </div>

                      {/* City, State, Zip */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleInputChange}
                            placeholder="New York"
                            className={`w-full px-4 py-4 bg-gray-50 border ${
                              errors['address.city'] ? 'border-red-300' : 'border-gray-200'
                            } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          />
                          {errors['address.city'] && (
                            <p className="mt-2 text-sm text-red-600">{errors['address.city']}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State
                          </label>
                          <select
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-4 bg-gray-50 border ${
                              errors['address.state'] ? 'border-red-300' : 'border-gray-200'
                            } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          >
                            <option value="">Select State</option>
                            <option value="AL">Alabama</option>
                            <option value="AK">Alaska</option>
                            <option value="AZ">Arizona</option>
                            <option value="AR">Arkansas</option>
                            <option value="CA">California</option>
                            <option value="CO">Colorado</option>
                            <option value="CT">Connecticut</option>
                            <option value="DE">Delaware</option>
                            <option value="FL">Florida</option>
                            <option value="GA">Georgia</option>
                            <option value="HI">Hawaii</option>
                            <option value="ID">Idaho</option>
                            <option value="IL">Illinois</option>
                            <option value="IN">Indiana</option>
                            <option value="IA">Iowa</option>
                            <option value="KS">Kansas</option>
                            <option value="KY">Kentucky</option>
                            <option value="LA">Louisiana</option>
                            <option value="ME">Maine</option>
                            <option value="MD">Maryland</option>
                            <option value="MA">Massachusetts</option>
                            <option value="MI">Michigan</option>
                            <option value="MN">Minnesota</option>
                            <option value="MS">Mississippi</option>
                            <option value="MO">Missouri</option>
                            <option value="MT">Montana</option>
                            <option value="NE">Nebraska</option>
                            <option value="NV">Nevada</option>
                            <option value="NH">New Hampshire</option>
                            <option value="NJ">New Jersey</option>
                            <option value="NM">New Mexico</option>
                            <option value="NY">New York</option>
                            <option value="NC">North Carolina</option>
                            <option value="ND">North Dakota</option>
                            <option value="OH">Ohio</option>
                            <option value="OK">Oklahoma</option>
                            <option value="OR">Oregon</option>
                            <option value="PA">Pennsylvania</option>
                            <option value="RI">Rhode Island</option>
                            <option value="SC">South Carolina</option>
                            <option value="SD">South Dakota</option>
                            <option value="TN">Tennessee</option>
                            <option value="TX">Texas</option>
                            <option value="UT">Utah</option>
                            <option value="VT">Vermont</option>
                            <option value="VA">Virginia</option>
                            <option value="WA">Washington</option>
                            <option value="WV">West Virginia</option>
                            <option value="WI">Wisconsin</option>
                            <option value="WY">Wyoming</option>
                          </select>
                          {errors['address.state'] && (
                            <p className="mt-2 text-sm text-red-600">{errors['address.state']}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={handleInputChange}
                            placeholder="10001"
                            className={`w-full px-4 py-4 bg-gray-50 border ${
                              errors['address.zipCode'] ? 'border-red-300' : 'border-gray-200'
                            } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          />
                          {errors['address.zipCode'] && (
                            <p className="mt-2 text-sm text-red-600">{errors['address.zipCode']}</p>
                          )}
                        </div>
                      </div>

                      {/* SSN */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Social Security Number (SSN)
                        </label>
                        <input
                          type="text"
                          name="ssn"
                          value={formData.ssn}
                          onChange={handleInputChange}
                          placeholder="XXX-XX-XXXX"
                          className={`w-full px-4 py-4 bg-gray-50 border ${
                            errors.ssn ? 'border-red-300' : 'border-gray-200'
                          } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        />
                        {errors.ssn && (
                          <p className="mt-2 text-sm text-red-600">{errors.ssn}</p>
                        )}
                        <p className="mt-2 text-sm text-gray-500">
                          Used for identity verification. We use bank-level encryption to protect your data.
                        </p>
                      </div>

                      {/* Privacy Note */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Note:</span> This information is required to verify your identity and comply with banking regulations. 
                          All data is encrypted and stored securely.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Security */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h3>
                      
                      {/* Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <FiLock className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Create a strong password"
                            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border ${
                              errors.password ? 'border-red-300' : 'border-gray-200'
                            } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <FiEyeOff className="w-5 h-5" />
                            ) : (
                              <FiEye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                        )}

                        {/* Password Strength Indicator */}
                        {formData.password && (
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
                            <ul className="mt-2 text-xs text-gray-600 space-y-1">
                              <li className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                                {formData.password.length >= 8 ? '✓' : '•'} At least 8 characters
                              </li>
                              <li className={`flex items-center gap-1 ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''}`}>
                                {/(?=.*[A-Z])/.test(formData.password) ? '✓' : '•'} One uppercase letter
                              </li>
                              <li className={`flex items-center gap-1 ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}`}>
                                {/(?=.*\d)/.test(formData.password) ? '✓' : '•'} One number
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <FiLock className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm your password"
                            className={`w-full pl-12 pr-12 py-4 bg-gray-50 border ${
                              errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                            } rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
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

                      {/* Terms and Conditions */}
                      <div className={`p-4 border rounded-xl ${
                        errors.terms ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => {
                              setAcceptedTerms(e.target.checked)
                              setErrors(prev => ({ ...prev, terms: '' }))
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5 flex-shrink-0"
                          />
                          <div>
                            <label htmlFor="terms" className="text-sm text-gray-700">
                              I agree to SoFi's{' '}
                              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                                Terms of Service
                              </a>
                              {' '}and{' '}
                              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                                Privacy Policy
                              </a>
                              . I confirm that I am at least 18 years old and a US resident.
                            </label>
                            {errors.terms && (
                              <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Marketing Consent */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="marketing"
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5 flex-shrink-0"
                        />
                        <label htmlFor="marketing" className="text-sm text-gray-600">
                          Send me financial tips, product updates, and special offers from SoFi. 
                          You can unsubscribe at any time.
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                    {currentStep > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                    ) : (
                      <div></div>
                    )}

                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                          isSubmitting
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                        } text-white`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating Account...
                          </div>
                        ) : (
                          'Create Account'
                        )}
                      </button>
                    )}
                  </div>
                </form>

                {/* Already have account */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>

                {/* Legal Disclaimer */}
                <div className="mt-6 text-xs text-gray-500">
                  <p>
                    *APY is Annual Percentage Yield. Rates are variable and subject to change. 
                    SoFi members with direct deposit can earn up to 4.60% APY on savings balances 
                    (including Vaults) and 0.50% APY on checking balances. 
                  </p>
                  <p className="mt-2">
                    Member FDIC. Equal Housing Lender. SoFi Bank, N.A., NMLS #696891.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-6 mt-12 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} SoFi. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Cookie Policy</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Support</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Security</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register