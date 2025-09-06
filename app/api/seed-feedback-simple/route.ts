import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    // Create sample feedback data
    const sampleFeedbacks = [
      {
        treatmentId: 5,
        customerName: 'Nina',
        customerPhone: '082170677736',
        serviceName: 'Ratus',
        therapistName: 'Sari Indah Permata',
        therapistRating: 5,
        serviceRating: 5,
        overallRating: 5,
        comment: 'Pelayanan sangat memuaskan! Terapis sangat profesional dan hasilnya bagus sekali.',
        isAnonymous: false
      },
      {
        treatmentId: 6,
        customerName: 'Nani',
        customerPhone: '081263475279',
        serviceName: 'Refleksi Massage',
        therapistName: 'Rina Sari Dewi',
        therapistRating: 4,
        serviceRating: 4,
        overallRating: 4,
        comment: 'Pijatan sangat rileks, badan terasa segar kembali. Terapis ramah dan profesional.',
        isAnonymous: false
      },
      {
        treatmentId: 7,
        customerName: 'Polan',
        customerPhone: '08122111',
        serviceName: 'Babyliss Kreasi',
        therapistName: 'Tina Wulandari',
        therapistRating: 5,
        serviceRating: 5,
        overallRating: 5,
        comment: 'Hasil babyliss sangat bagus! Rambut jadi lebih lembut dan wangi. Sangat puas dengan pelayanan.',
        isAnonymous: false
      },
      {
        treatmentId: null,
        customerName: 'Anonim',
        customerPhone: '081234567890',
        serviceName: 'Facial Treatment',
        therapistName: 'Dewi Lestari',
        therapistRating: 5,
        serviceRating: 5,
        overallRating: 5,
        comment: 'Facial treatment sangat bagus, kulit terasa lebih halus dan bersih.',
        isAnonymous: true
      }
    ]

    console.log('🌱 Seeding sample feedback data...')

    const { data, error } = await supabase
      .from('Feedback')
      .insert(sampleFeedbacks)
      .select()

    if (error) {
      console.error('❌ Seed feedback error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to seed feedback data',
        details: error.message
      })
    }

    console.log('✅ Sample feedback data seeded successfully:', data.length, 'records')

    return NextResponse.json({
      success: true,
      message: 'Sample feedback data seeded successfully',
      data
    })

  } catch (error) {
    console.error('❌ Seed feedback API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to seed feedback data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Seed feedback endpoint - use POST to populate sample feedback data'
  })
}