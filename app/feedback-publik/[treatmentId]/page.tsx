'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { showNotification } from '../../../components/ui/NotificationToast'

interface TreatmentInfo {
  id: string
  customerName: string
  serviceName: string
  therapistName: string
  servicePrice: number
  date: string
}

interface FeedbackData {
  overallRating: number
  serviceQuality: number
  therapistService: number
  cleanliness: number
  valueForMoney: number
  comment: string
  wouldRecommend: boolean
}

export default function PublicFeedbackPage() {
  const params = useParams()
  const treatmentId = params.treatmentId as string
  const [treatment, setTreatment] = useState<TreatmentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [feedback, setFeedback] = useState<FeedbackData>({
    overallRating: 5,
    serviceQuality: 5,
    therapistService: 5,
    cleanliness: 5,
    valueForMoney: 5,
    comment: '',
    wouldRecommend: true
  })

  const ratingCategories = [
    { key: 'overallRating', label: 'Kepuasan Keseluruhan', icon: '⭐' },
    { key: 'serviceQuality', label: 'Kualitas Treatment', icon: '💆‍♀️' },
    { key: 'therapistService', label: 'Pelayanan Therapist', icon: '👩‍⚕️' },
    { key: 'cleanliness', label: 'Kebersihan Salon', icon: '🧼' },
    { key: 'valueForMoney', label: 'Sesuai Harga', icon: '💰' }
  ]

  useEffect(() => {
    fetchTreatmentInfo()
  }, [treatmentId])

  const fetchTreatmentInfo = async () => {
    try {
      // Get treatment info from API
      const response = await fetch(`/api/treatments/${treatmentId}`)
      const result = await response.json()
      
      if (result.success) {
        setTreatment(result.data)
      } else {
        console.error('Treatment not found')
      }
    } catch (error) {
      console.error('Error fetching treatment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (category: keyof FeedbackData, rating: number) => {
    setFeedback(prev => ({ ...prev, [category]: rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!treatment) return
    
    try {
      setSubmitting(true)
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dailyTreatmentId: treatment.id,
          overallRating: feedback.overallRating,
          serviceQuality: feedback.serviceQuality,
          therapistService: feedback.therapistService,
          cleanliness: feedback.cleanliness,
          valueForMoney: feedback.valueForMoney,
          comment: feedback.comment,
          wouldRecommend: feedback.wouldRecommend
        })
      })

      const result = await response.json()

      if (result.success) {
        setSubmitted(true)
        showNotification.success(
          'Terima Kasih! 🙏',
          'Feedback Anda sangat berharga untuk kami'
        )
      } else {
        throw new Error(result.error || 'Gagal menyimpan feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      showNotification.error(
        'Gagal Menyimpan Feedback',
        error instanceof Error ? error.message : 'Silakan coba lagi'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const renderStars = (rating: number, category: keyof FeedbackData) => {
    return Array.from({ length: 5 }, (_, i) => (
      <motion.button
        key={i}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => handleRatingChange(category, i + 1)}
        className={`text-3xl transition-all duration-200 ${
          (feedback[category] as number) > i
            ? 'text-yellow-400 drop-shadow-sm'
            : 'text-gray-300 hover:text-yellow-200'
        }`}
        disabled={submitted}
      >
        ⭐
      </motion.button>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data treatment...</p>
        </div>
      </div>
    )
  }

  if (!treatment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Treatment Tidak Ditemukan</h1>
          <p className="text-gray-600">Link feedback mungkin sudah kedaluwarsa atau tidak valid.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-4"
        >
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">Feedback Berhasil Dikirim!</h1>
          <p className="text-green-600 mb-4">Terima kasih atas masukan Anda. Feedback sangat membantu kami meningkatkan kualitas layanan.</p>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <p className="text-sm text-gray-600">
              <strong>Salon Muslimah Dina</strong><br/>
              Jl. Sisingamangaraja No. 165, Medan<br/>
              WhatsApp: 0812-3456-7890
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-4xl mb-2">💬</div>
          <h1 className="text-3xl font-bold text-pink-800 mb-2">Feedback Pelanggan</h1>
          <p className="text-gray-600">Bagaimana pengalaman treatment Anda hari ini?</p>
        </motion.div>

        {/* Treatment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Detail Treatment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Tanggal:</span>
              <div className="font-medium">{formatDate(treatment.date)}</div>
            </div>
            <div>
              <span className="text-gray-500">Customer:</span>
              <div className="font-medium">{treatment.customerName}</div>
            </div>
            <div>
              <span className="text-gray-500">Treatment:</span>
              <div className="font-medium">{treatment.serviceName}</div>
            </div>
            <div>
              <span className="text-gray-500">Therapist:</span>
              <div className="font-medium">{treatment.therapistName}</div>
            </div>
          </div>
        </motion.div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Rating Categories */}
            {ratingCategories.map((category, index) => (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="font-semibold text-gray-800">{category.label}</h3>
                </div>
                
                <div className="flex items-center gap-2">
                  {renderStars(5, category.key as keyof FeedbackData)}
                  <span className="ml-3 text-sm text-gray-600 font-medium">
                    {feedback[category.key as keyof FeedbackData]}/5
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Recommendation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">💖</span>
                Apakah Anda akan merekomendasikan salon kami?
              </h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={feedback.wouldRecommend === true}
                    onChange={() => setFeedback(prev => ({ ...prev, wouldRecommend: true }))}
                    className="text-green-500"
                    disabled={submitted}
                  />
                  <span className="text-green-600 font-medium">Ya, pasti! 👍</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={feedback.wouldRecommend === false}
                    onChange={() => setFeedback(prev => ({ ...prev, wouldRecommend: false }))}
                    className="text-red-500"
                    disabled={submitted}
                  />
                  <span className="text-red-600 font-medium">Mungkin tidak 👎</span>
                </label>
              </div>
            </motion.div>

            {/* Comment */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-3"
            >
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">💬</span>
                Komentar & Saran (Opsional)
              </h3>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Ceritakan pengalaman Anda atau berikan saran untuk perbaikan..."
                rows={4}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                disabled={submitted}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="pt-4"
            >
              <button
                type="submit"
                disabled={submitting || submitted}
                className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengirim Feedback...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Kirim Feedback
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center mt-8 text-sm text-gray-500"
        >
          <p>© 2024 Salon Muslimah Dina - Terima kasih atas kepercayaan Anda</p>
        </motion.div>
      </div>
    </div>
  )
}