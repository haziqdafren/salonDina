'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface DatabaseStats {
  tables: number
  totalRecords: number
  counts: {
    admins: number
    services: number
    therapists: number
    customers: number
    treatments: number
    bookings: number
    bookkeeping: number
  }
}

export default function DatabaseManager() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDatabaseStats()
  }, [])

  const loadDatabaseStats = async () => {
    try {
      const response = await fetch('/api/database/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorization: 'force-migrate-salon-2024' })
      })
      
      const data = await response.json()
      if (data.success) {
        setStats({
          tables: data.data.tableCount,
          totalRecords: Object.values(data.data.counts).reduce((sum: number, count: any) => sum + count, 0),
          counts: data.data.counts
        })
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const runMigration = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/database/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorization: 'force-migrate-salon-2024' })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        await loadDatabaseStats()
      }
    } catch (error) {
      setResult({ success: false, error: 'Migration failed' })
    } finally {
      setLoading(false)
    }
  }

  const runPopulation = async (forceOverwrite = false) => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/database/populate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          authorization: 'populate-salon-database-2024',
          forceOverwrite
        })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        await loadDatabaseStats()
      }
    } catch (error) {
      setResult({ success: false, error: 'Population failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🗃️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Database Manager
          </h1>
          <p className="text-gray-600">
            Comprehensive database management for Salon Muslimah Dina
          </p>
        </motion.div>

        {/* Database Overview */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl border border-pink-100 p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span> Database Overview
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{stats.tables}</div>
                <div className="text-sm text-blue-700">Database Tables</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{stats.totalRecords}</div>
                <div className="text-sm text-green-700">Total Records</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{stats.counts.services}</div>
                <div className="text-sm text-purple-700">Services</div>
              </div>
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <div className="text-3xl font-bold text-pink-600">{stats.counts.customers}</div>
                <div className="text-sm text-pink-700">Customers</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">👤 Users & Access</h3>
                <div className="space-y-1 text-sm">
                  <p>Admins: <span className="font-semibold">{stats.counts.admins}</span></p>
                  <p>Therapists: <span className="font-semibold">{stats.counts.therapists}</span></p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">💆‍♀️ Business Data</h3>
                <div className="space-y-1 text-sm">
                  <p>Treatments: <span className="font-semibold">{stats.counts.treatments}</span></p>
                  <p>Bookings: <span className="font-semibold">{stats.counts.bookings}</span></p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">💰 Financial</h3>
                <div className="space-y-1 text-sm">
                  <p>Bookkeeping: <span className="font-semibold">{stats.counts.bookkeeping}</span></p>
                  <p>Records: <span className="font-semibold">Daily tracking</span></p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Database Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-pink-100 p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🔧</span> Database Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={runMigration}
              disabled={loading}
              className="p-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50 transition-colors flex flex-col items-center gap-2"
            >
              <span className="text-2xl">🔍</span>
              <div className="text-center">
                <div>Check Schema</div>
                <div className="text-xs opacity-75">Verify tables</div>
              </div>
            </button>

            <button
              onClick={() => runPopulation(false)}
              disabled={loading}
              className="p-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors flex flex-col items-center gap-2"
            >
              <span className="text-2xl">📥</span>
              <div className="text-center">
                <div>Populate Data</div>
                <div className="text-xs opacity-75">Add missing data</div>
              </div>
            </button>

            <button
              onClick={() => runPopulation(true)}
              disabled={loading}
              className="p-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 transition-colors flex flex-col items-center gap-2"
            >
              <span className="text-2xl">🔄</span>
              <div className="text-center">
                <div>Reset Data</div>
                <div className="text-xs opacity-75">Overwrite all</div>
              </div>
            </button>

            <button
              onClick={loadDatabaseStats}
              disabled={loading}
              className="p-4 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 disabled:opacity-50 transition-colors flex flex-col items-center gap-2"
            >
              <span className="text-2xl">📊</span>
              <div className="text-center">
                <div>Refresh Stats</div>
                <div className="text-xs opacity-75">Update info</div>
              </div>
            </button>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">⚠️ Important Notes</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• <strong>Check Schema:</strong> Verifies database tables are created correctly</p>
              <p>• <strong>Populate Data:</strong> Adds missing data without overwriting existing</p>
              <p>• <strong>Reset Data:</strong> Completely replaces all data (use carefully!)</p>
              <p>• <strong>Refresh Stats:</strong> Updates the overview with latest counts</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl border border-pink-100 p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>🚀</span> Quick Access
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a 
              href="/admin/masuk"
              className="p-4 bg-pink-100 text-pink-700 rounded-xl font-semibold hover:bg-pink-200 transition-colors text-center"
            >
              🔐 Admin Login
            </a>
            <a 
              href="/admin/dashboard"
              className="p-4 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-colors text-center"
            >
              📊 Dashboard
            </a>
            <a 
              href="/admin/customers"
              className="p-4 bg-green-100 text-green-700 rounded-xl font-semibold hover:bg-green-200 transition-colors text-center"
            >
              👥 Customers
            </a>
            <Link 
              href="/"
              className="p-4 bg-purple-100 text-purple-700 rounded-xl font-semibold hover:bg-purple-200 transition-colors text-center"
            >
              🏠 Homepage
            </Link>
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
              {result.success ? 'Operation Successful!' : 'Operation Failed'}
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

            {/* Population Results */}
            {result.success && result.data?.results && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {Object.entries(result.data.results).map(([key, value]: [string, any]) => (
                  <div key={key} className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-semibold text-blue-800 capitalize">{key}</div>
                    <div className="text-lg font-bold text-blue-600">
                      +{value.created} 📥 {value.existing}
                    </div>
                    <div className="text-xs text-blue-600">Created | Existing</div>
                  </div>
                ))}
              </div>
            )}

            {/* Login Credentials */}
            {result.success && result.data?.credentials && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-2">🔑 Admin Login Credentials:</h3>
                {result.data.credentials.map((cred: any, idx: number) => (
                  <div key={idx} className="font-mono text-sm mb-2 p-2 bg-yellow-100 rounded">
                    <p><strong>Role:</strong> {cred.role}</p>
                    <p><strong>Username:</strong> {cred.username}</p>
                    <p><strong>Password:</strong> {cred.password}</p>
                  </div>
                ))}
                
                <div className="mt-4 flex gap-2">
                  <a 
                    href="/admin/masuk"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-semibold"
                  >
                    🚀 Login Now
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
              <p className="text-lg font-semibold text-gray-800">Processing database operation...</p>
              <p className="text-sm text-gray-600">This may take a few moments</p>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}