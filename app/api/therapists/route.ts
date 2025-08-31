// Updated Therapist Management API - Works with Supabase schema
import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../lib/prisma'

// GET /api/therapists - List all therapists with optional filtering
export async function GET(request: NextRequest) {
  if (!isDatabaseAvailable() || !prisma) {
    return NextResponse.json({ 
      success: false, 
      error: 'Database not configured',
      data: []
    }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (active !== null) {
      where.isActive = active === 'true'
    }
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { initial: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }

    const therapists = await prisma!.therapist.findMany({
      where,
      include: {
        dailyTreatments: {
          where: {
            date: new Date().toISOString().split('T')[0]
          },
          include: {
            service: true
          }
        }
      },
      orderBy: { fullName: 'asc' }
    })

    // Format therapists with updated schema
    const therapistsWithStats = therapists.map(therapist => {
      const todayTreatments = therapist.dailyTreatments.length
      const todayEarnings = therapist.dailyTreatments.reduce((sum, treatment) => {
        if (treatment.isFreeVisit) return sum
        return sum + (treatment.service?.therapistFee || 0)
      }, 0)

      return {
        id: therapist.id.toString(),
        initial: therapist.initial,
        fullName: therapist.fullName,
        phone: therapist.phone,
        isActive: therapist.isActive,
        // Legacy compatibility
        namaLengkap: therapist.fullName,
        nomorTelepon: therapist.phone,
        status: therapist.isActive ? 'Aktif' : 'Tidak Aktif',
        // Performance stats
        todayTreatments,
        todayEarnings,
        // Monthly stats (simplified for now)
        monthlyTreatments: todayTreatments,
        monthlyRevenue: todayEarnings,
        monthlyTips: 0,
        averageRating: 5.0
      }
    })

    return NextResponse.json({
      success: true,
      data: therapistsWithStats,
      total: therapistsWithStats.length,
      summary: {
        total: therapistsWithStats.length,
        active: therapistsWithStats.filter(t => t.isActive).length,
        todayActive: therapistsWithStats.filter(t => t.todayTreatments > 0).length
      }
    })

  } catch (error) {
    console.error('Error fetching therapists:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch therapists',
      details: error instanceof Error ? error.message : 'Unknown error',
      data: []
    }, { status: 500 })
  }
}