// Individual Service API - GET, PUT, DELETE operations
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/services/[id] - Get single service with detailed stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        dailyTreatments: {
          orderBy: { date: 'desc' },
          take: 20,
          include: {
            therapist: true,
            customer: true,
            feedback: true
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    // Calculate detailed statistics
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    const thisMonthTreatments = service.dailyTreatments.filter(t => {
      const treatmentDate = new Date(t.date)
      return treatmentDate.getMonth() + 1 === currentMonth && treatmentDate.getFullYear() === currentYear
    })

    const lastMonthTreatments = service.dailyTreatments.filter(t => {
      const treatmentDate = new Date(t.date)
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
      const yearForLastMonth = currentMonth === 1 ? currentYear - 1 : currentYear
      return treatmentDate.getMonth() + 1 === lastMonth && treatmentDate.getFullYear() === yearForLastMonth
    })

    const totalRevenue = service.dailyTreatments.reduce((sum, t) => sum + t.servicePrice, 0)
    const thisMonthRevenue = thisMonthTreatments.reduce((sum, t) => sum + t.servicePrice, 0)
    const lastMonthRevenue = lastMonthTreatments.reduce((sum, t) => sum + t.servicePrice, 0)

    // Calculate average rating
    const ratingsWithFeedback = service.dailyTreatments
      .filter(t => t.feedback?.serviceQuality)
      .map(t => t.feedback!.serviceQuality)
    
    const averageRating = ratingsWithFeedback.length > 0
      ? ratingsWithFeedback.reduce((sum, rating) => sum + rating, 0) / ratingsWithFeedback.length
      : null

    // Get therapist performance for this service
    const therapistStats = service.dailyTreatments.reduce((acc, treatment) => {
      const therapistId = treatment.therapist.id
      const therapistName = treatment.therapist.fullName
      
      if (!acc[therapistId]) {
        acc[therapistId] = {
          therapistId,
          therapistName,
          initial: treatment.therapist.initial,
          treatments: 0,
          revenue: 0,
          averageRating: 0,
          ratings: []
        }
      }
      
      acc[therapistId].treatments++
      acc[therapistId].revenue += treatment.servicePrice
      
      if (treatment.feedback?.therapistService) {
        acc[therapistId].ratings.push(treatment.feedback.therapistService)
      }
      
      return acc
    }, {} as any)

    // Calculate average ratings for therapists
    Object.values(therapistStats).forEach((stat: any) => {
      if (stat.ratings.length > 0) {
        stat.averageRating = stat.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / stat.ratings.length
      }
      delete stat.ratings
    })

    return NextResponse.json({
      success: true,
      data: {
        // Basic info
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
        totalBookings: service.dailyTreatments.length,
        thisMonthBookings: thisMonthTreatments.length,
        lastMonthBookings: lastMonthTreatments.length,
        totalRevenue,
        thisMonthRevenue,
        lastMonthRevenue,
        averageRating,
        totalRatings: ratingsWithFeedback.length,
        
        // Trends
        bookingTrend: thisMonthTreatments.length - lastMonthTreatments.length,
        revenueTrend: thisMonthRevenue - lastMonthRevenue,
        
        // Recent activity
        recentTreatments: service.dailyTreatments.slice(0, 10).map(t => ({
          id: t.id,
          date: t.date.toISOString(),
          customerName: t.customerName,
          therapistName: t.therapist.fullName,
          therapistInitial: t.therapist.initial,
          servicePrice: t.servicePrice,
          tipAmount: t.tipAmount,
          paymentMethod: t.paymentMethod,
          rating: t.feedback?.serviceQuality || null
        })),
        
        // Therapist performance for this service
        therapistStats: Object.values(therapistStats).sort((a: any, b: any) => b.treatments - a.treatments)
      }
    })

  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

// PUT /api/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params
    const data = await request.json()

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    // Check if name is being changed and if it already exists
    if (data.name && data.name !== existingService.name) {
      const nameExists = await prisma.service.findFirst({
        where: { 
          name: data.name,
          category: data.category || existingService.category,
          id: { not: serviceId }
        }
      })

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Service name already exists in this category' },
          { status: 409 }
        )
      }
    }

    // Update service
    const updatedData: any = {}
    
    if (data.name) updatedData.name = data.name
    if (data.category) updatedData.category = data.category
    if (data.normalPrice !== undefined) updatedData.normalPrice = parseInt(data.normalPrice)
    if (data.promoPrice !== undefined) {
      updatedData.promoPrice = data.promoPrice ? parseInt(data.promoPrice) : null
    }
    if (data.duration !== undefined) updatedData.duration = parseInt(data.duration)
    if (data.description) updatedData.description = data.description
    if (data.isActive !== undefined) updatedData.isActive = data.isActive
    if (data.popularity !== undefined) updatedData.popularity = parseInt(data.popularity)

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: updatedData
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
        popularity: service.popularity
      }
    })

  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id] - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: serviceId } = await params

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Service not found' },
        { status: 404 }
      )
    }

    // Check if service has treatments (soft delete recommended)
    const treatmentCount = await prisma.dailyTreatment.count({
      where: { serviceId }
    })

    if (treatmentCount > 0) {
      // Soft delete - mark as inactive
      const service = await prisma.service.update({
        where: { id: serviceId },
        data: { isActive: false }
      })

      return NextResponse.json({
        success: true,
        message: 'Service deactivated (has existing treatments)',
        data: {
          id: service.id,
          isActive: service.isActive,
          treatmentCount
        }
      })
    } else {
      // Hard delete - no treatments exist
      await prisma.service.delete({
        where: { id: serviceId }
      })

      return NextResponse.json({
        success: true,
        message: 'Service deleted successfully'
      })
    }

  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete service' },
      { status: 500 }
    )
  }
}