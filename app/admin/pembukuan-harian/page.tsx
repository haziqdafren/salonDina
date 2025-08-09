'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'

// API-matching interfaces
interface Service {
  id: string
  name: string
  category: string
  normalPrice: number
  promoPrice?: number
  duration: number
  description?: string
}

interface Therapist {
  id: string
  initial: string
  fullName: string
  baseFeePerTreatment: number
  commissionRate: number
  status: string
}

interface DailyTreatment {
  id: string
  date: string
  customerName: string
  serviceName: string
  servicePrice: number
  therapistName: string
  therapistInitial: string
  startTime?: string
  endTime?: string
  tipAmount: number
  paymentMethod: 'cash' | 'transfer' | 'qris'
  notes?: string
  createdAt: string
  therapistEarnings?: number
}

// Mock data for fallback
const mockServices: Service[] = [
  { id: '1', name: 'Facial Brightening', category: 'Perawatan Wajah', normalPrice: 250000, duration: 90 },
  { id: '2', name: 'Facial Acne', category: 'Perawatan Wajah', normalPrice: 200000, duration: 75 },
  { id: '3', name: 'Hair Spa Premium', category: 'Perawatan Rambut', normalPrice: 180000, duration: 60 },
  { id: '4', name: 'Creambath', category: 'Perawatan Rambut', normalPrice: 75000, duration: 45 },
  { id: '5', name: 'Body Massage', category: 'Perawatan Tubuh', normalPrice: 200000, duration: 90 },
  { id: '6', name: 'Manicure Pedicure', category: 'Perawatan Kuku', normalPrice: 120000, duration: 60 },
  { id: '7', name: 'Paket Pengantin', category: 'Paket Khusus', normalPrice: 1500000, duration: 240 }
]

const mockTherapists: Therapist[] = [
  { id: '1', initial: 'R', fullName: 'Rina Sari', baseFeePerTreatment: 20000, commissionRate: 0.12, status: 'active' },
  { id: '2', initial: 'A', fullName: 'Aisha Putri', baseFeePerTreatment: 18000, commissionRate: 0.10, status: 'active' },
  { id: '3', initial: 'E', fullName: 'Elisa Rahman', baseFeePerTreatment: 17000, commissionRate: 0.10, status: 'active' },
  { id: '4', initial: 'T', fullName: 'Tina Wulandari', baseFeePerTreatment: 25000, commissionRate: 0.15, status: 'active' },
  { id: '5', initial: 'S', fullName: 'Sari Indah', baseFeePerTreatment: 15000, commissionRate: 0.08, status: 'leave' }
]

const mockTreatments: DailyTreatment[] = [
  {
    id: '1',
    date: '2024-12-07',
    customerName: 'Siti Aminah',
    serviceName: 'Facial Brightening',
    servicePrice: 250000,
    therapistName: 'Rina Sari',
    therapistInitial: 'R',
    startTime: '09:30',
    endTime: '11:00',
    tipAmount: 25000,
    paymentMethod: 'cash',
    notes: 'Customer reguler, puas dengan hasil facial',
    createdAt: '2024-12-07T09:30:00Z',
    therapistEarnings: 55000
  }
]

export default function PembukuanHarian() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [treatments, setTreatments] = useState<DailyTreatment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch treatments, services, and therapists in parallel
        const [treatmentsRes, servicesRes, therapistsRes] = await Promise.all([
          fetch(`/api/treatments?date=${selectedDate}`),
          fetch('/api/services'),
          fetch('/api/therapists')
        ])

        // Handle treatments response
        if (treatmentsRes.ok) {
          const treatmentsResult = await treatmentsRes.json()
          if (treatmentsResult.success) {
            setTreatments(treatmentsResult.data)
          } else {
            console.error('Failed to fetch treatments:', treatmentsResult.error)
            setTreatments(mockTreatments)
          }
        } else {
          console.error('Treatments API request failed')
          setTreatments(mockTreatments)
        }

        // Handle services response
        if (servicesRes.ok) {
          const servicesResult = await servicesRes.json()
          if (servicesResult.success) {
            setServices(servicesResult.data)
          } else {
            console.error('Failed to fetch services:', servicesResult.error)
            setServices(mockServices)
          }
        } else {
          console.error('Services API request failed')
          setServices(mockServices)
        }

        // Handle therapists response
        if (therapistsRes.ok) {
          const therapistsResult = await therapistsRes.json()
          if (therapistsResult.success) {
            // Filter only active therapists for the form
            setTherapists(therapistsResult.data.filter((t: Therapist) => t.status === 'active'))
          } else {
            console.error('Failed to fetch therapists:', therapistsResult.error)
            setTherapists(mockTherapists.filter(t => t.status === 'active'))
          }
        } else {
          console.error('Therapists API request failed')
          setTherapists(mockTherapists.filter(t => t.status === 'active'))
        }

      } catch (error) {
        console.error('Error fetching data:', error)
        setTreatments(mockTreatments)
        setServices(mockServices)
        setTherapists(mockTherapists.filter(t => t.status === 'active'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDate])

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    therapistId: '',
    customPrice: '',
    tipAmount: 0,
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'qris',
    startTime: '',
    endTime: '',
    notes: ''
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Filter treatments by selected date
  const filteredTreatments = treatments.filter(treatment => 
    new Date(treatment.date).toDateString() === new Date(selectedDate).toDateString()
  )

  // Calculate daily totals
  const dailyStats = {
    totalRevenue: filteredTreatments.reduce((sum, treatment) => sum + treatment.servicePrice, 0),
    totalTips: filteredTreatments.reduce((sum, treatment) => sum + treatment.tipAmount, 0),
    totalTreatments: filteredTreatments.length,
    newCustomers: 0, // This would need customer API integration to track new vs existing
    therapistEarnings: {} as Record<string, { fees: number, commissions: number, tips: number }>
  }

  // Calculate therapist earnings for the day
  filteredTreatments.forEach(treatment => {
    const therapist = therapists.find(t => t.initial === treatment.therapistInitial)
    if (therapist) {
      if (!dailyStats.therapistEarnings[therapist.id]) {
        dailyStats.therapistEarnings[therapist.id] = { fees: 0, commissions: 0, tips: 0 }
      }
      
      dailyStats.therapistEarnings[therapist.id].fees += therapist.baseFeePerTreatment
      dailyStats.therapistEarnings[therapist.id].commissions += treatment.servicePrice * therapist.commissionRate
      dailyStats.therapistEarnings[therapist.id].tips += treatment.tipAmount
    }
  })

  const calculateTotal = () => {
    if (formData.customPrice) {
      return parseInt(formData.customPrice)
    }
    const selectedService = services.find(s => s.id === formData.serviceId)
    return selectedService ? (selectedService.promoPrice || selectedService.normalPrice) : 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const servicePrice = calculateTotal()
      
      const treatmentData = {
        date: selectedDate,
        customerName: formData.customerName,
        phone: formData.customerPhone,
        serviceId: formData.serviceId,
        therapistId: formData.therapistId,
        servicePrice,
        tipAmount: formData.tipAmount,
        paymentMethod: formData.paymentMethod,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        notes: formData.notes || null
      }

      const response = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Add the new treatment to local state
          const newTreatment: DailyTreatment = {
            id: result.data.id,
            date: result.data.date,
            customerName: result.data.customerName,
            serviceName: result.data.serviceName,
            servicePrice: result.data.servicePrice,
            therapistName: result.data.therapistName,
            therapistInitial: result.data.therapistInitial,
            startTime: result.data.startTime,
            endTime: result.data.endTime,
            tipAmount: result.data.tipAmount,
            paymentMethod: result.data.paymentMethod,
            notes: result.data.notes,
            createdAt: result.data.createdAt || new Date().toISOString(),
            therapistEarnings: result.data.therapistEarnings
          }
          
          setTreatments(prev => [...prev, newTreatment])
          
          // Reset form
          setFormData({
            customerName: '',
            customerPhone: '',
            serviceId: '',
            therapistId: '',
            customPrice: '',
            tipAmount: 0,
            paymentMethod: 'cash',
            startTime: '',
            endTime: '',
            notes: ''
          })
          
          setShowAddForm(false)
        } else {
          console.error('Failed to create treatment:', result.error)
          alert('Failed to save treatment: ' + result.error)
        }
      } else {
        console.error('Treatment creation failed')
        alert('Failed to save treatment')
      }
    } catch (error) {
      console.error('Error creating treatment:', error)
      alert('Error saving treatment')
    }
  }

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data pembukuan...</p>
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
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Pembukuan Harian</h1>
            <p className="text-gray-600">Catat transaksi harian dengan detail therapist dan earnings</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="salon-input w-auto"
            />
            <button
              onClick={() => setShowAddForm(true)}
              className="salon-button-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Entry Baru
            </button>
          </div>
        </div>

        {/* Selected Date Display */}
        <div className="salon-card p-6">
          <h2 className="text-xl font-semibold text-pink-800 mb-2">
            {formatDate(selectedDate)}
          </h2>
          <p className="text-gray-600">
            {filteredTreatments.length} treatment tercatat
          </p>
        </div>

        {/* Daily Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="salon-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Revenue</h3>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(dailyStats.totalRevenue)}</p>
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
              <div className="bg-blue-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Treatments</h3>
                <p className="text-2xl font-bold text-blue-600">{dailyStats.totalTreatments}</p>
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
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Total Tips</h3>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(dailyStats.totalTips)}</p>
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
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Customer Baru</h3>
                <p className="text-2xl font-bold text-purple-600">{dailyStats.newCustomers}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Therapist Earnings Summary */}
        {Object.keys(dailyStats.therapistEarnings).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="salon-card overflow-hidden"
          >
            <div className="p-6 border-b border-pink-100">
              <h2 className="text-xl font-semibold text-pink-800">Earnings Therapist Hari Ini</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(dailyStats.therapistEarnings).map(([therapistId, earnings]) => {
                  const therapist = therapists.find(t => t.id === therapistId)
                  if (!therapist) return null
                  
                  const totalEarnings = earnings.fees + earnings.commissions + earnings.tips
                  
                  return (
                    <div key={therapistId} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {therapist.initial}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{therapist.fullName}</h4>
                          <p className="text-sm text-gray-600">Total: {formatCurrency(totalEarnings)}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Fees:</span>
                          <span className="font-semibold">{formatCurrency(earnings.fees)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Komisi:</span>
                          <span className="font-semibold">{formatCurrency(earnings.commissions)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tips:</span>
                          <span className="font-semibold">{formatCurrency(earnings.tips)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <h2 className="text-xl font-semibold text-pink-800">Transaksi Hari Ini</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Treatment</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Therapist</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Harga</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Tips</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Payment</th>
                  <th className="text-left py-4 px-6 font-semibold text-pink-800">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {filteredTreatments.map((treatment, index) => (
                  <tr key={treatment.id} className="border-t border-pink-100 hover:bg-pink-25">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-800">
                          {treatment.customerName}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">
                        {treatment.serviceName}
                      </div>
                      {treatment.notes && (
                        <div className="text-sm text-gray-500 mt-1">{treatment.notes}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {treatment.therapistInitial}
                        </span>
                        <span className="text-sm text-gray-700">{treatment.therapistName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(treatment.servicePrice)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-yellow-600">
                        {formatCurrency(treatment.tipAmount)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        treatment.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                        treatment.paymentMethod === 'transfer' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {treatment.paymentMethod.charAt(0).toUpperCase() + treatment.paymentMethod.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      <div>
                        {treatment.startTime && `${treatment.startTime}`}
                        {treatment.startTime && treatment.endTime && ' - '}
                        {treatment.endTime && `${treatment.endTime}`}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(treatment.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTreatments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada treatment</h3>
                <p className="text-gray-500">Tambah entry baru untuk mencatat treatment hari ini</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Add New Treatment Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="salon-card max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-pink-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-pink-800">Tambah Treatment Baru</h3>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 hover:bg-pink-50 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Informasi Customer</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="salon-label">Nama Customer *</label>
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        className="salon-input"
                        placeholder="Nama lengkap customer"
                      />
                    </div>
                    <div>
                      <label className="salon-label">Nomor Telepon</label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                        className="salon-input"
                        placeholder="+62812-xxxx-xxxx"
                      />
                    </div>
                  </div>
                </div>

                {/* Service & Therapist */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Service & Therapist</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="salon-label">Service *</label>
                      <select
                        value={formData.serviceId}
                        onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
                        className="salon-input"
                        required
                      >
                        <option value="">Pilih service</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name} - {formatCurrency(service.promoPrice || service.normalPrice)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="salon-label">Therapist *</label>
                      <select
                        value={formData.therapistId}
                        onChange={(e) => setFormData(prev => ({ ...prev, therapistId: e.target.value }))}
                        className="salon-input"
                        required
                      >
                        <option value="">Pilih therapist</option>
                        {therapists.map(therapist => (
                          <option key={therapist.id} value={therapist.id}>
                            {therapist.initial} - {therapist.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="salon-label">Harga Custom (Opsional)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.customPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, customPrice: e.target.value }))}
                      className="salon-input"
                      placeholder="Kosongkan untuk harga normal"
                    />
                  </div>
                  
                  {formData.serviceId && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-700">
                        Harga: {formatCurrency(calculateTotal())}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment & Time */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Detail Pembayaran & Waktu</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="salon-label">Tips Customer</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.tipAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipAmount: parseInt(e.target.value) || 0 }))}
                        className="salon-input"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="salon-label">Waktu Mulai</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        className="salon-input"
                      />
                    </div>
                    <div>
                      <label className="salon-label">Waktu Selesai</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        className="salon-input"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="salon-label">Metode Pembayaran</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                      className="salon-input"
                    >
                      <option value="cash">Cash</option>
                      <option value="transfer">Transfer</option>
                      <option value="qris">QRIS</option>
                    </select>
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
                    placeholder="Catatan treatment atau customer..."
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="salon-button-secondary flex-1"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.serviceId || !formData.therapistId || !formData.customerName}
                    className="salon-button-primary flex-1"
                  >
                    Simpan Treatment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}