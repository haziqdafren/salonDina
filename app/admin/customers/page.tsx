'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'
import Pagination, { usePagination } from '../../../components/admin/Pagination'

interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  address?: string
  totalVisits: number
  totalSpending: number
  loyaltyVisits: number
  isVip: boolean
  lastVisit?: string
  createdAt?: string
}

interface ApiResponse {
  success: boolean
  data: Customer[]
  fallback?: string
  message?: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Form state for CRUD operations
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    isVip: false
  })
  // Filter and paginate customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm)
    
    let matchesStatus = true
    if (statusFilter === 'vip') {
      matchesStatus = customer.isVip
    } else if (statusFilter === 'active') {
      matchesStatus = !customer.isVip && customer.totalVisits > 0
    } else if (statusFilter === 'inactive') {
      matchesStatus = customer.totalVisits === 0
    }
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const {
    paginatedItems: paginatedCustomers,
    paginationProps
  } = usePagination(filteredCustomers, 1, 10)

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/customers')
        const result: ApiResponse = await response.json()
        
        if (result.success) {
          setCustomers(result.data || [])
          console.log('👥 Customers fetched:', result.data?.length || 0)
        } else {
          setError('Failed to fetch customers')
        }
      } catch (err) {
        console.error('Error fetching customers:', err)
        setError('Network error while fetching customers')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const getCustomerStatus = (customer: Customer): 'vip' | 'active' | 'inactive' => {
    if (customer.isVip) return 'vip'
    if (customer.totalVisits > 0) return 'active'
    return 'inactive'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip':
        return 'bg-purple-100 text-purple-700 border border-purple-200'
      case 'active':
        return 'bg-green-100 text-green-700 border border-green-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'vip':
        return 'VIP Customer'
      case 'active':
        return 'Aktif'
      case 'inactive':
        return 'Tidak Aktif'
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

  // CRUD Functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      isVip: false
    })
    setEditingId(null)
  }

  const startEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      isVip: customer.isVip
    })
    setEditingId(customer.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingId ? `/api/customers/${editingId}` : '/api/customers'
      const method = editingId ? 'PUT' : 'POST'
      const submitData = {
        ...(editingId && { id: editingId }),
        ...formData
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (result.success) {
        console.log(`✅ Customer ${editingId ? 'updated' : 'created'} successfully`)
        
        if (editingId) {
          // Update existing customer
          setCustomers(prev => 
            prev.map(c => c.id === editingId ? { ...c, ...result.data } : c)
          )
        } else {
          // Add new customer
          setCustomers(prev => [result.data, ...prev])
        }
        
        resetForm()
        setShowForm(false)
      } else {
        alert(`Gagal ${editingId ? 'mengubah' : 'menambah'} customer: ` + result.error)
      }
    } catch (error) {
      console.error(`❌ Error ${editingId ? 'updating' : 'creating'} customer:`, error)
      alert(`Gagal ${editingId ? 'mengubah' : 'menambah'} customer. Silahkan coba lagi.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus customer ini?')) return

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Customer deleted successfully')
        setCustomers(prev => prev.filter(c => c.id !== id))
      } else {
        alert('Gagal menghapus customer: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Error deleting customer:', error)
      alert('Gagal menghapus customer. Silahkan coba lagi.')
    }
  }


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belum ada data'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const activeCustomers = customers.filter(c => !c.isVip && c.totalVisits > 0).length
  const vipCustomers = customers.filter(c => c.isVip).length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpending, 0)
  const avgSpentPerCustomer = customers.length > 0 ? totalRevenue / customers.length : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Database Customer</h1>
            <p className="text-gray-600">Kelola data customer dan riwayat kunjungan</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-pink-600">
                {loading ? '...' : customers.length} customer
              </div>
              <div className="text-sm text-gray-500">
                Total terdaftar
              </div>
            </div>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold"
            >
              + Tambah Customer
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="salon-card p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data customer...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="salon-card p-12 text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-red-500 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              Refresh Halaman
            </button>
          </div>
        )}

        {/* Customer Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="salon-card p-6"
          >
            <h2 className="text-xl font-semibold text-pink-800 mb-6">
              {editingId ? 'Edit Customer' : 'Tambah Customer Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Siti Aminah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="08xxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="customer@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status VIP
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isVip"
                        checked={formData.isVip}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Customer VIP</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Alamat lengkap customer..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold"
                >
                  {submitting 
                    ? (editingId ? 'Mengubah...' : 'Menyimpan...') 
                    : (editingId ? 'Ubah Customer' : 'Simpan Customer')
                  }
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                >
                  Batal
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm()
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    Reset ke Tambah Baru
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}

        {/* Main Content - Only show when not loading and no error */}
        {!loading && !error && (
          <>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Customer', value: customers.length, color: 'blue', icon: '👥' },
            { label: 'Customer Aktif', value: activeCustomers, color: 'green', icon: '✅' },
            { label: 'VIP Customer', value: vipCustomers, color: 'purple', icon: '⭐' },
            { label: 'Rata-rata Belanja', value: formatCurrency(avgSpentPerCustomer), color: 'yellow', icon: '💰', isFormatted: true }
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
                  <p className={`text-xl font-bold text-${stat.color}-600 ${stat.isFormatted ? 'text-base' : ''}`}>
                    {stat.isFormatted ? stat.value : stat.value}
                  </p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="salon-card p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Customer
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau nomor HP..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="vip">VIP Customer</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-pagination-container>
          {paginatedCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="salon-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{customer.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getCustomerStatus(customer))}`}>
                      {getStatusText(getCustomerStatus(customer))}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <span>📱</span>
                      <span>{customer.phone}</span>
                    </p>
                    {customer.email && (
                      <p className="flex items-center gap-2">
                        <span>✉️</span>
                        <span>{customer.email}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="line-clamp-2">{customer.address || 'Alamat tidak tersedia'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <div className="text-lg font-bold text-pink-600">{customer.totalVisits}</div>
                  <div className="text-xs text-gray-600">Total Kunjungan</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-bold text-green-600">
                    {formatCurrency(customer.totalSpending)}
                  </div>
                  <div className="text-xs text-gray-600">Total Belanja</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bergabung:</span>
                  <span className="font-medium">{formatDate(customer.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kunjungan Terakhir:</span>
                  <span className="font-medium">{formatDate(customer.lastVisit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Loyalty Points:</span>
                  <span className="font-medium text-pink-600">{customer.loyaltyVisits}/3</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => startEdit(customer)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDelete(customer.id)}
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                >
                  🗑️ Hapus
                </button>
                <button 
                  onClick={() => {
                    // Navigate to booking page with customer pre-filled
                    window.location.href = `/admin/bookings?customer=${encodeURIComponent(JSON.stringify({
                      id: customer.id,
                      name: customer.name,
                      phone: customer.phone
                    }))}`
                  }}
                  className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                >
                  📅 Booking
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {!loading && !error && filteredCustomers.length > 0 && (
          <div className="flex justify-center">
            <Pagination {...paginationProps} />
          </div>
        )}

        {!loading && !error && filteredCustomers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="salon-card p-12 text-center"
          >
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500 mb-2">Tidak ada customer ditemukan</p>
            <p className="text-sm text-gray-400">Coba ubah kata kunci pencarian atau filter status</p>
          </motion.div>
        )}
        
        </>
        )}
      </div>
    </AdminLayout>
  )
}