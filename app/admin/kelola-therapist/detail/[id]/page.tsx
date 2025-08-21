'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import AdminLayout from '../../../../../components/admin/AdminLayout'

interface Therapist {
  id: string
  initial: string
  namaLengkap: string
  nomorTelepon: string
  email?: string
  tanggalBergabung: string
  status: 'active' | 'inactive' | 'leave'
  feePerTreatment: number
  tingkatKomisi: number
  notes?: string
  // Performance data
  totalTreatments?: number
  totalEarnings?: number
  averageRating?: number
  monthlyTreatments?: number
  monthlyEarnings?: number
  todayTreatments?: number
  todayEarnings?: number
}

export default function DetailTherapist() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchTherapist()
    }
  }, [id])

  const fetchTherapist = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/therapists/${id}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setTherapist(result.data)
        } else {
          console.error('Failed to fetch therapist:', result.error)
          router.push('/admin/kelola-therapist')
        }
      } else {
        console.error('Therapist API request failed')
        router.push('/admin/kelola-therapist')
      }
    } catch (error) {
      console.error('Error fetching therapist:', error)
      router.push('/admin/kelola-therapist')
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

  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A'
    return phone.replace('+62', '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'inactive':
        return 'bg-red-100 text-red-700'
      case 'leave':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'inactive':
        return 'Tidak Aktif'
      case 'leave':
        return 'Cuti'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data therapist...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!therapist) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Therapist tidak ditemukan</h1>
          <button
            onClick={() => router.push('/admin/kelola-therapist')}
            className="salon-btn-primary"
          >
            Kembali ke Daftar Therapist
          </button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-pink-800">Detail Therapist</h1>
              <p className="text-gray-600">Informasi lengkap therapist</p>
            </div>
          </div>
          <Link href={`/admin/kelola-therapist/edit/${therapist.id}`}>
            <button className="salon-btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </Link>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="salon-card p-6"
        >
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {therapist.initial}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-800">{therapist.namaLengkap}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(therapist.status)}`}>
                  {getStatusText(therapist.status)}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nomor Telepon:</span>
                  <span className="ml-2 font-medium">{formatPhone(therapist.nomorTelepon)}</span>
                </div>
                {therapist.email && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{therapist.email}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Bergabung:</span>
                  <span className="ml-2 font-medium">
                    {new Date(therapist.tanggalBergabung).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Rating:</span>
                  <span className="ml-2 font-medium text-yellow-600">
                    ⭐ {(therapist.averageRating || 0).toFixed(1)}
                  </span>
                </div>
              </div>
              {therapist.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{therapist.notes}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="salon-card p-6"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {therapist.todayTreatments || 0}
              </div>
              <div className="text-sm text-gray-600">Treatments Hari Ini</div>
              <div className="text-lg font-semibold text-green-600 mt-1">
                {formatCurrency(therapist.todayEarnings || 0)}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="salon-card p-6"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {therapist.monthlyTreatments || 0}
              </div>
              <div className="text-sm text-gray-600">Treatments Bulan Ini</div>
              <div className="text-lg font-semibold text-green-600 mt-1">
                {formatCurrency(therapist.monthlyEarnings || 0)}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="salon-card p-6"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 mb-2">
                {therapist.totalTreatments || 0}
              </div>
              <div className="text-sm text-gray-600">Total Treatments</div>
              <div className="text-lg font-semibold text-green-600 mt-1">
                {formatCurrency(therapist.totalEarnings || 0)}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="salon-card p-6"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {(therapist.averageRating || 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Rating Rata-rata</div>
              <div className="text-sm text-gray-500 mt-1">
                dari {therapist.totalTreatments || 0} treatments
              </div>
            </div>
          </motion.div>
        </div>

        {/* Fee Structure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="salon-card p-6"
        >
          <h3 className="text-xl font-semibold text-pink-800 mb-4">Struktur Fee</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-green-700">Fee per Treatment</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(therapist.feePerTreatment)}
              </div>
              <div className="text-sm text-green-600 mt-1">
                Base fee untuk setiap treatment
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-blue-700">Tingkat Komisi</div>
              <div className="text-2xl font-bold text-blue-600">
                {therapist.tingkatKomisi}%
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Persentase dari harga treatment
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}