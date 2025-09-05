import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
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

    // Test creating a feedback record
    const testFeedback = {
      treatmentId: 1,
      customerName: 'Test Customer',
      customerPhone: '081234567890',
      serviceName: 'Test Service',
      therapistName: 'Test Therapist',
      therapistRating: 5,
      serviceRating: 5,
      overallRating: 5,
      comment: 'Test feedback from API test',
      isAnonymous: false
    }

    console.log('📝 Creating test feedback:', testFeedback)

    const { data, error } = await supabase
      .from('Feedback')
      .insert([testFeedback])
      .select()

    if (error) {
      console.error('❌ Create test feedback error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create test feedback',
        details: error.message
      })
    }

    console.log('✅ Test feedback created successfully:', data[0])

    // Now try to retrieve all feedback
    const { data: allFeedback, error: fetchError } = await supabase
      .from('Feedback')
      .select('*')
      .order('createdAt', { ascending: false })

    if (fetchError) {
      console.error('❌ Fetch feedback error:', fetchError)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch feedback',
        details: fetchError.message
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test feedback created and retrieved successfully',
      createdFeedback: data[0],
      allFeedback: allFeedback || []
    })

  } catch (error) {
    console.error('❌ Test feedback error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test feedback failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
