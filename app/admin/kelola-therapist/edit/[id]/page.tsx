'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
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
}

export default function EditTherapist() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    initial: '',
    namaLengkap: '',
    nomorTelepon: '',
    email: '',
    status: 'active' as 'active' | 'inactive' | 'leave',
    feePerTreatment: 0,
    tingkatKomisi: 0,
    notes: ''
  })

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
          const data = result.data
          setTherapist(data)
          setFormData({
            initial: data.initial || '',
            namaLengkap: data.namaLengkap || '',
            nomorTelepon: data.nomorTelepon || '',
            email: data.email || '',
            status: data.status || 'active',
            feePerTreatment: data.feePerTreatment || 0,
            tingkatKomisi: data.tingkatKomisi || 0,
            notes: data.notes || ''
          })
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      const response = await fetch(`/api/therapists/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          router.push('/admin/kelola-therapist')
        } else {
          alert('Failed to update therapist: ' + result.error)
        }
      } else {
        alert('Failed to update therapist')
      }
    } catch (error) {
      console.error('Error updating therapist:', error)
      alert('Error updating therapist')
    } finally {
      setSaving(false)
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
            <h1 className="text-3xl font-bold text-pink-800">Edit Therapist</h1>
            <p className="text-gray-600">Update informasi therapist</p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="salon-card p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Dasar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="salon-label">Inisial *</label>
                  <input
                    type="text"
                    maxLength={2}
                    required
                    value={formData.initial}
                    onChange={(e) => setFormData(prev => ({ ...prev, initial: e.target.value.toUpperCase() }))}
                    className="salon-input"
                    placeholder="Contoh: R"
                  />
                </div>
                <div>
                  <label className="salon-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaLengkap}
                    onChange={(e) => setFormData(prev => ({ ...prev, namaLengkap: e.target.value }))}
                    className="salon-input"
                    placeholder="Nama lengkap therapist"
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Kontak</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="salon-label">Nomor Telepon *</label>
                  <input
                    type="tel"
                    required
                    value={formData.nomorTelepon}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomorTelepon: e.target.value }))}
                    className="salon-input"
                    placeholder="+62812-xxxx-xxxx"
                  />
                </div>
                <div>
                  <label className="salon-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="salon-input"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Status & Compensation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status & Kompensasi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="salon-label">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="salon-input"
                    required
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                    <option value="leave">Cuti</option>
                  </select>
                </div>
                <div>
                  <label className="salon-label">Fee per Treatment (Rp) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.feePerTreatment}
                    onChange={(e) => setFormData(prev => ({ ...prev, feePerTreatment: parseInt(e.target.value) || 0 }))}
                    className="salon-input"
                    placeholder="20000"
                  />
                </div>
                <div>
                  <label className="salon-label">Tingkat Komisi (%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formData.tingkatKomisi}
                    onChange={(e) => setFormData(prev => ({ ...prev, tingkatKomisi: parseInt(e.target.value) || 0 }))}
                    className="salon-input"
                    placeholder="12"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="salon-label">Catatan</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="salon-input"
                placeholder="Catatan tentang therapist, spesialisasi, dll..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="salon-btn-secondary flex-1"
                disabled={saving}
              >
                Batal
              </button>
              <button
                type="submit"
                className="salon-btn-primary flex-1"
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : 'Update Therapist'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AdminLayout>
  )
}