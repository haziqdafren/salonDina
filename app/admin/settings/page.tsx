'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'

interface SettingsData {
  businessInfo: {
    name: string
    address: string
    phone: string
    email: string
    instagram: string
    operatingHours: {
      open: string
      close: string
    }
  }
  system: {
    timezone: string
    currency: string
    language: string
    dateFormat: string
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    bookingReminders: boolean
  }
  pricing: {
    defaultTherapistFeePercentage: number
    taxRate: number
    loyaltyProgramEnabled: boolean
    freeVisitThreshold: number
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    businessInfo: {
      name: 'Salon Muslimah Dina',
      address: 'Jl. Contoh No. 123, Medan, Sumatera Utara',
      phone: '+6287869590802',
      email: 'info@salonmuslimah.com',
      instagram: '@dina_salon_muslimah',
      operatingHours: {
        open: '09:00',
        close: '18:30'
      }
    },
    system: {
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      language: 'id-ID',
      dateFormat: 'DD/MM/YYYY'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      bookingReminders: true
    },
    pricing: {
      defaultTherapistFeePercentage: 40,
      taxRate: 0,
      loyaltyProgramEnabled: true,
      freeVisitThreshold: 3
    }
  })

  const [activeTab, setActiveTab] = useState<'business' | 'system' | 'notifications' | 'pricing'>('business')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement actual API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      console.log('Settings saved:', settings)
      alert('Pengaturan berhasil disimpan!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Gagal menyimpan pengaturan. Silahkan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  const updateBusinessInfo = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value
      }
    }))
  }

  const updateOperatingHours = (field: 'open' | 'close', value: string) => {
    setSettings(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        operatingHours: {
          ...prev.businessInfo.operatingHours,
          [field]: value
        }
      }
    }))
  }

  const updateSystemSetting = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        [field]: value
      }
    }))
  }

  const updateNotificationSetting = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const updatePricingSetting = (field: string, value: number | boolean) => {
    setSettings(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }))
  }

  const tabs = [
    { id: 'business', label: 'Info Bisnis', icon: '🏢' },
    { id: 'system', label: 'Sistem', icon: '⚙️' },
    { id: 'notifications', label: 'Notifikasi', icon: '🔔' },
    { id: 'pricing', label: 'Harga & Loyalitas', icon: '💰' }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Pengaturan Sistem</h1>
            <p className="text-gray-600">Konfigurasi aplikasi dan preferensi bisnis</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '⏳ Menyimpan...' : '💾 Simpan Pengaturan'}
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
          {/* Business Info Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-pink-800 mb-4">Informasi Bisnis</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Salon
                  </label>
                  <input
                    type="text"
                    value={settings.businessInfo.name}
                    onChange={(e) => updateBusinessInfo('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={settings.businessInfo.phone}
                    onChange={(e) => updateBusinessInfo('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Lengkap
                  </label>
                  <textarea
                    value={settings.businessInfo.address}
                    onChange={(e) => updateBusinessInfo('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.businessInfo.email}
                    onChange={(e) => updateBusinessInfo('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    value={settings.businessInfo.instagram}
                    onChange={(e) => updateBusinessInfo('instagram', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Buka
                  </label>
                  <input
                    type="time"
                    value={settings.businessInfo.operatingHours.open}
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
                    value={settings.businessInfo.operatingHours.close}
                    onChange={(e) => updateOperatingHours('close', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-pink-800 mb-4">Pengaturan Sistem</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zona Waktu
                  </label>
                  <select
                    value={settings.system.timezone}
                    onChange={(e) => updateSystemSetting('timezone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                    <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                    <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mata Uang
                  </label>
                  <select
                    value={settings.system.currency}
                    onChange={(e) => updateSystemSetting('currency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bahasa
                  </label>
                  <select
                    value={settings.system.language}
                    onChange={(e) => updateSystemSetting('language', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="id-ID">Indonesia</option>
                    <option value="en-US">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format Tanggal
                  </label>
                  <select
                    value={settings.system.dateFormat}
                    onChange={(e) => updateSystemSetting('dateFormat', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-pink-800 mb-4">Pengaturan Notifikasi</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Notifikasi Email', desc: 'Terima notifikasi melalui email' },
                  { key: 'smsNotifications', label: 'Notifikasi SMS', desc: 'Terima notifikasi melalui SMS' },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Notifikasi di browser/aplikasi' },
                  { key: 'bookingReminders', label: 'Pengingat Booking', desc: 'Kirim pengingat ke customer sebelum appointment' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">{item.label}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                        onChange={(e) => updateNotificationSetting(item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-pink-800 mb-4">Pengaturan Harga & Program Loyalitas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fee Therapist Default (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.pricing.defaultTherapistFeePercentage}
                    onChange={(e) => updatePricingSetting('defaultTherapistFeePercentage', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Persentase dari harga treatment yang diterima therapist</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pajak (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={settings.pricing.taxRate}
                    onChange={(e) => updatePricingSetting('taxRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batas Kunjungan Gratis
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.pricing.freeVisitThreshold}
                    onChange={(e) => updatePricingSetting('freeVisitThreshold', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Setelah berapa kali kunjungan customer mendapat treatment gratis</p>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-800">Program Loyalitas</h3>
                    <p className="text-sm text-gray-600">Aktifkan sistem poin loyalitas customer</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pricing.loyaltyProgramEnabled}
                      onChange={(e) => updatePricingSetting('loyaltyProgramEnabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  )
}