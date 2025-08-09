'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'
import Pagination, { usePagination } from '../../../components/admin/Pagination'

// Booking interfaces
interface Booking {
  id: string
  customerName: string
  customerPhone: string
  service: string
  servicePrice: number
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
}

export default function ManajemenBooking() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch bookings data from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/bookings')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setBookings(result.data)
          } else {
            console.error('Failed to fetch bookings:', result.error)
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      case 'confirmed':
        return 'bg-blue-100 text-blue-700'
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
      case 'completed':
        return 'Selesai'
      case 'cancelled':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus as any }
            : booking
        ))
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    // Safe property access with fallbacks
    const customerName = booking.customerName || ''
    const service = booking.service || ''
    
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination for filtered bookings
  const {
    currentPage,
    itemsPerPage, 
    paginatedData: paginatedBookings,
    totalItems: totalBookings,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredBookings, 10)

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data booking...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Manajemen Booking</h1>
            <p className="text-gray-600">Kelola janji temu dan reservasi pelanggan</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['pending', 'confirmed', 'completed', 'cancelled'].map((status, index) => {
            const count = bookings.filter(b => b.status === status).length
            const colors = ['yellow', 'blue', 'green', 'red']
            const color = colors[index]
            
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="salon-card p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`bg-${color}-100 p-3 rounded-2xl`}>
                    <div className={`w-6 h-6 text-${color}-600 font-bold text-lg flex items-center justify-center`}>
                      {status === 'pending' ? '⏳' : 
                       status === 'confirmed' ? '✅' :
                       status === 'completed' ? '🎉' : '❌'}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{getStatusText(status)}</h3>
                    <p className="text-3xl font-bold text-gray-700">{count}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Search and Filter */}
        <div className="salon-card p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Booking</label>
              <input
                type="text"
                placeholder="Cari berdasarkan nama customer atau layanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="salon-input"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="salon-input"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="confirmed">Dikonfirmasi</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-pink-800">
                Daftar Booking ({filteredBookings.length})
              </h2>
              {filteredBookings.length > 0 && (
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {Math.ceil(totalBookings / itemsPerPage)}
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Layanan</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Tanggal & Waktu</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Total</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((booking, index) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="border-t border-pink-100 hover:bg-pink-25"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-800">{booking.customerName}</div>
                        <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{booking.service}</div>
                      {booking.notes && (
                        <div className="text-sm text-gray-500 truncate max-w-xs" title={booking.notes}>{booking.notes}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{formatDate(booking.date)}</div>
                      <div className="text-sm text-gray-500">{booking.time}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {formatCurrency(booking.servicePrice)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors touch-manipulation min-h-[32px]"
                          >
                            Konfirmasi
                          </button>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors touch-manipulation min-h-[32px]"
                          >
                            Selesai
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors touch-manipulation min-h-[32px]"
                          >
                            Batal
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada booking</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tidak ada booking yang sesuai dengan filter pencarian'
                    : 'Booking dari pelanggan akan muncul di sini'
                  }
                </p>
                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    }}
                    className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination for Bookings */}
          {filteredBookings.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalBookings}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemName="booking"
              loading={loading}
              itemsPerPageOptions={[5, 10, 20, 50]}
            />
          )}
        </motion.div>
      </div>
    </AdminLayout>
  )
}