'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatRupiah } from '@/lib/therapist'

interface DashboardStats {
  todayTreatments: number
  todayRevenue: number
  activeTherapists: number
  totalCustomers: number
  monthlyRevenue: number
  monthlyTreatments: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/admin/masuk')
      return
    }

    fetchDashboardStats()
  }, [session, status, router])

  const fetchDashboardStats = async () => {
    try {
      // This would fetch real data from API endpoints
      // For now, using mock data that matches seeded database
      const mockStats: DashboardStats = {
        todayTreatments: 8,
        todayRevenue: 1250000,
        activeTherapists: 4,
        totalCustomers: 5,
        monthlyRevenue: 18500000,
        monthlyTreatments: 145
      }
      
      setStats(mockStats)
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen salon-gradient-bg salon-pattern flex items-center justify-center">
        <div className="salon-card p-8 text-center">
          <div className="salon-skeleton w-8 h-8 rounded-full mx-auto mb-4"></div>
          <p className="font-inter text-salon-text">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/masuk' })
  }

  const currentDate = new Date()
  const greeting = currentDate.getHours() < 12 ? 'Selamat pagi' : 
                  currentDate.getHours() < 15 ? 'Selamat siang' : 
                  currentDate.getHours() < 18 ? 'Selamat sore' : 'Selamat malam'
  
  const todayDate = currentDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen salon-gradient-bg salon-pattern">
      {/* Islamic Greeting */}
      <div className="pt-8 pb-4">
        <div className="bismillah-elegant">
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="salon-header-xl mb-4">
            Dashboard Admin
          </h1>
          <p className="font-dancing text-3xl text-salon-primary mb-6">
            Salon Muslimah Dina
          </p>
          <div className="salon-card max-w-md mx-auto p-4">
            <p className="font-kalam text-lg text-salon-islamic">
              {greeting}, {session.user.name || 'Admin'}
            </p>
            <p className="font-inter text-salon-text-muted text-sm mt-1">
              {todayDate}
            </p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {[
            { 
              title: 'Treatment Hari Ini', 
              value: stats?.todayTreatments?.toString() || '0', 
              icon: '📅', 
              color: 'salon-primary' 
            },
            { 
              title: 'Omzet Hari Ini', 
              value: stats ? formatRupiah(stats.todayRevenue) : 'Rp 0', 
              icon: '💰', 
              color: 'salon-gold' 
            },
            { 
              title: 'Therapist Aktif', 
              value: stats?.activeTherapists?.toString() || '0', 
              icon: '👩‍⚕️', 
              color: 'salon-islamic' 
            },
            { 
              title: 'Total Pelanggan', 
              value: stats?.totalCustomers?.toString() || '0', 
              icon: '👥', 
              color: 'salon-primary-dark' 
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              className="salon-stat-card text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.3 }
              }}
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="salon-stat-number">
                {stat.value}
              </div>
              <div className="salon-stat-label">
                {stat.title}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            {
              title: 'Input Treatment Harian',
              description: 'Catat treatment yang dilakukan hari ini',
              icon: '📝',
              href: '/admin/treatment',
              color: 'salon-primary'
            },
            {
              title: 'Pembukuan Harian',
              description: 'Kelola pembukuan dan keuangan harian',
              icon: '💳',
              href: '/admin/pembukuan',
              color: 'salon-gold'
            },
            {
              title: 'Data Therapist',
              description: 'Manage therapist dan perhitungan gaji',
              icon: '👩‍⚕️',
              href: '/admin/therapist',
              color: 'salon-islamic'
            },
            {
              title: 'Data Pelanggan',
              description: 'Kelola informasi dan riwayat customer',
              icon: '👤',
              href: '/admin/customers',
              color: 'salon-primary-dark'
            },
            {
              title: 'Layanan & Harga',
              description: 'Update daftar layanan dan tarif',
              icon: '💅',
              href: '/admin/services',
              color: 'salon-warning'
            },
            {
              title: 'Laporan & Analytics',
              description: 'Lihat statistik dan analisis bisnis',
              icon: '📊',
              href: '/admin/reports',
              color: 'salon-success'
            }
          ].map((card, index) => (
            <motion.div
              key={card.title}
              className="salon-card p-6 cursor-pointer float-animation"
              style={{ animationDelay: `${index * 0.1}s` }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.3 }
              }}
              onClick={() => {
                // For now, show coming soon
                alert('Coming soon in Phase 2!')
              }}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">{card.icon}</div>
                <h3 className="salon-header-sm mb-3">
                  {card.title}
                </h3>
                <p className="font-inter text-salon-text text-sm">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Monthly Summary */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="salon-card p-6">
            <h3 className="salon-header-md mb-4 text-center">
              Ringkasan Bulan Ini
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-inter text-salon-text">Total Treatment:</span>
                <span className="font-playfair font-bold text-salon-primary text-xl">
                  {stats?.monthlyTreatments || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-inter text-salon-text">Total Omzet:</span>
                <span className="font-playfair font-bold text-salon-gold text-xl">
                  {stats ? formatRupiah(stats.monthlyRevenue) : 'Rp 0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-inter text-salon-text">Rata-rata Harian:</span>
                <span className="font-inter font-semibold text-salon-primary">
                  {stats ? formatRupiah(Math.round(stats.monthlyRevenue / 30)) : 'Rp 0'}
                </span>
              </div>
            </div>
          </div>

          <div className="salon-card p-6">
            <h3 className="salon-header-md mb-4 text-center">
              Aktivitas Terbaru
            </h3>
            <div className="space-y-4">
              {[
                'Treatment Facial oleh Therapist R - Rp 200.000',
                'Customer baru: Siti Aminah - Rp 150.000',
                'Hair Spa oleh Therapist E - Rp 170.000',
                'Pembayaran lunas: Fatimah - Rp 450.000'
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  className="flex items-start p-3 bg-salon-background rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <div className="w-2 h-2 bg-salon-primary rounded-full mt-2 mr-3 flex-shrink-0" />
                  <p className="font-inter text-salon-text text-sm">
                    {activity}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="salon-divider-fancy">
            <span>Admin Panel</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="salon-button-primary"
              onClick={() => alert('Coming soon in Phase 2!')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📊 Lihat Laporan Lengkap
            </motion.button>
            <motion.button
              className="salon-button-secondary"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔐 Keluar dari Dashboard
            </motion.button>
          </div>
        </motion.div>

        {/* Footer Quote */}
        <motion.div
          className="text-center pt-8 border-t border-salon-primary/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <p className="font-dancing text-xl text-salon-islamic mb-2">
            &ldquo;Barangsiapa yang memudahkan urusan orang lain, maka Allah akan memudahkan urusannya di dunia dan akhirat&rdquo;
          </p>
          <p className="font-inter text-salon-text-muted text-sm">
            - HR. Muslim
          </p>
        </motion.div>
      </div>
    </div>
  )
}