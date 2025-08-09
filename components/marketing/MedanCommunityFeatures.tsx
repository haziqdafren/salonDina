'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Medan-specific marketing and community engagement features
export interface CommunityPromotion {
  id: string
  title: string
  description: string
  type: 'daily_advantage' | 'community' | 'islamic_events' | 'local_partnership'
  icon: string
  isActive: boolean
  validUntil?: string
  targetAudience: string[]
}

export interface MedanLandmark {
  name: string
  distance: string
  icon: string
}

const MEDAN_COMMUNITY_PROMOTIONS: CommunityPromotion[] = [
  // Daily availability marketing
  {
    id: 'daily-hours',
    title: 'BUKA SETIAP HARI!',
    description: 'Satu-satunya salon muslimah di Medan yang buka 09:00-18:30 setiap hari termasuk Minggu',
    type: 'daily_advantage',
    icon: '🗓️',
    isActive: true,
    targetAudience: ['working_women', 'students', 'busy_mothers']
  },
  {
    id: 'weekend-special',
    title: 'Weekend Tersedia',
    description: 'Libur kerja? Sabtu-Minggu tetap buka dengan layanan penuh untuk kenyamanan Anda',
    type: 'daily_advantage',
    icon: '🎯',
    isActive: true,
    targetAudience: ['working_women', 'students']
  },
  
  // Community engagement
  {
    id: 'ramadan-package',
    title: 'Paket Ramadan & Lebaran',
    description: 'Promo spesial menyambut bulan suci dengan treatment halal dan berkah',
    type: 'islamic_events',
    icon: '🌙',
    isActive: true,
    validUntil: '2024-05-01',
    targetAudience: ['all_muslimah']
  },
  {
    id: 'community-discount',
    title: 'Diskon Komunitas',
    description: 'Khusus rombongan 4+ orang, dapatkan potongan harga untuk acara arisan atau gathering',
    type: 'community',
    icon: '👥',
    isActive: true,
    targetAudience: ['community_groups', 'offices']
  },
  
  // Local partnerships
  {
    id: 'medan-collaboration',
    title: 'Kerjasama UMKM Medan',
    description: 'Mendukung produk kecantikan halal dari usaha lokal Sumatera Utara',
    type: 'local_partnership',
    icon: '🤝',
    isActive: true,
    targetAudience: ['community_conscious']
  }
]

const MEDAN_LANDMARKS: MedanLandmark[] = [
  { name: 'RS Columbia Asia', distance: '200m', icon: '🏥' },
  { name: 'Masjid Raya Al-Mashun', distance: '2.5km', icon: '🕌' },
  { name: 'Merdeka Walk', distance: '3km', icon: '🏛️' },
  { name: 'Sun Plaza', distance: '4km', icon: '🛍️' },
  { name: 'Bandara Kualanamu', distance: '35km', icon: '✈️' }
]

interface MedanCommunityFeaturesProps {
  showPromotions?: boolean
  showLandmarks?: boolean
  compact?: boolean
}

export default function MedanCommunityFeatures({
  showPromotions = true,
  showLandmarks = true,
  compact = false
}: MedanCommunityFeaturesProps) {
  const [activePromo, setActivePromo] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Check if salon is currently open
  const isCurrentlyOpen = () => {
    const jakartaTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
    const currentHour = jakartaTime.getHours()
    const currentMinute = jakartaTime.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute
    
    const openTime = 9 * 60 // 09:00
    const closeTime = 18 * 60 + 30 // 18:30
    
    return currentTimeMinutes >= openTime && currentTimeMinutes < closeTime
  }

  const getBusinessStatus = () => {
    return isCurrentlyOpen() 
      ? { status: 'BUKA SEKARANG', color: 'text-green-600', icon: '🟢' }
      : { status: 'TUTUP', color: 'text-orange-600', icon: '🟡' }
  }

  const businessStatus = getBusinessStatus()

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-salon-surface/30 to-salon-soft-pink/20">
      <div className="max-w-6xl mx-auto">
        
        {/* Real-time Business Status - Prominent */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl">{businessStatus.icon}</span>
              <div>
                <div className={`font-bold text-lg ${businessStatus.color}`}>
                  {businessStatus.status}
                </div>
                <div className="text-sm text-salon-charcoal/70">
                  {currentTime.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZone: 'Asia/Jakarta'
                  })} WIB
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-salon-primary/10 to-salon-secondary/10 rounded-lg p-3">
              <div className="font-bold text-salon-primary text-sm">
                ⭐ KEUNGGULAN KAMI
              </div>
              <div className="text-xs text-salon-charcoal/80 mt-1">
                Buka SETIAP HARI termasuk Minggu 09:00-18:30
              </div>
            </div>
          </div>
        </motion.div>

        {/* Community Promotions */}
        {showPromotions && (
          <div className="mb-12">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-center text-salon-primary mb-8"
            >
              🌟 Promo & Event Komunitas Medan
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MEDAN_COMMUNITY_PROMOTIONS.filter(promo => promo.isActive).map((promo, index) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="cursor-pointer"
                  onClick={() => setActivePromo(activePromo === promo.id ? null : promo.id)}
                >
                  <div className={`salon-card p-6 h-full transition-all duration-300 ${
                    promo.type === 'daily_advantage' 
                      ? 'bg-gradient-to-br from-salon-primary/5 to-salon-secondary/5 border-2 border-salon-primary/30'
                      : 'hover:shadow-lg'
                  } ${activePromo === promo.id ? 'ring-2 ring-salon-accent' : ''}`}>
                    
                    {/* Promo Type Badge */}
                    {promo.type === 'daily_advantage' && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-salon-gold to-salon-accent text-white text-xs px-2 py-1 rounded-full font-bold">
                        UNGGULAN
                      </div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-3xl mb-3">{promo.icon}</div>
                      <h3 className={`font-bold mb-3 ${
                        promo.type === 'daily_advantage' 
                          ? 'text-salon-primary text-lg' 
                          : 'text-salon-secondary'
                      }`}>
                        {promo.title}
                      </h3>
                      
                      <p className="text-sm text-salon-charcoal/80 leading-relaxed">
                        {promo.description}
                      </p>
                      
                      {promo.validUntil && (
                        <div className="mt-3 text-xs text-salon-accent bg-salon-accent/10 rounded-full px-3 py-1">
                          Berlaku sampai {new Date(promo.validUntil).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Medan Landmarks & Location Advantages */}
        {showLandmarks && (
          <div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold text-center text-salon-secondary mb-6"
            >
              📍 Lokasi Strategis di Medan
            </motion.h3>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="text-salon-primary font-bold text-lg mb-2">
                  Jl. Setia Budi No. 45B, Medan Selayang
                </div>
                <div className="text-salon-charcoal/70 text-sm">
                  Mudah dijangkau dari berbagai area di Medan
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {MEDAN_LANDMARKS.map((landmark, index) => (
                  <motion.div
                    key={landmark.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center p-3 bg-salon-soft-pink/30 rounded-xl hover:bg-salon-warm-pink/50 transition-colors duration-200"
                  >
                    <div className="text-2xl mb-2">{landmark.icon}</div>
                    <div className="font-medium text-salon-charcoal text-sm mb-1">
                      {landmark.name}
                    </div>
                    <div className="text-xs text-salon-accent">
                      {landmark.distance}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Transportation Info */}
              <div className="mt-6 bg-salon-islamic/5 rounded-lg p-4">
                <div className="flex items-center justify-center gap-6 text-sm text-salon-charcoal/80">
                  <div className="flex items-center gap-2">
                    <span>🚗</span>
                    <span>Parkir Luas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🛵</span>
                    <span>Akses Ojol</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🚌</span>
                    <span>Dekat Halte</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Community Engagement Call-to-Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-salon-primary/10 via-salon-secondary/10 to-salon-accent/10 rounded-2xl p-8 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-salon-primary mb-4">
              🤝 Bergabung dengan Komunitas Kami
            </h3>
            <p className="text-salon-charcoal leading-relaxed mb-6">
              Jadilah bagian dari komunitas wanita muslimah Medan yang peduli kecantikan halal. 
              Dapatkan info promo terbaru, tips kecantikan Islami, dan event khusus komunitas.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-bold text-salon-primary text-sm">WhatsApp Group</div>
                <div className="text-xs text-salon-charcoal/70">Tips & Promo Eksklusif</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-2xl mb-2">📸</div>
                <div className="font-bold text-salon-secondary text-sm">Instagram</div>
                <div className="text-xs text-salon-charcoal/70">Daily Updates & Stories</div>
              </div>
              <div className="bg-white/60 rounded-lg p-4">
                <div className="text-2xl mb-2">🎁</div>
                <div className="font-bold text-salon-accent text-sm">Member Benefits</div>
                <div className="text-xs text-salon-charcoal/70">Poin Reward & Diskon</div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const message = "Assalamu'alaikum! Saya ingin bergabung dengan komunitas Salon Muslimah Dina dan mendapatkan info promo terbaru 😊"
                const whatsappUrl = `https://wa.me/6206181234567890?text=${encodeURIComponent(message)}`
                window.open(whatsappUrl, '_blank')
              }}
              className="bg-gradient-to-r from-salon-primary to-salon-secondary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              💬 Join Komunitas Sekarang
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Compact widget for sidebar or footer
export function MedanBusinessStatus() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const isOpen = () => {
    const jakartaTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
    const currentHour = jakartaTime.getHours()
    const currentMinute = jakartaTime.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute
    return currentTimeMinutes >= 540 && currentTimeMinutes < 1110 // 9:00 to 18:30
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 text-center">
      <div className={`font-bold ${isOpen() ? 'text-green-600' : 'text-orange-600'} mb-2`}>
        {isOpen() ? '🟢 BUKA SEKARANG' : '🟡 TUTUP'}
      </div>
      <div className="text-sm text-salon-charcoal/80 mb-2">
        Setiap Hari: 09:00 - 18:30 WIB
      </div>
      <div className="text-xs text-salon-accent">
        ⭐ Tidak pernah libur Minggu!
      </div>
    </div>
  )
}