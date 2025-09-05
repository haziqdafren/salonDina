'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TreatmentData {
  id: number
  customerName: string
  customerPhone: string
  serviceName: string
  therapistName: string
}

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  treatmentData: TreatmentData
  onSubmit: (feedbackData: any) => void
}

export default function FeedbackModal({ isOpen, onClose, treatmentData, onSubmit }: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    therapistRating: 0,
    serviceRating: 0,
    overallRating: 0,
    comment: '',
    isAnonymous: false
  })
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }))
  }

  const handleRatingChange = (ratingType: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [ratingType]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const feedbackData = {
        treatmentId: treatmentData.id,
        customerName: treatmentData.customerName,
        customerPhone: treatmentData.customerPhone,
        serviceName: treatmentData.serviceName,
        therapistName: treatmentData.therapistName,
        ...formData
      }

      await onSubmit(feedbackData)
      onClose()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ rating, onRatingChange, label }: { rating: number, onRatingChange: (value: number) => void, label: string }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-2xl transition-all duration-300 ${
              star <= rating 
                ? 'text-yellow-400 drop-shadow-lg' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
            whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: star <= rating ? [1, 1.1, 1] : 1,
              rotate: star <= rating ? [0, -5, 5, 0] : 0
            }}
            transition={{
              duration: 0.3,
              delay: star <= rating ? (star - 1) * 0.1 : 0
            }}
          >
            ⭐
          </motion.button>
        ))}
        <motion.span 
          className="ml-2 text-sm text-gray-600"
          animate={{ opacity: rating > 0 ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
          {rating}/5
        </motion.span>
      </div>
    </div>
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-pink-800">⭐ Feedback Customer</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                <h3 className="font-semibold text-pink-800 mb-2">Detail Treatment</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Customer:</span> {treatmentData.customerName}
                  </div>
                  <div>
                    <span className="font-medium">Service:</span> {treatmentData.serviceName}
                  </div>
                  <div>
                    <span className="font-medium">Therapist:</span> {treatmentData.therapistName}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {treatmentData.customerPhone}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StarRating
                    rating={formData.therapistRating}
                    onRatingChange={(value) => handleRatingChange('therapistRating', value)}
                    label="Rating Therapist"
                  />
                  <StarRating
                    rating={formData.serviceRating}
                    onRatingChange={(value) => handleRatingChange('serviceRating', value)}
                    label="Rating Layanan"
                  />
                  <StarRating
                    rating={formData.overallRating}
                    onRatingChange={(value) => handleRatingChange('overallRating', value)}
                    label="Rating Keseluruhan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Komentar/Kesan
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Bagikan pengalaman Anda tentang layanan kami..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 focus:ring-2"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Kirim sebagai feedback anonim
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting || formData.overallRating === 0}
                    className="flex-1 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-400 transition-colors font-semibold"
                  >
                    {submitting ? '⏳ Mengirim...' : '💾 Kirim Feedback'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}