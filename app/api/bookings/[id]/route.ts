// Individual Booking API - GET, PUT, DELETE operations
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/bookings/[id] - Get single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          include: {
            bookings: {
              orderBy: { date: 'desc' },
              take: 5
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
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

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
        updatedAt: booking.updatedAt.toISOString(),
        
        // Customer details if available
        customer: booking.customer ? {
          id: booking.customer.id,
          name: booking.customer.name,
          phone: booking.customer.phone,
          email: booking.customer.email,
          address: booking.customer.address,
          notes: booking.customer.notes,
          totalVisits: booking.customer.totalVisits,
          totalSpending: booking.customer.totalSpending,
          lastVisit: booking.customer.lastVisit?.toISOString(),
          isVip: booking.customer.isVip,
          
          // Recent history
          recentBookings: booking.customer.bookings.map(b => ({
            id: b.id,
            service: b.service,
            date: b.date.toISOString(),
            status: b.status,
            servicePrice: b.servicePrice
          })),
          
          recentTreatments: booking.customer.dailyTreatments.map(t => ({
            id: t.id,
            serviceName: t.serviceName,
            date: t.date.toISOString(),
            servicePrice: t.servicePrice,
            therapistName: t.therapist.fullName,
            rating: t.feedback?.overallRating || null
          }))
        } : null
      }
    })

  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const data = await request.json()

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Validate date if being updated
    if (data.date) {
      const bookingDate = new Date(data.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (bookingDate < today && existingBooking.status === 'pending') {
        return NextResponse.json(
          { success: false, error: 'Cannot reschedule to past dates' },
          { status: 400 }
        )
      }
    }

    // Update booking
    const updatedData: any = {}
    
    if (data.customerName) updatedData.customerName = data.customerName
    if (data.phone) updatedData.phone = data.phone
    if (data.service) updatedData.service = data.service
    if (data.servicePrice !== undefined) updatedData.servicePrice = parseInt(data.servicePrice)
    if (data.date) updatedData.date = new Date(data.date)
    if (data.time) updatedData.time = data.time
    if (data.status) updatedData.status = data.status
    if (data.notes !== undefined) updatedData.notes = data.notes

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: updatedData,
      include: {
        customer: true
      }
    })

    // If booking is completed, create daily treatment record
    if (data.status === 'completed' && existingBooking.status !== 'completed') {
      // Get service details
      const service = await prisma.service.findFirst({
        where: { name: booking.service }
      })

      if (service && data.therapistId) {
        await prisma.dailyTreatment.create({
          data: {
            date: booking.date,
            customerId: booking.customerId,
            customerName: booking.customerName,
            serviceId: service.id,
            serviceName: service.name,
            servicePrice: booking.servicePrice,
            therapistId: data.therapistId,
            tipAmount: data.tipAmount || 0,
            paymentMethod: data.paymentMethod || 'cash',
            startTime: booking.time,
            endTime: data.endTime,
            notes: data.treatmentNotes
          }
        })

        // Update customer stats if customer exists
        if (booking.customerId) {
          await prisma.customer.update({
            where: { id: booking.customerId },
            data: {
              totalVisits: { increment: 1 },
              totalSpending: { increment: booking.servicePrice },
              lastVisit: booking.date
            }
          })
        }

        // Update service popularity
        await prisma.service.update({
          where: { id: service.id },
          data: {
            popularity: { increment: 1 }
          }
        })

        // Update therapist stats
        await prisma.therapist.update({
          where: { id: data.therapistId },
          data: {
            totalTreatments: { increment: 1 },
            totalEarnings: { 
              increment: data.therapistFee || (service.normalPrice * 0.1) 
            }
          }
        })
      }
    }

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
        updatedAt: booking.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params

    // Check if booking exists
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Only prevent deletion of confirmed bookings (active bookings)
    // Allow deletion of pending, completed, and cancelled bookings for admin cleanup
    if (existingBooking.status === 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete confirmed bookings. Cancel first or mark as completed.' },
        { status: 400 }
      )
    }

    // Delete booking
    await prisma.booking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}

// POST /api/bookings/[id]/complete - Complete booking and create treatment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params
    const data = await request.json()

    // Check if booking exists and is confirmed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      )
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        { success: false, error: 'Can only complete confirmed bookings' },
        { status: 400 }
      )
    }

    // Validate therapist exists
    const therapist = await prisma.therapist.findUnique({
      where: { id: data.therapistId }
    })

    if (!therapist) {
      return NextResponse.json(
        { success: false, error: 'Therapist not found' },
        { status: 404 }
      )
    }

    // Get service details
    const service = await prisma.service.findFirst({
      where: { name: booking.service }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'completed' }
      })

      // Create daily treatment record
      const treatment = await tx.dailyTreatment.create({
        data: {
          date: booking.date,
          customerId: booking.customerId,
          customerName: booking.customerName,
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: booking.servicePrice,
          therapistId: data.therapistId,
          tipAmount: data.tipAmount || 0,
          paymentMethod: data.paymentMethod || 'cash',
          startTime: booking.time,
          endTime: data.endTime,
          notes: data.treatmentNotes
        }
      })

      // Update customer stats
      if (booking.customerId) {
        await tx.customer.update({
          where: { id: booking.customerId },
          data: {
            totalVisits: { increment: 1 },
            totalSpending: { increment: booking.servicePrice },
            lastVisit: booking.date
          }
        })
      }

      // Update service popularity
      await tx.service.update({
        where: { id: service.id },
        data: { popularity: { increment: 1 } }
      })

      // Calculate therapist earnings
      const therapistEarning = therapist.baseFeePerTreatment + 
        (booking.servicePrice * therapist.commissionRate) + 
        (data.tipAmount || 0)

      // Update therapist stats
      await tx.therapist.update({
        where: { id: data.therapistId },
        data: {
          totalTreatments: { increment: 1 },
          totalEarnings: { increment: Math.round(therapistEarning) }
        }
      })

      return { updatedBooking, treatment, therapistEarning }
    })

    return NextResponse.json({
      success: true,
      message: 'Booking completed and treatment recorded',
      data: {
        booking: {
          id: result.updatedBooking.id,
          status: result.updatedBooking.status
        },
        treatment: {
          id: result.treatment.id,
          therapistEarning: Math.round(result.therapistEarning)
        }
      }
    })

  } catch (error) {
    console.error('Error completing booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to complete booking' },
      { status: 500 }
    )
  }
}