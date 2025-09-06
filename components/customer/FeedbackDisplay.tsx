'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Feedback {
  id: number
  customerName: string
  serviceName: string
  therapistName: string
  therapistRating: number
  serviceRating: number
  overallRating: number
  comment: string
  isAnonymous: boolean
  createdAt: string
}

export default function FeedbackDisplay() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch('/api/feedback')
        const result = await response.json()
        
        if (result.success && result.data) {
          const apiFeedbacks: Feedback[] = (result.data as any[]).map((fb) => ({
            id: fb.id,
            customerName: fb.customerName,
            serviceName: fb.serviceName,
            therapistName: fb.therapistName,
            therapistRating: fb.therapistRating ?? fb.ratingTherapist ?? 0,
            serviceRating: fb.serviceRating ?? fb.ratingService ?? 0,
            overallRating: fb.overallRating ?? fb.ratingOverall ?? 0,
            comment: fb.comment || '',
            isAnonymous: Boolean(fb.isAnonymous),
            createdAt: fb.createdAt || new Date().toISOString()
          }))

          const publicFeedbacks = apiFeedbacks
            .filter((fb) => !fb.isAnonymous)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6)

          setFeedbacks(publicFeedbacks)
          console.log('✅ Using database feedbacks:', publicFeedbacks.length)
        }
      } catch (error) {
        console.error('❌ Failed to fetch feedbacks from database:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedbacks()
  }, [])

  // Auto-rotate feedbacks every 5 seconds
  useEffect(() => {
    if (feedbacks.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % feedbacks.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [feedbacks.length])

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: star * 0.1 }}
          >
            ⭐
          </motion.span>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
        <p className="mt-2 text-gray-600">Memuat testimoni...</p>
      </div>
    )
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">💬</div>
        <p className="text-gray-600">Belum ada testimoni dari customer. Jadilah yang pertama!</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-pink-800 mb-2">💬 Testimoni Customer</h3>
        <p className="text-gray-600">Pengalaman nyata dari customer kami</p>
      </div>

      <div className="relative h-64 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="salon-card p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-pink-800">
                      {feedbacks[currentIndex].customerName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {feedbacks[currentIndex].serviceName} • {feedbacks[currentIndex].therapistName}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Rating Keseluruhan</div>
                    {renderStars(feedbacks[currentIndex].overallRating)}
                  </div>
                </div>

                {feedbacks[currentIndex].comment && (
                  <blockquote className="text-gray-700 italic leading-relaxed">
                    &ldquo;{feedbacks[currentIndex].comment}&rdquo;
                  </blockquote>
                )}

                <div className="mt-4 flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Therapist:</span>
                    {renderStars(feedbacks[currentIndex].therapistRating)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Layanan:</span>
                    {renderStars(feedbacks[currentIndex].serviceRating)}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 mt-4">
                {new Date(feedbacks[currentIndex].createdAt).toLocaleDateString('id-ID', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      {feedbacks.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {feedbacks.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-pink-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Auto-rotation indicator */}
      {feedbacks.length > 1 && (
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500">
            🔄 Testimoni berganti otomatis setiap 5 detik
          </p>
        </div>
      )}
    </div>
  )
}
