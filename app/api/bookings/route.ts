// Booking Management API - Full CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/bookings - List all bookings with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (date) {
      const searchDate = new Date(date)
      const startOfDay = new Date(searchDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(searchDate)
      endOfDay.setHours(23, 59, 59, 999)
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay
      }
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { service: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const totalCount = await prisma.booking.count({ where })
    
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: true
      },
      orderBy: [
        { date: 'desc' },
        { time: 'asc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    // Format bookings for frontend
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      customerName: booking.customerName,
      phone: booking.phone,
      service: booking.service,
      servicePrice: booking.servicePrice,
      date: booking.date.toISOString(),
      time: booking.time,
      status: booking.status,
      notes: booking.notes,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      // Customer info if exists
      customerInfo: booking.customer ? {
        totalVisits: booking.customer.totalVisits,
        totalSpending: booking.customer.totalSpending,
        isVip: booking.customer.isVip,
        lastVisit: booking.customer.lastVisit?.toISOString()
      } : null
    }))

    // Get summary statistics
    const today = new Date()
    const startOfToday = new Date(today)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)

    const todayBookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday
        }
      }
    })

    const summary = {
      total: totalCount,
      today: {
        total: todayBookings.length,
        confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
        pending: todayBookings.filter(b => b.status === 'pending').length,
        completed: todayBookings.filter(b => b.status === 'completed').length,
        cancelled: todayBookings.filter(b => b.status === 'cancelled').length,
        revenue: todayBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.servicePrice, 0)
      }
    }

    return NextResponse.json({
      success: true,
      data: formattedBookings,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      summary
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const { customerName, phone, service, servicePrice, date, time } = data
    
    if (!customerName || !phone || !service || !servicePrice || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate date is not in the past
    const bookingDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (bookingDate < today) {
      return NextResponse.json(
        { success: false, error: 'Cannot book for past dates' },
        { status: 400 }
      )
    }

    // Check for existing customer
    let customerId = null
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone }
    })

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else if (data.createCustomer) {
      // Create new customer if requested
      const newCustomer = await prisma.customer.create({
        data: {
          name: customerName,
          phone,
          email: data.email || null,
          address: data.address || null,
          notes: data.customerNotes || null
        }
      })
      customerId = newCustomer.id
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customerId,
        customerName,
        phone,
        service,
        servicePrice: parseInt(servicePrice),
        date: new Date(date),
        time,
        status: data.status || 'pending',
        notes: data.notes || null
      },
      include: {
        customer: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        customerName: booking.customerName,
        phone: booking.phone,
        service: booking.service,
        servicePrice: booking.servicePrice,
        date: booking.date.toISOString(),
        time: booking.time,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt.toISOString(),
        customerInfo: booking.customer ? {
          totalVisits: booking.customer.totalVisits,
          totalSpending: booking.customer.totalSpending,
          isVip: booking.customer.isVip
        } : null
      }
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}