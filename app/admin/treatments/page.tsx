'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'
import Pagination, { usePagination } from '../../../components/admin/Pagination'

interface Treatment {
  id: number
  name: string
  category: string
  price: number
  normalPrice?: number
  duration: number
  description: string
  is_active: boolean
  popularity?: number
  therapist_fee?: number
}

interface ApiResponse {
  success: boolean
  data: Treatment[]
  categories?: Array<{ name: string; count: number }>
  fallback?: string
  message?: string
}

export default function TreatmentsPage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showInactive, setShowInactive] = useState(false)
  
  // Form state for CRUD operations
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'facial',
    description: '',
    normalPrice: '',
    promoPrice: '',
    duration: '60',
    therapistFee: '',
    isActive: true
  })

  // Fetch treatments/services from API
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/services')
        const result: ApiResponse = await response.json()
        
        if (result.success) {
          setTreatments(result.data || [])
          setCategories(result.categories || [])
          console.log('💆‍♀️ Services/Treatments fetched:', result.data?.length || 0)
        } else {
          setError('Failed to fetch treatments')
        }
      } catch (err) {
        console.error('Error fetching treatments:', err)
        setError('Network error while fetching treatments')
      } finally {
        setLoading(false)
      }
    }

    fetchTreatments()
  }, [])

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'facial': '✨',
      'hair_spa': '💇‍♀️',
      'body_treatment': '🤲',
      'nails': '💅',
      'package': '👰',
      'therapy': '🩸'
    }
    return iconMap[categoryName] || '🌟'
  }

  const getCategoryLabel = (categoryName: string) => {
    const labelMap: { [key: string]: string } = {
      'facial': 'Perawatan Wajah',
      'hair_spa': 'Hair Spa',
      'body_treatment': 'Body Treatment',
      'nails': 'Manicure Pedicure',
      'package': 'Paket Premium',
      'therapy': 'Terapi'
    }
    return labelMap[categoryName] || categoryName
  }

  const filteredTreatments = treatments.filter(treatment => {
    const matchesCategory = selectedCategory === 'all' || treatment.category === selectedCategory
    const matchesStatus = showInactive || treatment.is_active
    return matchesCategory && matchesStatus
  })

  // Pagination
  const {
    paginatedItems: paginatedTreatments,
    paginationProps
  } = usePagination(filteredTreatments, 1, 12)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // CRUD Functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'facial',
      description: '',
      normalPrice: '',
      promoPrice: '',
      duration: '60',
      therapistFee: '',
      isActive: true
    })
    setEditingId(null)
  }

  const startEdit = (treatment: Treatment) => {
    setFormData({
      name: treatment.name,
      category: treatment.category,
      description: treatment.description,
      normalPrice: (treatment.normalPrice || treatment.price).toString(),
      promoPrice: treatment.normalPrice ? '' : '',
      duration: treatment.duration.toString(),
      therapistFee: (treatment.therapist_fee || 0).toString(),
      isActive: treatment.is_active
    })
    setEditingId(treatment.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = '/api/services'
      const method = editingId ? 'PUT' : 'POST'
      const submitData = {
        ...(editingId && { id: editingId }),
        ...formData,
        normalPrice: Number(formData.normalPrice),
        promoPrice: formData.promoPrice ? Number(formData.promoPrice) : null,
        duration: Number(formData.duration),
        therapistFee: Number(formData.therapistFee)
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
        console.log(`✅ Service ${editingId ? 'updated' : 'created'} successfully`)
        
        // Refresh treatments list
        const treatmentsResponse = await fetch('/api/services')
        const treatmentsResult = await treatmentsResponse.json()
        if (treatmentsResult.success) {
          setTreatments(treatmentsResult.data || [])
          setCategories(treatmentsResult.categories || [])
        }
        
        resetForm()
        setShowForm(false)
      } else {
        alert(`Gagal ${editingId ? 'mengubah' : 'menambah'} layanan: ` + result.error)
      }
    } catch (error) {
      console.error(`❌ Error ${editingId ? 'updating' : 'creating'} service:`, error)
      alert(`Gagal ${editingId ? 'mengubah' : 'menambah'} layanan. Silahkan coba lagi.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Service deleted successfully')
        setTreatments(prev => prev.filter(t => t.id !== id))
        
        // Update categories
        const treatmentsResponse = await fetch('/api/services')
        const treatmentsResult = await treatmentsResponse.json()
        if (treatmentsResult.success) {
          setCategories(treatmentsResult.categories || [])
        }
      } else {
        alert('Gagal menghapus layanan: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Error deleting service:', error)
      alert('Gagal menghapus layanan. Silahkan coba lagi.')
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`
    }
    return `${minutes}m`
  }

  const toggleTreatmentStatus = async (id: number) => {
    const treatment = treatments.find(t => t.id === id)
    if (!treatment) return

    // Optimistically update UI
    setTreatments(prev =>
      prev.map(treatment =>
        treatment.id === id ? { ...treatment, is_active: !treatment.is_active } : treatment
      )
    )

    try {
      // TODO: Add API call to update service status when endpoint is available
      console.log(`Toggle treatment ${id} status to ${!treatment.is_active}`)
    } catch (error) {
      console.error('Failed to update treatment status:', error)
      // Revert optimistic update on error
      setTreatments(prev =>
        prev.map(treatment =>
          treatment.id === id ? { ...treatment, is_active: treatment.is_active } : treatment
        )
      )
    }
  }

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-yellow-400 ${i < rating ? 'opacity-100' : 'opacity-30'}`}>
        ⭐
      </span>
    ))
  }

  const activeCount = treatments.filter(t => t.is_active).length
  const avgPrice = activeCount > 0 ? 
    treatments.filter(t => t.is_active).reduce((sum, t) => sum + t.price, 0) / activeCount : 0

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Menu Treatment</h1>
            <p className="text-gray-600">Kelola layanan dan treatment yang tersedia</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              Tampilkan yang non-aktif
            </label>
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold"
            >
              + Tambah Layanan
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="salon-card p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data treatment...</p>
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

        {/* Service Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="salon-card p-6"
          >
            <h2 className="text-xl font-semibold text-pink-800 mb-6">
              {editingId ? 'Edit Layanan' : 'Tambah Layanan Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Layanan *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Facial Brightening"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="facial">Perawatan Wajah</option>
                    <option value="hair_spa">Hair Spa</option>
                    <option value="body_treatment">Body Treatment</option>
                    <option value="nails">Manicure Pedicure</option>
                    <option value="package">Paket Treatment</option>
                    <option value="therapy">Therapy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Normal *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      name="normalPrice"
                      value={formData.normalPrice}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1000"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Promo (Opsional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      name="promoPrice"
                      value={formData.promoPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="40000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durasi (Menit) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    min="15"
                    step="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Therapist
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      name="therapistFee"
                      value={formData.therapistFee}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="20000"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Layanan Aktif</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Deskripsi layanan..."
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
                    : (editingId ? 'Ubah Layanan' : 'Simpan Layanan')
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
            { label: 'Total Treatment', value: treatments.length, color: 'blue', icon: '🌟' },
            { label: 'Treatment Aktif', value: activeCount, color: 'green', icon: '✅' },
            { label: 'Rata-rata Harga', value: formatCurrency(avgPrice), color: 'yellow', icon: '💰', isFormatted: true },
            { label: 'Kategori', value: categories.length, color: 'purple', icon: '📋' }
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

        {/* Category Filter */}
        <div className="salon-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Kategori</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {/* All categories button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`p-3 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-lg mb-1">🌟</div>
              <div>Semua Treatment</div>
            </button>
            
            {/* Dynamic categories from API */}
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.name
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-lg mb-1">{getCategoryIcon(category.name)}</div>
                <div>{getCategoryLabel(category.name)}</div>
                <div className="text-xs opacity-75 mt-1">({category.count})</div>
              </button>
            ))}
          </div>
        </div>

        {/* Treatments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {paginatedTreatments.map((treatment, index) => (
            <motion.div
              key={treatment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`salon-card p-6 ${
                !treatment.is_active ? 'opacity-60 border-dashed border-gray-300' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{treatment.name}</h3>
                    {!treatment.is_active && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                        Non-aktif
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(treatment.popularity)}
                    <span className="text-sm text-gray-500 ml-2">
                      ({treatment.popularity || 0}/5)
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Kategori: <span className="font-medium">{getCategoryLabel(treatment.category)}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleTreatmentStatus(treatment.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    treatment.is_active
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {treatment.is_active ? 'Non-aktifkan' : 'Aktifkan'}
                </button>
              </div>

              <p className="text-gray-600 text-sm mb-4">{treatment.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(treatment.price)}
                  </div>
                  <div className="text-xs text-gray-600">Harga</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {formatDuration(treatment.duration)}
                  </div>
                  <div className="text-xs text-gray-600">Durasi</div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Fee Therapist:</span>
                  <span className="font-medium text-green-600">
                    {treatment.therapist_fee ? formatCurrency(treatment.therapist_fee) : 'Belum diset'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Profit: {treatment.therapist_fee ? formatCurrency(treatment.price - treatment.therapist_fee) : formatCurrency(treatment.price)}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => startEdit(treatment)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDelete(treatment.id)}
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  title="Hapus layanan"
                >
                  🗑️
                </button>
                <button 
                  onClick={() => toggleTreatmentStatus(treatment.id)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    treatment.is_active 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {treatment.is_active ? '⏸️' : '▶️'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {!loading && !error && filteredTreatments.length > 0 && (
          <div className="flex justify-center">
            <Pagination {...paginationProps} />
          </div>
        )}

        {!loading && !error && filteredTreatments.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="salon-card p-12 text-center"
          >
            <div className="text-6xl mb-4">💆‍♀️</div>
            <p className="text-gray-500 mb-2">Tidak ada treatment ditemukan</p>
            <p className="text-sm text-gray-400">Coba ubah filter kategori atau aktifkan tampilan non-aktif</p>
          </motion.div>
        )}

        </>
        )}
      </div>
    </AdminLayout>
  )
}