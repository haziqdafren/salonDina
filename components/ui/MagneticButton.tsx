'use client'

import { motion } from 'framer-motion'
import { ReactNode, MouseEvent } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function MagneticButton({ 
  children, 
  onClick, 
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = ''
}: MagneticButtonProps) {
  const baseClasses = 'magnetic-btn relative font-amatic font-bold text-deep-charcoal rounded-lg transition-all duration-300 hover:shadow-warm focus:outline-none focus:ring-2 focus:ring-gold-accent focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-gradient-to-br from-dusty-pink to-dusty-mauve text-paper-white hover:from-dusty-mauve hover:to-dusty-pink',
    secondary: 'bg-gradient-to-br from-warm-cream to-paper-white text-deep-charcoal border-2 border-dusty-pink hover:bg-dusty-pink hover:text-paper-white',
    outline: 'bg-transparent border-2 border-forest-green text-forest-green hover:bg-forest-green hover:text-paper-white'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-lg',
    md: 'px-6 py-3 text-xl',
    lg: 'px-8 py-4 text-2xl'
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={{ 
        scale: 1.05, 
        rotate: [0, 1, -1, 0],
        transition: { duration: 0.3 } 
      }}
      whileTap={{ 
        scale: 0.95,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        className="relative z-10 block"
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 } 
        }}
      >
        {children}
      </motion.span>
    </motion.button>
  )
}