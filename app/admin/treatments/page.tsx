'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'
import Pagination, { usePagination } from '../../../components/admin/Pagination'

// Service interfaces
interface Service {
  id: string
  name: string
  category: string
  normalPrice: number
  promoPrice?: number
  duration: number
  description?: string
  isActive: boolean
  popularity: number
  createdAt: string
}

interface ServiceFormData {
  name: string
  category: string
  normalPrice: number
  promoPrice: number
  duration: number
  description: string
  isActive: boolean
}

const SERVICE_CATEGORIES = [
  'Facial Treatment',
  'Body Treatment', 
  'Hair Treatment',
  'Massage',
  'Spa Package',
  'Bridal Package',
  'Skincare',
  'Others'
]

export default function LayananHarga() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    category: '',
    normalPrice: 0,
    promoPrice: 0,
    duration: 60,
    description: '',
    isActive: true
  })

  // Fetch services data from API
  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setServices(result.data)
        } else {
          console.error('Failed to fetch services:', result.error)
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error)
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} menit`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}j ${remainingMinutes}m` : `${hours} jam`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Clean data - remove promo price if it's 0 or same as normal price
      const cleanData = {
        ...formData,
        promoPrice: formData.promoPrice > 0 && formData.promoPrice !== formData.normalPrice ? 
          formData.promoPrice : undefined
      }
      
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services'
      const method = editingService ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanData)
      })

      if (response.ok) {
        await fetchServices()
        resetForm()
        setShowForm(false)
      } else {
        const error = await response.json()
        console.error('Error saving service:', error)
      }
    } catch (error) {
      console.error('Error saving service:', error)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      category: service.category,
      normalPrice: service.normalPrice,
      promoPrice: service.promoPrice || 0,
      duration: service.duration,
      description: service.description || '',
      isActive: service.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Yakin ingin menghapus layanan ini?')) return

    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchServices()
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const handleToggleStatus = async (serviceId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      })

      if (response.ok) {
        setServices(prev => prev.map(service => 
          service.id === serviceId ? { ...service, isActive: newStatus } : service
        ))
      }
    } catch (error) {
      console.error('Error updating service status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      normalPrice: 0,
      promoPrice: 0,
      duration: 60,
      description: '',
      isActive: true
    })
    setEditingService(null)
  }

  const filteredServices = services.filter(service => {
    // Safe property access with fallbacks
    const name = service.name || ''
    const category = service.category || ''
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && service.isActive) ||
                         (statusFilter === 'inactive' && !service.isActive)
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Pagination for filtered services
  const {
    currentPage,
    itemsPerPage, 
    paginatedData: paginatedServices,
    totalItems: totalServices,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredServices, 10)

  const categories = Array.from(new Set(services.map(s => s.category)))

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data layanan...</p>
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
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Layanan & Harga</h1>
            <p className="text-gray-600">Manajemen treatment dan pricing salon</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="salon-btn-primary"
          >
            <span className="mr-2">➕</span>
            Tambah Layanan
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
                  💆‍♀️
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Layanan</h3>
                <p className="text-3xl font-bold text-gray-700">{services.length}</p>
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
              <div className="bg-green-100 p-3 rounded-2xl">
                <div className="w-6 h-6 text-green-600 font-bold text-lg flex items-center justify-center">
                  ✅
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Aktif</h3>
                <p className="text-3xl font-bold text-gray-700">
                  {services.filter(s => s.isActive).length}
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
              <div className="bg-yellow-100 p-3 rounded-2xl">
                <div className="w-6 h-6 text-yellow-600 font-bold text-lg flex items-center justify-center">
                  🏷️
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Ada Promo</h3>
                <p className="text-3xl font-bold text-gray-700">
                  {services.filter(s => s.promoPrice && s.promoPrice < s.normalPrice).length}
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
                <h3 className="text-lg font-semibold text-gray-800">Kategori</h3>
                <p className="text-3xl font-bold text-gray-700">{categories.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="salon-card p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Layanan</label>
              <input
                type="text"
                placeholder="Cari berdasarkan nama layanan atau kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="salon-input"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="salon-input"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="sm:w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="salon-input"
              >
                <option value="all">Semua</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Service Form Modal */}
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
                {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Layanan *
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
                    Kategori *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="salon-input"
                  >
                    <option value="">Pilih Kategori</option>
                    {SERVICE_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Normal *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.normalPrice}
                      onChange={(e) => setFormData({...formData, normalPrice: parseInt(e.target.value) || 0})}
                      className="salon-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Promo
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.promoPrice}
                      onChange={(e) => setFormData({...formData, promoPrice: parseInt(e.target.value) || 0})}
                      className="salon-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durasi (menit) *
                  </label>
                  <select
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    className="salon-input"
                  >
                    <option value={30}>30 menit</option>
                    <option value={45}>45 menit</option>
                    <option value={60}>1 jam</option>
                    <option value={90}>1.5 jam</option>
                    <option value={120}>2 jam</option>
                    <option value={180}>3 jam</option>
                    <option value={240}>4 jam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="salon-input h-20 resize-none"
                    placeholder="Deskripsi layanan..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Layanan Aktif
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 salon-btn-primary"
                  >
                    {editingService ? 'Update' : 'Simpan'}
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

        {/* Services Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-pink-800">
                Daftar Layanan ({filteredServices.length})
              </h2>
              {filteredServices.length > 0 && (
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {Math.ceil(totalServices / itemsPerPage)}
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Layanan</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Kategori</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Harga</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Durasi</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Popularitas</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedServices.map((service, index) => (
                  <motion.tr
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="border-t border-pink-100 hover:bg-pink-25"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-800">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-gray-500 line-clamp-2 max-w-xs" title={service.description}>{service.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {service.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        {service.promoPrice && service.promoPrice < service.normalPrice ? (
                          <>
                            <div className="font-semibold text-green-600">
                              {formatCurrency(service.promoPrice)}
                            </div>
                            <div className="text-sm text-gray-500 line-through">
                              {formatCurrency(service.normalPrice)}
                            </div>
                          </>
                        ) : (
                          <div className="font-semibold text-gray-800">
                            {formatCurrency(service.normalPrice)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {formatDuration(service.duration)}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(service.id, !service.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors touch-manipulation min-h-[32px] ${
                          service.isActive 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {service.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm text-gray-600">{service.popularity}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors touch-manipulation min-h-[32px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
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
            
            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💆‍♀️</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada layanan</h3>
                <p className="text-gray-500">
                  {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                    ? 'Tidak ada layanan yang sesuai dengan filter pencarian'
                    : 'Tambahkan layanan salon untuk memulai'
                  }
                </p>
                {(searchTerm || categoryFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setCategoryFilter('all')
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
          
          {/* Pagination for Services */}
          {filteredServices.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalServices}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemName="layanan"
              loading={loading}
              itemsPerPageOptions={[5, 10, 20, 50]}
            />
          )}
        </motion.div>
      </div>
    </AdminLayout>
  )
}