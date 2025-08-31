import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../lib/prisma'

// Fallback mock data - always available
const FALLBACK_SERVICES = [
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
    id: 5, 
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
    id: 6, 
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
    id: 7, 
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
    id: 8, 
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
    id: 9, 
    name: 'Body Scrub', 
    category: 'body_treatment', 
    price: 50000, 
    duration: 60, 
    description: 'Lulur seluruh tubuh', 
    therapistFee: 20000, 
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const FALLBACK_CATEGORIES = [
  { name: 'facial', count: 3 },
  { name: 'hair_spa', count: 3 },
  { name: 'body_treatment', count: 3 }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const active = searchParams.get('active')
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  // LAYER 1: Try database connection
  if (!isDatabaseAvailable() || !prisma) {
    console.log('Database not available, using fallback data')
    return NextResponse.json({
      success: true,
      data: FALLBACK_SERVICES.filter(s => active !== 'true' || s.isActive),
      categories: FALLBACK_CATEGORIES,
      total: FALLBACK_SERVICES.length,
      fallback: 'no_database',
      message: 'Using fallback data - database not configured'
    })
  }

  try {
    // LAYER 2: Try database operations
    await prisma.$connect()
    
    // Auto-populate if empty
    let serviceCount = 0
    try {
      serviceCount = await prisma.service.count()
      
      if (serviceCount === 0) {
        console.log('Database empty, auto-populating...')
        await prisma.service.createMany({
          data: FALLBACK_SERVICES.map(service => ({
            name: service.name,
            category: service.category,
            price: service.price,
            duration: service.duration,
            description: service.description,
            therapistFee: service.therapistFee,
            isActive: service.isActive
          }))
        })
      }
    } catch (populationError) {
      console.error('Auto-population failed:', populationError)
      // Continue with existing data or fallback
    }

    // Build query filters
    const where: any = {}
    
    if (active === 'true') {
      where.isActive = true
    }
    
    if (category && category !== 'semua') {
      where.category = category
    }
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    // LAYER 3: Try to fetch from database
    const services = await prisma.service.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        description: true,
        category: true,
        therapistFee: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const categories = await prisma.service.groupBy({
      by: ['category'],
      where: active === 'true' ? { isActive: true } : {},
      _count: {
        category: true
      },
      orderBy: {
        category: 'asc'
      }
    })

    const categoriesWithCount = categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }))

    return NextResponse.json({
      success: true,
      data: services,
      categories: categoriesWithCount,
      total: services.length,
      source: 'database'
    })

  } catch (error) {
    console.error('Services API error:', error)
    
    // LAYER 4: Final fallback with filtered mock data
    let filteredServices = FALLBACK_SERVICES
    
    if (active === 'true') {
      filteredServices = filteredServices.filter(s => s.isActive)
    }
    
    if (category && category !== 'semua') {
      filteredServices = filteredServices.filter(s => s.category === category)
    }
    
    if (search) {
      filteredServices = filteredServices.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredServices,
      categories: FALLBACK_CATEGORIES,
      total: filteredServices.length,
      fallback: 'database_error',
      error: 'Database connection failed, using mock data'
    })
  }
}