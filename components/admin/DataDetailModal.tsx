'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface DataDetailModalProps {
  isOpen: boolean
  onClose: () => void
  data: any
  title: string
  type: 'treatment' | 'customer' | 'therapist' | 'booking' | 'feedback'
}

const DataDetailModal: React.FC<DataDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  title,
  type
}) => {
  if (!isOpen || !data) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'treatment': return '💆‍♀️'
      case 'customer': return '👤'
      case 'therapist': return '👩‍⚕️'
      case 'booking': return '📅'
      case 'feedback': return '💬'
      default: return '📋'
    }
  }

  const getTypeColor = () => {
    switch (type) {
      case 'treatment': return 'from-pink-500 to-purple-600'
      case 'customer': return 'from-blue-500 to-indigo-600'
      case 'therapist': return 'from-green-500 to-emerald-600'
      case 'booking': return 'from-orange-500 to-red-600'
      case 'feedback': return 'from-purple-500 to-pink-600'
      default: return 'from-gray-500 to-slate-600'
    }
  }

  const renderTreatmentDetails = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">👤</span>
              Informasi Customer
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama:</span>
                <span className="font-medium">{data.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Treatment:</span>
                <span className="font-medium">{data.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Therapist:</span>
                <span className="font-medium">{data.therapistName}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">💰</span>
              Informasi Keuangan
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Harga Treatment:</span>
                <span className="font-medium text-green-600">{formatCurrency(data.servicePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tips:</span>
                <span className="font-medium text-blue-600">{formatCurrency(data.tipAmount || 0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-semibold">Total:</span>
                <span className="font-bold text-green-600">{formatCurrency((data.servicePrice || 0) + (data.tipAmount || 0))}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">⏰</span>
              Informasi Waktu
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tanggal:</span>
                <span className="font-medium">{data.date ? formatDate(data.date) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waktu Mulai:</span>
                <span className="font-medium">{data.startTime ? formatTime(data.startTime) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Waktu Selesai:</span>
                <span className="font-medium">{data.endTime ? formatTime(data.endTime) : '-'}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-lg">💳</span>
              Metode Pembayaran
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Metode:</span>
                <span className="font-medium capitalize">{data.paymentMethod || 'Cash'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                  data.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {data.status === 'completed' ? 'Selesai' : 'Dalam Proses'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      {(data.treatmentNotes || data.comment) && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">📝</span>
            Catatan & Komentar
          </h4>
          <div className="space-y-3">
            {data.treatmentNotes && (
              <div>
                <span className="text-sm font-medium text-gray-600">Catatan Treatment:</span>
                <p className="text-sm mt-1 text-gray-800 bg-white p-3 rounded-lg border">
                  {data.treatmentNotes}
                </p>
              </div>
            )}
            {data.comment && (
              <div>
                <span className="text-sm font-medium text-gray-600">Komentar Customer:</span>
                <p className="text-sm mt-1 text-gray-800 bg-white p-3 rounded-lg border">
                  {data.comment}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Ratings */}
      {data.overallRating && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">⭐</span>
            Rating & Feedback
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.overallRating && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kepuasan Keseluruhan:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-lg ${star <= data.overallRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                  <span className="text-sm font-medium ml-2">{data.overallRating}/5</span>
                </div>
              </div>
            )}
            {data.serviceQuality && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kualitas Treatment:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-lg ${star <= data.serviceQuality ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                  <span className="text-sm font-medium ml-2">{data.serviceQuality}/5</span>
                </div>
              </div>
            )}
            {data.therapistService && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pelayanan Therapist:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-lg ${star <= data.therapistService ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                  <span className="text-sm font-medium ml-2">{data.therapistService}/5</span>
                </div>
              </div>
            )}
            {data.cleanliness && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kebersihan Salon:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={`text-lg ${star <= data.cleanliness ? 'text-yellow-400' : 'text-gray-300'}`}>
                      ⭐
                    </span>
                  ))}
                  <span className="text-sm font-medium ml-2">{data.cleanliness}/5</span>
                </div>
              </div>
            )}
          </div>
          {data.wouldRecommend !== undefined && (
            <div className="mt-3 pt-3 border-t">
              <span className="text-sm text-gray-600">Akan Direkomendasikan:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                data.wouldRecommend 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {data.wouldRecommend ? 'Ya' : 'Tidak'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderCustomerDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">👤</span>
            Informasi Pribadi
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nama:</span>
              <span className="font-medium">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{data.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Telepon:</span>
              <span className="font-medium">{data.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Alamat:</span>
              <span className="font-medium text-right max-w-xs">{data.address || '-'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">📊</span>
            Statistik Kunjungan
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Kunjungan:</span>
              <span className="font-medium">{data.totalVisits || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Pengeluaran:</span>
              <span className="font-medium text-green-600">{formatCurrency(data.totalSpent || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kunjungan Terakhir:</span>
              <span className="font-medium">{data.lastVisit ? formatDate(data.lastVisit) : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member Sejak:</span>
              <span className="font-medium">{data.createdAt ? formatDate(data.createdAt) : '-'}</span>
            </div>
          </div>
        </div>
      </div>

      {data.preferences && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">❤️</span>
            Preferensi Treatment
          </h4>
          <div className="space-y-2 text-sm">
            {data.preferences.map((pref: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                <span>{pref}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderTherapistDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">👩‍⚕️</span>
            Informasi Pribadi
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Nama:</span>
              <span className="font-medium">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{data.email || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Telepon:</span>
              <span className="font-medium">{data.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Alamat:</span>
              <span className="font-medium text-right max-w-xs">{data.address || '-'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">💼</span>
            Informasi Pekerjaan
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                data.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {data.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pengalaman:</span>
              <span className="font-medium">{data.experience || 0} tahun</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Treatment:</span>
              <span className="font-medium">{data.totalTreatments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rating Rata-rata:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={`text-sm ${star <= (data.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ⭐
                  </span>
                ))}
                <span className="text-sm font-medium ml-1">{(data.averageRating || 0).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {data.specializations && data.specializations.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">🎯</span>
            Spesialisasi Treatment
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.specializations.map((spec: string, index: number) => (
              <span key={index} className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.bio && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span className="text-lg">📝</span>
            Biografi
          </h4>
          <p className="text-sm text-gray-700 leading-relaxed">{data.bio}</p>
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    switch (type) {
      case 'treatment':
        return renderTreatmentDetails()
      case 'customer':
        return renderCustomerDetails()
      case 'therapist':
        return renderTherapistDetails()
      case 'booking':
        return renderTreatmentDetails() // Similar to treatment
      case 'feedback':
        return renderTreatmentDetails() // Similar to treatment
      default:
        return (
          <div className="space-y-4">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )
    }
  }

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
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${getTypeColor()} text-white p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getTypeIcon()}</span>
                <div>
                  <h3 className="text-2xl font-bold">{title}</h3>
                  <p className="text-white/80 text-sm">Detail informasi lengkap</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-white/80 text-2xl transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {renderContent()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default DataDetailModal
