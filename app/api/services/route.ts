import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

// Fallback services data (same as before)
const FALLBACK_SERVICES = [
  { 
    id: 1, 
    name: 'Facial Acne', 
    category: 'facial', 
    price: 35000, 
    duration: 60, 
    description: 'Perawatan wajah untuk kulit berjerawat', 
    therapist_fee: 15000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 2, 
    name: 'Facial Brightening', 
    category: 'facial', 
    price: 40000, 
    duration: 60, 
    description: 'Facial pencerah wajah alami', 
    therapist_fee: 15000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 3, 
    name: 'Facial Anti Aging', 
    category: 'facial', 
    price: 50000, 
    duration: 75, 
    description: 'Perawatan anti penuaan dini', 
    therapist_fee: 20000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 4, 
    name: 'Facial Whitening', 
    category: 'facial', 
    price: 45000, 
    duration: 60, 
    description: 'Facial pemutih wajah', 
    therapist_fee: 17500, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 5, 
    name: 'Facial Basic', 
    category: 'facial', 
    price: 30000, 
    duration: 45, 
    description: 'Perawatan wajah dasar', 
    therapist_fee: 12500, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 6, 
    name: 'Hair Spa Creambath', 
    category: 'hair_spa', 
    price: 25000, 
    duration: 45, 
    description: 'Creambath dengan vitamin rambut', 
    therapist_fee: 10000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 7, 
    name: 'Hair Spa Protein', 
    category: 'hair_spa', 
    price: 35000, 
    duration: 60, 
    description: 'Perawatan protein untuk rambut rusak', 
    therapist_fee: 15000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 8, 
    name: 'Hair Spa Smoothing', 
    category: 'hair_spa', 
    price: 150000, 
    duration: 120, 
    description: 'Perawatan pelurus rambut alami', 
    therapist_fee: 50000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 9, 
    name: 'Hair Spa Keratin', 
    category: 'hair_spa', 
    price: 200000, 
    duration: 150, 
    description: 'Treatment keratin untuk rambut sehat', 
    therapist_fee: 75000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 10, 
    name: 'Full Body Massage', 
    category: 'body_treatment', 
    price: 60000, 
    duration: 90, 
    description: 'Pijat seluruh tubuh relaksasi', 
    therapist_fee: 25000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 11, 
    name: 'Aromatherapy Massage', 
    category: 'body_treatment', 
    price: 70000, 
    duration: 90, 
    description: 'Pijat aromaterapi dengan essential oil', 
    therapist_fee: 30000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 12, 
    name: 'Hot Stone Massage', 
    category: 'body_treatment', 
    price: 85000, 
    duration: 90, 
    description: 'Pijat dengan batu panas', 
    therapist_fee: 35000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 13, 
    name: 'Body Scrub', 
    category: 'body_treatment', 
    price: 50000, 
    duration: 60, 
    description: 'Lulur seluruh tubuh', 
    therapist_fee: 20000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  { 
    id: 14, 
    name: 'Body Whitening', 
    category: 'body_treatment', 
    price: 75000, 
    duration: 75, 
    description: 'Perawatan pemutih badan', 
    therapist_fee: 30000, 
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
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

  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, using fallback data')
    let filteredServices = [...FALLBACK_SERVICES]
    
    if (active === 'true') {
      filteredServices = filteredServices.filter(s => s.is_active)
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
      message: 'Using fallback data - Supabase not configured',
      source: 'fallback'
    })
  }

  try {
    // Build query
    if (!supabase) throw new Error('Supabase not initialized')
    
    // Use correct table name 'Service'
    let query = supabase.from('Service').select('*')
    
    // Build the query with correct field names
    if (active === 'true') {
      query = query.eq('isActive', true)
    }
    
    if (category && category !== 'semua') {
      query = query.eq('category', category)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: services, error } = await query.order('name', { ascending: true })

    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }

    // Map database fields to expected format (using exact DB field names)
    const mappedServices = (services || []).map(service => ({
      id: service.id,
      name: service.name,
      category: service.category,
      price: service.normalPrice, // Primary price field
      normalPrice: service.normalPrice, 
      promoPrice: service.promoPrice,
      duration: service.duration || 60,
      description: service.description || '',
      therapist_fee: service.therapistFee || 0,
      is_active: service.isActive !== false, // Map isActive -> is_active for frontend compatibility
      created_at: service.createdAt,
      updated_at: service.updatedAt,
      popularity: service.popularity || 0
    }))

    // Generate categories from actual data
    const categoryMap = new Map()
    mappedServices.forEach(service => {
      if (service.is_active && service.category) {
        const category = service.category
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
      }
    })

    const actualCategories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count
    }))

    return NextResponse.json({
      success: true,
      data: mappedServices,
      categories: actualCategories,
      total: mappedServices.length,
      message: 'Services loaded successfully from Supabase',
      source: 'supabase'
    })

  } catch (error) {
    console.error('Services API error:', error)
    
    // Return fallback data on any error
    let filteredServices = [...FALLBACK_SERVICES]
    
    if (active === 'true') {
      filteredServices = filteredServices.filter(s => s.is_active)
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
      message: 'Using fallback data - Supabase error',
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}