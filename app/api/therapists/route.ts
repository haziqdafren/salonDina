// Therapist Management API - Full CRUD Operations
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/therapists - List all therapists with optional filtering
export async function GET(request: NextRequest) {
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

    const therapists = await prisma.therapist.findMany({
      where,
      include: {
        dailyTreatments: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        },
        monthlyStats: {
          where: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
          }
        }
      },
      orderBy: { fullName: 'asc' }
    })

    // Calculate today's performance for each therapist
    const therapistsWithStats = therapists.map(therapist => {
      const todayTreatments = therapist.dailyTreatments.length
      const todayEarnings = therapist.dailyTreatments.reduce((sum, treatment) => {
        return sum + therapist.baseFeePerTreatment + (treatment.servicePrice * therapist.commissionRate) + treatment.tipAmount
      }, 0)

      const monthlyStats = therapist.monthlyStats[0] || {
        treatmentCount: 0,
        totalRevenue: 0,
        totalFees: 0,
        totalTips: 0,
        averageRating: null
      }

      return {
        id: therapist.id,
        initial: therapist.initial,
        namaLengkap: therapist.fullName,
        nomorTelepon: therapist.phone,
        tanggalBergabung: therapist.joinDate.toISOString(),
        status: therapist.isActive ? 'Aktif' : 'Tidak Aktif',
        feePerTreatment: therapist.baseFeePerTreatment,
        tingkatKomisi: therapist.commissionRate * 100,
        // Today's performance
        todayTreatments,
        todayEarnings: Math.round(todayEarnings),
        // Monthly performance
        monthlyTreatments: monthlyStats.treatmentCount,
        monthlyRevenue: monthlyStats.totalRevenue,
        monthlyTips: monthlyStats.totalTips,
        averageRating: therapist.averageRating || monthlyStats.averageRating || 0,
        // Raw data for other operations
        _raw: therapist
      }
    })

    return NextResponse.json({
      success: true,
      data: therapistsWithStats,
      total: therapistsWithStats.length
    })

  } catch (error) {
    console.error('Error fetching therapists:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch therapists' },
      { status: 500 }
    )
  }
}

// POST /api/therapists - Create new therapist
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const { initial, fullName, phone, baseFeePerTreatment, commissionRate } = data
    
    if (!initial || !fullName || !phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if initial is already taken
    const existingTherapist = await prisma.therapist.findUnique({
      where: { initial }
    })

    if (existingTherapist) {
      return NextResponse.json(
        { success: false, error: 'Initial already exists' },
        { status: 409 }
      )
    }

    // Create therapist
    const therapist = await prisma.therapist.create({
      data: {
        initial,
        fullName,
        phone,
        baseFeePerTreatment: baseFeePerTreatment || 15000,
        commissionRate: (commissionRate || 10) / 100, // Convert percentage to decimal
        isActive: data.isActive !== false
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: therapist.id,
        initial: therapist.initial,
        namaLengkap: therapist.fullName,
        nomorTelepon: therapist.phone,
        tanggalBergabung: therapist.joinDate.toISOString(),
        status: therapist.isActive ? 'Aktif' : 'Tidak Aktif',
        feePerTreatment: therapist.baseFeePerTreatment,
        tingkatKomisi: therapist.commissionRate * 100,
        todayTreatments: 0,
        todayEarnings: 0,
        monthlyTreatments: 0,
        monthlyRevenue: 0,
        monthlyTips: 0,
        averageRating: 0
      }
    })

  } catch (error) {
    console.error('Error creating therapist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create therapist' },
      { status: 500 }
    )
  }
}