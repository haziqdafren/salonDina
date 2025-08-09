// Individual Therapist API - GET, PUT, DELETE operations
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/therapists/[id] - Get single therapist with detailed stats
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: therapistId } = await params

    const therapist = await prisma.therapist.findUnique({
      where: { id: therapistId },
      include: {
        dailyTreatments: {
          orderBy: { date: 'desc' },
          take: 10,
          include: {
            service: true,
            customer: true,
            feedback: true
          }
        },
        monthlyStats: {
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          take: 12
        }
      }
    })

    if (!therapist) {
      return NextResponse.json(
        { success: false, error: 'Therapist not found' },
        { status: 404 }
      )
    }

    // Calculate detailed performance metrics
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()
    
    const currentMonthTreatments = therapist.dailyTreatments.filter(t => {
      const treatmentDate = new Date(t.date)
      return treatmentDate.getMonth() + 1 === currentMonth && treatmentDate.getFullYear() === currentYear
    })

    const todayTreatments = therapist.dailyTreatments.filter(t => {
      const today = new Date()
      const treatmentDate = new Date(t.date)
      return treatmentDate.toDateString() === today.toDateString()
    })

    const todayEarnings = todayTreatments.reduce((sum, treatment) => {
      return sum + therapist.baseFeePerTreatment + (treatment.servicePrice * therapist.commissionRate) + treatment.tipAmount
    }, 0)

    return NextResponse.json({
      success: true,
      data: {
        id: therapist.id,
        initial: therapist.initial,
        namaLengkap: therapist.fullName,
        nomorTelepon: therapist.phone,
        email: `${therapist.fullName.toLowerCase().replace(/\s+/g, '.')}@salonmuslimah.com`,
        tanggalBergabung: therapist.joinDate.toISOString(),
        status: therapist.isActive ? 'Aktif' : 'Tidak Aktif',
        feePerTreatment: therapist.baseFeePerTreatment,
        tingkatKomisi: therapist.commissionRate * 100,
        catatan: `Spesialis ${currentMonthTreatments.length > 10 ? 'premium' : 'reguler'} treatment`,
        
        // Performance metrics
        todayTreatments: todayTreatments.length,
        todayEarnings: Math.round(todayEarnings),
        monthlyTreatments: currentMonthTreatments.length,
        monthlyRevenue: currentMonthTreatments.reduce((sum, t) => sum + t.servicePrice, 0),
        monthlyTips: currentMonthTreatments.reduce((sum, t) => sum + t.tipAmount, 0),
        averageRating: therapist.averageRating || 0,
        
        // Historical data
        recentTreatments: therapist.dailyTreatments.map(t => ({
          id: t.id,
          date: t.date.toISOString(),
          customerName: t.customerName,
          serviceName: t.serviceName,
          servicePrice: t.servicePrice,
          tipAmount: t.tipAmount,
          paymentMethod: t.paymentMethod,
          rating: t.feedback?.therapistService || null
        })),
        
        monthlyStats: therapist.monthlyStats
      }
    })

  } catch (error) {
    console.error('Error fetching therapist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch therapist' },
      { status: 500 }
    )
  }
}

// PUT /api/therapists/[id] - Update therapist
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: therapistId } = await params
    const data = await request.json()

    // Check if therapist exists
    const existingTherapist = await prisma.therapist.findUnique({
      where: { id: therapistId }
    })

    if (!existingTherapist) {
      return NextResponse.json(
        { success: false, error: 'Therapist not found' },
        { status: 404 }
      )
    }

    // Check if initial is being changed and if it's already taken
    if (data.initial && data.initial !== existingTherapist.initial) {
      const initialTaken = await prisma.therapist.findUnique({
        where: { initial: data.initial }
      })

      if (initialTaken) {
        return NextResponse.json(
          { success: false, error: 'Initial already exists' },
          { status: 409 }
        )
      }
    }

    // Update therapist
    const updatedData: any = {}
    
    if (data.initial) updatedData.initial = data.initial
    if (data.fullName) updatedData.fullName = data.fullName
    if (data.phone) updatedData.phone = data.phone
    if (data.baseFeePerTreatment !== undefined) updatedData.baseFeePerTreatment = data.baseFeePerTreatment
    if (data.commissionRate !== undefined) updatedData.commissionRate = data.commissionRate / 100
    if (data.isActive !== undefined) updatedData.isActive = data.isActive

    const therapist = await prisma.therapist.update({
      where: { id: therapistId },
      data: updatedData
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
        tingkatKomisi: therapist.commissionRate * 100
      }
    })

  } catch (error) {
    console.error('Error updating therapist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update therapist' },
      { status: 500 }
    )
  }
}

// DELETE /api/therapists/[id] - Delete therapist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: therapistId } = await params

    // Check if therapist exists
    const existingTherapist = await prisma.therapist.findUnique({
      where: { id: therapistId }
    })

    if (!existingTherapist) {
      return NextResponse.json(
        { success: false, error: 'Therapist not found' },
        { status: 404 }
      )
    }

    // Check if therapist has treatments (soft delete recommended)
    const treatmentCount = await prisma.dailyTreatment.count({
      where: { therapistId }
    })

    if (treatmentCount > 0) {
      // Soft delete - mark as inactive
      const therapist = await prisma.therapist.update({
        where: { id: therapistId },
        data: { isActive: false }
      })

      return NextResponse.json({
        success: true,
        message: 'Therapist deactivated (has existing treatments)',
        data: {
          id: therapist.id,
          isActive: therapist.isActive,
          treatmentCount
        }
      })
    } else {
      // Hard delete - no treatments exist
      await prisma.therapist.delete({
        where: { id: therapistId }
      })

      return NextResponse.json({
        success: true,
        message: 'Therapist deleted successfully'
      })
    }

  } catch (error) {
    console.error('Error deleting therapist:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete therapist' },
      { status: 500 }
    )
  }
}