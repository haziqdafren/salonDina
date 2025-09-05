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

    const body = await request.json()
    console.log('📝 Simple feedback test - received data:', body)

    // Try to insert feedback directly
    const { data, error } = await supabase
      .from('Feedback')
      .insert([{
        treatmentId: body.treatmentId || 1,
        customerName: body.customerName || 'Test Customer',
        customerPhone: body.customerPhone || '081234567890',
        serviceName: body.serviceName || 'Test Service',
        therapistName: body.therapistName || 'Test Therapist',
        therapistRating: body.therapistRating || 5,
        serviceRating: body.serviceRating || 5,
        overallRating: body.overallRating || 5,
        comment: body.comment || 'Test comment',
        isAnonymous: body.isAnonymous || false
      }])
      .select()

    console.log('📝 Simple feedback test - insert result:', { data, error })

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to insert feedback',
        details: error.message,
        code: error.code
      })
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Feedback inserted successfully'
    })

  } catch (error) {
    console.error('❌ Simple feedback test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Simple feedback test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
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

    // Try to read feedback
    const { data, error } = await supabase
      .from('Feedback')
      .select('*')
      .order('createdAt', { ascending: false })

    console.log('📝 Simple feedback test - read result:', { data, error })

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to read feedback',
        details: error.message,
        code: error.code
      })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      message: 'Feedback read successfully'
    })

  } catch (error) {
    console.error('❌ Simple feedback test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Simple feedback test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
