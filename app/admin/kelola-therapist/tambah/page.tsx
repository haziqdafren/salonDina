'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AdminLayout from '../../../../components/admin/AdminLayout'

// Form interface
interface TherapistForm {
  namaLengkap: string
  initial: string
  nomorTelepon: string
  email: string
  tanggalBergabung: string
  status: 'Aktif' | 'Tidak Aktif'
  feePerTreatment: number
  tingkatKomisi: number
  catatan: string
}

// Error interface for validation
interface TherapistFormErrors {
  namaLengkap?: string
  initial?: string
  nomorTelepon?: string
  email?: string
  tanggalBergabung?: string
  status?: string
  feePerTreatment?: string
  tingkatKomisi?: string
  catatan?: string
}

export default function TambahTherapist() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<TherapistFormErrors>({})
  
  const [formData, setFormData] = useState<TherapistForm>({
    namaLengkap: '',
    initial: '',
    nomorTelepon: '',
    email: '',
    tanggalBergabung: new Date().toISOString().split('T')[0],
    status: 'Aktif',
    feePerTreatment: 15000,
    tingkatKomisi: 10,
    catatan: ''
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const validateForm = (): boolean => {
    const newErrors: TherapistFormErrors = {}

    // Validate required fields
    if (!formData.namaLengkap.trim()) {
      newErrors.namaLengkap = 'Nama lengkap wajib diisi'
    }

    if (!formData.initial.trim()) {
      newErrors.initial = 'Inisial wajib diisi'
    } else if (formData.initial.length > 1) {
      newErrors.initial = 'Inisial hanya boleh 1 huruf'
    }

    if (!formData.nomorTelepon.trim()) {
      newErrors.nomorTelepon = 'Nomor telepon wajib diisi'
    } else if (!/^(\+62|62|0)[0-9]{9,11}$/.test(formData.nomorTelepon.replace(/[-\s]/g, ''))) {
      newErrors.nomorTelepon = 'Format nomor telepon tidak valid'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    if (!formData.tanggalBergabung) {
      newErrors.tanggalBergabung = 'Tanggal bergabung wajib diisi'
    }

    if (formData.feePerTreatment < 0) {
      newErrors.feePerTreatment = 'Fee harus lebih dari 0'
    }

    if (formData.tingkatKomisi < 0 || formData.tingkatKomisi > 100) {
      newErrors.tingkatKomisi = 'Komisi harus antara 0-100%'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In real app, submit to API
      console.log('Submitting therapist data:', formData)
      
      // Show success and redirect
      alert('Therapist berhasil ditambahkan!')
      router.push('/admin/kelola-therapist')
    } catch (error) {
      console.error('Error adding therapist:', error)
      alert('Gagal menambahkan therapist. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TherapistForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Tambah Therapist Baru</h1>
            <p className="text-gray-600">Lengkapi informasi therapist yang akan bergabung</p>
          </div>
          <Link href="/admin/kelola-therapist">
            <button className="salon-button-secondary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Daftar
            </button>
          </Link>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="salon-card p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-pink-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Informasi Dasar
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="salon-form-group">
                  <label className="salon-label">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap therapist"
                    value={formData.namaLengkap}
                    onChange={(e) => handleInputChange('namaLengkap', e.target.value)}
                    className={`salon-input ${errors.namaLengkap ? 'border-red-300' : ''}`}
                  />
                  {errors.namaLengkap && (
                    <p className="salon-error">{errors.namaLengkap}</p>
                  )}
                </div>

                <div className="salon-form-group">
                  <label className="salon-label">
                    Inisial *
                  </label>
                  <input
                    type="text"
                    placeholder="R, A, E, T, dll"
                    maxLength={1}
                    value={formData.initial}
                    onChange={(e) => handleInputChange('initial', e.target.value.toUpperCase())}
                    className={`salon-input ${errors.initial ? 'border-red-300' : ''}`}
                  />
                  {errors.initial && (
                    <p className="salon-error">{errors.initial}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Satu huruf untuk identifikasi (contoh: R untuk Rina)
                  </p>
                </div>

                <div className="salon-form-group">
                  <label className="salon-label">
                    Nomor Telepon *
                  </label>
                  <input
                    type="tel"
                    placeholder="+62812-3456-7890"
                    value={formData.nomorTelepon}
                    onChange={(e) => handleInputChange('nomorTelepon', e.target.value)}
                    className={`salon-input ${errors.nomorTelepon ? 'border-red-300' : ''}`}
                  />
                  {errors.nomorTelepon && (
                    <p className="salon-error">{errors.nomorTelepon}</p>
                  )}
                </div>

                <div className="salon-form-group">
                  <label className="salon-label">
                    Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="therapist@salonmuslimah.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`salon-input ${errors.email ? 'border-red-300' : ''}`}
                  />
                  {errors.email && (
                    <p className="salon-error">{errors.email}</p>
                  )}
                </div>

                <div className="salon-form-group">
                  <label className="salon-label">
                    Tanggal Bergabung *
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalBergabung}
                    onChange={(e) => handleInputChange('tanggalBergabung', e.target.value)}
                    className={`salon-input ${errors.tanggalBergabung ? 'border-red-300' : ''}`}
                  />
                  {errors.tanggalBergabung && (
                    <p className="salon-error">{errors.tanggalBergabung}</p>
                  )}
                </div>

                <div className="salon-form-group">
                  <label className="salon-label">
                    Status Awal
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="salon-input"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Setup */}
            <div>
              <h2 className="text-xl font-semibold text-pink-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Pengaturan Finansial
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="salon-form-group">
                  <label className="salon-label">
                    Fee per Treatment
                  </label>
                  <input
                    type="number"
                    placeholder="15000"
                    min="0"
                    step="1000"
                    value={formData.feePerTreatment}
                    onChange={(e) => handleInputChange('feePerTreatment', parseInt(e.target.value) || 0)}
                    className={`salon-input ${errors.feePerTreatment ? 'border-red-300' : ''}`}
                  />
                  {errors.feePerTreatment && (
                    <p className="salon-error">{errors.feePerTreatment}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Preview: {formatCurrency(formData.feePerTreatment)}
                  </p>
                </div>

                <div className="salon-form-group">
                  <label className="salon-label">
                    Tingkat Komisi (%)
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.tingkatKomisi}
                    onChange={(e) => handleInputChange('tingkatKomisi', parseFloat(e.target.value) || 0)}
                    className={`salon-input ${errors.tingkatKomisi ? 'border-red-300' : ''}`}
                  />
                  {errors.tingkatKomisi && (
                    <p className="salon-error">{errors.tingkatKomisi}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Persentase dari harga treatment
                  </p>
                </div>
              </div>

              {/* Fee Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-2xl">
                <h4 className="font-semibold text-gray-800 mb-2">Preview Penghasilan:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Fee per Treatment:</span>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(formData.feePerTreatment)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Komisi dari treatment Rp 200.000:</span>
                    <div className="font-semibold text-blue-600">
                      {formatCurrency(200000 * (formData.tingkatKomisi / 100))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total per treatment (contoh):</span>
                    <div className="font-semibold text-purple-600">
                      {formatCurrency(formData.feePerTreatment + (200000 * (formData.tingkatKomisi / 100)))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h2 className="text-xl font-semibold text-pink-800 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Catatan Tambahan
              </h2>
              
              <div className="salon-form-group">
                <label className="salon-label">
                  Catatan Khusus
                </label>
                <textarea
                  rows={4}
                  placeholder="Keahlian khusus, pengalaman, atau informasi penting lainnya..."
                  value={formData.catatan}
                  onChange={(e) => handleInputChange('catatan', e.target.value)}
                  className="salon-input resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contoh: Spesialis facial, Expert creambath, Berpengalaman 5 tahun, dll.
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-pink-100">
              <Link href="/admin/kelola-therapist" className="flex-1">
                <button
                  type="button"
                  className="salon-button-secondary w-full"
                  disabled={loading}
                >
                  Batal
                </button>
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className="salon-button-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Therapist
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Help Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="salon-card p-6"
        >
          <h3 className="text-lg font-semibold text-pink-800 mb-4">💡 Tips Mengisi Data Therapist</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 font-bold">•</span>
              <p><strong>Inisial:</strong> Gunakan huruf pertama nama depan untuk memudah identifikasi</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-500 font-bold">•</span>
              <p><strong>Fee per Treatment:</strong> Standar salon Rp 15.000 - 25.000 per treatment</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">•</span>
              <p><strong>Komisi:</strong> Biasanya 8-15% dari harga treatment untuk motivasi kualitas</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-500 font-bold">•</span>
              <p><strong>Nomor Telepon:</strong> Format Indonesia (+62) untuk WhatsApp dan komunikasi</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}