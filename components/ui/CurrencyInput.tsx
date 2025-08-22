'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CurrencyInputProps {
  value: number | string
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
  required?: boolean
  min?: number
  max?: number
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  placeholder = "0",
  className = "",
  disabled = false,
  label,
  required = false,
  min = 0,
  max = 100000000
}) => {
  const [displayValue, setDisplayValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Format number to Indonesian Rupiah display format
  const formatCurrency = (num: number): string => {
    if (num === 0) return ''
    return new Intl.NumberFormat('id-ID').format(num)
  }

  // Parse display string back to number
  const parseCurrency = (str: string): number => {
    const cleaned = str.replace(/\D/g, '')
    return cleaned === '' ? 0 : parseInt(cleaned, 10)
  }

  // Update display value when prop value changes
  useEffect(() => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value || 0
    if (!isFocused) {
      setDisplayValue(formatCurrency(numValue))
    }
  }, [value, isFocused])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const numericValue = parseCurrency(input)
    
    // Apply min/max constraints
    const constrainedValue = Math.min(Math.max(numericValue, min), max)
    
    // Update display immediately for smooth typing
    setDisplayValue(formatCurrency(numericValue))
    
    // Call onChange with constrained value
    onChange(constrainedValue)
  }

  const handleFocus = () => {
    setIsFocused(true)
    // Show raw number for easier editing
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value || 0
    setDisplayValue(numValue === 0 ? '' : numValue.toString())
  }

  const handleBlur = () => {
    setIsFocused(false)
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value || 0
    setDisplayValue(formatCurrency(numValue))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey === true) ||
        (e.keyCode === 67 && e.ctrlKey === true) ||
        (e.keyCode === 86 && e.ctrlKey === true) ||
        (e.keyCode === 88 && e.ctrlKey === true) ||
        // Allow: home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
      return
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault()
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="salon-label flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Currency Symbol */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm z-10">
          Rp
        </div>
        
        {/* Input Field */}
        <motion.input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={isFocused ? "0" : placeholder}
          disabled={disabled}
          className={`
            salon-input pl-12 pr-4 text-right font-mono
            ${isFocused ? 'border-pink-400 ring-2 ring-pink-200' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${className}
          `}
          autoComplete="off"
        />
        
        {/* Format Helper */}
        {!isFocused && displayValue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
            IDR
          </div>
        )}
      </div>
      
      {/* Helper Text */}
      {isFocused && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-gray-500"
        >
          💡 Masukkan angka tanpa titik atau koma (contoh: 50000 untuk Rp 50.000)
        </motion.div>
      )}
    </div>
  )
}

export default CurrencyInput