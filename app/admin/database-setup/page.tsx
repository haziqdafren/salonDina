'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface SetupResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export default function DatabaseSetup() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SetupResult | null>(null)
  const [healthStatus, setHealthStatus] = useState<any>(null)

  // Check database health on component mount
  useEffect(() => {
    checkDatabaseHealth()
  }, [])

  const checkDatabaseHealth = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealthStatus(data)
    } catch (error) {
      console.error('Health check failed:', error)
    }
  }

  const runQuickSetup = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/quick-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorization: 'quick-setup-salon-2024',
          skipIfExists: false
        })
      })

      const data = await response.json()
      setResult(data)

      // Refresh health status after setup
      if (data.success) {
        setTimeout(() => {
          checkDatabaseHealth()
        }, 1000)
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Connection error. Please check your internet connection.',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testAllFeatures = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/test-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorization: 'test-salon-features-2024'
        })
      })

      const data = await response.json()
      setResult({
        success: data.success,
        message: data.message,
        data: data.data
      })
    } catch (error) {
      setResult({
        success: false,
        message: 'Feature testing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🗄️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Database Setup & Management
          </h1>
          <p className="text-gray-600">
            Initialize and manage your salon database system
          </p>
        </motion.div>

        {/* Database Health Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-pink-100 p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span> Database Health Status
          </h2>
          
          {healthStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${
                healthStatus.status === 'healthy' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{healthStatus.status === 'healthy' ? '✅' : '⚠️'}</span>
                  <span className="font-semibold">Status: {healthStatus.status}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Environment: {healthStatus.environment}</p>
                  <p>Timestamp: {new Date(healthStatus.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span>🗃️</span>
                  <span className="font-semibold">Database Info</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Connected: {healthStatus.database?.connected ? 'Yes' : 'No'}</p>
                  <p>Tables: {healthStatus.database?.tables || 0}</p>
                  <p>Version: {healthStatus.database?.version || 'Unknown'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Checking database health...</p>
            </div>
          )}
        </motion.div>

        {/* Setup Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-pink-100 p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🚀</span> Database Setup Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={runQuickSetup}
              disabled={loading}
              className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 disabled:opacity-50 transition-all flex flex-col items-center gap-3"
            >
              <span className="text-3xl">⚡</span>
              <div className="text-center">
                <div className="font-bold text-lg">Quick Setup</div>
                <div className="text-sm opacity-90">Create admin + sample data</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={testAllFeatures}
              disabled={loading}
              className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all flex flex-col items-center gap-3"
            >
              <span className="text-3xl">🧪</span>
              <div className="text-center">
                <div className="font-bold text-lg">Test Features</div>
                <div className="text-sm opacity-90">Run comprehensive tests</div>
              </div>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={checkDatabaseHealth}
              className="p-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              🔄 Refresh Health Status
            </button>

            <a
              href="/admin/masuk"
              className="p-4 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors text-center"
            >
              🏠 Go to Admin Login
            </a>
          </div>
        </motion.div>

        {/* Results Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-pink-100 p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>{result.success ? '✅' : '❌'}</span> 
              {result.success ? 'Success!' : 'Error'}
            </h2>

            <div className={`p-4 rounded-lg mb-4 ${
              result.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <p className="font-medium">{result.message}</p>
              {result.error && (
                <p className="text-sm mt-2 opacity-75">{result.error}</p>
              )}
            </div>

            {/* Setup Results */}
            {result.success && result.data?.setupResults && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.data.setupResults.adminsCreated}
                  </div>
                  <div className="text-sm text-blue-700">Admins Created</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.data.setupResults.servicesCreated}
                  </div>
                  <div className="text-sm text-purple-700">Services Created</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {result.data.setupResults.therapistsCreated}
                  </div>
                  <div className="text-sm text-green-700">Therapists Created</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {result.data.setupResults.customersCreated}
                  </div>
                  <div className="text-sm text-yellow-700">Customers Created</div>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">
                    {result.data.setupResults.treatmentsCreated}
                  </div>
                  <div className="text-sm text-pink-700">Treatments Created</div>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {result.data.setupResults.bookingsCreated}
                  </div>
                  <div className="text-sm text-indigo-700">Bookings Created</div>
                </div>
              </div>
            )}

            {/* Login Credentials */}
            {result.success && result.data?.credentials && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-2">🔑 Admin Login Credentials:</h3>
                <div className="font-mono text-sm">
                  <p><strong>Username:</strong> {result.data.credentials.username}</p>
                  <p><strong>Password:</strong> {result.data.credentials.password}</p>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  Save these credentials securely and change the password after first login.
                </p>
                
                <div className="mt-4 flex gap-2">
                  <a 
                    href="/admin/masuk"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-semibold"
                  >
                    Login Now
                  </a>
                  <a 
                    href="/admin/dashboard"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    Go to Dashboard
                  </a>
                </div>
              </div>
            )}

            {/* Test Results */}
            {result.data?.tests && (
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800">Test Results:</h3>
                {result.data.tests.map((test: any, index: number) => (
                  <div key={index} className={`p-2 rounded text-sm ${
                    test.status === 'PASS' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-mono">
                      {test.status === 'PASS' ? '✅' : '❌'} {test.name}
                    </span>
                    {test.error && <span className="block text-xs mt-1">{test.error}</span>}
                  </div>
                ))}
                
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Summary:</strong> {result.data.summary.passed}/{result.data.summary.total} tests passed
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-800">Setting up database...</p>
              <p className="text-sm text-gray-600">This may take a few moments</p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}