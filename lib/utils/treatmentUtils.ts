// Treatment utility functions for consistent data handling
// Replaces static data with dynamic API-based functions

export interface Treatment {
  id: string | number
  name: string
  price: number
  normalPrice?: number
  promoPrice?: number | null
  duration: number
  popularity?: number
  category: string
  description?: string
  is_active: boolean
  therapist_fee?: number
  created_at?: string
  updated_at?: string
}

// Format currency consistently across the app
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('IDR', 'Rp')
}

// Calculate total duration of selected treatments
export const calculateTotalDuration = (treatments: Treatment[]): number => {
  return treatments.reduce((total, treatment) => total + treatment.duration, 0)
}

// Calculate total price of selected treatments
export const calculateTotalPrice = (treatments: Treatment[]): number => {
  return treatments.reduce((total, treatment) => {
    return total + (treatment.promoPrice || treatment.price || treatment.normalPrice || 0)
  }, 0)
}

// Get display name for categories
export const getCategoryDisplayName = (category: string): string => {
  const displayNames: Record<string, string> = {
    'Penghilang Bulu (Wax)': 'Waxing',
    'Perawatan Tangan & Kaki': 'Mani/Pedi',
    'Terapi Bekam': 'Bekam',
    'Perawatan Tubuh': 'Body Care',
    'Perawatan Wajah': 'Facial',
    'Facial + Lumiface Treatment': 'Lumiface',
    'Perawatan Rambut': 'Hair Care',
    'Japanese Head SPA': 'Japanese SPA',
    'Paket Perawatan Wajah & Rambut': 'Face & Hair',
    'Paket Perawatan Wajah, Rambut & Tubuh': 'Full Package',
    'Paket Facial Lumiface + Rambut': 'Lumiface+',
    'Paket Pengantin': 'Bridal',
    'Paket Full': 'Premium'
  }
  return displayNames[category] || category
}

// Get icon for categories
export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'Penghilang Bulu (Wax)': '🌿',
    'Perawatan Tangan & Kaki': '💅',
    'Terapi Bekam': '🩸',
    'Perawatan Tubuh': '🧴',
    'Perawatan Wajah': '✨',
    'Facial + Lumiface Treatment': '💎',
    'Perawatan Rambut': '💇‍♀️',
    'Japanese Head SPA': '🌸',
    'Paket Perawatan Wajah & Rambut': '💄',
    'Paket Perawatan Wajah, Rambut & Tubuh': '👸',
    'Paket Facial Lumiface + Rambut': '💎',
    'Paket Pengantin': '👰‍♀️',
    'Paket Full': '🎁'
  }
  return icons[category] || '✨'
}

// Fetch treatments from API
export const fetchTreatments = async (): Promise<{ treatments: Treatment[], categories: string[] }> => {
  try {
    const response = await fetch('/api/services?active=true')
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        return {
          treatments: result.data,
          categories: result.categories || []
        }
      }
    }
    throw new Error('Failed to fetch treatments')
  } catch (error) {
    console.error('Error fetching treatments:', error)
    return { treatments: [], categories: [] }
  }
}

// Get popular treatments (sorted by popularity)
export const getPopularTreatments = (treatments: Treatment[], limit: number = 10): Treatment[] => {
  return treatments
    .filter(treatment => treatment.is_active)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit)
}

// Get treatments with promo prices
export const getPromoTreatments = (treatments: Treatment[]): Treatment[] => {
  return treatments
    .filter(treatment => treatment.is_active && treatment.promoPrice !== null)
    .sort((a, b) => {
      const discountA = (a.normalPrice || a.price || 0) - (a.promoPrice || 0)
      const discountB = (b.normalPrice || b.price || 0) - (b.promoPrice || 0)
      return discountB - discountA
    })
}

// Filter treatments by category
export const filterTreatmentsByCategory = (treatments: Treatment[], category: string): Treatment[] => {
  if (category === 'all') {
    return treatments.filter(treatment => treatment.is_active)
  }
  return treatments.filter(treatment => treatment.is_active && treatment.category === category)
}

// Search treatments by name or description
export const searchTreatments = (treatments: Treatment[], searchTerm: string): Treatment[] => {
  if (!searchTerm) return treatments.filter(treatment => treatment.is_active)
  
  const term = searchTerm.toLowerCase()
  return treatments.filter(treatment => 
    treatment.is_active && (
      treatment.name.toLowerCase().includes(term) ||
      treatment.category.toLowerCase().includes(term) ||
      (treatment.description && treatment.description.toLowerCase().includes(term))
    )
  )
}