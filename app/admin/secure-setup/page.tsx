'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SetupFormData {
  username: string
  password: string
  confirmPassword: string
  name: string
}

export default function SecureSetup() {
  const [formData, setFormData] = useState<SetupFormData>({
    username: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setResult({ success: false, message: 'Passwords do not match' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorization: 'setup-salon-dina-2024',
          adminData: {
            username: formData.username,
            password: formData.password,
            name: formData.name
          }
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: 'Database setup completed successfully!',
          data: data.data
        })
        
        // Clear form for security
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          name: ''
        })
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = '/admin/masuk'
        }, 3000)
      } else {
        setResult({
          success: false,
          message: data.error || 'Setup failed. Please try again.'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Connection error. Please check your internet connection.'
      })
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = (password: string) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z\d]/.test(password)) score++
    
    if (score < 2) return { text: 'Weak', color: 'red' }
    if (score < 4) return { text: 'Medium', color: 'yellow' }
    return { text: 'Strong', color: 'green' }
  }

  const strength = passwordStrength(formData.password)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-pink-100 p-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Secure Admin Setup
          </h1>
          <p className="text-gray-600 text-sm">
            Create your secure administrator account for Salon Muslimah Dina
          </p>
        </motion.div>

        {/* Result Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-6 ${
              result.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{result.success ? '✅' : '❌'}</span>
              <span className="text-sm font-medium">{result.message}</span>
            </div>
            
            {result.success && result.data && (
              <div className="mt-3 text-xs">
                <p>Admin: <strong>{result.data.adminCreated.name}</strong></p>
                <p>Username: <strong>{result.data.adminCreated.username}</strong></p>
                <p className="mt-2 text-green-600">Redirecting to login in 3 seconds...</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Administrator Full Name"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="admin_username"
              pattern="[a-zA-Z0-9_]+"
              minLength={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              At least 3 characters, letters, numbers and underscores only
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Strong secure password"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {formData.password && (
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full bg-${strength.color}-500`}></div>
                <span className={`text-xs text-${strength.color}-600 font-medium`}>
                  {strength.text} Password
                </span>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Minimum 8 characters with uppercase, lowercase, and numbers
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Confirm your password"
              minLength={8}
            />
            
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || result?.success}
            className="w-full bg-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Setting up database...
              </>
            ) : result?.success ? (
              <>
                ✅ Setup completed!
              </>
            ) : (
              <>
                🚀 Setup Salon Database
              </>
            )}
          </motion.button>
        </form>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <span className="text-yellow-600">⚠️</span>
            <div className="text-xs text-yellow-700">
              <p className="font-medium mb-1">Security Notice:</p>
              <ul className="space-y-1 text-xs">
                <li>• This setup can only be run once</li>
                <li>• Store your credentials securely</li>
                <li>• Use a unique, strong password</li>
                <li>• Never share admin credentials</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-8 pt-6 border-t border-gray-100 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-pink-600">
            <span className="text-lg">💆‍♀️</span>
            <span className="font-semibold text-sm">Salon Muslimah Dina</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Professional Salon Management System
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}