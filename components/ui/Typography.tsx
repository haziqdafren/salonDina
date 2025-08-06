'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface TypographyProps {
  children: ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'elegant'
  className?: string
  animate?: boolean
}

export function Typography({ 
  children, 
  variant = 'body', 
  className = '', 
  animate = false 
}: TypographyProps) {
  const baseClasses = 'text-deep-charcoal'
  
  const variantClasses = {
    h1: 'font-amatic text-4xl tablet:text-5xl laptop:text-6xl font-bold handwritten text-forest-green',
    h2: 'font-amatic text-3xl tablet:text-4xl laptop:text-5xl font-bold handwritten text-forest-green',
    h3: 'font-amatic text-2xl tablet:text-3xl laptop:text-4xl font-bold handwritten text-forest-green',
    h4: 'font-amatic text-xl tablet:text-2xl laptop:text-3xl font-bold handwritten text-forest-green',
    body: 'font-kalam text-base tablet:text-lg clean-text text-indonesian',
    caption: 'font-inter text-sm tablet:text-base text-soft-brown',
    elegant: 'font-dancing text-lg tablet:text-xl laptop:text-2xl elegant-script text-dusty-mauve'
  }

  const Component = animate ? motion.div : 'div'
  const Tag = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p'

  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" as const }
  } : {}

  if (animate) {
    return (
      <Component {...animationProps}>
        <Tag className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
          {children}
        </Tag>
      </Component>
    )
  }

  return (
    <Tag className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </Tag>
  )
}

export function BismillahAccent({ className = '' }: { className?: string }) {
  return (
    <motion.div 
      className={`bismillah-accent ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
    </motion.div>
  )
}

export function WelcomeGreeting({ 
  name, 
  className = '' 
}: { 
  name?: string
  className?: string 
}) {
  return (
    <motion.div 
      className={`font-kalam text-forest-green ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <p className="text-lg">Assalamu&apos;alaikum wa rahmatullahi wa barakatuh</p>
      {name && (
        <p className="text-base mt-1 text-soft-brown">
          Selamat datang kembali, <span className="font-dancing text-dusty-mauve">{name}</span>
        </p>
      )}
    </motion.div>
  )
}