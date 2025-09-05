'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function TestLoginPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    const tests = [
      {
        name: 'Environment Variables Check',
        test: async () => {
          const response = await fetch('/api/health')
          const data = await response.json()
          return {
            success: response.ok,
            message: data.message || 'Health check failed',
            details: data
          }
        }
      },
      {
        name: 'Database Connection Test',
        test: async () => {
          const response = await fetch('/api/auth/me')
          // This should fail with 401, but that means the API is working
          return {
            success: response.status === 401,
            message: response.status === 401 ? 'Database connection working (401 expected)' : `Unexpected status: ${response.status}`,
            details: { status: response.status }
          }
        }
      },
      {
        name: 'Login API Test',
        test: async () => {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test', password: 'test' })
          })
          const data = await response.json()
          return {
            success: response.status === 401, // Should fail with invalid credentials
            message: response.status === 401 ? 'Login API working (401 expected for invalid credentials)' : `Unexpected status: ${response.status}`,
            details: { status: response.status, data }
          }
        }
      },
      {
        name: 'Admin Table Check',
        test: async () => {
          try {
            const response = await fetch('/api/setup', { method: 'GET' })
            return {
              success: response.ok,
              message: 'Setup endpoint accessible',
              details: { status: response.status }
            }
          } catch (error) {
            return {
              success: false,
              message: 'Setup endpoint error',
              details: { error: error instanceof Error ? error.message : 'Unknown error' }
            }
          }
        }
      },
      {
        name: 'Admin Table Structure Test',
        test: async () => {
          try {
            const response = await fetch('/api/test-admin', { method: 'GET' })
            const data = await response.json()
            return {
              success: data.success,
              message: data.message,
              details: data.data || data.error
            }
          } catch (error) {
            return {
              success: false,
              message: 'Admin table test failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' }
            }
          }
        }
      }
    ]

    for (const test of tests) {
      try {
        const result = await test.test()
        setTestResults(prev => [...prev, {
          name: test.name,
          ...result,
          timestamp: new Date().toISOString()
        }])
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: test.name,
          success: false,
          message: 'Test failed with error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date().toISOString()
        }])
      }
    }
    
    setIsRunning(false)
  }

  const testCredentials = async () => {
    setIsRunning(true)
    const credentials = [
      { username: 'admin', password: 'SalonDina2024!' },
      { username: 'admin_dina', password: 'DinaAdmin123!' },
      { username: 'super_admin', password: 'SuperDina2024!' }
    ]

    for (const cred of credentials) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cred)
        })
        const data = await response.json()
        
        setTestResults(prev => [...prev, {
          name: `Login Test: ${cred.username}`,
          success: data.success,
          message: data.message || `Status: ${response.status}`,
          details: { status: response.status, data },
          timestamp: new Date().toISOString()
        }])
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: `Login Test: ${cred.username}`,
          success: false,
          message: 'Login failed with error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date().toISOString()
        }])
      }
    }
    
    setIsRunning(false)
  }

  const createTestAdmins = async () => {
    setIsRunning(true)
    const admins = [
      { username: 'admin', password: 'SalonDina2024!', name: 'Administrator' },
      { username: 'admin_dina', password: 'DinaAdmin123!', name: 'Dina Admin' },
      { username: 'super_admin', password: 'SuperDina2024!', name: 'Super Administrator' }
    ]

    for (const admin of admins) {
      try {
        const response = await fetch('/api/create-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(admin)
        })
        const data = await response.json()
        
        setTestResults(prev => [...prev, {
          name: `Create Admin: ${admin.username}`,
          success: data.success,
          message: data.message || `Status: ${response.status}`,
          details: { status: response.status, data },
          timestamp: new Date().toISOString()
        }])
      } catch (error) {
        setTestResults(prev => [...prev, {
          name: `Create Admin: ${admin.username}`,
          success: false,
          message: 'Admin creation failed with error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          timestamp: new Date().toISOString()
        }])
      }
    }
    
    setIsRunning(false)
  }

  const listAdmins = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/create-admin', { method: 'GET' })
      const data = await response.json()
      
      setTestResults(prev => [...prev, {
        name: 'List Admin Users',
        success: data.success,
        message: data.message || `Status: ${response.status}`,
        details: { status: response.status, data },
        timestamp: new Date().toISOString()
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        name: 'List Admin Users',
        success: false,
        message: 'Failed to list admins',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: new Date().toISOString()
      }])
    }
    
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Login System Test</h1>
            <p className="text-slate-600">Comprehensive testing for Salon Muslimah Dina login system</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.button
              onClick={runTests}
              disabled={isRunning}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isRunning ? 'Running...' : 'System Tests'}
            </motion.button>

            <motion.button
              onClick={testCredentials}
              disabled={isRunning}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isRunning ? 'Testing...' : 'Test Login'}
            </motion.button>

            <motion.button
              onClick={createTestAdmins}
              disabled={isRunning}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isRunning ? 'Creating...' : 'Create Admins'}
            </motion.button>

            <motion.button
              onClick={listAdmins}
              disabled={isRunning}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-orange-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isRunning ? 'Loading...' : 'List Admins'}
            </motion.button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Test Results</h2>
              {testResults.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-l-4 ${
                    result.success 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800">{result.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      result.success 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {result.success ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{result.message}</p>
                  {result.details && (
                    <details className="text-xs text-slate-500">
                      <summary className="cursor-pointer hover:text-slate-700">View Details</summary>
                      <pre className="mt-2 p-2 bg-slate-100 rounded overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                  <div className="text-xs text-slate-400 mt-2">
                    {new Date(result.timestamp).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-8 p-6 bg-slate-100 rounded-xl">
            <h3 className="font-semibold text-slate-800 mb-4">Default Admin Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-slate-700">admin</div>
                <div className="text-slate-500">SalonDina2024!</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-slate-700">admin_dina</div>
                <div className="text-slate-500">DinaAdmin123!</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <div className="font-medium text-slate-700">super_admin</div>
                <div className="text-slate-500">SuperDina2024!</div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a 
              href="/admin/login-new" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Login Page
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
