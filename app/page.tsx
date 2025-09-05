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
import dynamic from 'next/dynamic'
const FeedbackDisplay = dynamic(() => import('../components/customer/FeedbackDisplay'), { ssr: false })

export default function Homepage() {
  const [clickCount, setClickCount] = useState(0)
  const [databaseAvailable, setDatabaseAvailable] = useState<boolean | null>(null)
  const [homepageSettings, setHomepageSettings] = useState({
    hero: {
      salonName: 'Salon Muslimah Dina',
      greeting: 'Assalamu\'alaikum, Ukhti Cantik ✨',
      description: 'Selamat datang di ruang aman kami 🤲\nSalon eksklusif khusus wanita muslimah dengan suasana privat, nyaman, dan sesuai syariat Islam.',
      islamicQuote: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ'
    },
    contact: {
      address: 'Jl. Perhubungan, Tembung\nPercut Sei Tuan, Kabupaten Deli Serdang\nSumatera Utara 20371\n📍 Dekat SPBU Lau Dendang',
      phone: '+62 821-7067-7736',
      whatsapp: '+6282170677736',
      email: 'medan@salonmuslimah.com',
      instagram: '@dina_salon_muslimah',
      operatingHours: {
        open: '09:00',
        close: '18:30',
        description: '7 hari seminggu untuk kemudahan Anda'
      }
    },
    about: {
      whyChooseTitle: 'Mengapa Memilih Salon Muslimah Dina?',
      whyChooseSubtitle: 'Keunggulan yang membuat kami berbeda'
    },
    services: {
      title: 'Layanan Istimewa Kami',
      subtitle: 'Perawatan kecantihan dengan sentuhan Islami',
      description: 'Menggunakan produk halal pilihan dan therapist muslimah berpengalaman'
    }
  })
  const router = useRouter()
  const whatsappNumber = homepageSettings.contact.whatsapp

  // Check database availability
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        setDatabaseAvailable(data.database === 'connected')
      } catch (error) {
        console.log('Database check failed, but attempting to load data anyway:', error)
        // Don't immediately set to false - let the homepage settings load attempt determine connectivity
      }
    }
    checkDatabase()
  }, [])

  // Load homepage settings after component mounts (client-side only)
  useEffect(() => {
    const loadHomepageSettings = async () => {
      try {
        // Try to fetch homepage settings, but don't fail if it doesn't exist
        const response = await fetch('/api/homepage-settings')
        if (response.ok) {
          const result = await response.json()
          
          if (result.success && result.data) {
            setHomepageSettings(result.data)
            console.log('🏠 Homepage settings loaded:', result.data)
          }
        }
        // If homepage settings loaded successfully or endpoint doesn't exist, database is connected
        if (databaseAvailable === null) {
          setDatabaseAvailable(true)
        }
      } catch (error) {
        console.log('Homepage settings not available, using defaults:', error)
        // If this fails, still consider database connected since we have fallback data
        if (databaseAvailable === null) {
          setDatabaseAvailable(true)
        }
      }
    }
    // Small delay to ensure smooth loading experience
    setTimeout(loadHomepageSettings, 100)
  }, [databaseAvailable])
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
    const instagramHandle = homepageSettings.contact.instagram.replace('@', '')
    window.open(`https://instagram.com/${instagramHandle}`, '_blank')
  }

  // Show database connection screen only if explicitly determined to be disconnected
  if (databaseAvailable === false) {
    return <DatabaseNotConnected />
  }
  
  // Show loading while checking database connection
  if (databaseAvailable === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat halaman salon...</p>
        </div>
      </div>
    )
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
      
      {/* Lightweight Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Islamic Greeting */}
      <div className="pt-8 pb-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bismillah-elegant">
            {homepageSettings.hero.islamicQuote}
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
              
              <h1 className="salon-header-xl mb-6 text-center ornamental-border transition-all duration-300">
                {homepageSettings.hero.salonName}
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
            
            <p className="font-dancing text-3xl lg:text-4xl mb-8 text-center transition-opacity duration-300"
               style={{ 
                 background: 'linear-gradient(135deg, var(--salon-primary), var(--salon-accent))',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
                 backgroundClip: 'text'
               }}>
              {homepageSettings.hero.greeting}
            </p>
            
            <p className="font-inter text-lg lg:text-xl text-center max-w-2xl mx-auto mb-8 transition-opacity duration-300" 
               style={{ color: 'var(--salon-charcoal)' }}>
              {homepageSettings.hero.description.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index < homepageSettings.hero.description.split('\n').length - 1 && <br />}
                </span>
              ))}
            </p>

            {/* Salon Overview Video */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                poster="https://krcezovcddlxyuuvlrny.supabase.co/storage/v1/object/public/homepage-media/hero-poster.jpeg"
                className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto rounded-2xl shadow-2xl"
                style={{ maxHeight: '300px' }}
              >
                <source src="https://krcezovcddlxyuuvlrny.supabase.co/storage/v1/object/public/homepage-media/hero-1min.mp4" type="video/mp4" />
                Video browser Anda tidak mendukung pemutaran video.
              </video>
            </motion.div>

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
              <h2 className="salon-header-xl mb-4 ornamental-border transition-opacity duration-300">
                {homepageSettings.services.title}
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
              {homepageSettings.services.subtitle}
            </p>
            
            <p className="text-salon-charcoal/80 max-w-2xl mx-auto leading-relaxed">
              {homepageSettings.services.description}
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
                className="salon-card p-8 cursor-pointer corner-ornament relative overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  minHeight: '380px'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 }
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

      {/* Treatment Showcase Videos */}
      <motion.section
        id="treatment-showcase"
        className="mb-16 px-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="salon-header-xl mb-4 ornamental-border">
              Lihat Pengalaman Perawatan Kami
            </h2>
            <p className="font-dancing text-2xl text-salon-primary mb-4">
              Rasakan suasana nyaman dan perawatan profesional
            </p>
            <p className="text-salon-charcoal/80 max-w-2xl mx-auto">
              Video langsung dari salon kami - ruang perawatan yang privat dan fasilitas terkini
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Japanese Head Spa Treatment Video */}
            <motion.div
              className="salon-card p-4 sm:p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="text-center mb-4">
                <h3 className="salon-header text-lg sm:text-xl mb-2">Japanese Head SPA</h3>
                <p className="text-salon-charcoal/70 text-xs sm:text-sm mb-4 px-2">
                  Pengalaman relaksasi kepala dengan teknik Jepang yang menenangkan
                </p>
              </div>
              <video 
                controls 
                preload="metadata"
                poster="https://krcezovcddlxyuuvlrny.supabase.co/storage/v1/object/public/homepage-media/hero-poster.jpeg"
                className="w-full max-w-sm mx-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                style={{ maxHeight: '200px' }}
              >
                <source src="https://krcezovcddlxyuuvlrny.supabase.co/storage/v1/object/public/homepage-media/hero-34s.mp4" type="video/mp4" />
                Video tidak dapat diputar di browser Anda.
              </video>
              <div className="mt-3 text-center">
                <span className="inline-block bg-salon-primary/10 text-salon-primary px-2 py-1 rounded-full text-xs font-medium">
                  ⏱️ 34 detik
                </span>
              </div>
            </motion.div>

            {/* Room Treatment Video */}
            <motion.div
              className="salon-card p-4 sm:p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-center mb-4">
                <h3 className="salon-header text-lg sm:text-xl mb-2">Ruang Perawatan</h3>
                <p className="text-salon-charcoal/70 text-xs sm:text-sm mb-4 px-2">
                  Suasana privat dan nyaman untuk kenyamanan maksimal Anda
                </p>
              </div>
              <video 
                controls 
                preload="metadata"
                poster="https://krcezovcddlxyuuvlrny.supabase.co/storage/v1/object/public/homepage-media/hero-poster.jpeg"
                className="w-full max-w-sm mx-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                style={{ maxHeight: '200px' }}
              >
                <source src="https://krcezovcddlxyuuvlrny.supabase.co/storage/v1/object/public/homepage-media/hero-12s.mp4" type="video/mp4" />
                Video tidak dapat diputar di browser Anda.
              </video>
              <div className="mt-3 text-center">
                <span className="inline-block bg-salon-secondary/10 text-salon-secondary px-2 py-1 rounded-full text-xs font-medium">
                  ⏱️ 12 detik
                </span>
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              className="salon-button-primary"
              onClick={() => {
                const bookingSection = document.querySelector('#booking-section')
                bookingSection?.scrollIntoView({ behavior: 'smooth' })
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              🎯 Booking Sekarang untuk Pengalaman Serupa
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Customer Feedback Section */}
      <motion.section
        id="feedback"
        className="mb-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="max-w-6xl mx-auto">
          <FeedbackDisplay />
        </div>
      </motion.section>

      {/* Achievement & Certification Section */}
      <motion.section
        id="achievements"
        className="mb-16 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="salon-header-xl mb-4 ornamental-border">
              Prestasi & Sertifikasi
            </h2>
            <p className="font-dancing text-2xl text-salon-primary mb-4">
              Keunggulan yang diakui dan tersertifikasi
            </p>
            <p className="text-salon-charcoal/80 max-w-2xl mx-auto">
              Komitmen kami terhadap kualitas dan profesionalitas dalam setiap layanan
            </p>
          </div>

          <motion.div
            className="salon-card p-4 sm:p-6 lg:p-8 text-center corner-ornament"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="mb-6">
              <h3 className="salon-header text-lg sm:text-xl lg:text-2xl mb-3">
                🏆 Sertifikat Perawatan Wajah Dasar
              </h3>
              <p className="text-salon-charcoal/70 text-sm sm:text-base mb-6 max-w-2xl mx-auto">
                Pencapaian dalam mengikuti pelatihan basic skincare facial treatment yang membuktikan komitmen kami terhadap kualitas layanan perawatan wajah profesional.
              </p>
            </div>
            
            <div className="relative inline-block max-w-full">
              <img 
                src="https://krcezovcddlxyuuvlrny.supabase.co/storage/v1/object/public/homepage-media/hero-poster.jpeg"
                alt="Sertifikat Basic Skincare Facial Treatment - Salon Muslimah Dina"
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto rounded-xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 border-2 sm:border-4 border-salon-gold/20"
              />
              
              {/* Ornamental Frame */}
              <div className="absolute inset-2 sm:inset-4 border border-salon-accent/30 pointer-events-none rounded-lg" />
              
              {/* Achievement Badge */}
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-gradient-to-r from-salon-gold to-salon-accent text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg transform rotate-12">
                ✨ CERTIFIED
              </div>
            </div>

            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-salon-surface/50 p-3 sm:p-4 rounded-xl">
                <div className="text-xl sm:text-2xl mb-2">🎓</div>
                <h4 className="salon-header-sm mb-1 text-sm sm:text-base">Terlatih</h4>
                <p className="text-salon-text-muted text-xs sm:text-sm">Pelatihan profesional facial treatment</p>
              </div>
              <div className="bg-salon-surface/50 p-3 sm:p-4 rounded-xl">
                <div className="text-xl sm:text-2xl mb-2">💎</div>
                <h4 className="salon-header-sm mb-1 text-sm sm:text-base">Bersertifikat</h4>
                <p className="text-salon-text-muted text-xs sm:text-sm">Standar kualitas yang diakui</p>
              </div>
              <div className="bg-salon-surface/50 p-3 sm:p-4 rounded-xl">
                <div className="text-xl sm:text-2xl mb-2">🤲</div>
                <h4 className="salon-header-sm mb-1 text-sm sm:text-base">Islami</h4>
                <p className="text-salon-text-muted text-xs sm:text-sm">Sesuai syariat dan halal</p>
              </div>
            </div>

            <motion.div className="mt-4 sm:mt-6">
              <motion.button
                className="salon-button-secondary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                onClick={() => {
                  const servicesSection = document.querySelector('#services')
                  servicesSection?.scrollIntoView({ behavior: 'smooth' })
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                🌟 Lihat Layanan Perawatan Wajah
              </motion.button>
            </motion.div>
          </motion.div>
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
            <h2 className="salon-header-lg mb-4 transition-opacity duration-300">
              {homepageSettings.about.whyChooseTitle}
            </h2>
            <p className="font-dancing text-2xl text-salon-primary">
              {homepageSettings.about.whyChooseSubtitle}
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
                  {homepageSettings.contact.address.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < homepageSettings.contact.address.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">⏰</div>
                <h4 className="salon-header-sm mb-2">Jam Buka</h4>
                <p className="font-inter text-salon-text">
                  <strong className="text-salon-primary">Setiap Hari: {homepageSettings.contact.operatingHours.open} - {homepageSettings.contact.operatingHours.close} WIB</strong><br />
                  <em className="text-salon-secondary">{homepageSettings.contact.operatingHours.description}</em><br />
                  <small className="text-salon-islamic">*Fleksibel untuk waktu sholat</small>
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">📱</div>
                <h4 className="salon-header-sm mb-2">Kontak</h4>
                <p className="font-inter text-salon-text">
                  WhatsApp: {homepageSettings.contact.phone}<br />
                  Instagram: {homepageSettings.contact.instagram}<br />
                  Email: {homepageSettings.contact.email}
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