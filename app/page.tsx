'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import BookingSystem from '../components/customer/BookingSystem'
import PrayerTimeWidget from '../components/customer/PrayerTimeWidget'
import WhatsAppFloat from '../components/customer/WhatsAppFloat'

export default function Homepage() {
  const whatsappNumber = "+6281234567890"
  const whatsappMessage = "Assalamu'alaikum, saya ingin bertanya tentang layanan Salon Muslimah Dina di Medan"

  const handleWhatsAppClick = () => {
    const link = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`
    window.open(link, '_blank')
  }

  const handleInstagramClick = () => {
    window.open('https://instagram.com/dina_salon_muslimah', '_blank')
  }

  return (
    <div className="min-h-screen ornamental-background salon-gradient-bg salon-pattern">
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
            {/* Ornamental Header */}
            <div className="relative mb-8">
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
                description: 'Facial, cleansing, dan treatment wajah dengan produk halal',
                icon: '✨',
                price: 'Mulai Rp 150.000',
                benefits: ['Deep cleansing', 'Brightening', 'Anti-aging', 'Relaxing'],
                isSpecial: false
              },
              {
                title: 'Perawatan Rambut',
                description: 'Hair spa, creambath, dan styling rambut profesional',
                icon: '💇‍♀️',
                price: 'Mulai Rp 75.000',
                benefits: ['Hair spa', 'Creambath', 'Styling', 'Hair mask'],
                isSpecial: false
              },
              {
                title: 'Perawatan Tubuh',
                description: 'Body massage dan spa treatment relaksasi',
                icon: '🤲',
                price: 'Mulai Rp 150.000',
                benefits: ['Body massage', 'Body scrub', 'Aromaterapi', 'Relaksasi'],
                isSpecial: false
              },
              {
                title: 'Perawatan Kuku',
                description: 'Perawatan kuku tangan dan kaki yang higienis',
                icon: '💅',
                price: 'Mulai Rp 80.000',
                benefits: ['Manicure', 'Pedicure', 'Polish halal', 'Foot spa'],
                isSpecial: false
              },
              {
                title: 'Paket Pengantin',
                description: 'Paket lengkap untuk hari bahagia Anda',
                icon: '👰',
                price: 'Mulai Rp 1.500.000',
                benefits: ['Makeup pengantin', 'Hair do', 'Spa treatment', 'Konsultasi'],
                isSpecial: true
              },
              {
                title: 'Paket Membership',
                description: 'Paket bulanan dengan berbagai keuntungan',
                icon: '🎁',
                price: 'Mulai Rp 650.000',
                benefits: ['4x treatment', 'Diskon khusus', 'Priority booking', 'VIP service'],
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
                      <div className="text-2xl font-bold"
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

                  {/* Hover CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="absolute inset-0 flex items-end p-8 text-white"
                    style={{
                      background: 'linear-gradient(135deg, var(--salon-secondary)/95, var(--salon-primary)/95)',
                      borderRadius: '30px 10px 30px 10px'
                    }}
                  >
                    <div className="w-full text-center">
                      <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 w-full"
                              style={{ borderRadius: '25px 8px 25px 8px' }}>
                        Pilih Layanan Ini ✨
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Why Choose Us */}
      <motion.section
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
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
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div className="bg-salon-surface rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-card">
                  <span className="text-4xl">{feature.icon}</span>
                </div>
                <h4 className="salon-header-sm mb-2">
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
      <BookingSystem />

      {/* Contact Info */}
      <motion.section
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
                  Jl. Mawar Indah No. 123<br />
                  Medan, Sumatera Utara<br />
                  Indonesia
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">⏰</div>
                <h4 className="salon-header-sm mb-2">Jam Buka</h4>
                <p className="font-inter text-salon-text">
                  Senin - Sabtu: 09.00 - 17.00<br />
                  Minggu: 10.00 - 15.00<br />
                  <em className="text-salon-islamic">Tutup Jumat 12.00-13.30</em>
                </p>
              </div>
              
              <div>
                <div className="text-4xl mb-3">📱</div>
                <h4 className="salon-header-sm mb-2">Kontak</h4>
                <p className="font-inter text-salon-text">
                  WhatsApp: +62 812-3456-7890<br />
                  Instagram: @dina_salon_muslimah<br />
                  Email: info@salonmuslimah.com
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
      <PrayerTimeWidget />
      <WhatsAppFloat />
    </div>
  )
}