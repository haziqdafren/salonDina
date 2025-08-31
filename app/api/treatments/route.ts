// Updated Daily Treatment Management API - CRUD Operations with new schema
import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../lib/prisma'

// GET /api/treatments - List all treatments with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const therapistId = searchParams.get('therapistId')
    const customerId = searchParams.get('customerId')
    const serviceId = searchParams.get('serviceId')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    
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
    
    if (therapistId) {
      where.therapistId = therapistId
    }
    
    if (customerId) {
      where.customerId = customerId
    }
    
    if (serviceId) {
      where.serviceId = serviceId
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { serviceName: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const totalCount = await prisma.dailyTreatment.count({ where })
    
    const treatments = await prisma.dailyTreatment.findMany({
      where,
      include: {
        customer: true,
        service: true,
        therapist: true,
        feedback: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    // Format treatments data
    const formattedTreatments = treatments.map(treatment => ({
      id: treatment.id,
      date: treatment.date.toISOString(),
      customerName: treatment.customerName,
      serviceName: treatment.serviceName,
      servicePrice: treatment.servicePrice,
      therapistName: treatment.therapist.fullName,
      therapistInitial: treatment.therapist.initial,
      startTime: treatment.startTime,
      endTime: treatment.endTime,
      tipAmount: treatment.tipAmount,
      paymentMethod: treatment.paymentMethod,
      notes: treatment.notes,
      createdAt: treatment.createdAt.toISOString(),
      
      // Customer info
      customer: treatment.customer ? {
        id: treatment.customer.id,
        phone: treatment.customer.phone,
        email: treatment.customer.email,
        totalVisits: treatment.customer.totalVisits,
        isVip: treatment.customer.isVip
      } : null,
      
      // Service info
      service: {
        id: treatment.service.id,
        category: treatment.service.category,
        duration: treatment.service.duration,
        normalPrice: treatment.service.normalPrice,
        promoPrice: treatment.service.promoPrice
      },
      
      // Feedback info
      feedback: treatment.feedback ? {
        overallRating: treatment.feedback.overallRating,
        serviceQuality: treatment.feedback.serviceQuality,
        therapistService: treatment.feedback.therapistService,
        cleanliness: treatment.feedback.cleanliness,
        valueForMoney: treatment.feedback.valueForMoney,
        comment: treatment.feedback.comment,
        wouldRecommend: treatment.feedback.wouldRecommend
      } : null,
      
      // Calculate therapist earnings for this treatment
      therapistEarnings: treatment.therapist.baseFeePerTreatment + 
        (treatment.servicePrice * treatment.therapist.commissionRate) + 
        treatment.tipAmount
    }))

    // Calculate summary statistics
    const totalRevenue = treatments.reduce((sum, t) => sum + t.servicePrice, 0)
    const totalTips = treatments.reduce((sum, t) => sum + t.tipAmount, 0)
    const totalTherapistEarnings = formattedTreatments.reduce((sum, t) => sum + t.therapistEarnings, 0)

    return NextResponse.json({
      success: true,
      data: formattedTreatments,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      summary: {
        total: totalCount,
        totalRevenue,
        totalTips,
        totalTherapistEarnings: Math.round(totalTherapistEarnings),
        averageServicePrice: totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0,
        averageTip: totalCount > 0 ? Math.round(totalTips / totalCount) : 0
      }
    })

  } catch (error) {
    console.error('Error fetching treatments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch treatments' },
      { status: 500 }
    )
  }
}

// POST /api/treatments - Create new treatment (manual entry)
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const { date, customerName, serviceId, therapistId, servicePrice } = data
    
    if (!date || !customerName || !serviceId || !therapistId || !servicePrice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get service and therapist details
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId }
    })

    if (!therapist) {
      return NextResponse.json(
        { success: false, error: 'Therapist not found' },
        { status: 404 }
      )
    }

    // Find or create customer if phone provided
    let customerId = data.customerId || null
    if (data.phone && !customerId) {
      const customer = await prisma.customer.findUnique({
        where: { phone: data.phone }
      })
      customerId = customer?.id || null
    }

    // Create treatment
    const treatment = await prisma.dailyTreatment.create({
      data: {
        date: new Date(date),
        customerId,
        customerName,
        serviceId,
        serviceName: service.name,
        servicePrice: parseInt(servicePrice),
        therapistId,
        tipAmount: data.tipAmount || 0,
        paymentMethod: data.paymentMethod || 'cash',
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        notes: data.notes || null
      },
      include: {
        customer: true,
        service: true,
        therapist: true
      }
    })

    // Update related records
    await Promise.all([
      // Update customer stats if customer exists
      customerId && prisma.customer.update({
        where: { id: customerId },
        data: {
          totalVisits: { increment: 1 },
          totalSpending: { increment: parseInt(servicePrice) },
          lastVisit: new Date(date)
        }
      }),
      
      // Update service popularity
      prisma.service.update({
        where: { id: serviceId },
        data: { popularity: { increment: 1 } }
      }),
      
      // Update therapist stats
      prisma.therapist.update({
        where: { id: therapistId },
        data: {
          totalTreatments: { increment: 1 },
          totalEarnings: { 
            increment: Math.round(
              therapist.baseFeePerTreatment + 
              (parseInt(servicePrice) * therapist.commissionRate) + 
              (data.tipAmount || 0)
            )
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        id: treatment.id,
        date: treatment.date.toISOString(),
        customerName: treatment.customerName,
        serviceName: treatment.serviceName,
        servicePrice: treatment.servicePrice,
        therapistName: treatment.therapist.fullName,
        therapistInitial: treatment.therapist.initial,
        startTime: treatment.startTime,
        endTime: treatment.endTime,
        tipAmount: treatment.tipAmount,
        paymentMethod: treatment.paymentMethod,
        notes: treatment.notes,
        therapistEarnings: Math.round(
          therapist.baseFeePerTreatment + 
          (treatment.servicePrice * therapist.commissionRate) + 
          treatment.tipAmount
        )
      }
    })

  } catch (error) {
    console.error('Error creating treatment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create treatment' },
      { status: 500 }
    )
  }
}