// Individual Treatment API - GET, PUT, DELETE operations
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/treatments/[id] - Get single treatment with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: treatmentId } = await params

    const treatment = await prisma.dailyTreatment.findUnique({
      where: { id: treatmentId },
      include: {
        customer: true,
        service: true,
        therapist: true,
        feedback: true
      }
    })

    if (!treatment) {
      return NextResponse.json(
        { success: false, error: 'Treatment not found' },
        { status: 404 }
      )
    }

    // Calculate therapist earnings
    const therapistEarnings = treatment.therapist.baseFeePerTreatment + 
      (treatment.servicePrice * treatment.therapist.commissionRate) + 
      treatment.tipAmount

    return NextResponse.json({
      success: true,
      data: {
        id: treatment.id,
        date: treatment.date.toISOString(),
        customerName: treatment.customerName,
        serviceName: treatment.serviceName,
        servicePrice: treatment.servicePrice,
        startTime: treatment.startTime,
        endTime: treatment.endTime,
        tipAmount: treatment.tipAmount,
        paymentMethod: treatment.paymentMethod,
        notes: treatment.notes,
        createdAt: treatment.createdAt.toISOString(),
        updatedAt: treatment.updatedAt.toISOString(),
        
        // Customer details
        customer: treatment.customer ? {
          id: treatment.customer.id,
          name: treatment.customer.name,
          phone: treatment.customer.phone,
          email: treatment.customer.email,
          address: treatment.customer.address,
          totalVisits: treatment.customer.totalVisits,
          totalSpending: treatment.customer.totalSpending,
          isVip: treatment.customer.isVip,
          lastVisit: treatment.customer.lastVisit?.toISOString()
        } : null,
        
        // Service details
        service: {
          id: treatment.service.id,
          name: treatment.service.name,
          category: treatment.service.category,
          normalPrice: treatment.service.normalPrice,
          promoPrice: treatment.service.promoPrice,
          duration: treatment.service.duration,
          description: treatment.service.description
        },
        
        // Therapist details
        therapist: {
          id: treatment.therapist.id,
          initial: treatment.therapist.initial,
          fullName: treatment.therapist.fullName,
          phone: treatment.therapist.phone,
          baseFeePerTreatment: treatment.therapist.baseFeePerTreatment,
          commissionRate: treatment.therapist.commissionRate,
          totalTreatments: treatment.therapist.totalTreatments,
          totalEarnings: treatment.therapist.totalEarnings,
          averageRating: treatment.therapist.averageRating
        },
        
        // Feedback details
        feedback: treatment.feedback ? {
          id: treatment.feedback.id,
          overallRating: treatment.feedback.overallRating,
          serviceQuality: treatment.feedback.serviceQuality,
          therapistService: treatment.feedback.therapistService,
          cleanliness: treatment.feedback.cleanliness,
          valueForMoney: treatment.feedback.valueForMoney,
          comment: treatment.feedback.comment,
          wouldRecommend: treatment.feedback.wouldRecommend,
          createdAt: treatment.feedback.createdAt.toISOString()
        } : null,
        
        // Calculated values
        therapistEarnings: Math.round(therapistEarnings),
        serviceDuration: treatment.service.duration,
        priceDiscount: treatment.service.promoPrice ? 
          treatment.service.normalPrice - treatment.service.promoPrice : 0
      }
    })

  } catch (error) {
    console.error('Error fetching treatment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch treatment' },
      { status: 500 }
    )
  }
}

// PUT /api/treatments/[id] - Update treatment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: treatmentId } = await params
    const data = await request.json()

    // Check if treatment exists
    const existingTreatment = await prisma.dailyTreatment.findUnique({
      where: { id: treatmentId },
      include: {
        therapist: true,
        customer: true
      }
    })

    if (!existingTreatment) {
      return NextResponse.json(
        { success: false, error: 'Treatment not found' },
        { status: 404 }
      )
    }

    // Validate service and therapist if being changed
    if (data.serviceId && data.serviceId !== existingTreatment.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: data.serviceId }
      })
      
      if (!service) {
        return NextResponse.json(
          { success: false, error: 'Service not found' },
          { status: 404 }
        )
      }
    }

    if (data.therapistId && data.therapistId !== existingTreatment.therapistId) {
      const therapist = await prisma.therapist.findUnique({
        where: { id: data.therapistId }
      })
      
      if (!therapist) {
        return NextResponse.json(
          { success: false, error: 'Therapist not found' },
          { status: 404 }
        )
      }
    }

    // Prepare update data
    const updatedData: any = {}
    
    if (data.date) updatedData.date = new Date(data.date)
    if (data.customerName) updatedData.customerName = data.customerName
    if (data.servicePrice !== undefined) {
      updatedData.servicePrice = parseInt(data.servicePrice)
      
      // Update customer spending if customer exists and price changed
      if (existingTreatment.customerId && data.servicePrice !== existingTreatment.servicePrice) {
        const priceDifference = parseInt(data.servicePrice) - existingTreatment.servicePrice
        await prisma.customer.update({
          where: { id: existingTreatment.customerId },
          data: {
            totalSpending: { increment: priceDifference }
          }
        })
      }
    }
    
    if (data.tipAmount !== undefined) {
      updatedData.tipAmount = parseInt(data.tipAmount)
      
      // Update therapist earnings if tip changed
      if (data.tipAmount !== existingTreatment.tipAmount) {
        const tipDifference = parseInt(data.tipAmount) - existingTreatment.tipAmount
        await prisma.therapist.update({
          where: { id: existingTreatment.therapistId },
          data: {
            totalEarnings: { increment: tipDifference }
          }
        })
      }
    }
    
    if (data.paymentMethod) updatedData.paymentMethod = data.paymentMethod
    if (data.startTime) updatedData.startTime = data.startTime
    if (data.endTime) updatedData.endTime = data.endTime
    if (data.notes !== undefined) updatedData.notes = data.notes

    // Handle service change
    if (data.serviceId && data.serviceId !== existingTreatment.serviceId) {
      const newService = await prisma.service.findUnique({
        where: { id: data.serviceId }
      })
      
      if (newService) {
        updatedData.serviceId = data.serviceId
        updatedData.serviceName = newService.name
        
        // Update service popularity
        await prisma.service.update({
          where: { id: data.serviceId },
          data: { popularity: { increment: 1 } }
        })
        
        // Decrease old service popularity
        await prisma.service.update({
          where: { id: existingTreatment.serviceId },
          data: { popularity: { decrement: 1 } }
        })
      }
    }

    // Update treatment
    const treatment = await prisma.dailyTreatment.update({
      where: { id: treatmentId },
      data: updatedData,
      include: {
        customer: true,
        service: true,
        therapist: true,
        feedback: true
      }
    })

    // Calculate therapist earnings
    const therapistEarnings = treatment.therapist.baseFeePerTreatment + 
      (treatment.servicePrice * treatment.therapist.commissionRate) + 
      treatment.tipAmount

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
        updatedAt: treatment.updatedAt.toISOString(),
        therapistEarnings: Math.round(therapistEarnings)
      }
    })

  } catch (error) {
    console.error('Error updating treatment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update treatment' },
      { status: 500 }
    )
  }
}

// DELETE /api/treatments/[id] - Delete treatment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: treatmentId } = await params

    // Check if treatment exists
    const existingTreatment = await prisma.dailyTreatment.findUnique({
      where: { id: treatmentId },
      include: {
        therapist: true,
        customer: true,
        feedback: true
      }
    })

    if (!existingTreatment) {
      return NextResponse.json(
        { success: false, error: 'Treatment not found' },
        { status: 404 }
      )
    }

    // Calculate what needs to be reverted
    const therapistEarnings = existingTreatment.therapist.baseFeePerTreatment + 
      (existingTreatment.servicePrice * existingTreatment.therapist.commissionRate) + 
      existingTreatment.tipAmount

    // Start transaction to delete and update related records
    await prisma.$transaction(async (tx) => {
      // Delete feedback if exists
      if (existingTreatment.feedback) {
        await tx.customerFeedback.delete({
          where: { id: existingTreatment.feedback.id }
        })
      }

      // Delete the treatment
      await tx.dailyTreatment.delete({
        where: { id: treatmentId }
      })

      // Update customer stats if customer exists
      if (existingTreatment.customerId) {
        await tx.customer.update({
          where: { id: existingTreatment.customerId },
          data: {
            totalVisits: { decrement: 1 },
            totalSpending: { decrement: existingTreatment.servicePrice }
          }
        })
      }

      // Update service popularity
      await tx.service.update({
        where: { id: existingTreatment.serviceId },
        data: { popularity: { decrement: 1 } }
      })

      // Update therapist stats
      await tx.therapist.update({
        where: { id: existingTreatment.therapistId },
        data: {
          totalTreatments: { decrement: 1 },
          totalEarnings: { decrement: Math.round(therapistEarnings) }
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Treatment deleted successfully',
      reverted: {
        customerSpending: existingTreatment.servicePrice,
        therapistEarnings: Math.round(therapistEarnings),
        servicePopularity: 1
      }
    })

  } catch (error) {
    console.error('Error deleting treatment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete treatment' },
      { status: 500 }
    )
  }
}