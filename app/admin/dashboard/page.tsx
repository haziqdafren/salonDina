'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import Pagination, { usePagination } from '../../../components/admin/Pagination'

// Comprehensive dashboard data interface
interface DashboardData {
  todayRevenue: number
  yesterdayRevenue: number
  todayBookings: {
    confirmed: number
    pending: number
    completed: number
  }
  newCustomers: number
  monthlyNewCustomers: number
  popularTreatment: {
    name: string
    count: number
  }
  therapistTips: number
  activeTherapists: number
  therapistList: Array<{
    initial: string
    name: string
    todayEarnings: number
    todayTreatments: number
  }>
  recentBookings: Array<{
    id: number
    customer: string
    service: string
    therapist: string
    time: string
    status: 'completed' | 'in-progress' | 'confirmed' | 'pending'
    amount: number
  }>
  monthlyStats: {
    totalRevenue: number
    totalBookings: number
    averagePerBooking: number
    therapistFees: number
  }
}

// Mock comprehensive business data
const mockBusinessData: DashboardData = {
  todayRevenue: 2850000,
  yesterdayRevenue: 2650000,
  todayBookings: {
    confirmed: 12,
    pending: 3,
    completed: 8
  },
  newCustomers: 4,
  monthlyNewCustomers: 45,
  popularTreatment: {
    name: 'Facial Brightening',
    count: 6
  },
  therapistTips: 450000,
  activeTherapists: 5,
  therapistList: [
    { initial: 'R', name: 'Rina Sari', todayEarnings: 180000, todayTreatments: 4 },
    { initial: 'A', name: 'Aisha Putri', todayEarnings: 165000, todayTreatments: 3 },
    { initial: 'E', name: 'Elisa Rahman', todayEarnings: 150000, todayTreatments: 3 },
    { initial: 'T', name: 'Tina Wulandari', todayEarnings: 195000, todayTreatments: 4 },
    { initial: 'S', name: 'Sari Indah', todayEarnings: 120000, todayTreatments: 2 }
  ],
  recentBookings: [
    { id: 1, customer: 'Siti Aminah', service: 'Facial Premium', therapist: 'R', time: '09:00', status: 'completed', amount: 250000 },
    { id: 2, customer: 'Fatimah Zahra', service: 'Hair Spa', therapist: 'A', time: '10:30', status: 'completed', amount: 150000 },
    { id: 3, customer: 'Khadijah Ahmad', service: 'Body Massage', therapist: 'E', time: '11:00', status: 'in-progress', amount: 200000 },
    { id: 4, customer: 'Maryam Husna', service: 'Paket Pengantin', therapist: 'T', time: '14:00', status: 'confirmed', amount: 1500000 },
    { id: 5, customer: 'Zahra Fitri', service: 'Manicure Pedicure', therapist: 'S', time: '15:30', status: 'pending', amount: 120000 },
    { id: 6, customer: 'Aisyah Batubara', service: 'Perawatan Wajah', therapist: 'R', time: '08:30', status: 'completed', amount: 180000 },
    { id: 7, customer: 'Rahma Sari', service: 'Body Scrub', therapist: 'A', time: '09:15', status: 'completed', amount: 220000 },
    { id: 8, customer: 'Nurul Hasanah', service: 'Hair Treatment', therapist: 'E', time: '10:00', status: 'in-progress', amount: 175000 },
    { id: 9, customer: 'Salma Dewi', service: 'Manicure', therapist: 'T', time: '11:45', status: 'confirmed', amount: 95000 },
    { id: 10, customer: 'Latifah Ahmad', service: 'Pedicure', therapist: 'S', time: '13:00', status: 'pending', amount: 85000 },
    { id: 11, customer: 'Khadijah Nasution', service: 'Facial Acne', therapist: 'R', time: '14:30', status: 'completed', amount: 195000 },
    { id: 12, customer: 'Aminah Lubis', service: 'Deep Cleansing', therapist: 'A', time: '15:00', status: 'confirmed', amount: 165000 },
    { id: 13, customer: 'Maryam Siregar', service: 'Aromatherapi', therapist: 'E', time: '16:00', status: 'pending', amount: 210000 },
    { id: 14, customer: 'Fatimah Harahap', service: 'Hot Stone Massage', therapist: 'T', time: '16:45', status: 'confirmed', amount: 275000 },
    { id: 15, customer: 'Zainab Pohan', service: 'Full Body Massage', therapist: 'S', time: '17:30', status: 'pending', amount: 295000 }
  ],
  monthlyStats: {
    totalRevenue: 85400000,
    totalBookings: 342,
    averagePerBooking: 249706,
    therapistFees: 17080000
  }
}

export default function AdminDashboard() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Pagination for recent bookings
  const {
    currentPage: bookingsPage,
    itemsPerPage: bookingsPerPage, 
    paginatedData: paginatedBookings,
    totalItems: totalRecentBookings,
    handlePageChange: handleBookingsPageChange,
    handleItemsPerPageChange: handleBookingsPerPageChange
  } = usePagination(data?.recentBookings || [], 5)

  useEffect(() => {
    // Set initial time after component mounts to avoid hydration issues
    setCurrentTime(new Date())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Map API response to expected dashboard data structure
            const mappedData: DashboardData = {
              todayRevenue: result.data.today?.revenue || 0,
              yesterdayRevenue: 0, // API doesn't provide this
              todayBookings: {
                confirmed: result.data.today?.treatments || 0,
                pending: 0, // API doesn't provide this breakdown
                completed: result.data.today?.treatments || 0
              },
              newCustomers: 0, // API doesn't provide this
              monthlyNewCustomers: 0,
              popularTreatment: {
                name: 'Data tidak tersedia',
                count: 0
              },
              therapistTips: result.data.today?.therapistFees || 0,
              activeTherapists: result.data.system?.activeTherapists || 0,
              therapistList: [], // API doesn't provide detailed therapist data
              recentBookings: (result.data.today?.treatments_detail || []).map((treatment: any, index: number) => ({
                id: treatment.id || index,
                customer: treatment.customerName || 'Customer',
                service: treatment.serviceName || 'Service',
                therapist: treatment.therapistName || 'Therapist',
                time: treatment.createdAt ? new Date(treatment.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--',
                status: treatment.isFreeVisit ? 'completed' : 'completed' as const,
                amount: treatment.price || 0
              })),
              monthlyStats: {
                totalRevenue: result.data.monthly?.revenue || 0,
                totalBookings: result.data.monthly?.treatments || 0,
                averagePerBooking: result.data.monthly?.treatments > 0 ? Math.round((result.data.monthly?.revenue || 0) / result.data.monthly.treatments) : 0,
                therapistFees: result.data.monthly?.therapistFees || 0
              }
            }
            setData(mappedData)
          } else {
            console.error('Failed to fetch dashboard data:', result.error)
            // Fallback to mock data if API fails
            setData(mockBusinessData)
          }
        } else {
          console.error('Dashboard API request failed')
          setData(mockBusinessData)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setData(mockBusinessData)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
    
    // Refresh dashboard data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getTrendPercentage = (today: number, yesterday: number) => {
    const trend = ((today - yesterday) / yesterday) * 100
    return {
      value: Math.abs(trend).toFixed(1),
      isPositive: trend >= 0
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'confirmed':
        return 'bg-blue-100 text-blue-700'
      case 'pending':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Selesai'
      case 'in-progress':
        return 'Berlangsung'
      case 'confirmed':
        return 'Dikonfirmasi'
      case 'pending':
        return 'Menunggu'
      default:
        return status
    }
  }

  // Show loading state
  if (loading || !data) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data dashboard...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const revenueTrend = getTrendPercentage(data.todayRevenue, data.yesterdayRevenue)
  const totalBookings = data.todayBookings.confirmed + data.todayBookings.pending + data.todayBookings.completed

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header with Time and Islamic Greeting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Dashboard Utama</h1>
            <p className="text-gray-600">Assalamu&apos;alaikum wa rahmatullahi wa barakatuh - Selamat datang kembali! 🌸</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-pink-600">
              {currentTime ? currentTime.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              }) : '--:--:--'}
            </div>
            <div className="text-sm text-gray-500">
              {currentTime ? currentTime.toLocaleDateString('id-ID', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Loading...'}
            </div>
          </div>
        </div>

        {/* Today's Performance KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="salon-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                revenueTrend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <span>{revenueTrend.isPositive ? '↗' : '↘'}</span>
                <span>{revenueTrend.value}%</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Pendapatan Hari Ini</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(data.todayRevenue)}
            </p>
            <p className="text-sm text-gray-500">
              Kemarin: {formatCurrency(data.yesterdayRevenue)}
            </p>
          </motion.div>

          {/* Bookings Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="salon-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-blue-600">{totalBookings}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Booking Hari Ini</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Selesai:</span>
                <span className="font-semibold">{data.todayBookings.completed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Dikonfirmasi:</span>
                <span className="font-semibold">{data.todayBookings.confirmed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Menunggu:</span>
                <span className="font-semibold">{data.todayBookings.pending}</span>
              </div>
            </div>
          </motion.div>

          {/* New Customers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="salon-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-purple-600">{data.newCustomers}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Customer Baru</h3>
            <p className="text-sm text-gray-500 mb-2">Hari ini</p>
            <div className="bg-purple-50 px-3 py-2 rounded-lg">
              <p className="text-sm text-purple-700">
                Bulan ini: <span className="font-semibold">{data.monthlyNewCustomers} customer</span>
              </p>
            </div>
          </motion.div>

          {/* Popular Treatment Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="salon-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-pink-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-pink-600">{data.popularTreatment.count}x</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Treatment Favorit</h3>
            <p className="text-lg font-semibold text-pink-600 mb-2">{data.popularTreatment.name}</p>
            <p className="text-sm text-gray-500">Paling diminati hari ini</p>
          </motion.div>

          {/* Therapist Tips Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="salon-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-lg font-bold text-yellow-600">{data.activeTherapists} aktif</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Tips Therapist</h3>
            <p className="text-2xl font-bold text-yellow-600 mb-2">
              {formatCurrency(data.therapistTips)}
            </p>
            <p className="text-sm text-gray-500">Total tips hari ini</p>
          </motion.div>

          {/* Active Therapists Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="salon-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-indigo-600">{data.activeTherapists}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Therapist Aktif</h3>
            <p className="text-sm text-gray-500 mb-2">Sedang bertugas hari ini</p>
            <div className="flex -space-x-2">
              {data.therapistList.map((therapist, index) => (
                <div
                  key={therapist.initial}
                  className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white"
                  title={therapist.name}
                >
                  {therapist.initial}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Therapist Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-pink-800">Performa Therapist Hari Ini</h2>
              <Link href="/admin/kelola-therapist" className="salon-btn-secondary text-sm">
                Kelola Therapist
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {data.therapistList.map((therapist, index) => (
                <div key={therapist.initial} className="text-center p-3 sm:p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg mx-auto mb-2 sm:mb-3">
                    {therapist.initial}
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base leading-tight">{therapist.name}</h4>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earnings:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(therapist.todayEarnings)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Treatments:</span>
                      <span className="font-semibold text-blue-600">{therapist.todayTreatments}x</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-pink-800">Booking Terbaru</h2>
              <Link href="/admin/bookings" className="salon-btn-secondary text-sm">
                Lihat Semua
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-pink-800 text-sm">Customer</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-pink-800 text-sm">Layanan</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-pink-800 text-sm hidden sm:table-cell">Therapist</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-pink-800 text-sm">Waktu</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-pink-800 text-sm">Status</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-pink-800 text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-pink-100 hover:bg-pink-25">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{booking.customer}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{booking.service}</td>
                    <td className="py-4 px-6 hidden sm:table-cell">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {booking.therapist}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{booking.time}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {formatCurrency(booking.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Recent Bookings Pagination */}
          <Pagination
            currentPage={bookingsPage}
            totalItems={totalRecentBookings}
            itemsPerPage={bookingsPerPage}
            onPageChange={handleBookingsPageChange}
            onItemsPerPageChange={handleBookingsPerPageChange}
            itemName="booking"
            loading={loading}
            itemsPerPageOptions={[5, 10, 15]}
          />
        </motion.div>

        {/* Monthly Business Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="salon-card p-6"
        >
          <h2 className="text-xl font-semibold text-pink-800 mb-6">Ringkasan Bisnis Bulan Ini</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatCurrency(data.monthlyStats.totalRevenue)}
              </div>
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{data.monthlyStats.totalBookings}</div>
              <p className="text-sm font-medium text-gray-600">Total Booking</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {formatCurrency(data.monthlyStats.averagePerBooking)}
              </div>
              <p className="text-sm font-medium text-gray-600">Rata-rata per Booking</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {formatCurrency(data.monthlyStats.therapistFees)}
              </div>
              <p className="text-sm font-medium text-gray-600">Total Fee Therapist</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Link href="/admin/bookings" className="salon-btn-primary flex items-center justify-center gap-2 p-4 w-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Booking Baru
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Link href="/admin/kelola-therapist" className="salon-btn-secondary flex items-center justify-center gap-2 p-4 w-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Kelola Therapist
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Link href="/admin/pembukuan-harian" className="salon-btn-secondary flex items-center justify-center gap-2 p-4 w-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Pembukuan Harian
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <Link href="/admin/pembukuan-bulanan" className="salon-btn-secondary flex items-center justify-center gap-2 p-4 w-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Laporan Bisnis
            </Link>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  )
}