// Customer Management API - Full CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/customers - List all customers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const vip = searchParams.get('vip')
    const sortBy = searchParams.get('sortBy') || 'name'
    const order = searchParams.get('order') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    
    if (vip !== null) {
      where.isVip = vip === 'true'
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Determine sort order
    let orderBy: any = {}
    switch (sortBy) {
      case 'spending':
        orderBy = { totalSpending: order }
        break
      case 'visits':
        orderBy = { totalVisits: order }
        break
      case 'lastVisit':
        orderBy = { lastVisit: order }
        break
      default:
        orderBy = { name: order }
    }

    // Get total count for pagination
    const totalCount = await prisma.customer.count({ where })
    
    const customers = await prisma.customer.findMany({
      where,
      include: {
        bookings: {
          orderBy: { date: 'desc' },
          take: 3
        },
        dailyTreatments: {
          orderBy: { date: 'desc' },
          take: 5,
          include: {
            service: true,
            therapist: true,
            feedback: true
          }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    })

    // Format customers data
    const formattedCustomers = customers.map(customer => {
      const lastTreatment = customer.dailyTreatments[0]
      const averageSpending = customer.totalVisits > 0 ? customer.totalSpending / customer.totalVisits : 0
      
      // Calculate average rating from feedback
      const ratingsWithFeedback = customer.dailyTreatments
        .filter(t => t.feedback?.overallRating)
        .map(t => t.feedback!.overallRating)
      
      const averageRating = ratingsWithFeedback.length > 0
        ? ratingsWithFeedback.reduce((sum, rating) => sum + rating, 0) / ratingsWithFeedback.length
        : null

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        notes: customer.notes,
        totalVisits: customer.totalVisits,
        totalSpending: customer.totalSpending,
        averageSpending: Math.round(averageSpending),
        lastVisit: customer.lastVisit?.toISOString(),
        isVip: customer.isVip,
        createdAt: customer.createdAt.toISOString(),
        
        // Recent activity
        lastTreatment: lastTreatment ? {
          serviceName: lastTreatment.serviceName,
          date: lastTreatment.date.toISOString(),
          therapist: lastTreatment.therapist.fullName,
          rating: lastTreatment.feedback?.overallRating || null
        } : null,
        
        averageRating,
        
        // Upcoming bookings
        upcomingBookings: customer.bookings.filter(b => 
          new Date(b.date) >= new Date() && b.status !== 'cancelled'
        ).length,
        
        recentBookings: customer.bookings.length
      }
    })

    // Calculate summary statistics
    const summary = {
      total: totalCount,
      vip: customers.filter(c => c.isVip).length,
      newThisMonth: customers.filter(c => {
        const createdDate = new Date(c.createdAt)
        const now = new Date()
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear()
      }).length,
      totalSpending: customers.reduce((sum, c) => sum + c.totalSpending, 0),
      averageSpending: customers.length > 0 ? 
        Math.round(customers.reduce((sum, c) => sum + c.totalSpending, 0) / customers.length) : 0
    }

    return NextResponse.json({
      success: true,
      data: formattedCustomers,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      summary
    })

  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const { name, phone } = data
    
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      )
    }

    // Check if phone number already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone }
    })

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer with this phone number already exists' },
        { status: 409 }
      )
    }

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
        isVip: data.isVip || false
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        notes: customer.notes,
        totalVisits: customer.totalVisits,
        totalSpending: customer.totalSpending,
        averageSpending: 0,
        lastVisit: null,
        isVip: customer.isVip,
        createdAt: customer.createdAt.toISOString(),
        lastTreatment: null,
        averageRating: null,
        upcomingBookings: 0,
        recentBookings: 0
      }
    })

  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}