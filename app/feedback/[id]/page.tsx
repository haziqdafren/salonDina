// Customer feedback form page
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'

interface FeedbackData {
  overallRating: number
  serviceQuality: number
  therapistService: number
  cleanliness: number
  valueForMoney: number
  comment: string
  wouldRecommend: boolean
}

export default function FeedbackPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  
  const [feedback, setFeedback] = useState<FeedbackData>({
    overallRating: 5,
    serviceQuality: 5,
    therapistService: 5,
    cleanliness: 5,
    valueForMoney: 5,
    comment: '',
    wouldRecommend: true
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Feedback submitted:', feedback)
    setSubmitted(true)
  }

  const StarRating = ({ 
    rating, 
    onRatingChange, 
    label 
  }: { 
    rating: number
    onRatingChange: (rating: number) => void
    label: string 
  }) => (
    <div className="mb-6">
      <label className="block text-lg font-semibold text-salon-secondary mb-3">
        {label}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-3xl transition-all duration-200 ${
              star <= rating ? 'text-salon-gold' : 'text-gray-300'
            } hover:text-salon-gold hover:scale-110`}
          >
            ⭐
          </button>
        ))}
      </div>
      <p className="text-sm mt-1" style={{ color: 'var(--salon-charcoal)', opacity: 0.6 }}>
        {rating === 5 ? 'Sangat Puas' : rating === 4 ? 'Puas' : rating === 3 ? 'Cukup' : rating === 2 ? 'Kurang' : 'Tidak Puas'}
      </p>
    </div>
  )

  if (submitted) {
    return (
      <div className="min-h-screen salon-gradient-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="salon-card text-center max-w-md shadow-2xl"
          style={{ padding: '3rem', borderRadius: '30px 10px 30px 10px' }}
        >
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto mb-6">
            ✅
          </div>
          <h2 className="salon-header text-2xl mb-4">
            Jazakillahu Khairan! 🤲
          </h2>
          <p style={{ color: 'var(--salon-charcoal)', opacity: 0.8 }} className="leading-relaxed mb-6">
            Terima kasih atas feedback Anda. Masukan Ukhti sangat berharga untuk 
            terus meningkatkan kualitas pelayanan kami di Medan.
          </p>
          <p className="text-sm" style={{ color: 'var(--salon-charcoal)', opacity: 0.6 }}>
            Barakallahu fiki wa jazakillahu khair 🌸
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/')}
            className="salon-button-primary mt-6"
          >
            Kembali ke Beranda
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen salon-gradient-bg salon-pattern p-4">
      <div className="max-w-2xl mx-auto py-12">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 bg-gradient-to-r from-salon-primary to-salon-secondary rounded-full flex items-center justify-center text-white text-4xl mx-auto shadow-2xl">
              🌸
            </div>
          </div>
          
          <h1 className="salon-header-xl mb-4 ornamental-border">
            Feedback Treatment Anda
          </h1>
          <p style={{ color: 'var(--salon-charcoal)', opacity: 0.8 }} className="leading-relaxed">
            Bagikan pengalaman Ukhti untuk membantu kami memberikan pelayanan yang lebih baik di Salon Muslimah Dina - Medan
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="salon-card p-8 corner-ornament shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <StarRating
              rating={feedback.overallRating}
              onRatingChange={(rating) => setFeedback({...feedback, overallRating: rating})}
              label="⭐ Penilaian Keseluruhan"
            />

            <StarRating
              rating={feedback.serviceQuality}
              onRatingChange={(rating) => setFeedback({...feedback, serviceQuality: rating})}
              label="💆‍♀️ Kualitas Treatment"
            />

            <StarRating
              rating={feedback.therapistService}
              onRatingChange={(rating) => setFeedback({...feedback, therapistService: rating})}
              label="👩‍💼 Pelayanan Therapist"
            />

            <StarRating
              rating={feedback.cleanliness}
              onRatingChange={(rating) => setFeedback({...feedback, cleanliness: rating})}
              label="🏠 Kebersihan Salon"
            />

            <StarRating
              rating={feedback.valueForMoney}
              onRatingChange={(rating) => setFeedback({...feedback, valueForMoney: rating})}
              label="💰 Nilai sebanding dengan Harga"
            />

            <div>
              <label className="block text-lg font-semibold text-salon-secondary mb-3">
                📝 Ceritakan Pengalaman Anda (Opsional)
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                placeholder="Bagikan pengalaman Ukhti di salon kami... Apa yang Anda suka? Ada saran untuk perbaikan?"
                rows={5}
                className="salon-input resize-none"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-salon-secondary mb-4">
                💬 Apakah Anda akan merekomendasikan salon kami?
              </label>
              <div className="flex gap-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFeedback({...feedback, wouldRecommend: true})}
                  className={`flex-1 p-4 font-semibold transition-all duration-300 ${
                    feedback.wouldRecommend
                      ? 'bg-gradient-to-r from-salon-primary to-salon-secondary text-white shadow-lg'
                      : 'bg-salon-soft-pink hover:bg-salon-warm-pink'
                  }`}
                  style={{ 
                    borderRadius: '20px 5px 20px 5px',
                    color: feedback.wouldRecommend ? 'white' : 'var(--salon-charcoal)'
                  }}
                >
                  👍 Ya, Pasti!
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFeedback({...feedback, wouldRecommend: false})}
                  className={`flex-1 p-4 font-semibold transition-all duration-300 ${
                    !feedback.wouldRecommend
                      ? 'bg-gradient-to-r from-salon-primary to-salon-secondary text-white shadow-lg'
                      : 'bg-salon-soft-pink hover:bg-salon-warm-pink'
                  }`}
                  style={{ 
                    borderRadius: '20px 5px 20px 5px',
                    color: !feedback.wouldRecommend ? 'white' : 'var(--salon-charcoal)'
                  }}
                >
                  🤔 Mungkin
                </motion.button>
              </div>
            </div>

            <div className="bg-salon-soft-pink p-6 rounded-xl text-center">
              <p style={{ color: 'var(--salon-charcoal)', opacity: 0.8 }} className="italic mb-2">
                &ldquo;Barang siapa tidak berterima kasih kepada manusia, maka ia tidak berterima kasih kepada Allah&rdquo;
              </p>
              <p className="text-sm" style={{ color: 'var(--salon-charcoal)', opacity: 0.6 }}>
                - HR. Abu Dawud dan Tirmidzi
              </p>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="salon-button-primary w-full"
            >
              Kirim Feedback 🌸
            </motion.button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <p style={{ color: 'var(--salon-charcoal)', opacity: 0.7 }} className="italic">
            Jazakillahu khairan atas waktu yang Ukhti luangkan untuk memberikan feedback 🤲
          </p>
        </motion.div>
      </div>
    </div>
  )
}