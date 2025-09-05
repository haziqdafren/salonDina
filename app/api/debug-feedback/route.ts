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

    console.log('🔍 Debugging feedback system...')

    // Test 1: Check if Feedback table exists and has data
    const { data: feedbacks, error: feedbackError } = await supabase
      .from('Feedback')
      .select('*')
      .order('createdAt', { ascending: false })

    console.log('📊 Feedback table query result:', { feedbacks, error: feedbackError })

    // Test 2: Try to create a test feedback
    const testFeedback = {
      treatmentId: 1,
      customerName: 'Debug Test Customer',
      customerPhone: '081234567890',
      serviceName: 'Debug Test Service',
      therapistName: 'Debug Test Therapist',
      therapistRating: 5,
      serviceRating: 5,
      overallRating: 5,
      comment: 'This is a debug test feedback',
      isAnonymous: false
    }

    console.log('📝 Attempting to create test feedback:', testFeedback)

    const { data: newFeedback, error: createError } = await supabase
      .from('Feedback')
      .insert([testFeedback])
      .select()

    console.log('📝 Test feedback creation result:', { newFeedback, error: createError })

    // Test 3: Check if the feedback was actually created
    const { data: allFeedbacks, error: allError } = await supabase
      .from('Feedback')
      .select('*')
      .order('createdAt', { ascending: false })

    console.log('📊 All feedbacks after creation:', { allFeedbacks, error: allError })

    return NextResponse.json({
      success: true,
      message: 'Debug completed',
      results: {
        initialFeedbacks: feedbacks || [],
        feedbackError: feedbackError?.message || null,
        testFeedbackCreation: {
          success: !createError,
          data: newFeedback || null,
          error: createError?.message || null
        },
        finalFeedbacks: allFeedbacks || [],
        allError: allError?.message || null
      }
    })

  } catch (error) {
    console.error('❌ Debug feedback error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
