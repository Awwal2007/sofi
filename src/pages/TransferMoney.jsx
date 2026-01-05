// TransferMoney.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBanking } from '../contexts/BankingContext'
import { 
  FiSend, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiArrowLeft, 
  FiInfo, 
  FiSettings, 
  FiBarChart2, 
  FiHome,
  FiClock,
  FiDollarSign,
  FiUser,
  FiDownload,
  FiShare2
} from 'react-icons/fi'
import { format } from 'date-fns'
import { withProtectedRoute } from '../components/ProtectedRoute'

const TransferMoney = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    toAccount: '',
    amount: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transferResult, setTransferResult] = useState(null)
//   const [requiresConfirmation, setRequiresConfirmation] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const { transferMoney, user, getTransactionDetails } = useBanking()
  const navigate = useNavigate()

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  useEffect(() => {
    // Reset confirmation checkbox when step changes
    setConfirmed(false)
  }, [step])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const validateForm = () => {
    const errors = []
    
    if (!formData.toAccount.trim()) {
      errors.push('Recipient account number is required')
    } else if (formData.toAccount.length < 10) {
      errors.push('Account number must be 10 digits')
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.push('Please enter a valid amount')
    } else if (parseFloat(formData.amount) > (user?.balance || 0)) {
      errors.push('Insufficient funds')
    } else if (parseFloat(formData.amount) > 10000) {
      errors.push('Amount exceeds daily limit of $10,000')
    }
    
    if (errors.length > 0) {
      setError(errors.join('. '))
      return false
    }
    
    return true
  }

  const handleNextStep = async () => {
    if (step === 1) {
      if (validateForm()) {
        setStep(2)
        setError('')
      }
    } else if (step === 2) {
      if (!confirmed) {
        setError('Please confirm the transfer by checking the box')
        return
      }
      await handleTransfer()
    }
  }

  const handleTransfer = async () => {
    setLoading(true)
    setError('')
    
    try {
      const result = await transferMoney(
        formData.toAccount,
        formData.amount,
        formData.description
      )
      
      if (result.success) {
        setTransferResult(result)
        setStep(3)
        
        // If we have a transaction ID, fetch full details
        if (result.transaction?.transactionId) {
          const details = await getTransactionDetails(result.transaction.transactionId)
          if (details.success) {
            setTransferResult(prev => ({ ...prev, transaction: details.data }))
          }
        }
      } else {
        setError(result.message || 'Transfer failed. Please try again.')
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setFormData({
      toAccount: '',
      amount: '',
      description: '',
    })
    setTransferResult(null)
    setConfirmed(false)
    setError('')
  }

  const handleSaveTemplate = () => {
    const templates = JSON.parse(localStorage.getItem('transfer_templates') || '[]')
    templates.push({
      ...formData,
      name: `Transfer to ${formData.toAccount.slice(-4)}`,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('transfer_templates', JSON.stringify(templates.slice(-5))) // Keep last 5
    
    alert('Transfer template saved!')
  }

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Current Balance Display */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(user?.balance || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Account Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {user?.accountNumber ? '••••' + user.accountNumber.slice(-4) : '••••••••••'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recipient Account */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Send To
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="toAccount"
                  value={formData.toAccount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl text-lg font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 10-digit account number"
                  maxLength={10}
                />
                <button 
                  onClick={() => {
                    // This would open a contacts modal in a real app
                    setFormData(prev => ({ ...prev, toAccount: '2844829203' }))
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium text-sm hover:text-blue-700"
                >
                  Recent
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter the recipient's 10-digit account number
              </p>
            </div>
            
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900 text-2xl font-bold">$</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-12 py-4 bg-white border border-gray-300 rounded-2xl text-3xl font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max={user?.balance || 0}
                />
              </div>
              <div className="flex justify-between mt-3">
                <div className="flex gap-2">
                  {[10, 50, 100, 500].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, amount: amount.toString() }))}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    amount: (user?.balance || 0).toString() 
                  }))}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-semibold transition-colors"
                >
                  MAX
                </button>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Add a Note (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="What's this transfer for?"
                rows={3}
                maxLength={100}
              />
              <div className="flex justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Max 100 characters
                </p>
                <p className="text-xs text-gray-500">
                  {formData.description.length}/100
                </p>
              </div>
            </div>

            {/* Transfer Templates (if any) */}
            {(() => {
              const templates = JSON.parse(localStorage.getItem('transfer_templates') || '[]')
              if (templates.length > 0) {
                return (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Saved Templates</h4>
                    <div className="space-y-2">
                      {templates.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setFormData({
                              toAccount: template.toAccount,
                              amount: template.amount,
                              description: template.description
                            })
                          }}
                          className="w-full text-left p-3 bg-white hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{template.name}</span>
                            <span className="text-blue-600 text-sm">Apply</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>To: ••••{template.toAccount.slice(-4)}</span>
                            <span>{formatCurrency(template.amount)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {/* Quick Info */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> First transfer completes immediately. 
                    Subsequent transfers to new recipients may require review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            {/* Transfer Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-6 text-lg">Review Transfer</h3>
              
              <div className="space-y-5">
                {/* From */}
                <div className="flex justify-between items-center pb-4 border-b border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">From</p>
                    <p className="font-semibold text-gray-900">{user?.name || 'Your Account'}</p>
                    <p className="text-xs text-gray-500">
                      {user?.accountNumber ? '••••' + user.accountNumber.slice(-4) : '••••••••••'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Current Balance</p>
                    <p className="font-bold text-gray-900">{formatCurrency(user?.balance || 0)}</p>
                  </div>
                </div>
                
                {/* To */}
                <div className="flex justify-between items-center pb-4 border-b border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">To</p>
                    <p className="font-semibold text-gray-900">
                      Account: ••••{formData.toAccount.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500">External Bank Account</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FiSend className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                {/* Amount */}
                <div className="flex justify-between items-center pb-4 border-b border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(parseFloat(formData.amount) || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Transfer Fee</p>
                    <p className="font-semibold text-green-600">$0.00</p>
                  </div>
                </div>
                
                {/* Description */}
                {formData.description && (
                  <div className="pb-4 border-b border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Note</p>
                    <p className="font-medium text-gray-900">{formData.description}</p>
                  </div>
                )}
                
                {/* New Balance */}
                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-sm text-gray-600">New Balance</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency((user?.balance || 0) - (parseFloat(formData.amount) || 0))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      Instant Transfer
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Warning Alert */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <FiAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-800 mb-2">Important Security Notice</p>
                  <p className="text-sm text-yellow-800 mb-3">
                    Please verify the account number before confirming. Transfers are processed immediately 
                    and cannot be reversed. Only send money to trusted recipients.
                  </p>
                  <div className="flex items-start gap-3 p-3 bg-yellow-100 rounded-lg">
                    <input
                      type="checkbox"
                      id="confirmation"
                      checked={confirmed}
                      onChange={(e) => {
                        setConfirmed(e.target.checked)
                        setError('')
                      }}
                      className="w-4 h-4 text-blue-600 bg-white border-yellow-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5 flex-shrink-0"
                    />
                    <label htmlFor="confirmation" className="text-sm text-yellow-800">
                      I confirm that the recipient details are correct and I authorize this transfer.
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Template Option */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Save as template</p>
                  <p className="text-sm text-gray-600">Save these details for future transfers</p>
                </div>
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="text-center space-y-6">
            {transferResult?.success ? (
              <>
                {/* Success Animation */}
                <div className="relative">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <FiCheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <div className="absolute inset-0 animate-ping bg-green-100 rounded-full opacity-30"></div>
                </div>
                
                {/* Success Message */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Transfer Complete!
                  </h3>
                  <p className="text-gray-600 text-lg">
                    {formatCurrency(parseFloat(formData.amount) || 0)} sent successfully
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    to account ending in {formData.toAccount.slice(-4)}
                  </p>
                </div>
                
                {/* Transaction Details */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                        transferResult.transaction?.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : transferResult.transaction?.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transferResult.transaction?.status?.toUpperCase() || 'COMPLETED'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-mono text-sm font-semibold">
                        {transferResult.transaction?.transactionId || 'TRX' + Date.now().toString().slice(-8)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Date & Time</span>
                      <span className="font-medium">
                        {transferResult.transaction?.createdAt 
                          ? format(new Date(transferResult.transaction.createdAt), 'MMM d, h:mm a')
                          : format(new Date(), 'MMM d, h:mm a')
                        }
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">New Balance</span>
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(transferResult.newBalance || (user?.balance || 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    onClick={handleReset}
                    className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors"
                  >
                    Send More
                  </button>
                  <button 
                    onClick={() => navigate('/transactions')}
                    className="px-6 py-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl transition-colors"
                  >
                    View Receipt
                  </button>
                </div>
                
                {/* Additional Options */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button className="py-3 text-blue-600 font-medium text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <FiDownload className="w-4 h-4" />
                    Download Receipt
                  </button>
                  <button className="py-3 text-blue-600 font-medium text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <FiShare2 className="w-4 h-4" />
                    Share Details
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Error State */}
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <FiAlertCircle className="w-12 h-12 text-red-600" />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Transfer Failed
                  </h3>
                  <p className="text-gray-600">
                    {transferResult?.message || error || 'An error occurred while processing your transfer'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleReset}
                    className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => navigate('/support')}
                    className="px-6 py-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold rounded-2xl transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </>
            )}
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => step === 1 ? navigate('/dashboard') : setStep(step - 1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {step === 1 ? 'Send Money' : step === 2 ? 'Confirm Transfer' : 'Complete'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {step === 1 ? 'Transfer funds to another account' : 
                 step === 2 ? 'Review and confirm your transfer' : 
                 transferResult?.success ? 'Your transfer was successful' : 'Transfer could not be completed'}
              </p>
            </div>

            <div className="w-20"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {step < 3 && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2].map((stepNumber) => (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${
                    step >= stepNumber 
                      ? 'bg-blue-600 text-white border-4 border-blue-100' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {stepNumber}
                  </div>
                  <p className={`text-xs font-medium mt-2 ${
                    step >= stepNumber ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stepNumber === 1 ? 'Details' : 'Confirm'}
                  </p>
                </div>
                
                {stepNumber < 2 && (
                  <div className={`flex-1 h-1 mx-2 rounded-full ${step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="md:p-6 p-3">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl md:p-6 p-3 shadow-sm mb-6">
            {renderStepContent()}
            
            {error && step < 3 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 3 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleNextStep}
                  disabled={loading || (step === 1 && (!formData.toAccount || !formData.amount))}
                  className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
                    loading || (step === 1 && (!formData.toAccount || !formData.amount))
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : step === 2 ? (
                    <>
                      <FiSend className="w-5 h-5" />
                      Confirm & Send {formatCurrency(parseFloat(formData.amount) || 0)}
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Important Information Card */}
          {step < 3 && (
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <FiInfo className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Important Information</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">First transfer completes immediately,</span> subsequent transfers may require review
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Daily transfer limit:</span> $10,000 per recipient
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Processing time:</span> Usually within 1-2 business hours
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Support:</span> Contact us for urgent transfers or issues
                  </p>
                </div>
              </div>
              
              <button className="w-full mt-6 py-3 text-blue-600 font-semibold text-sm border-t border-gray-100 pt-4">
                View All Transfer Policies
              </button>
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
          
          {/* Transfer - Active when on transfer page */}
          <Link to='/transfer' className="flex flex-col items-center justify-center flex-1 h-full">
            <div className="relative">
              <FiSend className={`w-7 h-7 ${step < 3 ? 'text-blue-600' : 'text-gray-500'} mb-1`} />
              {step < 3 && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"></div>
              )}
            </div>
            <span className={`text-xs font-medium mt-1 ${step < 3 ? 'text-blue-600' : 'text-gray-500'}`}>
              Transfer
            </span>
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
  )
}

export default withProtectedRoute(TransferMoney) 