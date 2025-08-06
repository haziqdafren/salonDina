// Sophisticated WhatsApp Booking System - Logo-integrated design
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { treatmentCategories, formatRupiah, calculateTotalDuration, calculateTotalPrice } from '../../data/treatments'

interface Treatment {
  id: number
  name: string
  hargaNormal: number
  hargaPromo: number | null
  duration: number
  popularity: number
  category?: string
  categoryIcon?: string
}

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
      `• ${s.name} - ${formatRupiah(s.hargaPromo || s.hargaNormal)}`
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

  const handleWhatsAppBooking = () => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/6281234567890?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setShowConfirmation(true);
  };

  const availableTimeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

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
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <h3 className="salon-header text-2xl mb-2">
                  Pilih Treatment Favorit Anda
                </h3>
                <p style={{ color: 'var(--salon-charcoal)' }}>
                  Anda bisa memilih lebih dari satu treatment
                </p>
              </div>

              {Object.entries(treatmentCategories).map(([key, category]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="salon-card p-6 corner-ornament"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-3xl">{category.icon}</div>
                    <div>
                      <h4 className="salon-header text-xl mb-1">{category.title}</h4>
                      <p style={{ color: 'var(--salon-charcoal)', opacity: 0.7 }} className="text-sm">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.items.map((service) => (
                      <motion.div
                        key={service.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleServiceToggle(service)}
                        className={`p-4 cursor-pointer transition-all duration-300 ${
                          selectedServices.find(s => s.id === service.id)
                            ? 'bg-gradient-to-r from-salon-primary to-salon-secondary text-white shadow-lg'
                            : 'bg-salon-soft-pink hover:bg-salon-warm-pink'
                        }`}
                        style={{ 
                          borderRadius: '20px 5px 20px 5px',
                          minHeight: '120px',
                          color: selectedServices.find(s => s.id === service.id) ? 'white' : 'var(--salon-charcoal)'
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-semibold text-sm leading-tight flex-1">
                            {service.name}
                          </h5>
                          {service.hargaPromo && (
                            <span className="bg-salon-gold text-salon-charcoal text-xs px-2 py-1 rounded-full font-bold ml-2">
                              PROMO
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm mb-2">
                          {service.hargaPromo ? (
                            <div>
                              <span className="font-bold text-base">
                                {formatRupiah(service.hargaPromo)}
                              </span>
                              <span className={`ml-2 line-through text-xs ${
                                selectedServices.find(s => s.id === service.id) ? 'text-white/70' : 'opacity-60'
                              }`}>
                                {formatRupiah(service.hargaNormal)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-base">
                              {formatRupiah(service.hargaNormal)}
                            </span>
                          )}
                        </div>
                        
                        <div className={`text-xs ${
                          selectedServices.find(s => s.id === service.id) ? 'text-white/80' : 'opacity-60'
                        }`}>
                          ⏱️ ~{service.duration} menit • ⭐ {service.popularity}/10
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Selected Services Summary */}
              {selectedServices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="salon-card p-6"
                >
                  <h4 className="salon-header text-xl mb-4">
                    Treatment yang Dipilih ({selectedServices.length})
                  </h4>
                  
                  <div className="space-y-3 mb-6">
                    {selectedServices.map((service) => (
                      <div key={service.id} className="flex justify-between items-center p-3 bg-salon-soft-pink rounded-xl">
                        <span className="font-medium">{service.name}</span>
                        <span className="font-bold text-salon-primary">
                          {formatRupiah(service.hargaPromo || service.hargaNormal)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-salon-accent/30 pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Estimasi Durasi:</span>
                      <span className="font-bold text-salon-secondary">
                        {Math.ceil(totalDuration / 60)} jam {totalDuration % 60} menit
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total Estimasi:</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-salon-primary to-salon-secondary bg-clip-text text-transparent">
                        {formatRupiah(totalPrice)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentStep(2)}
                  disabled={selectedServices.length === 0}
                  className="salon-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lanjut ke Jadwal ({selectedServices.length} treatment)
                </motion.button>
              </div>
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
                      min={getTomorrowDate()}
                      onChange={(e) => setCustomerInfo({...customerInfo, date: e.target.value})}
                      className="salon-input"
                    />
                    
                    {/* Special Notes */}
                    <div className="mt-4 p-4 bg-salon-soft-pink rounded-xl">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--salon-charcoal)', opacity: 0.8 }}>
                        <span>🕌</span>
                        <span className="font-medium">Catatan: Salon tutup setiap hari Jumat 12:00-13:30 untuk sholat Jumat</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-salon-secondary mb-4">
                      ⏰ Pilih Waktu
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {availableTimeSlots.map((time) => (
                        <motion.button
                          key={time}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCustomerInfo({...customerInfo, time})}
                          className={`p-3 font-medium transition-all duration-300 ${
                            customerInfo.time === time
                              ? 'bg-gradient-to-r from-salon-primary to-salon-secondary text-white shadow-lg'
                              : 'bg-salon-soft-pink hover:bg-salon-warm-pink'
                          }`}
                          style={{ 
                            borderRadius: '15px 5px 15px 5px',
                            color: customerInfo.time === time ? 'white' : 'var(--salon-charcoal)'
                          }}
                        >
                          {time}
                        </motion.button>
                      ))}
                    </div>
                    
                    {/* Prayer Time Info */}
                    <div className="mt-4 p-4 bg-salon-soft-pink rounded-xl">
                      <div className="text-sm" style={{ color: 'var(--salon-charcoal)', opacity: 0.8 }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span>🤲</span>
                          <span className="font-medium">Waktu Sholat Medan Hari Ini:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <span>• Dzuhur: 12:20</span>
                          <span>• Ashar: 15:35</span>
                          <span>• Maghrib: 18:15</span>
                          <span>• Isya: 19:30</span>
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