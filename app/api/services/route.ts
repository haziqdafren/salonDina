// Service/Treatment Management API - Full CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/services - List all services with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const popular = searchParams.get('popular') // Get popular services

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
      orderBy = { popularity: 'desc' }
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        dailyTreatments: {
          where: {
            date: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) // Last 30 days
            }
          }
        }
      },
      orderBy
    })

    // Calculate service statistics
    const servicesWithStats = services.map(service => {
      const recentBookings = service.dailyTreatments.length
      const totalRevenue = service.dailyTreatments.reduce((sum, treatment) => 
        sum + treatment.servicePrice, 0
      )

      return {
        id: service.id,
        name: service.name,
        category: service.category,
        hargaNormal: service.normalPrice,
        hargaPromo: service.promoPrice,
        duration: service.duration,
        description: service.description,
        isActive: service.isActive,
        popularity: service.popularity,
        // Statistics
        recentBookings,
        totalRevenue,
        averagePrice: recentBookings > 0 ? Math.round(totalRevenue / recentBookings) : service.normalPrice,
        // Raw data
        _raw: service
      }
    })

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
        withPromo: servicesWithStats.filter(s => s.hargaPromo).length
      }
    })

  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// POST /api/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const { name, category, normalPrice, duration } = data
    
    if (!name || !category || !normalPrice || !duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, category, normalPrice, duration)' },
        { status: 400 }
      )
    }

    // Check if service name already exists in this category
    const existingService = await prisma.service.findFirst({
      where: { 
        name,
        category 
      }
    })

    if (existingService) {
      return NextResponse.json(
        { success: false, error: 'Service with this name already exists in this category' },
        { status: 409 }
      )
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name,
        category,
        normalPrice: parseInt(normalPrice),
        promoPrice: data.promoPrice ? parseInt(data.promoPrice) : null,
        duration: parseInt(duration),
        description: data.description || `${category} - ${name}`,
        isActive: data.isActive !== false,
        popularity: data.popularity || 0
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: service.id,
        name: service.name,
        category: service.category,
        hargaNormal: service.normalPrice,
        hargaPromo: service.promoPrice,
        duration: service.duration,
        description: service.description,
        isActive: service.isActive,
        popularity: service.popularity,
        recentBookings: 0,
        totalRevenue: 0,
        averagePrice: service.normalPrice
      }
    })

  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    )
  }
}