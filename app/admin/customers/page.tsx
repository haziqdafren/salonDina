'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'
import Pagination, { usePagination } from '../../../components/admin/Pagination'

// Customer interfaces
interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
  totalVisits: number
  totalSpending: number
  lastVisit: string | null
  isVip: boolean
  createdAt: string
}

interface CustomerFormData {
  name: string
  phone: string
  email: string
  address: string
  notes: string
  isVip: boolean
}

export default function DataPelanggan() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVip, setFilterVip] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    isVip: false
  })

  // Fetch customers data from API
  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/customers')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCustomers(result.data)
        } else {
          console.error('Failed to fetch customers:', result.error)
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Belum pernah'
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers'
      const method = editingCustomer ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCustomers()
        resetForm()
        setShowForm(false)
      } else {
        const error = await response.json()
        console.error('Error saving customer:', error)
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      notes: customer.notes || '',
      isVip: customer.isVip
    })
    setShowForm(true)
  }

  const handleDelete = async (customerId: string) => {
    if (!confirm('Yakin ingin menghapus data pelanggan ini?')) return

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchCustomers()
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      isVip: false
    })
    setEditingCustomer(null)
  }

  const filteredCustomers = customers.filter(customer => {
    // Safe property access with fallbacks
    const name = customer.name || ''
    const phone = customer.phone || ''
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phone.includes(searchTerm)
    const matchesVip = filterVip === 'all' || 
                      (filterVip === 'vip' && customer.isVip) ||
                      (filterVip === 'regular' && !customer.isVip)
    return matchesSearch && matchesVip
  })

  // Pagination for filtered customers
  const {
    currentPage,
    itemsPerPage, 
    paginatedData: paginatedCustomers,
    totalItems: totalCustomers,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredCustomers, 10)

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data pelanggan...</p>
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
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Data Pelanggan</h1>
            <p className="text-gray-600">Kelola database dan riwayat pelanggan</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="salon-btn-primary"
          >
            <span className="mr-2">➕</span>
            Tambah Pelanggan
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="salon-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <div className="w-6 h-6 text-blue-600 font-bold text-lg flex items-center justify-center">
                  👥
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Pelanggan</h3>
                <p className="text-3xl font-bold text-gray-700">{customers.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="salon-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-2xl">
                <div className="w-6 h-6 text-yellow-600 font-bold text-lg flex items-center justify-center">
                  ⭐
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">VIP Members</h3>
                <p className="text-3xl font-bold text-gray-700">
                  {customers.filter(c => c.isVip).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="salon-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-2xl">
                <div className="w-6 h-6 text-green-600 font-bold text-lg flex items-center justify-center">
                  💰
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Revenue</h3>
                <p className="text-2xl font-bold text-gray-700">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpending, 0))}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="salon-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-2xl">
                <div className="w-6 h-6 text-purple-600 font-bold text-lg flex items-center justify-center">
                  📊
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Avg. Visits</h3>
                <p className="text-2xl font-bold text-gray-700">
                  {customers.length > 0 ? 
                    Math.round(customers.reduce((sum, c) => sum + c.totalVisits, 0) / customers.length) : 0
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="salon-card p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Pelanggan</label>
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau nomor telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="salon-input"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
              <select
                value={filterVip}
                onChange={(e) => setFilterVip(e.target.value)}
                className="salon-input"
              >
                <option value="all">Semua Status</option>
                <option value="vip">VIP Member</option>
                <option value="regular">Regular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-pink-800 mb-6">
                {editingCustomer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="salon-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="salon-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="salon-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="salon-input h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="salon-input h-20 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isVip"
                    checked={formData.isVip}
                    onChange={(e) => setFormData({...formData, isVip: e.target.checked})}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="isVip" className="text-sm font-medium text-gray-700">
                    VIP Member
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 salon-btn-primary"
                  >
                    {editingCustomer ? 'Update' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      resetForm()
                    }}
                    className="flex-1 salon-btn-secondary"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Customers Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-pink-800">
                Daftar Pelanggan ({filteredCustomers.length})
              </h2>
              {filteredCustomers.length > 0 && (
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {Math.ceil(totalCustomers / itemsPerPage)}
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Pelanggan</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Kunjungan</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Total Belanja</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Kunjungan Terakhir</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer, index) => (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="border-t border-pink-100 hover:bg-pink-25"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-800 flex items-center gap-2">
                          {customer.name}
                          {customer.isVip && (
                            <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        customer.isVip 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {customer.isVip ? 'VIP Member' : 'Regular'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {customer.totalVisits}x
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      {formatCurrency(customer.totalSpending)}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600">
                        {formatDate(customer.lastVisit)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors touch-manipulation min-h-[32px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors touch-manipulation min-h-[32px]"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada data pelanggan</h3>
                <p className="text-gray-500">
                  {searchTerm || filterVip !== 'all' 
                    ? 'Tidak ada pelanggan yang sesuai dengan filter pencarian'
                    : 'Data pelanggan akan muncul di sini setelah ditambahkan'
                  }
                </p>
                {(searchTerm || filterVip !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterVip('all')
                    }}
                    className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination for Customers */}
          {filteredCustomers.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalCustomers}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemName="pelanggan"
              loading={loading}
              itemsPerPageOptions={[5, 10, 20, 50]}
            />
          )}
        </motion.div>
      </div>
    </AdminLayout>
  )
}