'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotification } from '../ui/NotificationToast'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  treatmentData: {
    id: string
    customerName: string
    serviceName: string
    therapistName: string
    servicePrice: number
  } | null
  onSubmit: (feedback: FeedbackData) => Promise<void>
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

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  treatmentData,
  onSubmit
}) => {
  const { success, error } = useNotification()
  const [feedback, setFeedback] = useState<FeedbackData>({
    overallRating: 5,
    serviceQuality: 5,
    therapistService: 5,
    cleanliness: 5,
    valueForMoney: 5,
    comment: '',
    wouldRecommend: true
  })
  const [loading, setLoading] = useState(false)

  const ratingCategories = [
    { key: 'overallRating', label: 'Kepuasan Keseluruhan', icon: '⭐' },
    { key: 'serviceQuality', label: 'Kualitas Treatment', icon: '💆‍♀️' },
    { key: 'therapistService', label: 'Pelayanan Therapist', icon: '👩‍⚕️' },
    { key: 'cleanliness', label: 'Kebersihan Salon', icon: '🧼' },
    { key: 'valueForMoney', label: 'Sesuai Harga', icon: '💰' }
  ]

  const handleRatingChange = (category: keyof FeedbackData, rating: number) => {
    setFeedback(prev => ({ ...prev, [category]: rating }))
  }

  const handleSubmit = async () => {
    if (!treatmentData) return
    
    try {
      setLoading(true)
      
      // Call the feedback API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dailyTreatmentId: treatmentData.id,
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
        // Show success notification
        success(
          'Feedback Berhasil Disimpan!',
          'Terima kasih atas masukan Anda 🙏'
        )

        // Call parent onSubmit if provided
        await onSubmit(feedback)
        onClose()
        
        // Reset form
        setFeedback({
          overallRating: 5,
          serviceQuality: 5,
          therapistService: 5,
          cleanliness: 5,
          valueForMoney: 5,
          comment: '',
          wouldRecommend: true
        })
      } else {
        throw new Error(result.error || 'Gagal menyimpan feedback')
      }
    } catch (err) {
      console.error('Error submitting feedback:', err)
      
      // Show error notification
      error(
        'Gagal Menyimpan Feedback',
        err instanceof Error ? err.message : 'Silakan coba lagi'
      )
    } finally {
      setLoading(false)
    }
  }


  if (!isOpen || !treatmentData) return null


  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Feedback Pelanggan</h3>
                <p className="text-pink-100 mt-1">Bagaimana pengalaman treatment hari ini?</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-pink-200 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Treatment Summary */}
            <div className="mt-4 bg-white/10 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-pink-200">Customer:</span>
                  <div className="font-semibold">{treatmentData.customerName}</div>
                </div>
                <div>
                  <span className="text-pink-200">Treatment:</span>
                  <div className="font-semibold">{treatmentData.serviceName}</div>
                </div>
                <div>
                  <span className="text-pink-200">Therapist:</span>
                  <div className="font-semibold">{treatmentData.therapistName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-6">
              {/* Rating Categories */}
              {ratingCategories.map((category) => (
                <div key={category.key} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h4 className="font-semibold text-gray-800">{category.label}</h4>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => {
                      const isFilled = (feedback[category.key as keyof FeedbackData] as number) >= rating
                      const isHovered = (feedback[category.key as keyof FeedbackData] as number) >= rating
                      
                      return (
                        <motion.button
                          key={rating}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRatingChange(category.key as keyof FeedbackData, rating)}
                          className="relative group"
                        >
                          <motion.span
                            initial={false}
                            animate={{
                              scale: isFilled ? 1 : 0.8,
                              opacity: isFilled ? 1 : 0.3
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                              duration: 0.2
                            }}
                            className={`text-3xl transition-all duration-300 ${
                              isFilled 
                                ? 'text-yellow-400 drop-shadow-lg' 
                                : 'text-gray-300 group-hover:text-yellow-200'
                            }`}
                          >
                            {isFilled ? '⭐' : '☆'}
                          </motion.span>
                          
                          {/* Glow effect for filled stars */}
                          {isFilled && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0 bg-yellow-400 rounded-full blur-sm -z-10"
                            />
                          )}
                        </motion.button>
                      )
                    })}
                    <motion.span 
                      key={`${category.key}-${feedback[category.key as keyof FeedbackData]}`}
                      initial={{ scale: 1.2, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="ml-3 text-sm text-gray-600 font-medium bg-gray-100 px-2 py-1 rounded-full"
                    >
                      {(feedback[category.key as keyof FeedbackData] as number)}/5
                    </motion.span>
                  </div>
                </div>
              ))}

              {/* Recommendation */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">💖</span>
                  Apakah Anda akan merekomendasikan salon kami?
                </h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={feedback.wouldRecommend === true}
                      onChange={() => setFeedback(prev => ({ ...prev, wouldRecommend: true }))}
                      className="text-green-500"
                    />
                    <span className="text-green-600 font-medium">Ya, pasti! 👍</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={feedback.wouldRecommend === false}
                      onChange={() => setFeedback(prev => ({ ...prev, wouldRecommend: false }))}
                      className="text-red-500"
                    />
                    <span className="text-red-600 font-medium">Mungkin tidak 👎</span>
                  </label>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  Komentar & Saran (Opsional)
                </h4>
                <textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Ceritakan pengalaman Anda atau berikan saran untuk perbaikan..."
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              Skip Feedback
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Kirim Feedback
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default FeedbackModal