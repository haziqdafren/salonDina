import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const body = await request.json()
    console.log('📝 Direct feedback creation:', body)

    // Create feedback with only essential fields to avoid RLS issues
    const feedbackData = {
      customerName: body.customerName || 'Anonymous',
      customerPhone: body.customerPhone || '0000000000',
      overallRating: Number(body.overallRating) || 0,
      comment: body.comment || '',
      isAnonymous: Boolean(body.isAnonymous)
    }

    console.log('📝 Inserting minimal feedback:', feedbackData)

    const { data, error } = await supabase
      .from('Feedback')
      .insert([feedbackData])
      .select()

    if (error) {
      console.error('❌ Direct feedback creation error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create feedback',
        details: error.message
      })
    }

    console.log('✅ Direct feedback created successfully:', data[0])

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Feedback saved successfully to database'
    })

  } catch (error) {
    console.error('❌ Direct feedback API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data: feedbacks, error } = await supabase
      .from('Feedback')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.error('❌ Direct feedback fetch error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch feedbacks',
        details: error.message
      })
    }

    return NextResponse.json({
      success: true,
      data: feedbacks || []
    })

  } catch (error) {
    console.error('❌ Direct feedback fetch API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feedbacks',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
