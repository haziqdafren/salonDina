// Floating WhatsApp Contact Button
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const WhatsAppFloat = () => {
  const [isHovered, setIsHovered] = useState(false)

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(`Assalamu'alaikum Kak Dina! 🌸

Saya mau tanya-tanya tentang treatment di salon. Bisa dibantu ya kak?

📍 Saya dari Medan
💄 Ingin konsultasi treatment yang cocok

Jazakillahu khairan 🤲`)
    
    const whatsappUrl = `https://wa.me/6281234567890?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200 }}
    >
      <motion.button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 group"
        style={{ borderRadius: '50%' }}
      >
        {/* WhatsApp Icon */}
        <motion.svg 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          animate={isHovered ? { rotate: 5 } : { rotate: 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
        </motion.svg>

        {/* Notification Dot */}
        <motion.div
          animate={isHovered ? { scale: 0 } : { scale: [1, 1.2, 1] }}
          transition={{ duration: isHovered ? 0.2 : 2, repeat: isHovered ? 0 : Infinity }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
        >
          !
        </motion.div>

        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 text-white px-4 py-2 text-sm font-medium whitespace-nowrap shadow-lg"
              style={{ 
                backgroundColor: 'var(--salon-charcoal)',
                borderRadius: '15px 5px 15px 5px'
              }}
            >
              Chat Dina Langsung 💬
              <div 
                className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45"
                style={{ backgroundColor: 'var(--salon-charcoal)' }}
              ></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse Animation */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-green-400 rounded-full -z-10"
      />

      {/* Secondary smaller pulse */}
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        className="absolute inset-0 bg-green-300 rounded-full -z-20"
      />
    </motion.div>
  )
}

export default WhatsAppFloat