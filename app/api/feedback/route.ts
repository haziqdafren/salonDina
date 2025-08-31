// Customer Feedback API - CRUD Operations for treatment feedback
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/feedback - List all feedback with filtering and analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const therapistId = searchParams.get('therapistId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minRating = searchParams.get('minRating')
    const analytics = searchParams.get('analytics') === 'true'

    const where: any = {}
    
    // Filter by therapist
    if (therapistId) {
      where.dailyTreatment = {
        therapistId: therapistId
      }
    }
    
    // Filter by date range
    if (startDate || endDate) {
      where.dailyTreatment = {
        ...where.dailyTreatment,
        date: {}
      }
      if (startDate) {
        where.dailyTreatment.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.dailyTreatment.date.lte = new Date(endDate)
      }
    }
    
    // Filter by minimum overall rating
    if (minRating) {
      where.overallRating = {
        gte: parseInt(minRating)
      }
    }

    const feedback = await prisma.customerFeedback.findMany({
      where,
      include: {
        dailyTreatment: {
          include: {
            therapist: true,
            service: true,
            customer: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format feedback data
    const formattedFeedback = feedback.map(item => ({
      id: item.id,
      tanggalTreatment: item.dailyTreatment.date.toISOString(),
      namaCustomer: item.dailyTreatment.customerName,
      namaService: item.dailyTreatment.serviceName,
      namaTherapist: item.dailyTreatment.therapist.fullName,
      initialTherapist: item.dailyTreatment.therapist.initial,
      
      // Ratings
      ratingKeseluruhan: item.overallRating,
      ratingKualitasService: item.serviceQuality,
      ratingPelayananTherapist: item.therapistService,
      ratingKebersihan: item.cleanliness,
      ratingSesuaiHarga: item.valueForMoney,
      
      komentar: item.comment,
      akanMerekomendasikan: item.wouldRecommend,
      tanggalFeedback: item.createdAt.toISOString()
    }))

    // Calculate analytics if requested
    if (analytics) {
      const totalFeedback = feedback.length
      
      const ratings = {
        rataRataKeseluruhan: feedback.reduce((sum, f) => sum + f.overallRating, 0) / totalFeedback || 0,
        rataRataKualitasService: feedback.reduce((sum, f) => sum + f.serviceQuality, 0) / totalFeedback || 0,
        rataRataPelayananTherapist: feedback.reduce((sum, f) => sum + f.therapistService, 0) / totalFeedback || 0,
        rataRataKebersihan: feedback.reduce((sum, f) => sum + f.cleanliness, 0) / totalFeedback || 0,
        rataRataSesuaiHarga: feedback.reduce((sum, f) => sum + f.valueForMoney, 0) / totalFeedback || 0
      }

      const recommendation = {
        totalMerekomendasikan: feedback.filter(f => f.wouldRecommend).length,
        persentaseMerekomendasikan: (feedback.filter(f => f.wouldRecommend).length / totalFeedback * 100) || 0
      }

      // Rating distribution
      const distribusiRating = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        jumlah: feedback.filter(f => f.overallRating === rating).length,
        persentase: (feedback.filter(f => f.overallRating === rating).length / totalFeedback * 100) || 0
      }))

      return NextResponse.json({
        success: true,
        data: formattedFeedback,
        analytics: {
          totalFeedback,
          ratings,
          recommendation,
          distribusiRating
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: formattedFeedback,
      total: formattedFeedback.length
    })

  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data feedback' },
      { status: 500 }
    )
  }
}

// POST /api/feedback - Create new feedback entry
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const { 
      dailyTreatmentId, 
      overallRating, 
      serviceQuality, 
      therapistService, 
      cleanliness, 
      valueForMoney 
    } = data
    
    if (!dailyTreatmentId || !overallRating || !serviceQuality || !therapistService || !cleanliness || !valueForMoney) {
      return NextResponse.json(
        { success: false, error: 'Semua rating wajib diisi' },
        { status: 400 }
      )
    }

    // Validate rating values (1-5)
    const ratings = [overallRating, serviceQuality, therapistService, cleanliness, valueForMoney]
    if (ratings.some(rating => rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Rating harus antara 1 sampai 5' },
        { status: 400 }
      )
    }

    // Check if treatment exists
    const treatment = await prisma.dailyTreatment.findUnique({
      where: { id: dailyTreatmentId },
      include: { therapist: true, customer: true }
    })

    if (!treatment) {
      return NextResponse.json(
        { success: false, error: 'Treatment tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if feedback already exists for this treatment
    const existingFeedback = await prisma.customerFeedback.findUnique({
      where: { dailyTreatmentId }
    })

    if (existingFeedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback sudah pernah diberikan untuk treatment ini' },
        { status: 409 }
      )
    }

    // Create feedback
    const feedback = await prisma.customerFeedback.create({
      data: {
        dailyTreatmentId,
        customerId: treatment.customerId,
        overallRating,
        serviceQuality,
        therapistService,
        cleanliness,
        valueForMoney,
        comment: data.comment || '',
        wouldRecommend: data.wouldRecommend !== false // Default true
      },
      include: {
        dailyTreatment: {
          include: {
            therapist: true,
            service: true
          }
        }
      }
    })

    // Mark treatment as feedback completed
    await prisma.dailyTreatment.update({
      where: { id: dailyTreatmentId },
      data: { 
        feedbackCompleted: true,
        feedbackRequested: true
      }
    })

    // Update therapist average rating
    const therapistFeedback = await prisma.customerFeedback.findMany({
      where: {
        dailyTreatment: {
          therapistId: treatment.therapistId
        }
      }
    })

    const avgRating = therapistFeedback.reduce((sum, f) => sum + f.therapistService, 0) / therapistFeedback.length
    
    await prisma.therapist.update({
      where: { id: treatment.therapistId },
      data: { averageRating: avgRating }
    })

    return NextResponse.json({
      success: true,
      message: 'Terima kasih atas feedback Anda! 🙏',
      data: {
        id: feedback.id,
        namaCustomer: treatment.customerName,
        namaService: treatment.serviceName,
        namaTherapist: treatment.therapist.fullName,
        ratingKeseluruhan: feedback.overallRating,
        tanggalFeedback: feedback.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan feedback' },
      { status: 500 }
    )
  }
}