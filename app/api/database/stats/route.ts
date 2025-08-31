import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    // Ensure prisma is connected
    await prisma!.$connect()
    
    // Get counts for all tables
    const [
      adminsCount,
      customersCount,
      therapistsCount,
      servicesCount,
      treatmentsCount,
      bookingsCount,
      feedbackCount
    ] = await Promise.all([
      prisma!.admin.count(),
      prisma!.customer.count(),
      prisma!.therapist.count(),
      prisma!.service.count(),
      prisma!.dailyTreatment.count(),
      prisma!.booking.count(),
      prisma!.customerFeedback.count()
    ])

    const totalRecords = adminsCount + customersCount + therapistsCount + 
                        servicesCount + treatmentsCount + bookingsCount + feedbackCount

    // Get recent activity (last 10 treatments)
    const recentTreatments = await prisma!.dailyTreatment.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        customer: {
          select: { name: true }
        },
        therapist: {
          select: { fullName: true }
        },
        service: {
          select: { name: true }
        }
      }
    })

    // Check if database is properly initialized
    const hasData = totalRecords > 0
    const hasServices = servicesCount > 0
    const hasTherapists = therapistsCount > 0

    return NextResponse.json({
      success: true,
      stats: {
        tables: 7,
        totalRecords,
        counts: {
          admins: adminsCount,
          customers: customersCount,
          therapists: therapistsCount,
          services: servicesCount,
          treatments: treatmentsCount,
          bookings: bookingsCount,
          feedback: feedbackCount
        },
        recentActivity: recentTreatments,
        status: {
          hasData,
          hasServices,
          hasTherapists,
          isHealthy: hasData && hasServices && hasTherapists
        }
      }
    })

  } catch (error) {
    console.error('Database stats error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get database statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma!.$disconnect()
  }
}
