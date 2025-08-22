'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import FeedbackModal from './FeedbackModal'
import CurrencyInput from '../ui/CurrencyInput'

interface TreatmentCompletionProps {
  treatment: {
    id: string
    customerName: string
    serviceName: string
    servicePrice: number
    therapistName: string
    therapistId: string
    date: string
    startTime?: string
  }
  onComplete: (completionData: CompletionData) => Promise<void>
  onCancel: () => void
}

interface CompletionData {
  endTime: string
  tipAmount: number
  paymentMethod: 'cash' | 'transfer' | 'qris'
  treatmentNotes: string
  actualPrice: number
  therapistId: string
}

const TreatmentCompletion: React.FC<TreatmentCompletionProps> = ({
  treatment,
  onComplete,
  onCancel
}) => {

  const [completionData, setCompletionData] = useState<CompletionData>({
    endTime: new Date().toTimeString().slice(0, 5),
    tipAmount: 0,
    paymentMethod: 'cash',
    treatmentNotes: '',
    actualPrice: treatment.servicePrice,
    therapistId: treatment.therapistId
  })
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    try {
      setLoading(true)
      const success = await onComplete(completionData)
      
      if (success) {
        // Show feedback modal after successful completion
        setShowFeedbackModal(true)
      } else {
        alert('Gagal menyelesaikan treatment. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Error completing treatment:', error)
      alert('Gagal menyelesaikan treatment. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackSubmit = async (feedbackData: any) => {
    // Feedback is handled by the FeedbackModal component via API
    console.log('Feedback submitted:', feedbackData)
    
    // First close the feedback modal
    setShowFeedbackModal(false)
    
    // Then close the parent modal after a short delay to ensure smooth transition
    setTimeout(() => {
      onCancel()
    }, 100)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const calculateTotalEarnings = () => {
    // Base fee + commission from service price + tips
    const baseFee = 15000 // Default therapist fee
    const commission = completionData.actualPrice * 0.1 // 10% commission
    return baseFee + commission + completionData.tipAmount
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6">
          <h3 className="text-xl font-bold mb-2">🎉 Selesaikan Treatment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-green-100">Customer:</span>
              <div className="font-semibold">{treatment.customerName}</div>
            </div>
            <div>
              <span className="text-green-100">Treatment:</span>
              <div className="font-semibold">{treatment.serviceName}</div>
            </div>
            <div>
              <span className="text-green-100">Therapist:</span>
              <div className="font-semibold">{treatment.therapistName}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Treatment Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-lg">⏰</span>
              Detail Treatment
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="salon-label">Waktu Selesai</label>
                <input
                  type="time"
                  value={completionData.endTime}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="salon-input"
                />
              </div>

              <CurrencyInput
                label="Harga Aktual"
                value={completionData.actualPrice}
                onChange={(value) => setCompletionData(prev => ({ ...prev, actualPrice: value }))}
                placeholder={treatment.servicePrice.toString()}
              />

              <div>
                <label className="salon-label">Metode Pembayaran</label>
                <select
                  value={completionData.paymentMethod}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                  className="salon-input"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="transfer">🏧 Transfer Bank</option>
                  <option value="qris">📱 QRIS</option>
                </select>
              </div>

              <div>
                <label className="salon-label">Catatan Treatment</label>
                <textarea
                  value={completionData.treatmentNotes}
                  onChange={(e) => setCompletionData(prev => ({ ...prev, treatmentNotes: e.target.value }))}
                  placeholder="Hasil treatment, kondisi pelanggan, dll..."
                  rows={3}
                  className="salon-input resize-none"
                />
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-lg">💰</span>
              Ringkasan Keuangan
            </h4>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Harga Treatment:</span>
                <span className="font-semibold">{formatCurrency(completionData.actualPrice)}</span>
              </div>
              
              <div className="border-t pt-2">
                <CurrencyInput
                  label="Tips untuk Therapist"
                  value={completionData.tipAmount}
                  onChange={(value) => setCompletionData(prev => ({ ...prev, tipAmount: value }))}
                  placeholder="0"
                />
              </div>

              <div className="border-t pt-2 space-y-2">
                <h5 className="font-semibold text-gray-700">💸 Pendapatan Therapist:</h5>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee Dasar:</span>
                    <span>Rp 15.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Komisi (10%):</span>
                    <span>{formatCurrency(completionData.actualPrice * 0.1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tips:</span>
                    <span>{formatCurrency(completionData.tipAmount)}</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between font-semibold text-green-600">
                    <span>Total Therapist:</span>
                    <span>{formatCurrency(calculateTotalEarnings())}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-800">💵 Total untuk Salon:</span>
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(completionData.actualPrice + completionData.tipAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleComplete}
            disabled={loading}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Memproses...
              </>
            ) : (
              <>
                <span>✅</span>
                Selesaikan & Minta Feedback
              </>
            )}
          </button>
        </div>
        

      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          treatmentData={treatment}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  )
}

export default TreatmentCompletion