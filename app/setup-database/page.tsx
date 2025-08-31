'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function DatabaseSetup() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  const setupDatabase = async () => {
    setLoading(true)
    setStatus('🚀 Starting database setup...')

    try {
      // Try the API route first
      setStatus('📡 Connecting to database...')
      const response = await fetch('/api/database/populate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          authorization: 'populate-salon-database-2024',
          forceOverwrite: false
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStatus('✅ Database populated successfully!')
          setCompleted(true)
        } else {
          setStatus(`❌ Setup failed: ${data.error}`)
        }
      } else {
        setStatus(`❌ API request failed: ${response.status}`)
      }
    } catch (error) {
      setStatus(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Emergency Database Setup
          </h1>
          <p className="text-gray-600">
            One-click setup for Salon Muslimah Dina Database
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-pink-100 p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span>🗃️</span> Database Setup Status
          </h2>
          
          {!completed && (
            <div className="text-center">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  This will create:
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">👤 Admin Accounts</div>
                    <div className="text-blue-600">2 secure admin users</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">💆‍♀️ Salon Services</div>
                    <div className="text-green-600">20+ treatment options</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800">👩‍⚕️ Therapists</div>
                    <div className="text-purple-600">6 professional staff</div>
                  </div>
                  <div className="bg-pink-50 p-3 rounded-lg">
                    <div className="font-semibold text-pink-800">👥 Sample Customers</div>
                    <div className="text-pink-600">5 test customers</div>
                  </div>
                </div>
              </div>

              <button
                onClick={setupDatabase}
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Setting up database...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    🚀 Setup Database Now
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Status */}
          {status && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="font-mono text-sm">
                {status}
              </div>
            </div>
          )}

          {/* Success */}
          {completed && (
            <div className="mt-6 space-y-4">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-bold text-green-800 mb-3">✅ Setup Complete!</h3>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">🔑 Admin Login Credentials:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="font-mono bg-green-100 p-2 rounded">
                      <strong>Username:</strong> admin_dina<br/>
                      <strong>Password:</strong> DinaAdmin123!
                    </div>
                    <div className="font-mono bg-green-100 p-2 rounded">
                      <strong>Username:</strong> owner_dina<br/>
                      <strong>Password:</strong> OwnerDina2024!
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a 
                    href="/admin/masuk" 
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    🔐 Login Now
                  </a>
                  <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🏠 Check Homepage
                  </Link>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-bold text-yellow-800 mb-2">🔥 Next Steps:</h4>
                <ol className="text-sm text-yellow-700 space-y-1">
                  <li>1. Try logging in with the admin credentials above</li>
                  <li>2. Check the homepage - treatments should now appear in booking</li>
                  <li>3. Access the admin dashboard to manage your salon</li>
                  <li>4. Delete this setup page: <code>/app/setup-database/</code></li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>🔒 This page should be deleted after successful setup</p>
        </div>

      </div>
    </div>
  )
}