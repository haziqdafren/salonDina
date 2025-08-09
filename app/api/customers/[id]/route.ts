// Individual Customer API - GET, PUT, DELETE operations
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/customers/[id] - Get single customer with detailed history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        bookings: {
          orderBy: { date: 'desc' },
          include: {
            customer: false
          }
        },
        dailyTreatments: {
          orderBy: { date: 'desc' },
          include: {
            service: true,
            therapist: true,
            feedback: true
          }
        },
        feedback: {
          orderBy: { createdAt: 'desc' },
          include: {
            dailyTreatment: {
              include: {
                service: true,
                therapist: true
              }
            }
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Calculate detailed statistics
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    const thisMonthTreatments = customer.dailyTreatments.filter(t => {
      const treatmentDate = new Date(t.date)
      return treatmentDate.getMonth() + 1 === currentMonth && treatmentDate.getFullYear() === currentYear
    })

    const thisMonthSpending = thisMonthTreatments.reduce((sum, t) => sum + t.servicePrice, 0)
    
    // Calculate service preferences
    const servicePreferences = customer.dailyTreatments.reduce((acc, treatment) => {
      const serviceName = treatment.serviceName
      if (!acc[serviceName]) {
        acc[serviceName] = {
          name: serviceName,
          count: 0,
          totalSpent: 0
        }
      }
      acc[serviceName].count++
      acc[serviceName].totalSpent += treatment.servicePrice
      return acc
    }, {} as any)

    const topServices = Object.values(servicePreferences)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 3)

    // Calculate therapist preferences
    const therapistPreferences = customer.dailyTreatments.reduce((acc, treatment) => {
      const therapistName = treatment.therapist.fullName
      const therapistInitial = treatment.therapist.initial
      if (!acc[therapistName]) {
        acc[therapistName] = {
          name: therapistName,
          initial: therapistInitial,
          count: 0,
          totalSpent: 0
        }
      }
      acc[therapistName].count++
      acc[therapistName].totalSpent += treatment.servicePrice
      return acc
    }, {} as any)

    const favoriteTherapists = Object.values(therapistPreferences)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 3)

    // Calculate average rating
    const ratingsWithFeedback = customer.dailyTreatments
      .filter(t => t.feedback?.overallRating)
      .map(t => t.feedback!.overallRating)
    
    const averageRating = ratingsWithFeedback.length > 0
      ? ratingsWithFeedback.reduce((sum, rating) => sum + rating, 0) / ratingsWithFeedback.length
      : null

    // Get upcoming bookings
    const upcomingBookings = customer.bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return bookingDate >= today && booking.status !== 'cancelled'
    })

    // Calculate visit frequency
    const firstVisit = customer.dailyTreatments[customer.dailyTreatments.length - 1]
    const visitFrequency = firstVisit ? {
      daysSinceFirst: Math.floor((new Date().getTime() - new Date(firstVisit.date).getTime()) / (1000 * 60 * 60 * 24)),
      averageDaysBetweenVisits: customer.totalVisits > 1 ? 
        Math.floor((new Date().getTime() - new Date(firstVisit.date).getTime()) / (1000 * 60 * 60 * 24) / (customer.totalVisits - 1))
        : null
    } : null

    return NextResponse.json({
      success: true,
      data: {
        // Basic info
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        notes: customer.notes,
        totalVisits: customer.totalVisits,
        totalSpending: customer.totalSpending,
        averageSpending: customer.totalVisits > 0 ? Math.round(customer.totalSpending / customer.totalVisits) : 0,
        lastVisit: customer.lastVisit?.toISOString(),
        isVip: customer.isVip,
        createdAt: customer.createdAt.toISOString(),
        
        // This month statistics
        thisMonth: {
          visits: thisMonthTreatments.length,
          spending: thisMonthSpending
        },
        
        // Preferences and patterns
        averageRating,
        topServices,
        favoriteTherapists,
        visitFrequency,
        
        // Upcoming activity
        upcomingBookings: upcomingBookings.map(booking => ({
          id: booking.id,
          service: booking.service,
          date: booking.date.toISOString(),
          time: booking.time,
          status: booking.status,
          servicePrice: booking.servicePrice
        })),
        
        // Treatment history
        treatmentHistory: customer.dailyTreatments.map(treatment => ({
          id: treatment.id,
          date: treatment.date.toISOString(),
          serviceName: treatment.serviceName,
          servicePrice: treatment.servicePrice,
          therapistName: treatment.therapist.fullName,
          therapistInitial: treatment.therapist.initial,
          tipAmount: treatment.tipAmount,
          paymentMethod: treatment.paymentMethod,
          startTime: treatment.startTime,
          endTime: treatment.endTime,
          notes: treatment.notes,
          rating: treatment.feedback ? {
            overall: treatment.feedback.overallRating,
            serviceQuality: treatment.feedback.serviceQuality,
            therapistService: treatment.feedback.therapistService,
            cleanliness: treatment.feedback.cleanliness,
            valueForMoney: treatment.feedback.valueForMoney,
            comment: treatment.feedback.comment,
            wouldRecommend: treatment.feedback.wouldRecommend
          } : null
        })),
        
        // Booking history
        bookingHistory: customer.bookings.map(booking => ({
          id: booking.id,
          service: booking.service,
          servicePrice: booking.servicePrice,
          date: booking.date.toISOString(),
          time: booking.time,
          status: booking.status,
          notes: booking.notes,
          createdAt: booking.createdAt.toISOString()
        }))
      }
    })

  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params
    const data = await request.json()

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if phone is being changed and if it's already taken
    if (data.phone && data.phone !== existingCustomer.phone) {
      const phoneTaken = await prisma.customer.findUnique({
        where: { phone: data.phone }
      })

      if (phoneTaken) {
        return NextResponse.json(
          { success: false, error: 'Phone number already exists' },
          { status: 409 }
        )
      }
    }

    // Update customer
    const updatedData: any = {}
    
    if (data.name) updatedData.name = data.name
    if (data.phone) updatedData.phone = data.phone
    if (data.email !== undefined) updatedData.email = data.email || null
    if (data.address !== undefined) updatedData.address = data.address || null
    if (data.notes !== undefined) updatedData.notes = data.notes || null
    if (data.isVip !== undefined) updatedData.isVip = data.isVip

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: updatedData
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
        isVip: customer.isVip,
        lastVisit: customer.lastVisit?.toISOString(),
        updatedAt: customer.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if customer has treatments or bookings
    const treatmentCount = await prisma.dailyTreatment.count({
      where: { customerId }
    })

    const bookingCount = await prisma.booking.count({
      where: { customerId }
    })

    if (treatmentCount > 0 || bookingCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete customer with existing treatments or bookings',
        data: {
          treatmentCount,
          bookingCount
        }
      }, { status: 400 })
    }

    // Delete customer
    await prisma.customer.delete({
      where: { id: customerId }
    })

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}