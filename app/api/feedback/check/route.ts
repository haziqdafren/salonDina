// Check feedback existence for treatments
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/feedback/check - Check if feedback exists for multiple treatments
export async function POST(request: NextRequest) {
  try {
    const { treatmentIds } = await request.json()
    
    if (!treatmentIds || !Array.isArray(treatmentIds)) {
      return NextResponse.json(
        { success: false, error: 'treatmentIds array is required' },
        { status: 400 }
      )
    }

    // Find all existing feedback for the given treatment IDs
    const existingFeedback = await prisma.customerFeedback.findMany({
      where: {
        dailyTreatmentId: {
          in: treatmentIds
        }
      },
      select: {
        dailyTreatmentId: true,
        overallRating: true,
        createdAt: true
      }
    })

    // Create a map of treatment ID to feedback status
    const feedbackStatus = treatmentIds.reduce((acc: any, treatmentId: string) => {
      const feedback = existingFeedback.find(f => f.dailyTreatmentId === treatmentId)
      acc[treatmentId] = {
        hasFeedback: !!feedback,
        rating: feedback?.overallRating || null,
        submittedAt: feedback?.createdAt?.toISOString() || null
      }
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: feedbackStatus
    })

  } catch (error) {
    console.error('Error checking feedback status:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengecek status feedback' },
      { status: 500 }
    )
  }
}