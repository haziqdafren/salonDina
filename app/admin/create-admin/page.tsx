'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface DebugInfo {
  database: {
    available: boolean
    connected: boolean
    tables: number
    adminCount: number
    adminUsers: any[]
  }
  auth: {
    bcryptAvailable: boolean
    testHash: string | null
    testVerification: boolean
  }
}

export default function CreateAdmin() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: 'admin_dina',
    password: 'DinaAdmin123!',
    name: 'Administrator Salon Dina'
  })

  const runDebug = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/debug-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorization: 'debug-auth-salon-2024' })
      })
      
      const data = await response.json()
      if (data.success) {
        setDebugInfo(data.data)
      }
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: 'Debug failed' })
    } finally {
      setLoading(false)
    }
  }

  const createAdmin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/debug-auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorization: 'create-admin-salon-2024',
          username: formData.username,
          password: formData.password,
          name: formData.name
        })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        // Clear form
        setFormData({
          username: '',
          password: '',
          name: ''
        })
      }
    } catch (error) {
      setResult({ success: false, error: 'Admin creation failed' })
    } finally {
      setLoading(false)
    }
  }

  const runQuickSetup = async () => {
    setLoading(true)
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
    } catch (error) {
      setResult({ success: false, error: 'Quick setup failed' })
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
            <span className="text-4xl">🔧</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Admin Creation & Debug Tool
          </h1>
          <p className="text-gray-600">
            Debug authentication system and create admin users
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-pink-100 p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={runDebug}
              disabled={loading}
              className="p-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              🔍 Debug System
            </button>
            
            <button
              onClick={runQuickSetup}
              disabled={loading}
              className="p-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              ⚡ Run Quick Setup
            </button>

            <a
              href="/admin/database-setup"
              className="p-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors text-center"
            >
              🗄️ Database Setup
            </a>
          </div>
        </motion.div>

        {/* Debug Info Display */}
        {debugInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-pink-100 p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 System Debug Info</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Database Info */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">Database Status</h3>
                <div className="space-y-1 text-sm">
                  <p>Available: {debugInfo.database.available ? '✅ Yes' : '❌ No'}</p>
                  <p>Connected: {debugInfo.database.connected ? '✅ Yes' : '❌ No'}</p>
                  <p>Tables: {debugInfo.database.tables}</p>
                  <p>Admin Count: {debugInfo.database.adminCount}</p>
                </div>
                
                {debugInfo.database.adminUsers.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold text-blue-800">Admin Users:</p>
                    {debugInfo.database.adminUsers.map((admin, idx) => (
                      <div key={idx} className="text-xs bg-blue-100 p-2 rounded mt-1">
                        <p>Username: {admin.username}</p>
                        <p>Name: {admin.name}</p>
                        <p>Created: {new Date(admin.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth Info */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold text-green-800 mb-2">Auth System</h3>
                <div className="space-y-1 text-sm">
                  <p>Bcrypt Available: {debugInfo.auth.bcryptAvailable ? '✅ Yes' : '❌ No'}</p>
                  <p>Test Hash: {debugInfo.auth.testHash ? '✅ Working' : '❌ Failed'}</p>
                  <p>Test Verification: {debugInfo.auth.testVerification ? '✅ Working' : '❌ Failed'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Admin Creation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-pink-100 p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">👤 Create Admin User</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="admin_username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Strong password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Administrator Name"
                />
              </div>

              <button
                onClick={createAdmin}
                disabled={loading || !formData.username || !formData.password || !formData.name}
                className="w-full p-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-2">⚠️ Default Credentials</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p><strong>Username:</strong> admin_dina</p>
                <p><strong>Password:</strong> DinaAdmin123!</p>
                <p><strong>Name:</strong> Administrator Salon Dina</p>
              </div>
              <p className="text-xs text-yellow-600 mt-2">
                These are the default credentials. Change them if needed.
              </p>
            </div>
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
                <p className="text-sm mt-2">{result.error}</p>
              )}
              {result.details && (
                <p className="text-sm mt-2 opacity-75">{result.details}</p>
              )}
            </div>

            {/* Success Actions */}
            {result.success && result.data?.credentials && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-800 mb-2">🔑 Login Credentials:</h3>
                <div className="font-mono text-sm space-y-1">
                  <p><strong>Username:</strong> {result.data.credentials.username}</p>
                  <p><strong>Password:</strong> {result.data.credentials.password}</p>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <a 
                    href="/admin/masuk"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                  >
                    🚀 Login Now
                  </a>
                  <a 
                    href="/admin/dashboard"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                  >
                    📊 Go to Dashboard
                  </a>
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
              <p className="text-lg font-semibold text-gray-800">Processing...</p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}