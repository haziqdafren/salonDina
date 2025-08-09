'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import AdminLayout from '../../../components/admin/AdminLayout'
import Pagination, { usePagination } from '../../../components/admin/Pagination'

// Therapist interface matching API response - flexible for both API and mock data
interface Therapist {
  id: string
  initial?: string
  namaLengkap?: string  // API returns namaLengkap, not fullName
  fullName?: string     // Keep for backward compatibility
  nomorTelepon?: string // API returns nomorTelepon
  phone?: string        // Keep for backward compatibility
  email?: string
  tanggalBergabung?: string // API returns tanggalBergabung
  joinDate?: string     // Keep for backward compatibility
  status?: 'active' | 'inactive' | 'leave' | 'Aktif' | 'Tidak Aktif' | 'Cuti'
  feePerTreatment?: number // API returns feePerTreatment
  baseFeePerTreatment?: number // Keep for backward compatibility
  tingkatKomisi?: number // API returns tingkatKomisi
  commissionRate?: number // Keep for backward compatibility
  notes?: string
  // Performance data
  totalTreatments?: number
  totalEarnings?: number
  averageRating?: number
  // Monthly stats from API
  monthlyTreatments?: number
  monthlyEarnings?: number
  todayTreatments?: number
  todayEarnings?: number
}

// Mock therapist data for fallback
const mockTherapists: Therapist[] = [
  {
    id: '1',
    initial: 'R',
    namaLengkap: 'Rina Sari Dewi',
    fullName: 'Rina Sari Dewi',
    nomorTelepon: '+62812-3456-7890',
    phone: '+62812-3456-7890',
    email: 'rina@salonmuslimah.com',
    tanggalBergabung: '2023-01-15',
    joinDate: '2023-01-15',
    status: 'active',
    feePerTreatment: 20000,
    baseFeePerTreatment: 20000,
    tingkatKomisi: 12,
    commissionRate: 0.12,
    notes: 'Spesialis facial dan perawatan wajah',
    totalTreatments: 850,
    totalEarnings: 17000000,
    averageRating: 4.8,
    monthlyTreatments: 85,
    monthlyEarnings: 1700000,
    todayTreatments: 4,
    todayEarnings: 180000
  },
  {
    id: '2',
    initial: 'A',
    fullName: 'Aisha Putri Maharani',
    phone: '+62813-7890-1234',
    email: 'aisha@salonmuslimah.com',
    joinDate: '2023-02-20',
    status: 'active',
    baseFeePerTreatment: 18000,
    commissionRate: 0.10,
    notes: 'Expert creambath dan hair spa',
    totalTreatments: 720,
    totalEarnings: 12960000,
    averageRating: 4.7,
    monthlyTreatments: 72,
    monthlyEarnings: 1296000,
    todayTreatments: 3,
    todayEarnings: 165000
  },
  {
    id: '3',
    initial: 'E',
    fullName: 'Elisa Rahman Wati',
    phone: '+62814-5678-9012',
    email: 'elisa@salonmuslimah.com',
    joinDate: '2023-03-10',
    status: 'active',
    baseFeePerTreatment: 17000,
    commissionRate: 0.10,
    notes: 'Mahir body massage dan aromaterapi',
    totalTreatments: 680,
    totalEarnings: 11560000,
    averageRating: 4.6,
    monthlyTreatments: 68,
    monthlyEarnings: 1156000,
    todayTreatments: 3,
    todayEarnings: 150000
  },
  {
    id: '4',
    initial: 'T',
    fullName: 'Tina Wulandari Sari',
    phone: '+62815-9012-3456',
    email: 'tina@salonmuslimah.com',
    joinDate: '2023-04-05',
    status: 'active',
    baseFeePerTreatment: 25000,
    commissionRate: 0.15,
    notes: 'Spesialis paket pengantin dan makeup',
    totalTreatments: 450,
    totalEarnings: 11250000,
    averageRating: 4.9,
    monthlyTreatments: 45,
    monthlyEarnings: 1125000,
    todayTreatments: 4,
    todayEarnings: 195000
  },
  {
    id: '5',
    initial: 'S',
    fullName: 'Sari Indah Permata',
    phone: '+62816-2345-6789',
    joinDate: '2023-05-15',
    status: 'leave',
    baseFeePerTreatment: 15000,
    commissionRate: 0.08,
    notes: 'Sedang cuti hamil sampai Desember 2024',
    totalTreatments: 200,
    totalEarnings: 3000000,
    averageRating: 4.5,
    monthlyTreatments: 0,
    monthlyEarnings: 0,
    todayTreatments: 0,
    todayEarnings: 0
  }
]

export default function KelolaTherapist() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Aktif' | 'Tidak Aktif' | 'Cuti'>('Semua')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Fetch therapists data from API
  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/therapists')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setTherapists(result.data)
          } else {
            console.error('Failed to fetch therapists:', result.error)
            // Fallback to mock data
            setTherapists(mockTherapists)
          }
        } else {
          console.error('Therapists API request failed')
          setTherapists(mockTherapists)
        }
      } catch (error) {
        console.error('Error fetching therapists:', error)
        setTherapists(mockTherapists)
      } finally {
        setLoading(false)
      }
    }

    fetchTherapists()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A'
    return phone.replace('+62', '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
      case 'Aktif':
        return 'bg-green-100 text-green-700'
      case 'inactive':
      case 'Tidak Aktif':
        return 'bg-red-100 text-red-700'
      case 'leave':
      case 'Cuti':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'inactive':
        return 'Tidak Aktif'
      case 'leave':
        return 'Cuti'
      case 'Aktif':
      case 'Tidak Aktif':
      case 'Cuti':
        return status
      default:
        return status || 'Unknown'
    }
  }

  const mapFilterStatus = (filter: string) => {
    switch (filter) {
      case 'Aktif':
        return 'active'
      case 'Tidak Aktif':
        return 'inactive'
      case 'Cuti':
        return 'leave'
      default:
        return 'all'
    }
  }

  const filteredTherapists = therapists.filter(therapist => {
    // Safe property access with fallbacks
    const fullName = therapist.namaLengkap || therapist.fullName || ''
    const initial = therapist.initial || ''
    
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         initial.toLowerCase().includes(searchTerm.toLowerCase())
    const mappedStatus = mapFilterStatus(statusFilter)
    const matchesStatus = statusFilter === 'Semua' || therapist.status === mappedStatus
    return matchesSearch && matchesStatus
  })

  // Pagination for filtered therapists
  const {
    currentPage,
    itemsPerPage, 
    paginatedData: paginatedTherapists,
    totalItems: totalTherapists,
    handlePageChange,
    handleItemsPerPageChange
  } = usePagination(filteredTherapists, 10)

  const handleDeactivate = async (id: string) => {
    try {
      // Call API to deactivate therapist
      const response = await fetch(`/api/therapists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inactive' })
      })
      
      if (response.ok) {
        // Update local state
        setTherapists(prevTherapists =>
          prevTherapists.map(therapist =>
            therapist.id === id 
              ? { ...therapist, status: 'inactive' as const }
              : therapist
          )
        )
      } else {
        console.error('Failed to deactivate therapist')
      }
    } catch (error) {
      console.error('Error deactivating therapist:', error)
    }
    setShowDeleteConfirm(null)
  }

  const activeTherapistsCount = therapists.filter(t => t.status === 'active').length
  const totalMonthlyRevenue = therapists.reduce((sum, t) => sum + (t.monthlyEarnings || 0), 0)
  const averagePerformance = therapists.length > 0 
    ? therapists.reduce((sum, t) => sum + (t.averageRating || 0), 0) / therapists.length 
    : 0

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data therapist...</p>
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
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Kelola Therapist</h1>
            <p className="text-gray-600">Manajemen lengkap data therapist salon</p>
          </div>
          <Link href="/admin/kelola-therapist/tambah">
            <button className="salon-button-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Tambah Therapist Baru
            </button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="salon-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Therapist Aktif</h3>
                <p className="text-3xl font-bold text-blue-600">{activeTherapistsCount}</p>
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
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Revenue Bulan Ini</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthlyRevenue)}</p>
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
              <div className="bg-yellow-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Rating Rata-rata</h3>
                <p className="text-3xl font-bold text-yellow-600">{averagePerformance.toFixed(1)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="salon-card p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cari Therapist</label>
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau inisial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="salon-input"
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="salon-input"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
                <option value="Cuti">Cuti</option>
              </select>
            </div>
          </div>
        </div>

        {/* Therapists Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-pink-800">
                Daftar Therapist ({filteredTherapists.length})
              </h2>
              {filteredTherapists.length > 0 && (
                <div className="text-sm text-gray-600">
                  Halaman {currentPage} dari {Math.ceil(totalTherapists / itemsPerPage)}
                </div>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Therapist</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Kontak</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Performance Bulan Ini</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Fee Structure</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTherapists.map((therapist, index) => (
                  <motion.tr
                    key={therapist.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-t border-pink-100 hover:bg-pink-25"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {therapist.initial}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{therapist.namaLengkap || therapist.fullName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            Bergabung: {therapist.tanggalBergabung ? new Date(therapist.tanggalBergabung).toLocaleDateString('id-ID') : (therapist.joinDate ? new Date(therapist.joinDate).toLocaleDateString('id-ID') : 'N/A')}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-800">
                          {formatPhone(therapist.nomorTelepon || therapist.phone || '')}
                        </div>
                        {therapist.email && (
                          <div className="text-sm text-gray-500">{therapist.email}</div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(therapist.status)}`}>
                        {getStatusText(therapist.status)}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Treatments:</span>
                          <span className="font-semibold">{therapist.monthlyTreatments || 0}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Revenue:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(therapist.monthlyEarnings || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rating:</span>
                          <span className="font-semibold text-yellow-600">
                            ⭐ {(therapist.averageRating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-sm">
                        <div className="font-semibold">
                          {formatCurrency(therapist.feePerTreatment || therapist.baseFeePerTreatment || 0)}/treatment
                        </div>
                        <div className="text-gray-500">
                          Komisi: {Math.round((therapist.tingkatKomisi || therapist.commissionRate || 0) * (therapist.tingkatKomisi ? 1 : 100))}%
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/kelola-therapist/edit/${therapist.id}`}>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors touch-manipulation min-w-[40px] min-h-[40px]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </Link>
                        
                        <Link href={`/admin/kelola-therapist/detail/${therapist.id}`}>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors touch-manipulation min-w-[40px] min-h-[40px]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </Link>
                        
                        {therapist.status === 'active' && (
                          <button
                            onClick={() => setShowDeleteConfirm(therapist.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors touch-manipulation min-w-[40px] min-h-[40px]"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredTherapists.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada therapist ditemukan</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'Semua'
                    ? 'Tidak ada therapist yang sesuai dengan filter pencarian'
                    : 'Coba ubah filter pencarian atau tambah therapist baru'
                  }
                </p>
                {(searchTerm || statusFilter !== 'Semua') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('Semua')
                    }}
                    className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Pagination for Therapists */}
          {filteredTherapists.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalTherapists}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemName="therapist"
              loading={loading}
              itemsPerPageOptions={[5, 10, 15, 25]}
            />
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="salon-card p-6 max-w-md mx-4"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Nonaktifkan Therapist?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Therapist ini akan dinonaktifkan dan tidak bisa menerima booking baru.
                    Data dan riwayat tetap tersimpan.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="salon-button-secondary flex-1"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => handleDeactivate(showDeleteConfirm)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-2xl transition-colors flex-1"
                    >
                      Ya, Nonaktifkan
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}