// Ultra-Professional Interactive Booking System for Medan
'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatRupiah, calculateTotalDuration, calculateTotalPrice, getCategoryDisplayName, getCategoryIcon, Treatment } from '../../lib/utils/treatmentUtils'
import { getCurrentBusinessStatus, getAvailableSlots, isWithinPrayerTime, SALON_BUSINESS_HOURS } from '../../lib/utils/businessHours'
import IndonesianPaymentMethods from '../payment/IndonesianPaymentMethods'

// Treatment interface imported from utils

interface CustomerInfo {
  name: string
  phone: string
  date: string
  time: string
  notes: string
}

const BookingSystem = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState<Treatment[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    phone: '',
    date: '',
    time: '',
    notes: ''
  })
  const [totalPrice, setTotalPrice] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Fetch treatments from API on component mount
  useEffect(() => {
    fetchTreatments()
  }, [])

  // Fetch treatments from database API
  const fetchTreatments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services?active=true')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setTreatments(result.data)
          setCategories(result.categories || [])
        }
      }
    } catch (error) {
      console.error('Error fetching treatments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter treatments based on search and category
  const filteredTreatments = useMemo(() => {
    let filtered = treatments.filter(treatment => treatment.isActive)

    if (activeCategory !== 'all') {
      filtered = filtered.filter(treatment => treatment.category === activeCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(treatment =>
        treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        treatment.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => b.popularity - a.popularity)
  }, [treatments, activeCategory, searchTerm])

  // Category tabs data - generate from live data
  const categoryTabs = useMemo(() => {
    const tabs = [
      { key: 'all', title: 'Semua', icon: '✨', count: treatments.filter(t => t.isActive).length }
    ]
    
    categories.forEach(category => {
      const count = treatments.filter(t => t.category === category && t.isActive).length
      if (count > 0) {
        tabs.push({
          key: category,
          title: getCategoryDisplayName(category),
          icon: getCategoryIcon(category),
          count
        })
      }
    })
    
    return tabs
  }, [treatments, categories])

  // Calculate totals whenever services change
  useEffect(() => {
    setTotalPrice(calculateTotalPrice(selectedServices))
    setTotalDuration(calculateTotalDuration(selectedServices))
  }, [selectedServices])

  const handleServiceToggle = (service: Treatment) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const generateWhatsAppMessage = () => {
    const services = selectedServices.map(s => 
      `• ${s.name} - ${formatRupiah(s.promoPrice || s.normalPrice)}`
    ).join('\n');

    const message = `Assalamu'alaikum Kak Dina! 🌸

Saya ${customerInfo.name} mau booking treatment:

📅 Tanggal: ${new Date(customerInfo.date).toLocaleDateString('id-ID', { 
  weekday: 'long', 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
⏰ Waktu: ${customerInfo.time} WIB
📍 Lokasi: Salon Muslimah Dina - Medan

💄 Treatment yang dipilih:
${services}

⏱️ Estimasi Durasi: ${Math.ceil(totalDuration / 60)} jam ${totalDuration % 60} menit
💰 Total Estimasi: ${formatRupiah(totalPrice)}

📝 Catatan: ${customerInfo.notes || 'Tidak ada catatan khusus'}
📱 WhatsApp: ${customerInfo.phone}

Mohon konfirmasinya ya kak. Jazakillahu khairan! 🤲

Wassalamu'alaikum`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppBooking = async () => {
    try {
      // FIRST: Save booking to database before WhatsApp redirect
      const bookingData = {
        customerName: customerInfo.name,
        phone: customerInfo.phone.replace(/^0/, '+62'), // Convert to international format
        service: selectedServices.map(s => s.name).join(', '),
        servicePrice: totalPrice,
        date: customerInfo.date,
        time: customerInfo.time.replace(' 🕌', ''), // Clean up prayer time indicator
        status: 'pending',
        notes: `${customerInfo.notes || 'Tidak ada catatan khusus'}\n\nLayanan detail:\n${selectedServices.map(s => `• ${s.name} - ${formatRupiah(s.promoPrice || s.normalPrice)} (${s.duration}m)`).join('\n')}\n\nTotal Estimasi: ${formatRupiah(totalPrice)}\nEstimasi Durasi: ${Math.ceil(totalDuration / 60)} jam ${totalDuration % 60} menit`
      };

      // Save to database
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Booking saved to database:', result);
      } else {
        console.warn('⚠️ Failed to save booking to database, but continuing to WhatsApp');
      }
    } catch (error) {
      console.error('❌ Error saving booking:', error);
      // Continue to WhatsApp even if database save fails
    }

    // THEN: Open WhatsApp for confirmation
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/6281234567890?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setShowConfirmation(true);
  };

  // Generate available time slots using business hours utility
  const availableTimeSlots = useMemo(() => {
    // Generate 30-minute slots from 09:00 to 18:00
    const slots = []
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        
        // Mark prayer time flexibility
        if ((hour === 12 && minute >= 25 && minute <= 55) || 
            (hour === 15 && minute >= 46) || (hour === 16 && minute <= 16)) {
          slots.push(`${timeString} 🕌`) // Prayer flexible time
        } else {
          slots.push(timeString)
        }
      }
    }
    return slots
  }, []);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper functions are now imported from utils

  // Show loading state
  if (loading) {
    return (
      <section className="py-20 px-4 ornamental-background salon-gradient-bg relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-salon-primary mx-auto mb-4"></div>
            <p className="text-salon-charcoal text-lg">Memuat layanan treatment...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 ornamental-background salon-gradient-bg relative overflow-hidden">
      {/* Ornamental Background */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23E91E63' stroke-width='1'%3E%3Cpath d='M100,50 Q120,70 140,50 Q160,30 180,50 Q160,70 140,90 Q120,70 100,90 Q80,70 60,90 Q40,70 20,50 Q40,30 60,50 Q80,70 100,50Z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '400px 400px'
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header with Logo Elements */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <h2 className="salon-header-xl mb-4 ornamental-border">
              Booking Treatment
            </h2>
            
            {/* Ornamental Underline */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-16 h-px bg-gradient-to-r from-salon-primary to-salon-accent"></div>
              <div className="w-3 h-3 bg-salon-gold rounded-full"></div>
              <div className="w-16 h-px bg-gradient-to-l from-salon-primary to-salon-accent"></div>
            </div>
          </div>
          
          <p className="text-lg leading-relaxed" style={{ color: 'var(--salon-charcoal)' }}>
            Pilih treatment yang Anda inginkan dan buat janji dengan mudah
          </p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                  currentStep >= step 
                    ? 'bg-gradient-to-r from-salon-primary to-salon-secondary text-white' 
                    : 'bg-white border-2 border-salon-accent text-salon-accent'
                }`}
                whileHover={{ scale: 1.1 }}
                style={{
                  borderRadius: currentStep >= step ? '50%' : '12px 3px 12px 3px'
                }}
              >
                {step}
              </motion.div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 transition-all duration-500 ${
                  currentStep > step ? 'bg-gradient-to-r from-salon-primary to-salon-secondary' : 'bg-salon-accent/30'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Ultra-Professional Service Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-salon-primary to-salon-secondary bg-clip-text text-transparent mb-3">
                  Pilih Treatment Favorit
                </h3>
                <p className="text-slate-600 text-lg">Temukan layanan terbaik untuk kecantikan Anda</p>
              </div>

              {/* Search Bar - Ultra Thin */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative max-w-md mx-auto mb-8"
              >
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  🔍
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari treatment..."
                  className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-salon-primary/30 focus:border-salon-primary transition-all duration-300 text-slate-700 placeholder-slate-400"
                />
              </motion.div>

              {/* Category Tabs - Ultra Thin */}
              <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 mb-6">
                {categoryTabs.map((tab, index) => (
                  <motion.button
                    key={tab.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveCategory(tab.key)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition-all duration-300 ${
                      activeCategory === tab.key
                        ? 'bg-gradient-to-r from-salon-primary to-salon-secondary text-white shadow-lg'
                        : 'bg-white/70 hover:bg-white text-slate-600 hover:shadow-md border border-slate-200/50'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-semibold">{tab.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeCategory === tab.key
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {tab.count}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Treatment Grid - Mobile Optimized */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-salon-primary/20 scrollbar-track-transparent">
                {filteredTreatments.map((treatment, index) => (
                  <motion.div
                    key={treatment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedTreatment(treatment)}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 hover:border-salon-primary/30 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
                  >
                    {/* Popular Badge */}
                    {treatment.popularity >= 8 && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          POPULER
                        </div>
                      </div>
                    )}

                    {/* Promo Badge */}
                    {treatment.promoPrice && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                          PROMO
                        </div>
                      </div>
                    )}

                    <div className="text-center">
                      <div className="text-3xl mb-3">{getCategoryIcon(treatment.category)}</div>
                      <h4 className="font-bold text-slate-800 mb-2 group-hover:text-salon-primary transition-colors">
                        {treatment.name}
                      </h4>
                      
                      <div className="mb-3">
                        {treatment.promoPrice ? (
                          <div className="space-y-1">
                            <div className="text-xl font-bold text-green-600">
                              {formatRupiah(treatment.promoPrice)}
                            </div>
                            <div className="text-sm text-slate-400 line-through">
                              {formatRupiah(treatment.normalPrice)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xl font-bold text-slate-700">
                            {formatRupiah(treatment.normalPrice)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-4">
                        <span>⏱️ {treatment.duration}m</span>
                        <span>⭐ {treatment.popularity}/10</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleServiceToggle(treatment)
                        }}
                        className={`w-full py-3 min-h-[44px] rounded-xl font-semibold transition-all duration-300 touch-manipulation ${
                          selectedServices.find(s => s.id === treatment.id)
                            ? 'bg-gradient-to-r from-salon-primary to-salon-secondary text-white'
                            : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700'
                        }`}
                      >
                        {selectedServices.find(s => s.id === treatment.id) ? '✓ Dipilih' : '+ Pilih'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredTreatments.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-bold text-slate-600 mb-2">Treatment tidak ditemukan</h3>
                  <p className="text-slate-500">Coba ubah kata kunci pencarian atau kategori</p>
                </div>
              )}

            </motion.div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h3 className="salon-header text-2xl mb-2">
                  Pilih Jadwal Treatment
                </h3>
                <p style={{ color: 'var(--salon-charcoal)', opacity: 0.7 }}>
                  Pilih tanggal dan waktu yang sesuai untuk Anda
                </p>
              </div>

              <div className="salon-card p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Date Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-salon-secondary mb-4">
                      📅 Pilih Tanggal
                    </label>
                    <input
                      type="date"
                      value={customerInfo.date}
                      min={getTodayDate()}
                      onChange={(e) => setCustomerInfo({...customerInfo, date: e.target.value})}
                      className="salon-input"
                    />
                    
                    {/* Business Hours Info */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-salon-primary/10 to-salon-secondary/10 rounded-xl">
                      <div className="space-y-2 text-sm" style={{ color: 'var(--salon-charcoal)', opacity: 0.9 }}>
                        <div className="flex items-center gap-2 font-semibold text-salon-primary">
                          <span>🕐</span>
                          <span>BUKA SETIAP HARI: 09:00 - 18:30 WIB</span>
                        </div>
                        <div className="text-xs text-salon-secondary">
                          ⭐ Satu-satunya salon muslimah di Medan yang buka 7 hari seminggu!
                        </div>
                        <div className="flex items-center gap-2 text-xs text-salon-islamic">
                          <span>🕌</span>
                          <span>*Fleksibel menyesuaikan waktu sholat</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-salon-secondary mb-4">
                      ⏰ Pilih Waktu
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableTimeSlots.map((time) => (
                        <motion.button
                          key={time}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCustomerInfo({...customerInfo, time})}
                          className={`p-4 min-h-[48px] font-medium transition-all duration-300 text-center touch-manipulation ${
                            customerInfo.time === time
                              ? 'bg-gradient-to-r from-salon-primary to-salon-secondary text-white shadow-lg'
                              : 'bg-salon-soft-pink hover:bg-salon-warm-pink active:bg-salon-warm-pink'
                          }`}
                          style={{ 
                            borderRadius: '15px 5px 15px 5px',
                            color: customerInfo.time === time ? 'white' : 'var(--salon-charcoal)',
                            minHeight: '48px' // Ensure 48px minimum touch target
                          }}
                        >
                          {time}
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Prayer Time Info - Medan Specific */}
                    <div className="mt-4 p-4 bg-salon-islamic/10 rounded-xl">
                      <div className="text-sm" style={{ color: 'var(--salon-charcoal)', opacity: 0.8 }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span>🕌</span>
                          <span className="font-medium text-salon-islamic">Waktu Sholat Medan:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span>• Subuh: 05:00</span>
                          <span>• Dzuhur: 12:25</span>
                          <span>• Ashar: 15:46</span>
                          <span>• Maghrib: 18:32</span>
                        </div>
                        <div className="mt-2 text-xs text-salon-accent">
                          💡 Tip: Pilih waktu sebelum Maghrib untuk treatment yang lebih panjang
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Duration */}
                {selectedServices.length > 0 && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-salon-primary/10 to-salon-secondary/10 rounded-xl">
                    <h4 className="font-bold text-salon-secondary mb-3">Estimasi Waktu Treatment:</h4>
                    <div style={{ color: 'var(--salon-charcoal)' }}>
                      <span className="text-2xl font-bold">
                        {totalDuration} menit
                      </span>
                      <span className="text-lg ml-2">
                        (~{Math.ceil(totalDuration / 60)} jam)
                      </span>
                    </div>
                    <p className="text-sm mt-2" style={{ color: 'var(--salon-charcoal)', opacity: 0.7 }}>
                      Mohon datang 10 menit sebelum jadwal untuk persiapan
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(1)}
                  className="salon-button-secondary"
                >
                  ← Kembali
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(3)}
                  disabled={!customerInfo.date || !customerInfo.time}
                  className="salon-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lanjut ke Data Diri →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Customer Information */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h3 className="salon-header text-2xl mb-2">
                  Lengkapi Data Diri
                </h3>
                <p style={{ color: 'var(--salon-charcoal)', opacity: 0.7 }}>
                  Isi data diri untuk konfirmasi booking via WhatsApp
                </p>
              </div>

              <div className="salon-card p-8">
                <div className="space-y-6">
                  
                  {/* Name Input */}
                  <div>
                    <label className="block text-lg font-semibold text-salon-secondary mb-3">
                      👤 Nama Lengkap Ukhti
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Masukkan nama lengkap Anda..."
                      className="salon-input"
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-lg font-semibold text-salon-secondary mb-3">
                      📱 Nomor WhatsApp Aktif
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="08xxxxxxxxxx"
                      className="salon-input"
                    />
                    <p className="text-sm mt-2" style={{ color: 'var(--salon-charcoal)', opacity: 0.6 }}>
                      * Akan digunakan untuk konfirmasi booking via WhatsApp
                    </p>
                  </div>

                  {/* Notes Input */}
                  <div>
                    <label className="block text-lg font-semibold text-salon-secondary mb-3">
                      📝 Catatan Khusus (Opsional)
                    </label>
                    <textarea
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                      placeholder="Apakah ada permintaan khusus atau hal yang perlu diketahui therapist?"
                      rows={4}
                      className="salon-input resize-none"
                    />
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-gradient-to-r from-salon-soft-pink to-salon-warm-pink p-6 rounded-xl">
                    <h4 className="salon-header text-xl mb-4">Ringkasan Booking</h4>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between">
                        <span>📅 Tanggal:</span>
                        <span className="font-semibold">
                          {customerInfo.date ? new Date(customerInfo.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>⏰ Waktu:</span>
                        <span className="font-semibold">{customerInfo.time || '-'} WIB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📍 Lokasi:</span>
                        <span className="font-semibold">Medan</span>
                      </div>
                      <div className="flex justify-between">
                        <span>💄 Jumlah Treatment:</span>
                        <span className="font-semibold">{selectedServices.length} treatment</span>
                      </div>
                      <div className="flex justify-between">
                        <span>⏱️ Estimasi Durasi:</span>
                        <span className="font-semibold">{Math.ceil(totalDuration / 60)} jam {totalDuration % 60} menit</span>
                      </div>
                    </div>

                    <div className="border-t border-salon-accent/30 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Total Estimasi:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-salon-primary to-salon-secondary bg-clip-text text-transparent">
                          {formatRupiah(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions */}
                  <div className="bg-salon-soft-pink p-4 rounded-xl">
                    <div className="flex items-start gap-3 text-sm" style={{ color: 'var(--salon-charcoal)', opacity: 0.8 }}>
                      <span className="text-lg">ℹ️</span>
                      <div>
                        <p className="mb-2 font-semibold">Syarat dan Ketentuan:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Booking akan dikonfirmasi melalui WhatsApp dalam 1-2 jam</li>
                          <li>• Harap datang 10 menit sebelum jadwal treatment</li>
                          <li>• Pembatalan/reschedule maksimal 4 jam sebelum jadwal</li>
                          <li>• Semua produk yang digunakan 100% halal dan aman</li>
                          <li>• Salon menyediakan ruang sholat dan area wudhu</li>
                          <li>• Lokasi: Medan, Sumatera Utara</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(2)}
                  className="salon-button-secondary"
                >
                  ← Kembali
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWhatsAppBooking}
                  disabled={!customerInfo.name || !customerInfo.phone}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                >
                  💬 Booking via WhatsApp
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Selected Services Summary */}
        <AnimatePresence>
          {selectedServices.length > 0 && currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-6 left-6 right-6 z-40"
            >
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-200/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 mb-1">
                      {selectedServices.length} Treatment Dipilih
                    </div>
                    <div className="text-sm text-slate-600">
                      {Math.ceil(totalDuration / 60)}j {totalDuration % 60}m • {formatRupiah(totalPrice)}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(2)}
                    className="bg-gradient-to-r from-salon-primary to-salon-secondary text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
                  >
                    Lanjutkan →
                  </motion.button>
                </div>
                
                {/* Quick selected items list */}
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {selectedServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1 whitespace-nowrap"
                    >
                      <span className="text-sm font-medium">{service.name}</span>
                      <button
                        onClick={() => handleServiceToggle(service)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Treatment Detail Modal */}
        <AnimatePresence>
          {selectedTreatment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedTreatment(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
              >
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">{getCategoryIcon(selectedTreatment.category)}</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {selectedTreatment.name}
                  </h3>
                  
                  <div className="mb-4">
                    {selectedTreatment.promoPrice ? (
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-green-600">
                          {formatRupiah(selectedTreatment.promoPrice)}
                        </div>
                        <div className="text-lg text-slate-400 line-through">
                          {formatRupiah(selectedTreatment.normalPrice)}
                        </div>
                        <div className="inline-block bg-green-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                          HEMAT {formatRupiah(selectedTreatment.normalPrice - selectedTreatment.promoPrice)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-slate-700">
                        {formatRupiah(selectedTreatment.normalPrice)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-6 text-slate-600 mb-6">
                    <div className="text-center">
                      <div className="text-2xl">⏱️</div>
                      <div className="text-sm font-semibold">{selectedTreatment.duration} menit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">⭐</div>
                      <div className="text-sm font-semibold">{selectedTreatment.popularity}/10</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl">{getCategoryIcon(selectedTreatment.category)}</div>
                      <div className="text-sm font-semibold">Premium</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedTreatment(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => {
                      handleServiceToggle(selectedTreatment)
                      setSelectedTreatment(null)
                    }}
                    className={`flex-1 font-semibold py-3 rounded-xl transition-all ${
                      selectedServices.find(s => s.id === selectedTreatment.id)
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gradient-to-r from-salon-primary to-salon-secondary hover:shadow-lg text-white'
                    }`}
                  >
                    {selectedServices.find(s => s.id === selectedTreatment.id) ? 'Hapus dari Keranjang' : 'Tambah ke Keranjang'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking Confirmation Modal */}
        <AnimatePresence>
          {showConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowConfirmation(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="salon-card max-w-md w-full text-center shadow-2xl"
                style={{ padding: '2rem', borderRadius: '30px 10px 30px 10px' }}
              >
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    ✅
                  </div>
                  <h3 className="salon-header text-2xl mb-2">
                    Barakallahu fiki! 🤲
                  </h3>
                  <p style={{ color: 'var(--salon-charcoal)', opacity: 0.8 }} className="leading-relaxed">
                    Booking Anda telah dikirim ke WhatsApp. Kak Dina akan membalas dalam 1-2 jam untuk konfirmasi.
                  </p>
                </div>

                <div className="space-y-3 mb-6 text-sm" style={{ color: 'var(--salon-charcoal)', opacity: 0.7 }}>
                  <p>📱 Pastikan WhatsApp Anda aktif</p>
                  <p>⏰ Tunggu konfirmasi dari Kak Dina</p>
                  <p>🏠 Alamat salon akan dikirim setelah booking dikonfirmasi</p>
                  <p>📍 Lokasi: Medan, Sumatera Utara</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowConfirmation(false)}
                  className="salon-button-primary w-full"
                >
                  Tutup
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default BookingSystem