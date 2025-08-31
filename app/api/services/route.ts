// Updated Service/Treatment Management API - Works with Supabase schema
import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../lib/prisma'

// GET /api/services - List all services with optional filtering
export async function GET(request: NextRequest) {
  if (!isDatabaseAvailable() || !prisma) {
    return NextResponse.json({ 
      success: false, 
      error: 'Database not configured',
      data: [],
      categories: [],
      total: 0
    }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const popular = searchParams.get('popular')

    const where: any = {}
    
    if (active !== null) {
      where.isActive = active === 'true'
    }
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    let orderBy: any = { name: 'asc' }
    
    if (popular === 'true') {
      orderBy = { normalPrice: 'desc' } // Order by price as popularity indicator
    }

    const services = await prisma!.service.findMany({
      where,
      orderBy
    })

    // Format services for frontend (matching expected interface)
    const servicesWithStats = services.map(service => ({
      id: service.id.toString(),
      name: service.name,
      category: service.category,
      normalPrice: service.normalPrice,
      promoPrice: service.promoPrice,
      duration: service.duration,
      description: service.description || '',
      isActive: service.isActive,
      therapistFee: service.therapistFee,
      // Frontend compatibility
      popularity: service.normalPrice, // Use price as popularity indicator
      recentBookings: 0, // Will be calculated if needed
      totalRevenue: 0,
      averagePrice: service.promoPrice || service.normalPrice
    }))

    // Get categories for filtering
    const categories = [...new Set(services.map(s => s.category))].sort()

    return NextResponse.json({
      success: true,
      data: servicesWithStats,
      total: servicesWithStats.length,
      categories,
      summary: {
        total: servicesWithStats.length,
        active: servicesWithStats.filter(s => s.isActive).length,
        inactive: servicesWithStats.filter(s => !s.isActive).length,
        withPromo: servicesWithStats.filter(s => s.promoPrice).length
      }
    })

  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch services',
      details: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      categories: [],
      total: 0
    }, { status: 500 })
  }
}

// POST /api/services - Create new service
export async function POST(request: NextRequest) {
  if (!isDatabaseAvailable() || !prisma) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  try {
    const data = await request.json()
    
    // Validate required fields
    const { name, category, normalPrice, duration, therapistFee } = data
    
    if (!name || !category || !normalPrice || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, category, normalPrice, duration)' },
        { status: 400 }
      )
    }

    // Check if service name already exists
    const existingService = await prisma!.service.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    })

    if (existingService) {
      return NextResponse.json(
        { success: false, error: 'Service with this name already exists' },
        { status: 409 }
      )
    }

    // Create service with new schema
    const service = await prisma!.service.create({
      data: {
        name,
        category,
        normalPrice: parseInt(normalPrice),
        promoPrice: data.promoPrice ? parseInt(data.promoPrice) : null,
        duration: parseInt(duration),
        description: data.description || `${category} - ${name}`,
        therapistFee: therapistFee ? parseInt(therapistFee) : 0,
        isActive: data.isActive !== false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      data: {
        id: service.id.toString(),
        name: service.name,
        category: service.category,
        normalPrice: service.normalPrice,
        promoPrice: service.promoPrice,
        duration: service.duration,
        description: service.description,
        therapistFee: service.therapistFee,
        isActive: service.isActive,
        popularity: service.normalPrice,
        recentBookings: 0,
        totalRevenue: 0,
        averagePrice: service.normalPrice
      }
    })

  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create service',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}