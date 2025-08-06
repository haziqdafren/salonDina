'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BismillahAccent } from '@/components/ui/Typography'

interface IndonesianLayoutProps {
  children: ReactNode
  showBismillah?: boolean
  showPattern?: boolean
  className?: string
}

export default function IndonesianLayout({ 
  children, 
  showBismillah = false, 
  showPattern = true,
  className = '' 
}: IndonesianLayoutProps) {
  return (
    <div className={`min-h-screen bg-warm-cream relative overflow-hidden ${className}`}>
      {/* Islamic geometric pattern background */}
      {showPattern && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 islamic-pattern opacity-5" />
          <div className="absolute top-10 left-10 w-20 h-20 bg-cork-texture rounded-full opacity-20 gentle-float" />
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-cork-texture rounded-full opacity-20 gentle-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-cork-texture rounded-full opacity-15 gentle-float" style={{ animationDelay: '2s' }} />
        </div>
      )}

      {/* Main content container */}
      <motion.div 
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Bismillah at the top */}
        {showBismillah && (
          <div className="pt-8 pb-4">
            <BismillahAccent className="text-center" />
          </div>
        )}

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </motion.div>

      {/* Decorative elements */}
      <div className="fixed bottom-4 right-4 pointer-events-none">
        <motion.div
          className="text-dusty-pink text-2xl opacity-30"
          animate={{ 
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          🌸
        </motion.div>
      </div>

      <div className="fixed top-20 right-10 pointer-events-none">
        <motion.div
          className="text-forest-green text-lg opacity-20"
          animate={{ 
            y: [-5, 5, -5],
            x: [-2, 2, -2]
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        >
          ☪️
        </motion.div>
      </div>
    </div>
  )
}