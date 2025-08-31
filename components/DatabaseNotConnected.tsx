'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface DatabaseNotConnectedProps {
  title?: string
  message?: string
  showSetupButton?: boolean
}

export default function DatabaseNotConnected({
  title = "Database Belum Terhubung",
  message = "Sistem belum terhubung ke database. Silakan hubungi administrator.",
  showSetupButton = false
}: DatabaseNotConnectedProps) {
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupResult, setSetupResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSetupDatabase = async () => {
    setIsSettingUp(true)
    setSetupResult(null)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorization: 'setup-salon-dina-2024' })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSetupResult({
          success: true,
          message: 'Database berhasil disetup! Halaman akan dimuat ulang dalam 3 detik.'
        })
        
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else {
        setSetupResult({
          success: false,
          message: result.error || 'Setup database gagal. Silakan coba lagi.'
        })
      }
    } catch (error) {
      setSetupResult({
        success: false,
        message: 'Terjadi kesalahan saat setup database.'
      })
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-pink-100 p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span className="text-4xl">🗄️</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-800 mb-4"
        >
          {title}
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-6 leading-relaxed"
        >
          {message}
        </motion.p>

        {/* Setup Result */}
        {setupResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg mb-4 ${
              setupResult.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{setupResult.success ? '✅' : '❌'}</span>
              <span className="text-sm">{setupResult.message}</span>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          {showSetupButton && (
            <button
              onClick={handleSetupDatabase}
              disabled={isSettingUp || setupResult?.success}
              className="w-full bg-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSettingUp ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting up database...
                </>
              ) : setupResult?.success ? (
                <>
                  ✅ Setup completed
                </>
              ) : (
                <>
                  🚀 Setup Database
                </>
              )}
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            🔄 Muat Ulang Halaman
          </button>

          <div className="text-xs text-gray-500 mt-4">
            <p>Environment: {process.env.NODE_ENV || 'development'}</p>
            <p>Timestamp: {new Date().toLocaleString('id-ID')}</p>
          </div>
        </motion.div>

        {/* Salon Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 pt-6 border-t border-gray-100"
        >
          <div className="flex items-center justify-center gap-2 text-pink-600">
            <span className="text-lg">💆‍♀️</span>
            <span className="font-semibold text-sm">Salon Muslimah Dina</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sistem Manajemen Salon
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}