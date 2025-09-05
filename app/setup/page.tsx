'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SetupResponse {
  success: boolean
  message?: string
  error?: string
  details?: string
  adminCredentials?: Array<{
    username: string
    password: string
    name: string
    note: string
  }>
  instructions?: string[]
  sqlFile?: string
}

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupResult, setSetupResult] = useState<SetupResponse | null>(null)
  const [showPasswords, setShowPasswords] = useState(false)

  const runSetup = async () => {
    setIsLoading(true)
    setSetupResult(null)

    try {
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result: SetupResponse = await response.json()
      setSetupResult(result)
    } catch (error) {
      setSetupResult({
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Failed to connect to setup API'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23334155' fill-opacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg border border-slate-200">
              <img 
                src="/logo.jpeg" 
                alt="Salon Muslimah Dina" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Database Setup
            </h1>
            <p className="text-slate-600">
              Salon Muslimah Dina - Initialize Database
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-slate-300 to-slate-500 mx-auto mt-4"></div>
          </motion.div>

          {/* Instructions */}
          {!setupResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4">Setup Instructions</h3>
                <ol className="space-y-2 text-blue-700">
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                    <div>
                      <strong>Run SQL Setup:</strong> Execute the SQL script in your Supabase dashboard
                      <code className="block mt-1 bg-blue-100 p-2 rounded text-sm">lib/database-setup.sql</code>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                    <div>
                      <strong>Initialize Database:</strong> Click the button below to create admin users
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                    <div>
                      <strong>Login:</strong> Use the generated credentials to access the admin panel
                    </div>
                  </li>
                </ol>
              </div>

              <div className="text-center">
                <button
                  onClick={runSetup}
                  disabled={isLoading}
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isLoading
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-xl'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Setting up database...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Initialize Database
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Setup Results */}
          {setupResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {setupResult.success ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">✅</span>
                    <h3 className="text-lg font-semibold text-green-800">Setup Successful!</h3>
                  </div>
                  <p className="text-green-700 mb-4">{setupResult.message}</p>
                  
                  {setupResult.adminCredentials && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-green-800">Admin Credentials</h4>
                        <button
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="px-3 py-1 bg-green-200 text-green-800 rounded-lg text-sm hover:bg-green-300 transition-colors"
                        >
                          {showPasswords ? '🙈 Hide' : '👁️ Show'} Passwords
                        </button>
                      </div>
                      
                      <div className="grid gap-4">
                        {setupResult.adminCredentials.map((admin, index) => (
                          <div key={admin.username} className="bg-white border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-800">{admin.name}</h5>
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                {admin.note}
                              </span>
                            </div>
                            <div className="space-y-2 font-mono text-sm">
                              <div>
                                <span className="text-gray-600">Username: </span>
                                <span className="bg-gray-100 px-2 py-1 rounded">{admin.username}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Password: </span>
                                <span className="bg-gray-100 px-2 py-1 rounded">
                                  {showPasswords ? admin.password : '••••••••••••'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {setupResult.instructions && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-green-800 mb-2">Next Steps:</h4>
                      <ul className="space-y-1 text-green-700">
                        {setupResult.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-green-200">
                    <a
                      href="/admin/masuk"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      <span>🔑</span>
                      Go to Login Page
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">❌</span>
                    <h3 className="text-lg font-semibold text-red-800">Setup Failed</h3>
                  </div>
                  <p className="text-red-700 mb-4">{setupResult.error}</p>
                  {setupResult.details && (
                    <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-800 font-mono text-sm">{setupResult.details}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button
                      onClick={runSetup}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setSetupResult(null)}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      Back to Instructions
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}