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

    console.log('🧪 Testing direct feedback insert...')

    const testFeedback = {
      customerName: 'Direct Test User',
      customerPhone: '081234567890',
      overallRating: 5,
      comment: 'Testing direct database insert after RLS fix',
      isAnonymous: false
    }

    console.log('📝 Inserting feedback:', testFeedback)

    const { data, error } = await supabase
      .from('Feedback')
      .insert([testFeedback])
      .select()

    if (error) {
      console.error('❌ Direct insert error:', error)
      return NextResponse.json({
        success: false,
        error: 'Insert failed',
        details: error.message,
        code: error.code,
        hint: error.hint
      })
    }

    console.log('✅ Direct insert successful:', data[0])

    return NextResponse.json({
      success: true,
      message: 'Direct insert successful!',
      data: data[0]
    })

  } catch (error) {
    console.error('❌ Test insert error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
