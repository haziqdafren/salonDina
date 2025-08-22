'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '../../../components/admin/AdminLayout'

interface FeedbackItem {
  id: string
  tanggalTreatment: string
  namaCustomer: string
  namaService: string
  namaTherapist: string
  initialTherapist: string
  ratingKeseluruhan: number
  ratingKualitasService: number
  ratingPelayananTherapist: number
  ratingKebersihan: number
  ratingSesuaiHarga: number
  komentar: string
  akanMerekomendasikan: boolean
  tanggalFeedback: string
}

interface FeedbackAnalytics {
  totalFeedback: number
  ratings: {
    rataRataKeseluruhan: number
    rataRataKualitasService: number
    rataRataPelayananTherapist: number
    rataRataKebersihan: number
    rataRataSesuaiHarga: number
  }
  recommendation: {
    totalMerekomendasikan: number
    persentaseMerekomendasikan: number
  }
  distribusiRating: Array<{
    rating: number
    jumlah: number
    persentase: number
  }>
}

export default function FeedbackManagement() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    therapistId: '',
    minRating: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchFeedback()
  }, [filter])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('analytics', 'true')
      
      if (filter.therapistId) params.append('therapistId', filter.therapistId)
      if (filter.minRating) params.append('minRating', filter.minRating)
      if (filter.startDate) params.append('startDate', filter.startDate)
      if (filter.endDate) params.append('endDate', filter.endDate)

      const response = await fetch(`/api/feedback?${params}`)
      const result = await response.json()

      if (result.success) {
        setFeedback(result.data)
        setAnalytics(result.analytics)
      } else {
        console.error('Error fetching feedback:', result.error)
      }
    } catch (error) {
      console.error('Error fetching feedback:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRatingBg = (rating: number) => {
    if (rating >= 4.5) return 'bg-green-100'
    if (rating >= 3.5) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ⭐
      </span>
    ))
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-pink-800 mb-2">Manajemen Feedback</h1>
            <p className="text-gray-600">Analisis kepuasan pelanggan dan kualitas layanan</p>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="salon-card p-6"
        >
          <h2 className="text-xl font-semibold text-pink-800 mb-4">Filter Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="salon-label">Rating Minimum</label>
              <select
                value={filter.minRating}
                onChange={(e) => setFilter(prev => ({ ...prev, minRating: e.target.value }))}
                className="salon-input"
              >
                <option value="">Semua Rating</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 bintang)</option>
                <option value="4">⭐⭐⭐⭐ (4+ bintang)</option>
                <option value="3">⭐⭐⭐ (3+ bintang)</option>
                <option value="2">⭐⭐ (2+ bintang)</option>
                <option value="1">⭐ (1+ bintang)</option>
              </select>
            </div>
            <div>
              <label className="salon-label">Tanggal Mulai</label>
              <input
                type="date"
                value={filter.startDate}
                onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                className="salon-input"
              />
            </div>
            <div>
              <label className="salon-label">Tanggal Akhir</label>
              <input
                type="date"
                value={filter.endDate}
                onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                className="salon-input"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilter({ therapistId: '', minRating: '', startDate: '', endDate: '' })}
                className="salon-btn-secondary w-full"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="salon-card p-6"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-2xl">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Total Feedback</h3>
                  <p className="text-2xl font-bold text-blue-600">{analytics.totalFeedback}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="salon-card p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${getRatingBg(analytics.ratings.rataRataKeseluruhan)}`}>
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Rata-rata Rating</h3>
                  <p className={`text-2xl font-bold ${getRatingColor(analytics.ratings.rataRataKeseluruhan)}`}>
                    {analytics.ratings.rataRataKeseluruhan.toFixed(1)}/5
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="salon-card p-6"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-2xl">
                  <span className="text-2xl">💖</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Akan Merekomendasikan</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.recommendation.persentaseMerekomendasikan.toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="salon-card p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${getRatingBg(analytics.ratings.rataRataPelayananTherapist)}`}>
                  <span className="text-2xl">👩‍⚕️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Rating Therapist</h3>
                  <p className={`text-2xl font-bold ${getRatingColor(analytics.ratings.rataRataPelayananTherapist)}`}>
                    {analytics.ratings.rataRataPelayananTherapist.toFixed(1)}/5
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Detailed Rating Analytics */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="salon-card p-6"
          >
            <h2 className="text-xl font-semibold text-pink-800 mb-6">Analisis Rating Detail</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">⭐</div>
                <h4 className="font-semibold text-gray-800 mb-2">Keseluruhan</h4>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {analytics.ratings.rataRataKeseluruhan.toFixed(1)}
                </div>
                <div className="flex justify-center">
                  {renderStars(Math.round(analytics.ratings.rataRataKeseluruhan))}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">💆‍♀️</div>
                <h4 className="font-semibold text-gray-800 mb-2">Kualitas Service</h4>
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {analytics.ratings.rataRataKualitasService.toFixed(1)}
                </div>
                <div className="flex justify-center">
                  {renderStars(Math.round(analytics.ratings.rataRataKualitasService))}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">👩‍⚕️</div>
                <h4 className="font-semibold text-gray-800 mb-2">Pelayanan Therapist</h4>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {analytics.ratings.rataRataPelayananTherapist.toFixed(1)}
                </div>
                <div className="flex justify-center">
                  {renderStars(Math.round(analytics.ratings.rataRataPelayananTherapist))}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">🧼</div>
                <h4 className="font-semibold text-gray-800 mb-2">Kebersihan</h4>
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {analytics.ratings.rataRataKebersihan.toFixed(1)}
                </div>
                <div className="flex justify-center">
                  {renderStars(Math.round(analytics.ratings.rataRataKebersihan))}
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <h4 className="font-semibold text-gray-800 mb-2">Sesuai Harga</h4>
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {analytics.ratings.rataRataSesuaiHarga.toFixed(1)}
                </div>
                <div className="flex justify-center">
                  {renderStars(Math.round(analytics.ratings.rataRataSesuaiHarga))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Feedback Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="salon-card overflow-hidden"
        >
          <div className="p-6 border-b border-pink-100">
            <h2 className="text-xl font-semibold text-pink-800">Daftar Feedback Pelanggan</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-pink-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Tanggal</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Service</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Therapist</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Rating</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Komentar</th>
                  <th className="text-left py-3 px-4 font-semibold text-pink-800">Rekomendasi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                        <span className="text-gray-500">Memuat data feedback...</span>
                      </div>
                    </td>
                  </tr>
                ) : feedback.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada feedback</h3>
                      <p className="text-gray-500">Feedback akan muncul setelah pelanggan memberikan rating</p>
                    </td>
                  </tr>
                ) : (
                  feedback.map((item) => (
                    <tr key={item.id} className="border-t border-pink-100 hover:bg-pink-25">
                      <td className="py-3 px-4">
                        <div className="font-medium">{formatDate(item.tanggalTreatment)}</div>
                        <div className="text-xs text-gray-500">
                          Feedback: {formatDate(item.tanggalFeedback)}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">{item.namaCustomer}</td>
                      <td className="py-3 px-4">{item.namaService}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          {item.initialTherapist} - {item.namaTherapist}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${getRatingColor(item.ratingKeseluruhan)}`}>
                            {item.ratingKeseluruhan}.0
                          </span>
                          <div className="flex">
                            {renderStars(item.ratingKeseluruhan)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        {item.komentar ? (
                          <div className="text-sm text-gray-700 line-clamp-2" title={item.komentar}>
                            &ldquo;{item.komentar}&rdquo;
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Tidak ada komentar</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          item.akanMerekomendasikan 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.akanMerekomendasikan ? '👍 Ya' : '👎 Tidak'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}