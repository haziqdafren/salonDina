'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'
import Pagination, { usePagination } from '../../../components/admin/Pagination'

interface Booking {
  id: number
  customerName: string
  customerPhone: string
  customerEmail?: string
  bookingDate: string
  timeSlot: string
  serviceId?: number
  therapistId?: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
  Service?: {
    name: string
    category: string
    normalPrice: number
  }
  Therapist?: {
    fullName: string
    initial: string
  }
}

interface ApiResponse {
  success: boolean
  data: Booking[]
  fallback?: string
  message?: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  // Filter bookings based on status and date
  const filteredBookings = bookings.filter(booking => {
    let matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    
    let matchesDate = true
    if (dateFilter) {
      const filterDate = new Date(dateFilter).toISOString().split('T')[0]
      const bookingDate = new Date(booking.bookingDate).toISOString().split('T')[0]
      matchesDate = bookingDate === filterDate
    }
    
    return matchesStatus && matchesDate
  })

  // Pagination
  const {
    paginatedItems: paginatedBookings,
    paginationProps
  } = usePagination(filteredBookings, 1, 10)

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/bookings')
        const result: ApiResponse = await response.json()
        
        if (result.success) {
          setBookings(result.data || [])
          console.log('📋 Bookings fetched:', result.data?.length || 0)
        } else {
          setError('Failed to fetch bookings')
        }
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError('Network error while fetching bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'confirmed':
        return 'bg-blue-100 text-blue-700'
      case 'in-progress':
        return 'bg-purple-100 text-purple-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu'
      case 'confirmed':
        return 'Dikonfirmasi'
      case 'in-progress':
        return 'Berlangsung'
      case 'completed':
        return 'Selesai'
      case 'cancelled':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const updateBookingStatus = async (id: number, newStatus: Booking['status']) => {
    try {
      // Optimistically update the UI first
      setBookings(prev => 
        prev.map(booking => 
          booking.id === id ? { ...booking, status: newStatus } : booking
        )
      )

      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      const result = await response.json()
      if (result.success) {
        console.log('✅ Booking status updated successfully')
      } else {
        throw new Error(result.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('❌ Error updating booking status:', error)
      // Revert the optimistic update on error
      setBookings(prev => 
        prev.map(booking => 
          booking.id === id ? { ...booking, status: booking.status } : booking
        )
      )
      alert('Gagal memperbarui status booking. Silahkan coba lagi.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Manajemen Booking</h1>
            <p className="text-gray-600">Kelola jadwal appointment dan booking customer</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-pink-600">
              {filteredBookings.length} booking
            </div>
            <div className="text-sm text-gray-500">
              Total hari ini
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="salon-card p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="in-progress">Berlangsung</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Tanggal
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="salon-card overflow-hidden"
          data-pagination-container
        >
          <div className="p-4 sm:p-6 border-b border-pink-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-pink-800">Daftar Booking</h2>
            <div className="text-sm text-gray-600">
              Menampilkan {filteredBookings.length} booking total
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-500 mb-2">Memuat data booking...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                Refresh Halaman
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-pink-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-pink-800">Customer</th>
                      <th className="text-left py-4 px-6 font-semibold text-pink-800">Layanan</th>
                      <th className="text-left py-4 px-6 font-semibold text-pink-800">Therapist</th>
                      <th className="text-left py-4 px-6 font-semibold text-pink-800">Jadwal</th>
                      <th className="text-left py-4 px-6 font-semibold text-pink-800">Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-pink-800">Total</th>
                      <th className="text-left py-4 px-6 font-semibold text-pink-800">Aksi</th>
                    </tr>
                  </thead>
                <tbody>
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-pink-100 hover:bg-pink-25">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-800">{booking.customerName}</div>
                          <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-800">
                          {booking.Service?.name || 'Service tidak ditemukan'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-gray-800">
                          {booking.Therapist?.fullName || 'Belum ditentukan'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-800">
                            {new Date(booking.bookingDate).toLocaleDateString('id-ID')}
                          </div>
                          <div className="text-sm text-gray-500">{booking.timeSlot}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-800">
                        {formatCurrency(booking.totalPrice)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Konfirmasi
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                              className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                            >
                              Mulai
                            </button>
                          )}
                          {booking.status === 'in-progress' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'completed')}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Selesai
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

              {/* Mobile/Tablet Card Layout */}
              <div className="lg:hidden space-y-4 p-4">
                {paginatedBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-pink-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{booking.customerName}</h3>
                        <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Layanan:</span>
                        <p className="font-medium">{booking.Service?.name || 'Service tidak ditemukan'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Therapist:</span>
                        <p className="font-medium">{booking.Therapist?.fullName || 'Belum ditentukan'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Tanggal:</span>
                        <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString('id-ID')}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Jam:</span>
                        <p className="font-medium">{booking.timeSlot}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-pink-100">
                      <div className="font-semibold text-lg text-pink-600">
                        {formatCurrency(booking.totalPrice)}
                      </div>
                      <div className="flex gap-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Konfirmasi
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                            className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                          >
                            Mulai
                          </button>
                        )}
                        {booking.status === 'in-progress' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Selesai
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && !error && filteredBookings.length > 0 && (
            <div className="border-t border-pink-100 p-4">
              <Pagination {...paginationProps} />
            </div>
          )}
          
          {!loading && !error && paginatedBookings.length === 0 && filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-500 mb-2">Tidak ada booking ditemukan</p>
              <p className="text-sm text-gray-400">Coba ubah filter atau tambah booking baru</p>
            </div>
          )}
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Booking', value: bookings.length, color: 'blue', icon: '📅' },
            { label: 'Menunggu Konfirmasi', value: bookings.filter(b => b.status === 'pending').length, color: 'yellow', icon: '⏳' },
            { label: 'Sedang Berlangsung', value: bookings.filter(b => b.status === 'in-progress').length, color: 'purple', icon: '🔄' },
            { label: 'Selesai Hari Ini', value: bookings.filter(b => b.status === 'completed').length, color: 'green', icon: '✅' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="salon-card p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}