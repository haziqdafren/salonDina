'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface PaymentMethod {
  id: string
  name: string
  type: 'ewallet' | 'bank' | 'qris' | 'cash'
  icon: string
  description: string
  isPopular?: boolean
  color: string
  processingTime: string
}

interface PaymentMethodsProps {
  selectedMethod: string | null
  onMethodSelect: (methodId: string) => void
  totalAmount: number
}

// Popular payment methods in Medan, Indonesia
const MEDAN_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'gopay',
    name: 'GoPay',
    type: 'ewallet',
    icon: '🟢',
    description: 'Bayar dengan GoPay - Praktis & Cashback',
    isPopular: true,
    color: 'bg-green-500',
    processingTime: 'Instan'
  },
  {
    id: 'ovo',
    name: 'OVO',
    type: 'ewallet',
    icon: '🟣',
    description: 'Bayar dengan OVO - Poin Rewards',
    isPopular: true,
    color: 'bg-purple-500',
    processingTime: 'Instan'
  },
  {
    id: 'dana',
    name: 'DANA',
    type: 'ewallet',
    icon: '🔵',
    description: 'Bayar dengan DANA - Aman & Mudah',
    isPopular: true,
    color: 'bg-blue-500',
    processingTime: 'Instan'
  },
  {
    id: 'qris',
    name: 'QRIS',
    type: 'qris',
    icon: '📱',
    description: 'Scan QR Universal - Semua E-wallet',
    isPopular: true,
    color: 'bg-gradient-to-r from-red-500 to-blue-500',
    processingTime: 'Instan'
  },
  {
    id: 'bca',
    name: 'BCA Transfer',
    type: 'bank',
    icon: '🏦',
    description: 'Transfer Bank BCA - Terpercaya',
    color: 'bg-blue-600',
    processingTime: '1-3 menit'
  },
  {
    id: 'mandiri',
    name: 'Mandiri Transfer',
    type: 'bank',
    icon: '🏦',
    description: 'Transfer Bank Mandiri',
    color: 'bg-yellow-600',
    processingTime: '1-3 menit'
  },
  {
    id: 'bni',
    name: 'BNI Transfer',
    type: 'bank',
    icon: '🏦',
    description: 'Transfer Bank BNI',
    color: 'bg-orange-600',
    processingTime: '1-3 menit'
  },
  {
    id: 'cash',
    name: 'Bayar di Tempat',
    type: 'cash',
    icon: '💵',
    description: 'Bayar cash langsung di salon',
    color: 'bg-green-600',
    processingTime: 'Saat treatment'
  }
]

export default function IndonesianPaymentMethods({ 
  selectedMethod, 
  onMethodSelect, 
  totalAmount 
}: PaymentMethodsProps) {
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const groupedMethods = {
    popular: MEDAN_PAYMENT_METHODS.filter(method => method.isPopular),
    ewallet: MEDAN_PAYMENT_METHODS.filter(method => method.type === 'ewallet' && !method.isPopular),
    bank: MEDAN_PAYMENT_METHODS.filter(method => method.type === 'bank'),
    other: MEDAN_PAYMENT_METHODS.filter(method => method.type === 'cash')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-salon-primary mb-2">
          Pilih Metode Pembayaran
        </h3>
        <div className="bg-gradient-to-r from-salon-primary/10 to-salon-secondary/10 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-salon-charcoal font-medium">Total Pembayaran:</span>
            <span className="text-2xl font-bold text-salon-primary">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Popular Methods - Prominent Display */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-salon-gold text-xl">⭐</span>
          <h4 className="font-bold text-salon-primary">Metode Populer di Medan</h4>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {groupedMethods.popular.map((method) => (
            <motion.div
              key={method.id}
              className={`payment-method-card ${
                selectedMethod === method.id 
                  ? 'ring-2 ring-salon-primary bg-salon-primary/5' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => onMethodSelect(method.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{method.icon}</div>
                <div className="font-bold text-sm mb-1">{method.name}</div>
                <div className="text-xs text-salon-charcoal/70">{method.processingTime}</div>
                {selectedMethod === method.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2"
                  >
                    <div className="w-6 h-6 bg-salon-primary rounded-full mx-auto flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Other Payment Methods */}
      <div className="space-y-6">
        {/* Bank Transfers */}
        <div>
          <h4 className="font-bold text-salon-primary mb-3 flex items-center gap-2">
            🏦 Transfer Bank
          </h4>
          <div className="space-y-2">
            {groupedMethods.bank.map((method) => (
              <motion.div
                key={method.id}
                className={`payment-method-row ${
                  selectedMethod === method.id 
                    ? 'ring-2 ring-salon-primary bg-salon-primary/5' 
                    : 'hover:bg-salon-surface/50'
                }`}
                onClick={() => onMethodSelect(method.id)}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-salon-charcoal/70">{method.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-salon-accent">{method.processingTime}</span>
                    {selectedMethod === method.id && (
                      <div className="w-5 h-5 bg-salon-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Cash Payment */}
        <div>
          <h4 className="font-bold text-salon-primary mb-3 flex items-center gap-2">
            💵 Pembayaran Tunai
          </h4>
          <div className="space-y-2">
            {groupedMethods.other.map((method) => (
              <motion.div
                key={method.id}
                className={`payment-method-row ${
                  selectedMethod === method.id 
                    ? 'ring-2 ring-salon-primary bg-salon-primary/5' 
                    : 'hover:bg-salon-surface/50'
                }`}
                onClick={() => onMethodSelect(method.id)}
                whileHover={{ x: 5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-salon-charcoal/70">{method.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-salon-accent">{method.processingTime}</span>
                    {selectedMethod === method.id && (
                      <div className="w-5 h-5 bg-salon-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      <AnimatePresence>
        {selectedMethod && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 bg-salon-soft-pink rounded-lg p-4"
          >
            <PaymentInstructions 
              method={MEDAN_PAYMENT_METHODS.find(m => m.id === selectedMethod)!}
              totalAmount={totalAmount}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .payment-method-card {
          @apply bg-white rounded-lg p-4 border border-salon-accent/20 cursor-pointer transition-all duration-200;
        }
        
        .payment-method-row {
          @apply bg-white rounded-lg p-4 border border-salon-accent/20 cursor-pointer transition-all duration-200;
        }
      `}</style>
    </div>
  )
}

// Payment Instructions Component
function PaymentInstructions({ method, totalAmount }: { method: PaymentMethod, totalAmount: number }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getInstructions = (method: PaymentMethod) => {
    switch (method.id) {
      case 'gopay':
      case 'ovo':  
      case 'dana':
        return [
          'Buka aplikasi ' + method.name,
          'Pilih "Bayar" atau "Pay"',
          'Scan QR code yang akan dikirim via WhatsApp',
          'Konfirmasi pembayaran',
          'Screenshot bukti transfer'
        ]
      
      case 'qris':
        return [
          'Buka aplikasi e-wallet favorit Anda',
          'Pilih "Scan QR" atau "QRIS"',
          'Scan QR code yang akan dikirim',
          'Konfirmasi pembayaran',
          'Screenshot bukti transfer'
        ]
        
      case 'bca':
        return [
          'Transfer ke: BCA 1234567890',
          'a.n. Salon Muslimah Dina',
          'Nominal: ' + formatCurrency(totalAmount),
          'Kirim bukti transfer via WhatsApp',
          'Booking dikonfirmasi setelah transfer'
        ]
        
      case 'mandiri':
        return [
          'Transfer ke: Mandiri 9876543210',
          'a.n. Salon Muslimah Dina',
          'Nominal: ' + formatCurrency(totalAmount),
          'Kirim bukti transfer via WhatsApp',
          'Booking dikonfirmasi setelah transfer'
        ]
        
      case 'bni':
        return [
          'Transfer ke: BNI 5555666677',
          'a.n. Salon Muslimah Dina',
          'Nominal: ' + formatCurrency(totalAmount),
          'Kirim bukti transfer via WhatsApp',
          'Booking dikonfirmasi setelah transfer'
        ]
        
      case 'cash':
        return [
          'Bayar langsung saat datang ke salon',
          'Lokasi: Jl. Setia Budi No. 45B, Medan',
          'Siapkan uang pas: ' + formatCurrency(totalAmount),
          'Atau tersedia kembalian',
          'Booking tetap terkonfirmasi'
        ]
        
      default:
        return ['Instruksi akan dikirim via WhatsApp']
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{method.icon}</span>
        <span className="font-bold text-salon-primary">
          Instruksi Pembayaran {method.name}
        </span>
      </div>
      
      <div className="space-y-2">
        {getInstructions(method).map((instruction, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-salon-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-salon-primary">
                {index + 1}
              </span>
            </div>
            <span className="text-sm text-salon-charcoal">{instruction}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-salon-islamic/10 rounded-lg">
        <div className="flex items-center gap-2 text-salon-islamic">
          <span>💬</span>
          <span className="text-sm font-medium">
            Butuh bantuan? Chat WhatsApp kami untuk panduan lebih detail!
          </span>
        </div>
      </div>
    </div>
  )
}