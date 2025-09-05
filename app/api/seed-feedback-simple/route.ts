import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'
import { supabaseAdmin, isServiceRoleConfigured } from '../../../lib/supabaseAdmin'

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

    console.log('🌱 Seeding sample feedback data...')

    // Create sample feedback data
    const sampleFeedbacks = [
      {
        treatmentId: 1,
        customerName: 'Siti Aminah',
        customerPhone: '081234567890',
        serviceName: 'Facial Treatment',
        therapistName: 'Rina Sari Dewi',
        therapistRating: 5,
        serviceRating: 5,
        overallRating: 5,
        comment: 'Pelayanan sangat memuaskan, terapis sangat profesional dan ramah. Hasil facial sangat bagus!',
        isAnonymous: false
      },
      {
        treatmentId: 2,
        customerName: 'Budi Santoso',
        customerPhone: '081234567891',
        serviceName: 'Hair Spa',
        therapistName: 'Ani Susanti',
        therapistRating: 4,
        serviceRating: 4,
        overallRating: 4,
        comment: 'Rambut terasa lebih lembut dan wangi. Pijatan kepala sangat rileks.',
        isAnonymous: false
      },
      {
        treatmentId: 3,
        customerName: 'Anonim',
        customerPhone: '081234567892',
        serviceName: 'Body Massage',
        therapistName: 'Dewi Lestari',
        therapistRating: 5,
        serviceRating: 5,
        overallRating: 5,
        comment: 'Badan terasa segar kembali setelah pijat. Terapis sangat ahli.',
        isAnonymous: true
      }
    ]

    // Try with regular client first
    let client = supabase
    let { data, error } = await client
      .from('Feedback')
      .insert(sampleFeedbacks)
      .select()

    // If that fails, try with service role
    if (error && isServiceRoleConfigured() && supabaseAdmin) {
      console.log('🔄 Regular client failed, trying with service role...')
      client = supabaseAdmin
      const result = await client
        .from('Feedback')
        .insert(sampleFeedbacks)
        .select()
      
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('❌ Seed feedback error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to seed feedback data',
        details: error.message,
        code: error.code
      })
    }

    console.log('✅ Sample feedback data seeded successfully:', data?.length || 0, 'records')

    return NextResponse.json({
      success: true,
      message: 'Sample feedback data seeded successfully',
      data: data || []
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
