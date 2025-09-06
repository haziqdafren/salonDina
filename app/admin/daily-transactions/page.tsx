'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'
import FeedbackModal from '../../../components/admin/FeedbackModal'

interface DailyTreatment {
  id: number
  date: string
  customerName: string
  customerPhone: string
  serviceName: string
  servicePrice: number
  therapistName: string
  therapistFee: number
  revenue: number
  profit: number
  notes?: string
  createdAt: string
}

interface Therapist {
  id: number
  fullName: string
  initial: string
  isActive: boolean
}

interface Service {
  id: number
  name: string
  normalPrice: number
  category: string
}

interface Customer {
  id: number
  name: string
  phone: string
}

interface ApiResponse {
  success: boolean
  data: DailyTreatment[]
  fallback?: string
  message?: string
}

interface TherapistApiResponse {
  success: boolean
  data: Therapist[]
}

interface ServiceApiResponse {
  success: boolean
  data: Service[]
}

interface CustomerApiResponse {
  success: boolean
  data: Customer[]
}

export default function DailyTransactionsPage() {
  const [transactions, setTransactions] = useState<DailyTreatment[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState<boolean>(false)
  
  // Dropdown data
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  
  // Form state
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    serviceName: '',
    servicePrice: '',
    therapistId: '',
    therapistName: '',
    therapistFee: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState<boolean>(false)
  
  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false)
  const [selectedTreatment, setSelectedTreatment] = useState<DailyTreatment | null>(null)
  const [feedbackGivenIds, setFeedbackGivenIds] = useState<Set<number>>(new Set())

  // Rehydrate feedback-given state so button stays off across renders
  useEffect(() => {
    try {
      const raw = localStorage.getItem('feedbackGivenIds')
      if (raw) {
        const arr = JSON.parse(raw) as number[]
        setFeedbackGivenIds(new Set(arr))
      }
    } catch {}
  }, [])

  // Fetch all data in one optimized call
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        console.log('🚀 Fetching combined daily transactions data for:', selectedDate)
        
        const response = await fetch(`/api/daily-treatments?date=${selectedDate}`)
        const result = await response.json()
        
        if (result.success) {
          const transactions = result.data || []
          
          // Fetch additional data in parallel
          const [therapistsRes, servicesRes, customersRes] = await Promise.all([
            fetch('/api/therapists'),
            fetch('/api/services'),
            fetch('/api/customers')
          ])
          
          const [therapistsData, servicesData, customersData] = await Promise.all([
            therapistsRes.json(),
            servicesRes.json(),
            customersRes.json()
          ])
          
          setTransactions(transactions)
          setTherapists(therapistsData.data || [])
          setServices(servicesData.data || [])
          setCustomers(customersData.data || [])
          
          console.log('✅ All data fetched successfully:', {
            transactions: transactions?.length || 0,
            therapists: therapistsData.data?.length || 0,
            services: servicesData.data?.length || 0,
            customers: customersData.data?.length || 0
          })
        } else {
          setError('Failed to fetch data')
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Network error while fetching data')
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [selectedDate])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const serviceId = e.target.value
    const selectedService = services.find(s => s.id === parseInt(serviceId))
    
    setFormData(prev => ({
      ...prev,
      serviceId,
      serviceName: selectedService?.name || '',
      servicePrice: selectedService?.normalPrice.toString() || ''
    }))
  }

  const handleTherapistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const therapistId = e.target.value
    const selectedTherapist = therapists.find(t => t.id === parseInt(therapistId))
    
    setFormData(prev => ({
      ...prev,
      therapistId,
      therapistName: selectedTherapist?.fullName || '',
      // Set default therapist fee (40% of service price)
      therapistFee: prev.servicePrice ? (parseFloat(prev.servicePrice) * 0.4).toString() : ''
    }))
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = customers.find(c => c.id === parseInt(customerId))
    if (customer) {
      setFormData(prev => ({
        ...prev,
        customerName: customer.name,
        customerPhone: customer.phone
      }))
    }
  }

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      serviceId: '',
      serviceName: '',
      servicePrice: '',
      therapistId: '',
      therapistName: '',
      therapistFee: '',
      notes: ''
    })
    setEditingId(null)
  }

  const startEdit = (transaction: DailyTreatment) => {
    const matchingService = services.find(s => s.name === transaction.serviceName)
    const matchingTherapist = therapists.find(t => t.fullName === transaction.therapistName)

    setFormData({
      customerName: transaction.customerName,
      customerPhone: transaction.customerPhone,
      serviceId: matchingService?.id.toString() || '',
      serviceName: transaction.serviceName,
      servicePrice: transaction.servicePrice.toString(),
      therapistId: matchingTherapist?.id.toString() || '',
      therapistName: transaction.therapistName,
      therapistFee: transaction.therapistFee.toString(),
      notes: transaction.notes || ''
    })
    setEditingId(transaction.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Form validation
    if (!formData.customerName.trim()) {
      alert('Nama customer harus diisi')
      setSubmitting(false)
      return
    }
    
    if (!formData.serviceName.trim()) {
      alert('Nama layanan harus diisi')
      setSubmitting(false)
      return
    }
    
    if (!formData.servicePrice || Number(formData.servicePrice) <= 0) {
      alert('Harga layanan harus diisi dengan benar')
      setSubmitting(false)
      return
    }

    try {
      const url = editingId ? `/api/daily-treatments/${editingId}` : '/api/daily-treatments'
      const method = editingId ? 'PUT' : 'POST'
      const submitData = {
        ...(editingId && { id: editingId }),
        ...formData,
        date: selectedDate,
        servicePrice: Number(formData.servicePrice),
        therapistFee: Number(formData.therapistFee) || 0
      }
      
      console.log('🔍 Submitting data:', submitData)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      console.log('📡 Response status:', response.status)
      const result = await response.json()
      console.log('📋 Response data:', result)

      if (result.success) {
        console.log(`✅ Transaction ${editingId ? 'updated' : 'added'} successfully`)
        
        if (editingId) {
          // Update existing transaction
          setTransactions(prev => 
            prev.map(t => t.id === editingId ? result.data : t)
          )
        } else {
          // Add new transaction
          setTransactions(prev => [result.data, ...prev])
        }
        
        resetForm()
        setShowForm(false)
        
        // Show success message with fallback info if applicable
        const successMessage = result.fallback 
          ? `✅ Data transaksi berhasil disimpan! (Mode: ${result.fallback})`
          : '✅ Data transaksi berhasil disimpan!'
        alert(successMessage)
      } else {
        console.error('❌ API returned error:', result.error, result.details)
        alert(`❌ Gagal ${editingId ? 'mengubah' : 'menambah'} transaksi: ${result.error}\n\nDetail: ${result.details || 'Tidak ada detail error'}`)
      }
    } catch (error) {
      console.error(`❌ Error ${editingId ? 'updating' : 'adding'} transaction:`, error)
      alert(`❌ Terjadi kesalahan jaringan. Detail error:\n${error instanceof Error ? error.message : 'Unknown error'}\n\nSilahkan periksa koneksi dan coba lagi.`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return

    try {
      const response = await fetch(`/api/daily-treatments/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Transaction deleted successfully')
        setTransactions(prev => prev.filter(t => t.id !== id))
      } else {
        alert('Gagal menghapus transaksi: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Error deleting transaction:', error)
      alert('Gagal menghapus transaksi. Silahkan coba lagi.')
    }
  }

  const handleRequestFeedback = (transaction: DailyTreatment) => {
    setSelectedTreatment(transaction)
    setFeedbackModalOpen(true)
  }

  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      })

      const result = await response.json()

      if (result.success) {
        console.log('✅ Feedback saved successfully')
        alert('✅ Feedback customer berhasil disimpan!')
        // Mark this treatment as feedback given
        setFeedbackGivenIds(prev => {
          const next = new Set(prev)
          next.add(feedbackData.treatmentId)
          try { localStorage.setItem('feedbackGivenIds', JSON.stringify(Array.from(next))) } catch {}
          return next
        })
        // Cache public feedback locally to ensure homepage section can show it even in fallback mode
        if (!result.data.isAnonymous) {
          try {
            const cached = localStorage.getItem('publicFeedbacks')
            const list = cached ? JSON.parse(cached) : []
            list.unshift(result.data)
            localStorage.setItem('publicFeedbacks', JSON.stringify(list.slice(0, 10)))
          } catch {}
        }
      } else {
        alert('❌ Gagal menyimpan feedback: ' + result.error)
      }
    } catch (error) {
      console.error('❌ Error saving feedback:', error)
      alert('❌ Terjadi kesalahan saat menyimpan feedback')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calculate totals
  const totalRevenue = transactions.reduce((sum, t) => sum + t.revenue, 0)
  const totalTherapistFees = transactions.reduce((sum, t) => sum + t.therapistFee, 0)
  const totalProfit = totalRevenue - totalTherapistFees

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Laporan Harian</h1>
            <p className="text-gray-600">Input dan kelola transaksi harian salon</p>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>ℹ️ Info:</strong> Data transaksi disimpan dalam mode fallback. 
                Semua data akan tetap tersimpan dan dapat diakses dengan normal.
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-pink-600">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-sm text-gray-500">
              Total pendapatan hari ini
            </div>
          </div>
        </div>

        {/* Date Selector and Add Button */}
        <div className="salon-card p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold"
            >
              {showForm ? 'Tutup Form' : '+ Tambah Transaksi'}
            </button>
          </div>
        </div>

        {/* Add Transaction Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="salon-card p-6"
          >
            <h2 className="text-xl font-semibold text-pink-800 mb-6">Tambah Transaksi Baru</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer *
                  </label>
                  <div className="space-y-2">
                    <select
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="">Pilih customer atau ketik manual</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id.toString()}>
                          {customer.name} ({customer.phone})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Nama customer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="08xxxxxxxxx"
                  />
                </div>

                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layanan *
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={handleServiceChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Pilih layanan</option>
                    {services.map(service => (
                      <option key={service.id} value={service.id.toString()}>
                        {service.name} - {formatCurrency(service.normalPrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Layanan *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      name="servicePrice"
                      value={formData.servicePrice}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="1000"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="50000"
                    />
                  </div>
                </div>

                {/* Therapist Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Therapist
                  </label>
                  <select
                    value={formData.therapistId}
                    onChange={handleTherapistChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Pilih therapist</option>
                    {therapists.map(therapist => (
                      <option key={therapist.id} value={therapist.id.toString()}>
                        {therapist.fullName} ({therapist.initial})
                      </option>
                    ))}
                  </select>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Catatan tambahan..."
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
                    : (editingId ? 'Ubah Transaksi' : 'Simpan Transaksi')
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Transaksi', value: transactions.length, color: 'blue', icon: '📊' },
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'green', icon: '💰' },
            { label: 'Fee Therapist', value: formatCurrency(totalTherapistFees), color: 'orange', icon: '👩‍⚕️' },
            { label: 'Profit Bersih', value: formatCurrency(totalProfit), color: 'purple', icon: '💎' }
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
                    {typeof stat.value === 'string' ? stat.value : stat.value}
                  </p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <h2 className="text-xl font-semibold text-pink-800">
              Transaksi {formatDate(selectedDate)}
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-500 mb-2">Memuat transaksi...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                Refresh Halaman
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 mb-2">Belum ada transaksi untuk tanggal ini</p>
              <p className="text-sm text-gray-400">Tambah transaksi baru untuk mulai mencatat</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Waktu</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Customer</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Layanan</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Therapist</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Harga</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Fee</th>
                    <th className="text-left py-4 px-6 font-semibold text-pink-800">Profit</th>
                    <th className="text-center py-4 px-6 font-semibold text-pink-800">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-pink-100 hover:bg-pink-25">
                      <td className="py-4 px-6 text-gray-800">
                        {formatTime(transaction.createdAt)}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-800">{transaction.customerName}</div>
                          {transaction.customerPhone && (
                            <div className="text-sm text-gray-500">{transaction.customerPhone}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        {transaction.serviceName}
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        {transaction.therapistName || '-'}
                      </td>
                      <td className="py-4 px-6 font-semibold text-green-600">
                        {formatCurrency(transaction.servicePrice)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-orange-600">
                        {formatCurrency(transaction.therapistFee)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-purple-600">
                        {formatCurrency(transaction.profit)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex gap-1 justify-center flex-wrap">
                          <button
                            onClick={() => handleRequestFeedback(transaction)}
                            className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 transition-colors"
                            title="Minta feedback customer"
                            disabled={feedbackGivenIds.has(transaction.id)}
                          >
                            {feedbackGivenIds.has(transaction.id) ? '✅ Selesai' : '⭐ Feedback'}
                          </button>
                          <button
                            onClick={() => startEdit(transaction)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                            title="Edit transaksi"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 transition-colors"
                            title="Hapus transaksi"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Feedback Modal */}
        {selectedTreatment && (
          <FeedbackModal
            isOpen={feedbackModalOpen}
            onClose={() => {
              setFeedbackModalOpen(false)
              setSelectedTreatment(null)
            }}
            treatmentData={{
              id: selectedTreatment.id,
              customerName: selectedTreatment.customerName,
              customerPhone: selectedTreatment.customerPhone || '',
              serviceName: selectedTreatment.serviceName,
              therapistName: selectedTreatment.therapistName
            }}
            onSubmit={handleFeedbackSubmit}
          />
        )}
      </div>
    </AdminLayout>
  )
}