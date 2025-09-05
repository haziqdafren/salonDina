import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured',
      details: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const results: any = {}

    // Test DailyTreatment table
    try {
      const { data: dailyTreatments, error: dtError } = await supabase
        .from('DailyTreatment')
        .select('id, date, price, isFreeVisit, notes, createdAt, updatedAt')
        .limit(1)
      
      results.dailyTreatment = {
        exists: !dtError,
        error: dtError?.message,
        sampleData: dailyTreatments?.[0] || null
      }
    } catch (error) {
      results.dailyTreatment = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test Feedback table
    try {
      const { data: feedbacks, error: fbError } = await supabase
        .from('Feedback')
        .select('id, customerName, customerPhone, serviceName, therapistName, therapistRating, serviceRating, overallRating, comment, isAnonymous, createdAt, updatedAt')
        .limit(1)
      
      results.feedback = {
        exists: !fbError,
        error: fbError?.message,
        sampleData: feedbacks?.[0] || null
      }
    } catch (error) {
      results.feedback = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test Service table
    try {
      const { data: services, error: svcError } = await supabase
        .from('Service')
        .select('id, name, normalPrice, therapistFee')
        .limit(1)
      
      results.service = {
        exists: !svcError,
        error: svcError?.message,
        sampleData: services?.[0] || null
      }
    } catch (error) {
      results.service = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test Customer table
    try {
      const { data: customers, error: custError } = await supabase
        .from('Customer')
        .select('id, name, phone')
        .limit(1)
      
      results.customer = {
        exists: !custError,
        error: custError?.message,
        sampleData: customers?.[0] || null
      }
    } catch (error) {
      results.customer = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    // Test Therapist table
    try {
      const { data: therapists, error: thError } = await supabase
        .from('Therapist')
        .select('id, fullName, phone')
        .limit(1)
      
      results.therapist = {
        exists: !thError,
        error: thError?.message,
        sampleData: therapists?.[0] || null
      }
    } catch (error) {
      results.therapist = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection test completed',
      results
    })

  } catch (error) {
    console.error('❌ Database test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
