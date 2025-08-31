import { NextRequest, NextResponse } from 'next/server'

// Complete services data - no database required
const SALON_SERVICES = [
  { 
    id: 1, 
    name: 'Facial Acne', 
    category: 'facial', 
    price: 35000, 
    duration: 60, 
    description: 'Perawatan wajah untuk kulit berjerawat', 
    therapistFee: 15000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 2, 
    name: 'Facial Brightening', 
    category: 'facial', 
    price: 40000, 
    duration: 60, 
    description: 'Facial pencerah wajah alami', 
    therapistFee: 15000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 3, 
    name: 'Facial Anti Aging', 
    category: 'facial', 
    price: 50000, 
    duration: 75, 
    description: 'Perawatan anti penuaan dini', 
    therapistFee: 20000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 4, 
    name: 'Facial Whitening', 
    category: 'facial', 
    price: 45000, 
    duration: 60, 
    description: 'Facial pemutih wajah', 
    therapistFee: 17500, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 5, 
    name: 'Facial Basic', 
    category: 'facial', 
    price: 30000, 
    duration: 45, 
    description: 'Perawatan wajah dasar', 
    therapistFee: 12500, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 6, 
    name: 'Hair Spa Creambath', 
    category: 'hair_spa', 
    price: 25000, 
    duration: 45, 
    description: 'Creambath dengan vitamin rambut', 
    therapistFee: 10000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 7, 
    name: 'Hair Spa Protein', 
    category: 'hair_spa', 
    price: 35000, 
    duration: 60, 
    description: 'Perawatan protein untuk rambut rusak', 
    therapistFee: 15000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 8, 
    name: 'Hair Spa Smoothing', 
    category: 'hair_spa', 
    price: 150000, 
    duration: 120, 
    description: 'Perawatan pelurus rambut alami', 
    therapistFee: 50000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 9, 
    name: 'Hair Spa Keratin', 
    category: 'hair_spa', 
    price: 200000, 
    duration: 150, 
    description: 'Treatment keratin untuk rambut sehat', 
    therapistFee: 75000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 10, 
    name: 'Full Body Massage', 
    category: 'body_treatment', 
    price: 60000, 
    duration: 90, 
    description: 'Pijat seluruh tubuh relaksasi', 
    therapistFee: 25000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 11, 
    name: 'Aromatherapy Massage', 
    category: 'body_treatment', 
    price: 70000, 
    duration: 90, 
    description: 'Pijat aromaterapi dengan essential oil', 
    therapistFee: 30000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 12, 
    name: 'Hot Stone Massage', 
    category: 'body_treatment', 
    price: 85000, 
    duration: 90, 
    description: 'Pijat dengan batu panas', 
    therapistFee: 35000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 13, 
    name: 'Body Scrub', 
    category: 'body_treatment', 
    price: 50000, 
    duration: 60, 
    description: 'Lulur seluruh tubuh', 
    therapistFee: 20000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  { 
    id: 14, 
    name: 'Body Whitening', 
    category: 'body_treatment', 
    price: 75000, 
    duration: 75, 
    description: 'Perawatan pemutih badan', 
    therapistFee: 30000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const CATEGORIES = [
  { name: 'facial', count: 5 },
  { name: 'hair_spa', count: 4 },
  { name: 'body_treatment', count: 5 }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const active = searchParams.get('active')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  // Filter services based on parameters
  let filteredServices = [...SALON_SERVICES]
  
  if (active === 'true') {
    filteredServices = filteredServices.filter(s => s.isActive)
  }
  
  if (category && category !== 'semua') {
    filteredServices = filteredServices.filter(s => s.category === category)
  }
  
  if (search) {
    filteredServices = filteredServices.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    )
  }

  return NextResponse.json({
    success: true,
    data: filteredServices,
    categories: CATEGORIES,
    total: filteredServices.length,
    message: '✅ Services loaded successfully from static data',
    source: 'static'
  })
}