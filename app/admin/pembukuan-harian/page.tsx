'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'

// Enhanced interfaces
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
  isActive: boolean
}

interface Booking {
  id: string
  customerName: string
  phone: string
  service: string
  servicePrice: number
  date: string
  time: string
  status: string
  notes?: string
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

interface QuickAddTreatment {
  serviceId: string
  therapistId: string
  customerName: string
  tipAmount: number
  paymentMethod: 'cash' | 'transfer' | 'qris'
  notes?: string
}

export default function PembukuanHarian() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [treatments, setTreatments] = useState<DailyTreatment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  
  // UI States
  const [showAddForm, setShowAddForm] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [showImportBookings, setShowImportBookings] = useState(false)
  const [addMode, setAddMode] = useState<'single' | 'quick' | 'bulk'>('single')

  // Quick Add State
  const [quickAddItems, setQuickAddItems] = useState<QuickAddTreatment[]>([])
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])

  // Fetch data from APIs
  useEffect(() => {
    fetchData()
  }, [selectedDate])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [treatmentsRes, servicesRes, therapistsRes, bookingsRes] = await Promise.all([
        fetch(`/api/treatments?date=${selectedDate}`),
        fetch('/api/services?active=true'),
        fetch('/api/therapists?active=true'),
        fetch(`/api/bookings?date=${selectedDate}&status=completed`)
      ])

      // Handle treatments
      if (treatmentsRes.ok) {
        const treatmentsResult = await treatmentsRes.json()
        if (treatmentsResult.success) {
          setTreatments(treatmentsResult.data)
        }
      }

      // Handle services
      if (servicesRes.ok) {
        const servicesResult = await servicesRes.json()
        if (servicesResult.success) {
          setServices(servicesResult.data)
        }
      }

      // Handle therapists
      if (therapistsRes.ok) {
        const therapistsResult = await therapistsRes.json()
        if (therapistsResult.success) {
          setTherapists(therapistsResult.data.filter((t: Therapist) => t.isActive))
        }
      }

      // Handle bookings
      if (bookingsRes.ok) {
        const bookingsResult = await bookingsRes.json()
        if (bookingsResult.success) {
          setBookings(bookingsResult.data)
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-import from completed bookings
  const handleImportFromBookings = async () => {
    try {
      const importPromises = selectedBookings.map(async (bookingId) => {
        const booking = bookings.find(b => b.id === bookingId)
        if (!booking) return null

        // Find matching service
        const service = services.find(s => 
          booking.service.toLowerCase().includes(s.name.toLowerCase()) ||
          s.name.toLowerCase().includes(booking.service.toLowerCase())
        )

        if (!service) {
          console.warn(`No matching service found for: ${booking.service}`)
          return null
        }

        const treatmentData = {
          date: selectedDate,
          customerName: booking.customerName,
          phone: booking.phone,
          serviceId: service.id,
          therapistId: therapists[0]?.id || '', // Default to first therapist
          servicePrice: booking.servicePrice,
          tipAmount: 0,
          paymentMethod: 'cash' as const,
          startTime: booking.time,
          notes: `Imported from booking: ${booking.notes || ''}`
        }

        const response = await fetch('/api/treatments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(treatmentData)
        })

        if (response.ok) {
          const result = await response.json()
          return result.data
        }
        return null
      })

      const results = await Promise.all(importPromises)
      const successful = results.filter(r => r !== null)

      if (successful.length > 0) {
        await fetchData() // Refresh data
        setSelectedBookings([])
        setShowImportBookings(false)
        alert(`Successfully imported ${successful.length} treatments from bookings`)
      }
    } catch (error) {
      console.error('Error importing bookings:', error)
      alert('Error importing bookings')
    }
  }

  // Quick add multiple treatments
  const handleQuickAddSubmit = async () => {
    // Validate all items first
    const invalidItems = quickAddItems.filter(item => 
      !item.customerName.trim() || 
      !item.serviceId || 
      !item.therapistId
    )

    if (invalidItems.length > 0) {
      alert(`Please fill in all required fields for all treatments. ${invalidItems.length} items need completion.`)
      return
    }

    try {
      const submitPromises = quickAddItems.map(async (item, index) => {
        const service = services.find(s => s.id === item.serviceId)
        const therapist = therapists.find(t => t.id === item.therapistId)
        
        if (!service || !therapist) {
          console.warn(`Invalid service or therapist for item ${index}`)
          return null
        }

        const treatmentData = {
          date: selectedDate,
          customerName: item.customerName.trim(),
          serviceId: item.serviceId,
          therapistId: item.therapistId,
          servicePrice: service.promoPrice || service.normalPrice,
          tipAmount: item.tipAmount || 0,
          paymentMethod: item.paymentMethod || 'cash',
          notes: item.notes?.trim() || null
        }

        console.log('Sending treatment data:', treatmentData)

        const response = await fetch('/api/treatments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(treatmentData)
        })

        if (response.ok) {
          const result = await response.json()
          return result.data
        } else {
          const errorData = await response.json()
          console.error(`Error for item ${index}:`, errorData)
          return null
        }
      })

      const results = await Promise.all(submitPromises)
      const successful = results.filter(r => r !== null)

      if (successful.length > 0) {
        await fetchData() // Refresh data
        setQuickAddItems([])
        setShowQuickAdd(false)
        alert(`Successfully added ${successful.length} treatments`)
      } else {
        alert('Failed to add any treatments. Check the console for details.')
      }
    } catch (error) {
      console.error('Error adding treatments:', error)
      alert('Error adding treatments')
    }
  }

  // Add item to quick add list
  const addQuickAddItem = () => {
    setQuickAddItems(prev => [...prev, {
      serviceId: '',
      therapistId: '',
      customerName: '',
      tipAmount: 0,
      paymentMethod: 'cash',
      notes: ''
    }])
  }

  // Remove item from quick add list
  const removeQuickAddItem = (index: number) => {
    setQuickAddItems(prev => prev.filter((_, i) => i !== index))
  }

  // Update quick add item
  const updateQuickAddItem = (index: number, field: keyof QuickAddTreatment, value: any) => {
    setQuickAddItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
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

  // Calculate daily stats
  const dailyStats = {
    totalRevenue: filteredTreatments.reduce((sum, treatment) => sum + treatment.servicePrice, 0),
    totalTips: filteredTreatments.reduce((sum, treatment) => sum + treatment.tipAmount, 0),
    totalTreatments: filteredTreatments.length,
    availableBookings: bookings.length
  }

  // Show loading state
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data pembukuan...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Pembukuan Harian Cerdas</h1>
            <p className="text-gray-600">Sistem pencatatan otomatis dengan import dari booking</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="salon-input w-auto"
            />
            
            {/* Import from Bookings */}
            {bookings.length > 0 && (
              <button
                onClick={() => setShowImportBookings(true)}
                className="salon-btn-secondary flex items-center gap-2 text-sm"
              >
                📥 Import ({bookings.length})
              </button>
            )}
            
            {/* Quick Add */}
            <button
              onClick={() => setShowQuickAdd(true)}
              className="salon-btn-secondary flex items-center gap-2 text-sm"
            >
              ⚡ Quick Add
            </button>
            
            {/* Manual Add */}
            <button
              onClick={() => setShowAddForm(true)}
              className="salon-btn-primary flex items-center gap-2 text-sm"
            >
              ➕ Manual Add
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="salon-card p-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(dailyStats.totalRevenue)}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="salon-card p-4">
            <div className="text-2xl font-bold text-blue-600">{dailyStats.totalTreatments}</div>
            <div className="text-sm text-gray-600">Treatments</div>
          </div>
          <div className="salon-card p-4">
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(dailyStats.totalTips)}</div>
            <div className="text-sm text-gray-600">Tips</div>
          </div>
          <div className="salon-card p-4">
            <div className="text-2xl font-bold text-purple-600">{dailyStats.availableBookings}</div>
            <div className="text-sm text-gray-600">Available Bookings</div>
          </div>
        </div>

        {/* Treatments List */}
        <div className="salon-card">
          <div className="p-4 border-b border-pink-100">
            <h2 className="text-xl font-semibold text-pink-800">
              Treatments - {formatDate(selectedDate)}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Treatment</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Therapist</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Tips</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredTreatments.map((treatment) => (
                  <tr key={treatment.id} className="border-t border-pink-100 hover:bg-pink-25">
                    <td className="py-3 px-4 font-medium">{treatment.customerName}</td>
                    <td className="py-3 px-4">{treatment.serviceName}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                          {treatment.therapistInitial}
                        </span>
                        {treatment.therapistName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">{formatCurrency(treatment.servicePrice)}</td>
                    <td className="py-3 px-4 font-semibold text-yellow-600">{formatCurrency(treatment.tipAmount)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        treatment.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
                        treatment.paymentMethod === 'transfer' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {treatment.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredTreatments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada treatment</h3>
                <p className="text-gray-500">
                  {bookings.length > 0 
                    ? `Import ${bookings.length} booking yang tersedia atau tambah manual`
                    : 'Tambah treatment untuk mencatat pendapatan hari ini'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Import Bookings Modal */}
        <AnimatePresence>
          {showImportBookings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowImportBookings(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              >
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold text-pink-800">Import dari Bookings</h3>
                  <p className="text-gray-600 text-sm mt-1">Pilih booking yang sudah selesai untuk diimport</p>
                </div>
                
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <label key={booking.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBookings.includes(booking.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBookings(prev => [...prev, booking.id])
                            } else {
                              setSelectedBookings(prev => prev.filter(id => id !== booking.id))
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{booking.customerName}</div>
                          <div className="text-sm text-gray-600">{booking.service}</div>
                          <div className="text-sm text-green-600 font-semibold">{formatCurrency(booking.servicePrice)}</div>
                        </div>
                        <div className="text-sm text-gray-500">{booking.time}</div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 border-t flex gap-3">
                  <button
                    onClick={() => setShowImportBookings(false)}
                    className="salon-btn-secondary flex-1"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleImportFromBookings}
                    disabled={selectedBookings.length === 0}
                    className="salon-btn-primary flex-1 disabled:opacity-50"
                  >
                    Import {selectedBookings.length} Booking
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Add Modal */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowQuickAdd(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              >
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-pink-800">Quick Add Treatments</h3>
                      <p className="text-gray-600 text-sm mt-1">Tambah multiple treatments sekaligus</p>
                    </div>
                    <button
                      onClick={addQuickAddItem}
                      className="salon-btn-secondary text-sm"
                    >
                      + Add Row
                    </button>
                  </div>
                </div>
                
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {quickAddItems.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border rounded-lg">
                        <input
                          type="text"
                          placeholder="Customer Name"
                          value={item.customerName}
                          onChange={(e) => updateQuickAddItem(index, 'customerName', e.target.value)}
                          className="salon-input text-sm"
                        />
                        <select
                          value={item.serviceId}
                          onChange={(e) => updateQuickAddItem(index, 'serviceId', e.target.value)}
                          className="salon-input text-sm"
                        >
                          <option value="">Service</option>
                          {services.map(service => (
                            <option key={service.id} value={service.id}>
                              {service.name} - {formatCurrency(service.promoPrice || service.normalPrice)}
                            </option>
                          ))}
                        </select>
                        <select
                          value={item.therapistId}
                          onChange={(e) => updateQuickAddItem(index, 'therapistId', e.target.value)}
                          className="salon-input text-sm"
                        >
                          <option value="">Therapist</option>
                          {therapists.map(therapist => (
                            <option key={therapist.id} value={therapist.id}>
                              {therapist.initial} - {therapist.fullName}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Tips"
                          value={item.tipAmount}
                          onChange={(e) => updateQuickAddItem(index, 'tipAmount', parseInt(e.target.value) || 0)}
                          className="salon-input text-sm"
                        />
                        <select
                          value={item.paymentMethod}
                          onChange={(e) => updateQuickAddItem(index, 'paymentMethod', e.target.value)}
                          className="salon-input text-sm"
                        >
                          <option value="cash">Cash</option>
                          <option value="transfer">Transfer</option>
                          <option value="qris">QRIS</option>
                        </select>
                        <button
                          onClick={() => removeQuickAddItem(index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                    
                    {quickAddItems.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Click "Add Row" to start adding treatments</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 border-t flex gap-3">
                  <button
                    onClick={() => setShowQuickAdd(false)}
                    className="salon-btn-secondary flex-1"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleQuickAddSubmit}
                    disabled={quickAddItems.length === 0}
                    className="salon-btn-primary flex-1 disabled:opacity-50"
                  >
                    Save All ({quickAddItems.length})
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual Add Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              >
                <div className="p-6 border-b">
                  <h3 className="text-xl font-semibold text-pink-800">Manual Add Treatment</h3>
                  <p className="text-gray-600 text-sm mt-1">Tambah satu treatment dengan detail lengkap</p>
                </div>
                
                <div className="p-6 max-h-96 overflow-y-auto">
                  <ManualAddForm 
                    services={services}
                    therapists={therapists}
                    selectedDate={selectedDate}
                    onSuccess={() => {
                      setShowAddForm(false)
                      fetchData()
                    }}
                    onCancel={() => setShowAddForm(false)}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  )
}

// Manual Add Form Component
function ManualAddForm({ services, therapists, selectedDate, onSuccess, onCancel }: {
  services: any[]
  therapists: any[]
  selectedDate: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    customerName: '',
    serviceId: '',
    therapistId: '',
    customPrice: '',
    tipAmount: 0,
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'qris',
    startTime: '',
    endTime: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const calculatePrice = () => {
    if (formData.customPrice) return parseInt(formData.customPrice)
    const service = services.find(s => s.id === formData.serviceId)
    return service ? (service.promoPrice || service.normalPrice) : 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerName || !formData.serviceId || !formData.therapistId) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const treatmentData = {
        date: selectedDate,
        customerName: formData.customerName,
        serviceId: formData.serviceId,
        therapistId: formData.therapistId,
        servicePrice: calculatePrice(),
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
          onSuccess()
          alert('Treatment berhasil ditambahkan!')
        } else {
          alert('Error: ' + result.error)
        }
      } else {
        const errorResult = await response.json()
        alert('Error: ' + (errorResult.error || 'Failed to save treatment'))
      }
    } catch (error) {
      console.error('Error saving treatment:', error)
      alert('Error saving treatment')
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <label className="salon-label">Harga Custom (Optional)</label>
        <input
          type="number"
          min="0"
          value={formData.customPrice}
          onChange={(e) => setFormData(prev => ({ ...prev, customPrice: e.target.value }))}
          className="salon-input"
          placeholder="Kosongkan untuk harga normal"
        />
        {formData.serviceId && (
          <div className="mt-2 text-sm text-green-600 font-medium">
            Harga: {formatCurrency(calculatePrice())}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="salon-label">Tips</label>
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

      <div>
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

      <div>
        <label className="salon-label">Catatan</label>
        <textarea
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="salon-input"
          placeholder="Catatan treatment..."
        />
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="salon-btn-secondary flex-1"
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          className="salon-btn-primary flex-1"
          disabled={loading || !formData.customerName || !formData.serviceId || !formData.therapistId}
        >
          {loading ? 'Menyimpan...' : 'Simpan Treatment'}
        </button>
      </div>
    </form>
  )
}