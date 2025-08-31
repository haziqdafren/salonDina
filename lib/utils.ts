// Utility functions for the salon application

// Format currency for Indonesian Rupiah
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date to Indonesian locale
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

// Format time to Indonesian locale
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}