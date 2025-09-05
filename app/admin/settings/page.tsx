'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'

interface HomepageSettings {
  hero: {
    salonName: string
    greeting: string
    description: string
    islamicQuote: string
  }
  contact: {
    address: string
    phone: string
    whatsapp: string
    email: string
    instagram: string
    operatingHours: {
      open: string
      close: string
      description: string
    }
  }
  about: {
    whyChooseTitle: string
    whyChooseSubtitle: string
    features: {
      icon: string
      title: string
      description: string
      isSpecial: boolean
    }[]
  }
  services: {
    title: string
    subtitle: string
    description: string
    serviceList: {
      title: string
      description: string
      icon: string
      price: string
      benefits: string[]
      isSpecial: boolean
    }[]
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<HomepageSettings>({
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
      whyChooseSubtitle: 'Keunggulan yang membuat kami berbeda',
      features: [
        {
          icon: '🗓️',
          title: 'Buka Setiap Hari',
          description: 'Konsisten 09:00-18:30 WIB, 7 hari seminggu - satu-satunya di Medan!',
          isSpecial: true
        },
        {
          icon: '🏠',
          title: 'Privasi Terjamin',
          description: 'Area khusus wanita dengan privasi penuh sesuai syariat Islam',
          isSpecial: false
        },
        {
          icon: '🌿',
          title: 'Produk Halal',
          description: 'Semua produk yang digunakan bersertifikat halal MUI',
          isSpecial: false
        },
        {
          icon: '👩‍⚕️',
          title: 'Therapist Muslimah',
          description: 'Semua terapis adalah wanita muslimah yang berpengalaman',
          isSpecial: false
        },
        {
          icon: '🕌',
          title: 'Suasana Islami',
          description: 'Lingkungan yang tenang dengan nuansa Islami',
          isSpecial: false
        },
        {
          icon: '🕐',
          title: 'Fleksibel Waktu Sholat',
          description: 'Jadwal appointment yang menghormati waktu ibadah Anda',
          isSpecial: false
        }
      ]
    },
    services: {
      title: 'Layanan Istimewa Kami',
      subtitle: 'Perawatan kecantihan dengan sentuhan Islami',
      description: 'Menggunakan produk halal pilihan dan therapist muslimah berpengalaman',
      serviceList: [
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
      ]
    }
  })

  const [activeTab, setActiveTab] = useState<'hero' | 'services' | 'about' | 'contact'>('hero')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch existing settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/homepage-settings')
        const result = await response.json()
        
        if (result.success && result.data) {
          setSettings(result.data)
          console.log('📊 Homepage settings loaded:', result.data)
        } else {
          console.warn('Failed to load settings, using defaults')
        }
      } catch (error) {
        console.error('Error fetching homepage settings:', error)
        // Continue with default settings already set in state
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/homepage-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('Homepage settings saved:', settings)
        alert('✅ Pengaturan homepage berhasil disimpan!')
      } else {
        alert('❌ Gagal menyimpan pengaturan: ' + result.error)
      }
    } catch (error) {
      console.error('Error saving homepage settings:', error)
      alert('❌ Terjadi kesalahan saat menyimpan pengaturan. Silahkan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateHeroSetting = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }))
  }

  const updateContactSetting = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }))
  }

  const updateOperatingHours = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        operatingHours: {
          ...prev.contact.operatingHours,
          [field]: value
        }
      }
    }))
  }

  const updateAboutSetting = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: value
      }
    }))
  }

  const updateServicesSetting = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [field]: value
      }
    }))
  }

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: '🌟' },
    { id: 'services', label: 'Layanan', icon: '✨' },
    { id: 'about', label: 'Tentang Kami', icon: '🏢' },
    { id: 'contact', label: 'Kontak', icon: '📞' }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Pengaturan Homepage</h1>
            <p className="text-gray-600">Edit konten dan tampilan website homepage</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '⏳ Menyimpan...' : '💾 Simpan Homepage'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="salon-card p-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="salon-card p-6"
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⏳</div>
              <p className="text-gray-500 mb-2">Memuat pengaturan homepage...</p>
              <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <>
          {/* Hero Section Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-pink-800 mb-4">Hero Section Homepage</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Salon
                  </label>
                  <input
                    type="text"
                    value={settings.hero.salonName}
                    onChange={(e) => updateHeroSetting('salonName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Salon Muslimah Dina"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Greeting Message
                  </label>
                  <input
                    type="text"
                    value={settings.hero.greeting}
                    onChange={(e) => updateHeroSetting('greeting', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Assalamu'alaikum, Ukhti Cantik ✨"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Utama
                  </label>
                  <textarea
                    value={settings.hero.description}
                    onChange={(e) => updateHeroSetting('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Selamat datang di ruang aman kami..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Gunakan \\n untuk baris baru</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teks Islami (Arab)
                  </label>
                  <input
                    type="text"
                    value={settings.hero.islamicQuote}
                    onChange={(e) => updateHeroSetting('islamicQuote', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right"
                    placeholder="بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-pink-800 mb-4">Pengaturan Layanan</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul Section Layanan
                  </label>
                  <input
                    type="text"
                    value={settings.services.title}
                    onChange={(e) => updateServicesSetting('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Layanan Istimewa Kami"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.services.subtitle}
                    onChange={(e) => updateServicesSetting('subtitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Perawatan kecantihan dengan sentuhan Islami"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Section Layanan
                  </label>
                  <textarea
                    value={settings.services.description}
                    onChange={(e) => updateServicesSetting('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Menggunakan produk halal pilihan dan therapist muslimah berpengalaman"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Info Layanan</h3>
                  <p className="text-sm text-blue-700">
                    Untuk mengubah daftar layanan spesifik (nama, harga, deskripsi), gunakan halaman 
                    <strong> Kelola Layanan</strong> di menu admin. Bagian ini hanya untuk mengubah judul dan deskripsi umum section layanan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-pink-800 mb-4">Pengaturan Tentang Kami</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul &quot;Mengapa Memilih Kami&quot;
                  </label>
                  <input
                    type="text"
                    value={settings.about.whyChooseTitle}
                    onChange={(e) => updateAboutSetting('whyChooseTitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Mengapa Memilih Salon Muslimah Dina?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={settings.about.whyChooseSubtitle}
                    onChange={(e) => updateAboutSetting('whyChooseSubtitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Keunggulan yang membuat kami berbeda"
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">✨ Info Keunggulan</h3>
                  <p className="text-sm text-green-700">
                    Daftar keunggulan (seperti &quot;Buka Setiap Hari&quot;, &quot;Privasi Terjamin&quot;, dll) sudah ditetapkan 
                    dan tidak perlu diubah karena sesuai dengan keunggulan salon. Bagian ini hanya untuk mengubah 
                    judul dan subtitle section.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-pink-800 mb-4">Pengaturan Kontak</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap
                  </label>
                  <textarea
                    value={settings.contact.address}
                    onChange={(e) => updateContactSetting('address', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Jl. Perhubungan, Tembung..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Gunakan \\n untuk baris baru</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={settings.contact.phone}
                    onChange={(e) => updateContactSetting('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="+62 821-7067-7736"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={settings.contact.whatsapp}
                    onChange={(e) => updateContactSetting('whatsapp', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="+6282170677736"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: +628xxxxxxxxxx (tanpa spasi/tanda)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) => updateContactSetting('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="medan@salonmuslimah.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={settings.contact.instagram}
                    onChange={(e) => updateContactSetting('instagram', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="@dina_salon_muslimah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Buka
                  </label>
                  <input
                    type="time"
                    value={settings.contact.operatingHours.open}
                    onChange={(e) => updateOperatingHours('open', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Tutup
                  </label>
                  <input
                    type="time"
                    value={settings.contact.operatingHours.close}
                    onChange={(e) => updateOperatingHours('close', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Jam Operasional
                  </label>
                  <input
                    type="text"
                    value={settings.contact.operatingHours.description}
                    onChange={(e) => updateOperatingHours('description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="7 hari seminggu untuk kemudahan Anda"
                  />
                </div>
              </div>
            </div>
          )}
          </>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  )
}