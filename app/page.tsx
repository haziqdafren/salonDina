'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BookingSystem from '../components/customer/BookingSystem'
// import PrayerTimeWidget from '../components/customer/PrayerTimeWidget' // Removed - unnecessary
import WhatsAppFloat from '../components/customer/WhatsAppFloat'
import CustomerNavbar from '../components/customer/CustomerNavbar'
import DatabaseNotConnected from '../components/DatabaseNotConnected'

export default function Homepage() {
  const [clickCount, setClickCount] = useState(0)
  const [databaseAvailable, setDatabaseAvailable] = useState(true)
  const router = useRouter()
  const whatsappNumber = "+6282170677736"

  // Check database availability
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        setDatabaseAvailable(data.database === 'connected')
      } catch (error) {
        console.log('Database check failed:', error)
        setDatabaseAvailable(false)
      }
    }
    checkDatabase()
  }, [])
  const whatsappMessage = "Assalamu'alaikum, saya ingin booking dan bertanya tentang layanan Salon Muslimah Dina di Medan. Apakah masih ada slot hari ini?"

  // Logo click handler for admin access
  const handleLogoClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    
    if (newCount >= 7) {
      router.push('/admin/masuk')
    }
  }

  // Reset click count after 5 seconds
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [clickCount])

  const handleWhatsAppClick = () => {
    const link = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`
    window.open(link, '_blank')
  }

  const handleInstagramClick = () => {
    window.open('https://instagram.com/dina_salon_muslimah', '_blank')
  }

  // Show database connection screen if database is not available
  if (!databaseAvailable) {
    return <DatabaseNotConnected />
  }

  return (
    <div className="min-h-screen ornamental-background salon-gradient-bg salon-pattern">
      {/* Professional Navigation */}
      <CustomerNavbar />
      
      {/* Admin Login Button - Always Visible */}
      <div className="fixed top-4 right-4 z-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <Link href="/admin/masuk">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-medium text-xs sm:text-sm md:text-base touch-manipulation min-h-[44px]"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0 -8 0v4h8z" />
              </svg>
              <span className="hidden sm:inline">Admin</span>
              <span className="sm:hidden">👤</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
      
      {/* Floating Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 right-20 w-64 h-64 opacity-10"
          style={{
            background: 'conic-gradient(from 0deg, var(--salon-primary), var(--salon-secondary), var(--salon-accent), var(--salon-primary))',
            borderRadius: '50% 20% 50% 20%',
            filter: 'blur(20px)'
          }}
        />
        
        <motion.div
          animate={{ 
            rotate: [360, 0],
            scale: [1.1, 1, 1.1]
          }}
          transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 left-20 w-48 h-48 opacity-15"
          style={{
            background: 'conic-gradient(from 180deg, var(--salon-secondary), var(--salon-accent), var(--salon-primary), var(--salon-secondary))',
            borderRadius: '20% 50% 20% 50%',
            filter: 'blur(15px)'
          }}
        />
      </div>

      {/* Islamic Greeting */}
      <div className="pt-8 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bismillah-elegant">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-salon-islamic to-transparent"></div>
            <div className="w-2 h-2 bg-salon-gold rounded-full"></div>
            <div className="w-12 h-px bg-gradient-to-l from-transparent via-salon-islamic to-transparent"></div>
          </div>
        </motion.div>
      </div>

      {/* Hero Section - Logo Inspired */}
      <motion.section
        id="home"
        className="text-center mb-16 px-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="salon-card max-w-4xl mx-auto p-8 lg:p-12 corner-ornament"
            initial={{ scale: 0.9, rotateY: -5 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Logo and Header */}
            <div className="relative mb-8">
              {/* Logo - Hidden Admin Access */}
              <div 
                className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 shadow-xl border-4 border-white cursor-pointer relative group"
                onClick={handleLogoClick}
                title={clickCount >= 3 ? `Klik ${7 - clickCount}x lagi untuk admin` : ""}
              >
                <img 
                  src="/logo.jpeg" 
                  alt="Salon Muslimah Dina" 
                  className="w-full h-full object-cover transition-all duration-300 group-active:scale-95"
                />
                
                {/* Ultra-subtle admin indicator */}
                {clickCount > 0 && (
                  <div className="absolute inset-0 border-2 border-salon-gold/30 rounded-full animate-pulse" />
                )}
                
                {/* Progress dots for mobile feedback */}
                {clickCount >= 1 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {Array.from({length: 7}, (_, i) => (
                      <div 
                        key={i}
                        className={`w-1 h-1 rounded-full transition-all duration-300 ${
                          i < clickCount 
                            ? 'bg-salon-gold' 
                            : 'bg-gray-300/50'
                        }`} 
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <h1 className="salon-header-xl mb-6 text-center ornamental-border">
                Salon Muslimah Dina
              </h1>
              
              {/* Animated Glow Effect */}
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-salon-primary to-salon-secondary rounded-full blur-2xl -z-10"
              />
            </div>
            
            <p className="font-dancing text-3xl lg:text-4xl mb-8 text-center"
               style={{ 
                 background: 'linear-gradient(135deg, var(--salon-primary), var(--salon-accent))',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
                 backgroundClip: 'text'
               }}>
              Assalamu&apos;alaikum, Ukhti Cantik ✨
            </p>
            
            <p className="font-inter text-lg lg:text-xl text-center max-w-2xl mx-auto mb-8" 
               style={{ color: 'var(--salon-charcoal)' }}>
              Selamat datang di ruang aman kami 🤲<br/>
              Salon eksklusif khusus wanita muslimah dengan suasana privat, 
              nyaman, dan sesuai syariat Islam.
            </p>

            {/* Ornamental CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <motion.button
                className="salon-button-primary relative overflow-hidden group"
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  💬 Hubungi via WhatsApp
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-salon-secondary to-salon-deep-purple"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
              
              <motion.button
                className="salon-button-secondary"
                onClick={handleInstagramClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                📸 Lihat Instagram
              </motion.button>
            </div>

            {/* Instagram Handle with Ornamental Styling */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center"
            >
              <div className="ornamental-divider">
                <span>@dina_salon_muslimah</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Services Section */}
      <motion.section
        id="services"
        className="mb-16 px-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative inline-block mb-8">
              <h2 className="salon-header-xl mb-4 ornamental-border">
                Layanan Istimewa Kami
              </h2>
              
              {/* Ornamental Underline */}
              <motion.div
                className="flex items-center justify-center gap-2 mt-6"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="h-px bg-gradient-to-r from-salon-primary to-salon-accent w-16"
                />
                <div className="w-3 h-3 bg-salon-gold rounded-full"></div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="h-px bg-gradient-to-l from-salon-primary to-salon-accent w-16"
                />
              </motion.div>
            </div>
            
            <p className="font-dancing text-2xl mb-4"
               style={{ 
                 background: 'linear-gradient(135deg, var(--salon-accent), var(--salon-secondary))',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
                 backgroundClip: 'text'
               }}>
              Perawatan kecantihan dengan sentuhan Islami
            </p>
            
            <p className="text-salon-charcoal/80 max-w-2xl mx-auto leading-relaxed">
              Menggunakan produk halal pilihan dan therapist muslimah berpengalaman
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Perawatan Wajah',
                description: 'Facial, microdermabrasi, dan treatment wajah dengan teknologi terkini',
                icon: '✨',
                price: 'Mulai Rp 40.000',
                benefits: ['Facial Detox', 'Whitening', 'PDT Technology', 'Lumiface'],
                isSpecial: false
              },
              {
                title: 'Perawatan Rambut',
                description: 'Hair spa, creambath, smoothing dengan produk premium',
                icon: '💇‍♀️',
                price: 'Mulai Rp 20.000',
                benefits: ['Hair SPA', 'Nano Technology', 'Japanese Head SPA', 'Smoothing'],
                isSpecial: false
              },
              {
                title: 'Perawatan Tubuh',
                description: 'Body massage, lulur, sauna dengan produk alami',
                icon: '🤲',
                price: 'Mulai Rp 35.000',
                benefits: ['Body massage', 'Lulur traditional', 'Sauna', 'Rempah ratus'],
                isSpecial: false
              },
              {
                title: 'Perawatan Tangan & Kaki',
                description: 'Manicure, pedicure, dan refleksi kaki profesional',
                icon: '💅',
                price: 'Mulai Rp 45.000',
                benefits: ['Manicure', 'Pedicure', 'Refleksi kaki', 'Callus treatment'],
                isSpecial: false
              },
              {
                title: 'Paket Pengantin',
                description: 'Paket lengkap premium untuk hari bahagia Anda',
                icon: '👰',
                price: 'Mulai Rp 400.000',
                benefits: ['Hair SPA', 'Facial + PDT', 'Full body treatment', 'Free products'],
                isSpecial: true
              },
              {
                title: 'Terapi Bekam',
                description: 'Terapi bekam sesuai sunnah dengan peralatan steril',
                icon: '🩸',
                price: 'Mulai Rp 70.000',
                benefits: ['Bekam traditional', 'Massage therapy', 'Hair treatment combo', 'Holistic healing'],
                isSpecial: true
              }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                className="salon-card p-8 cursor-pointer float-animation corner-ornament relative overflow-hidden group"
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  minHeight: '380px'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                {/* Special Offer Badge */}
                {service.isSpecial && (
                  <div className="absolute -top-4 -right-4 z-20">
                    <motion.div
                      animate={{ rotate: [0, 5, 0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-4 py-2 text-xs font-bold tracking-wider uppercase shadow-lg text-white"
                      style={{
                        background: 'linear-gradient(45deg, var(--salon-gold), #FFB300)',
                        borderRadius: '15px 5px 15px 5px'
                      }}
                    >
                      PREMIUM
                    </motion.div>
                  </div>
                )}

                {/* Ornamental Border */}
                <div className="absolute inset-4 border border-salon-accent/20 pointer-events-none" 
                     style={{ borderRadius: '20px 5px 20px 5px' }} />

                <div className="h-full flex flex-col">
                  <div className="flex-grow">
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-4">{service.icon}</div>
                      <h3 className="salon-header text-xl mb-3">
                        {service.title}
                      </h3>
                      <div className="text-xl font-bold"
                           style={{ 
                             background: 'linear-gradient(135deg, var(--salon-gold), var(--salon-accent))',
                             WebkitBackgroundClip: 'text',
                             WebkitTextFillColor: 'transparent',
                             backgroundClip: 'text'
                           }}>
                        {service.price}
                      </div>
                    </div>
                    
                    <p className="font-inter text-center mb-6" style={{ color: 'var(--salon-charcoal)' }}>
                      {service.description}
                    </p>

                    <div className="space-y-3">
                      {service.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <div className="w-2 h-2 bg-salon-primary rounded-full mr-3" />
                          <span className="font-inter" style={{ color: 'var(--salon-charcoal)' }}>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ultra-thin Always Visible CTA */}
                  <div className="mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const bookingSection = document.querySelector('#booking-section')
                        bookingSection?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="w-full bg-gradient-to-r from-salon-primary to-salon-secondary text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>Pilih Layanan</span>
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          →
                        </motion.span>
                      </span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* About Us - Why Choose Us */}
      <motion.section
        id="about"
        className="mb-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="salon-header-lg mb-4">
              Mengapa Memilih Salon Muslimah Dina?
            </h2>
            <p className="font-dancing text-2xl text-salon-primary">
              Keunggulan yang membuat kami berbeda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🗓️',
                title: 'Buka Setiap Hari',
                description: 'Konsisten 09:00-18:30 WIB, 7 hari seminggu - satu-satunya di Medan!',
                isSpecial: true
              },
              {
                icon: '🏠',
                title: 'Privasi Terjamin',
                description: 'Area khusus wanita dengan privasi penuh sesuai syariat Islam'
              },
              {
                icon: '🌿',
                title: 'Produk Halal',
                description: 'Semua produk yang digunakan bersertifikat halal MUI'
              },
              {
                icon: '👩‍⚕️',
                title: 'Therapist Muslimah',
                description: 'Semua terapis adalah wanita muslimah yang berpengalaman'
              },
              {
                icon: '🕌',
                title: 'Suasana Islami',
                description: 'Lingkungan yang tenang dengan nuansa Islami'
              },
              {
                icon: '🕐',
                title: 'Fleksibel Waktu Sholat',
                description: 'Jadwal appointment yang menghormati waktu ibadah Anda'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`text-center relative ${feature.isSpecial ? 'transform scale-105' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: feature.isSpecial ? 1.05 : 1 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                {feature.isSpecial && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-salon-gold to-salon-accent text-white text-xs px-2 py-1 rounded-full font-bold z-10">
                    UNGGULAN
                  </div>
                )}
                <div className={`rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-card ${
                  feature.isSpecial 
                    ? 'bg-gradient-to-br from-salon-primary to-salon-secondary text-white' 
                    : 'bg-salon-surface'
                }`}>
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                <h4 className={`salon-header-sm mb-2 ${
                  feature.isSpecial ? 'text-salon-primary font-bold' : ''
                }`}>
                  {feature.title}
                </h4>
                <p className="font-inter text-salon-text-muted text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Booking System */}
      <div id="booking-section">
        <BookingSystem />
      </div>

      {/* Contact Info */}
      <motion.section
        id="contact"
        className="mb-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="salon-card p-8 text-center">
            <h2 className="salon-header-lg mb-8">
              Hubungi Kami
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-4xl mb-3">📍</div>
                <h4 className="salon-header-sm mb-2">Lokasi</h4>
                <p className="font-inter text-salon-text">
                  Jl. Perhubungan, Tembung<br />
                  Percut Sei Tuan, Kabupaten Deli Serdang<br />
                  Sumatera Utara 20371<br />
                  <small className="text-salon-accent">📍 Dekat SPBU Lau Dendang</small>
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">⏰</div>
                <h4 className="salon-header-sm mb-2">Jam Buka</h4>
                <p className="font-inter text-salon-text">
                  <strong className="text-salon-primary">Setiap Hari: 09:00 - 18:30 WIB</strong><br />
                  <em className="text-salon-secondary">7 hari seminggu untuk kemudahan Anda</em><br />
                  <small className="text-salon-islamic">*Fleksibel untuk waktu sholat</small>
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">📱</div>
                <h4 className="salon-header-sm mb-2">Kontak</h4>
                <p className="font-inter text-salon-text">
                  WhatsApp: +62 821-7067-7736<br />
                  Instagram: @dina_salon_muslimah<br />
                  Email: medan@salonmuslimah.com
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="salon-button-primary"
                onClick={handleWhatsAppClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                💬 Chat WhatsApp
              </motion.button>
              <motion.button
                className="salon-button-secondary"
                onClick={handleInstagramClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📸 Follow Instagram
              </motion.button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer Quote */}
      <motion.section
        className="text-center px-4 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        <div className="salon-divider-fancy">
          <span>✨</span>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <p className="font-dancing text-2xl text-salon-islamic mb-4">
            &ldquo;Sesungguhnya Allah itu indah dan menyukai keindahan&rdquo;
          </p>
          <p className="font-inter text-salon-text-muted">
            - HR. Muslim
          </p>
          
          <div className="mt-8">
            <p className="font-inter text-sm text-salon-text-muted">
              © 2024 Salon Muslimah Dina - Kecantikan Islami untuk Wanita Muslimah
            </p>
          </div>
        </div>
      </motion.section>

      {/* Fixed Position Elements */}
      <WhatsAppFloat />
      
      {/* Ultra-Hidden Admin Access */}
      <HiddenAdminAccess />
    </div>
  )
}

// Ultra-Mobile-Friendly Hidden Admin Access Component
const HiddenAdminAccess = () => {
  const [keySequence, setKeySequence] = useState<string[]>([])
  const [touchCount, setTouchCount] = useState(0)
  const [showMobileHint, setShowMobileHint] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const router = useRouter()

  // Secret key sequence: "admin"
  const secretSequence = ['a', 'd', 'm', 'i', 'n']

  // Multi-touch gesture detection (3+ fingers)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length >= 3) {
        const newCount = touchCount + 1
        setTouchCount(newCount)
        setShowMobileHint(true)
        
        if (newCount >= 2) {
          router.push('/admin/masuk')
        }
      }
    }

    // Corner swipe detection
    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]
      const x = touch.clientX
      const y = touch.clientY
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      
      // Four corner swipe pattern: top-left, top-right, bottom-right, bottom-left
      if (x < 50 && y < 50) { // Top-left corner
        setTimeout(() => {
          if (touchCount === 0) {
            setTouchCount(1)
            setShowMobileHint(true)
          }
        }, 100)
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [touchCount, router])

  // Reset touch count after 5 seconds
  useEffect(() => {
    if (touchCount > 0) {
      const timer = setTimeout(() => {
        setTouchCount(0)
        setShowMobileHint(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [touchCount])

  // Keyboard shortcuts (for desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + A for quick admin access
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        router.push('/admin/masuk')
        return
      }

      // Secret sequence detection
      if (e.key.toLowerCase() >= 'a' && e.key.toLowerCase() <= 'z') {
        const newSequence = [...keySequence, e.key.toLowerCase()].slice(-5)
        setKeySequence(newSequence)
        
        if (newSequence.join('') === secretSequence.join('')) {
          router.push('/admin/masuk')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [keySequence, router])

  // Long press detection for footer area
  const handleTouchStart = (e: React.TouchEvent) => {
    const timer = setTimeout(() => {
      router.push('/admin/masuk')
    }, 2000) // 2 second long press
    setLongPressTimer(timer)
  }

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  return (
    <>
      {/* Mobile Gesture Hints */}
      <AnimatePresence>
        {showMobileHint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 text-white px-6 py-4 rounded-2xl text-sm z-50 max-w-xs text-center"
          >
            <div className="space-y-2">
              <div className="text-lg">🔐</div>
              <div className="font-semibold">Admin Access</div>
              <div className="text-xs opacity-80">
                {touchCount === 1 ? 
                  "3-finger tap lagi untuk masuk admin" : 
                  "Gesture terdeteksi!"
                }
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-Friendly Footer Long Press Area */}
      <div 
        className="fixed bottom-0 left-0 w-20 h-20 opacity-0 z-40"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        title="Long press untuk admin"
      >
        <div className="w-full h-full bg-gradient-to-tr from-salon-primary/10 to-transparent" />
      </div>

      {/* Easy Mobile Access - Copyright Text (Hidden in Plain Sight) */}
      <div 
        className="fixed bottom-4 right-4 text-xs text-slate-400 cursor-pointer select-none"
        onClick={(e) => {
          if (e.detail === 5) { // 5 quick clicks
            router.push('/admin/masuk')
          }
        }}
        onTouchStart={(e) => {
          // Double tap detection
          e.currentTarget.setAttribute('data-tap-time', Date.now().toString())
        }}
        onTouchEnd={(e) => {
          const lastTap = parseInt(e.currentTarget.getAttribute('data-tap-time') || '0')
          const now = Date.now()
          if (now - lastTap < 300) { // Double tap within 300ms
            router.push('/admin/masuk')
          }
        }}
      >
        v1.0
      </div>

      {/* Ultra-Subtle Desktop Corner Access */}
      <div 
        className="fixed top-0 left-0 w-8 h-8 opacity-0 hover:opacity-10 cursor-pointer z-40 bg-salon-primary/5"
        onClick={() => router.push('/admin/masuk')}
        title="Admin access"
      />
    </>
  )
}