import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

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
        customerName: 'Fatimah Zahra',
        customerPhone: '081234567891',
        serviceName: 'Hair Spa',
        therapistName: 'Maya Sari',
        therapistRating: 4,
        serviceRating: 5,
        overallRating: 4,
        comment: 'Hair spa-nya bagus, rambut jadi lembut dan berkilau. Harga juga terjangkau.',
        isAnonymous: false
      },
      {
        treatmentId: 3,
        customerName: 'Aisyah Putri',
        customerPhone: '081234567892',
        serviceName: 'Manicure & Pedicure',
        therapistName: 'Dewi Lestari',
        therapistRating: 5,
        serviceRating: 4,
        overallRating: 5,
        comment: 'Kuku jadi cantik dan rapi. Pelayanan cepat dan hasilnya memuaskan.',
        isAnonymous: false
      },
      {
        treatmentId: 4,
        customerName: 'Anonim',
        customerPhone: '081234567893',
        serviceName: 'Body Treatment',
        therapistName: 'Sari Indah',
        therapistRating: 3,
        serviceRating: 3,
        overallRating: 3,
        comment: 'Lumayan, tapi masih ada yang perlu ditingkatkan.',
        isAnonymous: true
      },
      {
        treatmentId: 5,
        customerName: 'Khadijah Ahmad',
        customerPhone: '081234567803',
        serviceName: 'Bekam',
        therapistName: 'Rina Sari Dewi',
        therapistRating: 5,
        serviceRating: 5,
        overallRating: 5,
        comment: 'Bekam-nya sangat nyaman dan hasilnya bagus. Terapis sudah berpengalaman.',
        isAnonymous: false
      }
    ]

    console.log('📝 Creating sample feedback data...')

    const { data, error } = await supabase
      .from('Feedback')
      .insert(sampleFeedbacks)
      .select()

    if (error) {
      console.error('❌ Create sample feedback error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create sample feedback',
        details: error.message
      })
    }

    console.log('✅ Sample feedback created successfully:', data.length, 'records')

    return NextResponse.json({
      success: true,
      message: `Successfully created ${data.length} sample feedback records`,
      data: data
    })

  } catch (error) {
    console.error('❌ Seed feedback error:', error)
    return NextResponse.json({
      success: false,
      error: 'Seed feedback failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
