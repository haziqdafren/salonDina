// Simple Admin Layout with Custom Auth
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface AdminLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  id: string
  title: string
  icon: string
  href: string
  description: string
  badge?: string
}

interface User {
  id: string
  username: string
  name: string
  role: string
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Navigation items - Complete salon management features
  const navigationItems: NavItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Utama',
      icon: '🏠',
      href: '/admin/dashboard',
      description: 'Ringkasan bisnis dan statistik harian',
    },
    {
      id: 'bookings',
      title: 'Manajemen Booking',
      icon: '📅',
      href: '/admin/bookings',
      description: 'Kelola jadwal appointment customer',
    },
    {
      id: 'customers',
      title: 'Database Customer',
      icon: '👥',
      href: '/admin/customers',
      description: 'Data customer dan riwayat kunjungan',
    },
    {
      id: 'treatments',
      title: 'Layanan & Harga',
      icon: '💆‍♀️',
      href: '/admin/treatments',
      description: 'Kelola menu treatment dan harga',
    },
    {
      id: 'therapists',
      title: 'Manajemen Therapist',
      icon: '👩‍⚕️',
      href: '/admin/therapists',
      description: 'Kelola data therapist salon',
    },
    {
      id: 'daily-transactions',
      title: 'Laporan Harian',
      icon: '📝',
      href: '/admin/daily-transactions',
      description: 'Input transaksi dan penjualan harian',
    },
    {
      id: 'reports',
      title: 'Laporan Keuangan',
      icon: '📊',
      href: '/admin/reports',
      description: 'Laporan pendapatan dan keuangan',
    },
    {
      id: 'feedback',
      title: 'Manajemen Feedback',
      icon: '💬',
      href: '/admin/feedback',
      description: 'Kelola testimoni dan rating pelanggan',
    },
    {
      id: 'settings',
      title: 'Pengaturan Sistem',
      icon: '⚙️',
      href: '/admin/settings',
      description: 'Konfigurasi aplikasi dan sistem',
    }
  ]

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          if (data.authenticated) {
            setUser(data.user)
            console.log('✅ Valid session found for:', data.user?.name)
          } else {
            console.log('🚪 No valid authentication, redirecting to login')
            router.replace('/admin/masuk')
          }
        } else {
          console.log('🚪 Authentication failed, redirecting to login')
          router.replace('/admin/masuk')
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        router.replace('/admin/masuk')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.replace('/admin/masuk')
    } catch (error) {
      console.error('Logout failed:', error)
      router.replace('/admin/masuk')
    }
  }

  // Show loading for initial load
  if (loading) {
    console.log('⏳ Showing loading screen - status:', loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat sistem manajemen...</p>
        </div>
      </div>
    )
  }

  // Show loading for authentication check
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Session Warning Modal */}
      <AnimatePresence>
        {false && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⏰</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Sesi Akan Berakhir
                </h3>
                <p className="text-slate-600 mb-4">
                  Sesi login Anda akan berakhir dalam 5 menit untuk keamanan sistem.
                </p>
                <div className="text-lg font-mono text-amber-600 bg-amber-50 rounded-lg p-3">
                  05:00
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {}}
                  className="flex-1 bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                >
                  Perpanjang Sesi
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                >
                  Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Mobile Responsive */}
        <motion.div
          animate={{ 
            width: sidebarOpen ? '320px' : '80px',
            x: sidebarOpen || window.innerWidth >= 768 ? 0 : '-100%' 
          }}
          transition={{ duration: 0.3 }}
          className="bg-white border-r border-slate-200 shadow-lg flex-shrink-0 fixed md:relative md:translate-x-0 z-40 h-screen md:h-auto flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <motion.div
              animate={{ opacity: sidebarOpen ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {sidebarOpen ? (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                      <img 
                        src="/logo.jpeg" 
                        alt="Salon Muslimah Dina" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h1 className="font-bold text-slate-800">
                        Salon Muslimah Dina
                      </h1>
                      <p className="text-xs text-slate-500">
                        Sistem Manajemen
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    Selamat datang, {user?.name}
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 mx-auto">
                  <img 
                    src="/logo.jpeg" 
                    alt="Salon Muslimah Dina" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link key={item.id} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${
                    pathname === item.href
                      ? 'bg-slate-100 text-slate-900 border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <motion.div
                    animate={{ opacity: sidebarOpen ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1"
                  >
                    {sidebarOpen && (
                      <>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {item.title}
                          {item.badge && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {item.description}
                        </div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Toggle Button - Mobile Optimized */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute -right-4 top-20 w-10 h-10 min-h-[44px] min-w-[44px] bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all touch-manipulation"
          >
            <motion.span
              animate={{ rotate: sidebarOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-600"
            >
              ←
            </motion.span>
          </button>

          {/* Bottom Section */}
          <div className="p-4 border-t border-slate-200 mt-auto">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center gap-3 p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            >
              <span className="text-xl">🚪</span>
              <motion.span
                animate={{ opacity: sidebarOpen ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="font-semibold text-sm"
              >
                {sidebarOpen && 'Keluar Sistem'}
              </motion.span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 md:ml-0">
          {/* Top Bar - Mobile Responsive */}
          <div className="bg-white border-b border-slate-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-800 text-base sm:text-lg">
                  Dashboard Manajemen
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Kelola bisnis salon dengan mudah dan efisien
                </p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="text-right">
                  <div className="text-xs sm:text-sm font-semibold text-slate-700">
                    {new Date().toLocaleDateString('id-ID', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date().toLocaleTimeString('id-ID', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })} WIB
                  </div>
                </div>
                
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content - Mobile Responsive */}
          <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}