'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// North Sumatra cultural integration component
// Respectful acknowledgment of diverse heritage while maintaining Islamic focus

export interface CulturalFeature {
  id: string
  title: string
  description: string
  icon: string
  category: 'islamic' | 'local' | 'community'
  isProminent?: boolean
}

const NORTH_SUMATRA_FEATURES: CulturalFeature[] = [
  // Islamic Values (Primary focus)
  {
    id: 'islamic-primary',
    title: 'Nilai-nilai Islam',
    description: 'Layanan sesuai syariat dengan produk halal dan suasana islami yang tenang',
    icon: '🕌',
    category: 'islamic',
    isProminent: true
  },
  {
    id: 'prayer-respect',
    title: 'Menghormati Waktu Sholat',
    description: 'Jadwal fleksibel yang mempertimbangkan waktu ibadah pelanggan',
    icon: '🤲',
    category: 'islamic',
    isProminent: true
  },
  
  // Local North Sumatra Appreciation
  {
    id: 'medan-service',
    title: 'Pelayanan Khas Medan',
    description: 'Keramahan dan kehangatan pelayanan khas masyarakat Medan',
    icon: '🏛️',
    category: 'local'
  },
  {
    id: 'local-community',
    title: 'Bagian dari Komunitas Medan',
    description: 'Mendukung usaha lokal dan ekonomi masyarakat Sumatera Utara',
    icon: '🤝',
    category: 'community'
  },
  {
    id: 'multicultural-respect',
    title: 'Menghargai Keberagaman',
    description: 'Menyambut pelanggan dari berbagai latar belakang etnis di Medan',
    icon: '🌸',
    category: 'community'
  },
  
  // Community Integration
  {
    id: 'women-empowerment',
    title: 'Pemberdayaan Wanita',
    description: 'Menyediakan lapangan kerja untuk wanita muslimah lokal',
    icon: '👩‍💼',
    category: 'community'
  }
]

interface NorthSumatraFeaturesProps {
  showTitle?: boolean
  compact?: boolean
}

export default function NorthSumatraFeatures({ 
  showTitle = true, 
  compact = false 
}: NorthSumatraFeaturesProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)

  const groupedFeatures = {
    islamic: NORTH_SUMATRA_FEATURES.filter(f => f.category === 'islamic'),
    local: NORTH_SUMATRA_FEATURES.filter(f => f.category === 'local'),
    community: NORTH_SUMATRA_FEATURES.filter(f => f.category === 'community')
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-salon-primary mb-4">
              Nilai-nilai Kami
            </h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-salon-islamic text-xl">🕌</span>
              <p className="text-lg text-salon-secondary max-w-2xl">
                Memadukan nilai-nilai Islam dengan kehangatan budaya Medan
              </p>
              <span className="text-salon-gold text-xl">🌸</span>
            </div>
          </motion.div>
        )}

        {/* Primary Islamic Values - Prominent Display */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedFeatures.islamic.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="salon-card p-8 h-full bg-gradient-to-br from-salon-islamic/5 to-salon-primary/5 border-2 border-salon-islamic/20 hover:border-salon-primary/40 transition-all duration-300">
                  {/* Premium Badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-salon-islamic to-salon-primary text-white text-xs px-3 py-1 rounded-full font-bold">
                    UTAMA
                  </div>
                  
                  <div className="text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-salon-islamic mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-salon-charcoal leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Local & Community Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...groupedFeatures.local, ...groupedFeatures.community].map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: (index + 2) * 0.1 }}
              className="cursor-pointer"
              onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
            >
              <div className={`salon-card p-6 h-full text-center transition-all duration-300 ${
                selectedFeature === feature.id 
                  ? 'bg-gradient-to-br from-salon-secondary/10 to-salon-accent/10 border-2 border-salon-secondary'
                  : 'hover:shadow-lg hover:scale-105'
              }`}>
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h4 className="font-bold text-salon-secondary mb-2">
                  {feature.title}
                </h4>
                
                <AnimatePresence>
                  {selectedFeature === feature.id ? (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-salon-charcoal/80 leading-relaxed"
                    >
                      {feature.description}
                    </motion.p>
                  ) : (
                    <motion.div
                      initial={{ opacity: 1 }}
                      className="text-xs text-salon-accent cursor-pointer"
                    >
                      Klik untuk detail →
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cultural Appreciation Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-salon-soft-pink via-salon-warm-pink to-salon-soft-pink rounded-2xl p-8"
        >
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-2xl">🕌</span>
              <span className="text-2xl">🏛️</span>
              <span className="text-2xl">🌸</span>
            </div>
            
            <h3 className="text-2xl font-bold text-salon-primary mb-4">
              Melayani dengan Hati, Menghormati Keberagaman
            </h3>
            
            <p className="text-salon-charcoal leading-relaxed text-lg">
              Sebagai bagian dari komunitas Medan yang beragam, kami dengan bangga melayani 
              seluruh wanita muslimah dari berbagai latar belakang etnis di Sumatera Utara. 
              Nilai-nilai Islam adalah fondasi kami, dan kehangatan budaya Medan adalah cara kami.
            </p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2 text-salon-islamic">
                <span>🤲</span>
                <span>Berdasarkan Syariat Islam</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-salon-secondary">
                <span>🏛️</span>
                <span>Bangga Budaya Medan</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-salon-accent">
                <span>🌸</span>
                <span>Menghargai Keberagaman</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Batak Acknowledgment - Subtle and Respectful */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-8 text-center"
        >
          <div className="bg-white/70 rounded-xl p-6 max-w-3xl mx-auto">
            <p className="text-sm text-salon-charcoal/70 leading-relaxed">
              <span className="font-medium">🌟 Apresiasi Budaya:</span> Kami menghormati 
              kekayaan budaya Sumatera Utara termasuk tradisi Batak, Melayu, Jawa, dan suku lainnya 
              yang menjadi bagian dari keberagaman Medan. Namun, layanan kami tetap fokus pada 
              nilai-nilai Islam untuk memberikan kenyamanan spiritual bagi seluruh pelanggan muslimah.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// Compact version for embedding in other components
export function CompactCulturalHighlights() {
  return (
    <div className="bg-gradient-to-r from-salon-islamic/5 to-salon-primary/5 rounded-xl p-6">
      <div className="flex items-center justify-center gap-8 text-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🕌</span>
          <div>
            <div className="font-bold text-salon-islamic text-sm">Islami</div>
            <div className="text-xs text-salon-charcoal/70">100% Syariah</div>
          </div>
        </div>
        
        <div className="w-px h-8 bg-salon-accent/30"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏛️</span>
          <div>
            <div className="font-bold text-salon-secondary text-sm">Medan</div>
            <div className="text-xs text-salon-charcoal/70">Pelayanan Hangat</div>
          </div>
        </div>
        
        <div className="w-px h-8 bg-salon-accent/30"></div>
        
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <div>
            <div className="font-bold text-salon-accent text-sm">Inklusif</div>
            <div className="text-xs text-salon-charcoal/70">Semua Etnis</div>
          </div>
        </div>
      </div>
    </div>
  )
}