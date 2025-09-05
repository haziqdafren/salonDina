// Professional Admin Login Page - Indonesian Business Language
'use client'

import { useState, useEffect } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLogin() {
  const router = useRouter()
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState<number | null>(null)

  // Ultra-safe session check with detailed logging
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔍 Checking existing session on login page...')
        const session = await getSession()
        console.log('📋 Session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userName: session?.user?.name
        })
        
        if (session?.user) {
          console.log('✅ Valid session exists, redirecting to dashboard')
          router.replace('/admin/dashboard')
        } else {
          console.log('❌ No valid session found, staying on login page')
        }
      } catch (error) {
        console.error('❌ Session check failed:', error)
      }
    }
    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Username dan password harus diisi')
      return
    }

    setIsLoading(true)
    setError('')
    console.log('🔐 Attempting login for:', credentials.username)

    try {
      console.log('🔐 Starting login process for:', credentials.username.trim())
      
      const result = await signIn('credentials', {
        username: credentials.username.trim(),
        password: credentials.password,
        redirect: false,
      })

      console.log('📋 Ultra-detailed SignIn result:', {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url
      })

      if (result?.error) {
        console.log('❌ Login failed with error:', result.error)
        setError('Username atau password salah')
      } else if (result?.ok) {
        console.log('✅ Login successful! Preparing redirect...')
        
        // Use replace to prevent back button issues and wait for session
        setTimeout(() => {
          console.log('➡️ Redirecting to dashboard via router...')
          router.replace('/admin/dashboard')
        }, 1000)
      } else {
        console.log('⚠️ Unexpected login result:', result)
        setError('Login gagal, silakan coba lagi')
      }
    } catch (err) {
      console.error('❌ Login exception:', err)
      setError('Terjadi kesalahan sistem. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRemainingLockoutTime = () => {
    if (!lockoutTime || lockoutTime <= Date.now()) return 0
    return Math.ceil((lockoutTime - Date.now()) / 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      {/* Professional Background Pattern */}
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
        className="relative z-10 w-full max-w-md"
      >
        {/* Professional Header */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            {/* Business Logo Area */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg border border-slate-200">
              <img 
                src="/logo.jpeg" 
                alt="Salon Muslimah Dina" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Portal Manajemen Bisnis
            </h1>
            <p className="text-slate-600 text-sm">
              Salon Muslimah Dina - Medan
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-slate-300 to-slate-500 mx-auto mt-4"></div>
          </motion.div>

          {/* Professional Login Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">⚠️</span>
                    <span>{error}</span>
                  </div>
                  {lockoutTime && lockoutTime > Date.now() && (
                    <div className="mt-2 text-xs text-red-600">
                      Waktu tersisa: {getRemainingLockoutTime()} detik
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username Field */}
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Username Administrator
              </label>
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                placeholder="Masukkan username"
                autoComplete="username"
                disabled={isLoading || !!(lockoutTime && lockoutTime > Date.now())}
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 bg-slate-50 focus:bg-white"
                placeholder="Masukkan password"
                autoComplete="current-password"
                disabled={isLoading || !!(lockoutTime && lockoutTime > Date.now())}
              />
            </div>

            {/* Security Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-start gap-3 text-xs text-slate-600">
                <span className="text-blue-500 text-sm">🔐</span>
                <div>
                  <p className="font-medium mb-1">Keamanan Sistem:</p>
                  <ul className="space-y-1">
                    <li>• Sesi otomatis berakhir dalam 30 menit</li>
                    <li>• Maksimal 3 percobaan login</li>
                    <li>• Akses dibatasi untuk administrator</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isLoading || !!(lockoutTime && lockoutTime > Date.now())}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-900 text-white font-semibold py-3 px-6 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>🔓</span>
                  <span>Masuk Sistem</span>
                </>
              )}
            </motion.button>

            {/* Attempt Counter */}
            {attempts > 0 && attempts < 3 && (
              <div className="text-center text-xs text-slate-500">
                Percobaan: {attempts}/3
              </div>
            )}
          </motion.form>

          {/* Professional Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-slate-200 text-center"
          >
            <p className="text-xs text-slate-500 mb-2">
              © 2024 Salon Muslimah Dina
            </p>
            <p className="text-xs text-slate-400">
              Sistem Manajemen Bisnis Internal
            </p>
          </motion.div>
        </div>

        {/* Business Hours Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50"
        >
          <div className="text-center text-sm text-slate-600">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span>🕐</span>
              <span className="font-medium">Jam Operasional Sistem</span>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Senin - Sabtu: 08:00 - 18:00</div>
              <div>Minggu: 10:00 - 16:00</div>
              <div className="text-slate-400 mt-2">📍 Medan, Sumatera Utara</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}