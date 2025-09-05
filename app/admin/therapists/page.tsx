'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'

interface Therapist {
  id: number
  initial: string
  fullName: string
  phone?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface ApiResponse {
  success: boolean
  data: Therapist[]
  fallback?: string
  message?: string
}

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Form state for CRUD operations
  const [showForm, setShowForm] = useState<boolean>(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [formData, setFormData] = useState({
    initial: '',
    fullName: '',
    phone: '',
    isActive: true
  })

  // Fetch therapists from API
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/therapists')
        const result: ApiResponse = await response.json()
        
        if (result.success) {
          setTherapists(result.data || [])
          console.log('👩‍⚕️ Therapists fetched:', result.data?.length || 0)
        } else {
          setError('Failed to fetch therapists')
        }
      } catch (err) {
        console.error('Error fetching therapists:', err)
        setError('Network error while fetching therapists')
      } finally {
        setLoading(false)
      }
    }

    fetchTherapists()
  }, [])

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.initial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (therapist.phone && therapist.phone.includes(searchTerm))
    
    let matchesStatus = true
    if (statusFilter === 'active') {
      matchesStatus = therapist.isActive
    } else if (statusFilter === 'inactive') {
      matchesStatus = !therapist.isActive
    }
    
    return matchesSearch && matchesStatus
  })

  const toggleTherapistStatus = async (id: number) => {
    const therapist = therapists.find(t => t.id === id)
    if (!therapist) return

    // Optimistically update UI
    setTherapists(prev =>
      prev.map(therapist =>
        therapist.id === id ? { ...therapist, isActive: !therapist.isActive } : therapist
      )
    )

    try {
      // TODO: Add API call to update therapist status when endpoint is available
      console.log(`Toggle therapist ${id} status to ${!therapist.isActive}`)
    } catch (error) {
      console.error('Failed to update therapist status:', error)
      // Revert optimistic update on error
      setTherapists(prev =>
        prev.map(therapist =>
          therapist.id === id ? { ...therapist, isActive: therapist.isActive } : therapist
        )
      )
    }
  }

  // CRUD Functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const resetForm = () => {
    setFormData({
      initial: '',
      fullName: '',
      phone: '',
      isActive: true
    })
    setEditingId(null)
  }

  const startEdit = (therapist: Therapist) => {
    setFormData({
      initial: therapist.initial,
      fullName: therapist.fullName,
      phone: therapist.phone || '',
      isActive: therapist.isActive
    })
    setEditingId(therapist.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = '/api/therapists'
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
        console.log(`✅ Therapist ${editingId ? 'updated' : 'created'} successfully`)
        
        if (editingId) {
          // Update existing therapist
          setTherapists(prev => 
            prev.map(t => t.id === editingId ? result.data : t)
          )
        } else {
          // Add new therapist
          setTherapists(prev => [result.data, ...prev])
        }
        
        resetForm()
        setShowForm(false)
      } else {
        alert(`Gagal ${editingId ? 'mengubah' : 'menambah'} therapist: ` + result.error)
      }
    } catch (error) {
      console.error(`❌ Error ${editingId ? 'updating' : 'creating'} therapist:`, error)
      alert(`Gagal ${editingId ? 'mengubah' : 'menambah'} therapist. Silahkan coba lagi.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus therapist ini?')) return

    try {
      const response = await fetch(`/api/therapists/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Therapist deleted successfully')
        setTherapists(prev => prev.filter(t => t.id !== id))
      } else {
        alert('Gagal menghapus therapist: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Error deleting therapist:', error)
      alert('Gagal menghapus therapist. Silahkan coba lagi.')
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

  const activeCount = therapists.filter(t => t.isActive).length
  const inactiveCount = therapists.filter(t => !t.isActive).length

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Manajemen Therapist</h1>
            <p className="text-gray-600">Kelola data therapist dan status keaktifan</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-bold text-pink-600">
                {loading ? '...' : therapists.length} therapist
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
              + Tambah Therapist
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="salon-card p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data therapist...</p>
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

        {/* Therapist Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="salon-card p-6"
          >
            <h2 className="text-xl font-semibold text-pink-800 mb-6">
              {editingId ? 'Edit Therapist' : 'Tambah Therapist Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inisial *
                  </label>
                  <input
                    type="text"
                    name="initial"
                    value={formData.initial}
                    onChange={handleInputChange}
                    required
                    maxLength={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="F (untuk Fatimah)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Fatimah Azzahra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="08xxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Therapist Aktif</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors font-semibold"
                >
                  {submitting 
                    ? (editingId ? 'Mengubah...' : 'Menyimpan...') 
                    : (editingId ? 'Ubah Therapist' : 'Simpan Therapist')
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
            { label: 'Total Therapist', value: therapists.length, color: 'blue', icon: '👩‍⚕️' },
            { label: 'Therapist Aktif', value: activeCount, color: 'green', icon: '✅' },
            { label: 'Tidak Aktif', value: inactiveCount, color: 'red', icon: '❌' },
            { label: 'Sedang Bertugas', value: activeCount, color: 'purple', icon: '💼' }
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
                  <p className={`text-xl font-bold text-${stat.color}-600`}>
                    {stat.value}
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
                Cari Therapist
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau inisial..."
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
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Therapists Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTherapists.map((therapist, index) => (
            <motion.div
              key={therapist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="salon-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {therapist.initial}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{therapist.fullName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      therapist.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {therapist.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => toggleTherapistStatus(therapist.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    therapist.isActive
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {therapist.isActive ? 'Non-aktifkan' : 'Aktifkan'}
                </button>
              </div>

              {therapist.phone && (
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p className="flex items-center gap-2">
                    <span>📱</span>
                    <span>{therapist.phone}</span>
                  </p>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bergabung:</span>
                  <span className="font-medium">{formatDate(therapist.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Update Terakhir:</span>
                  <span className="font-medium">{formatDate(therapist.updatedAt)}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => startEdit(therapist)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDelete(therapist.id)}
                  className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  title="Hapus therapist"
                >
                  🗑️
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors">
                  📅 Jadwal
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && !error && filteredTherapists.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="salon-card p-12 text-center"
          >
            <div className="text-6xl mb-4">👩‍⚕️</div>
            <p className="text-gray-500 mb-2">Tidak ada therapist ditemukan</p>
            <p className="text-sm text-gray-400">Coba ubah kata kunci pencarian atau filter status</p>
          </motion.div>
        )}

        </>
        )}
      </div>
    </AdminLayout>
  )
}