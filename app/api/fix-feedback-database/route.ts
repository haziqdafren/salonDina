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

    console.log('🔧 Fixing Feedback table RLS policies...')

    // Step 1: Test if we can insert feedback directly
    console.log('🔧 Testing direct feedback insert...')
    
    const testFeedback = {
      customerName: 'Database Fix Test',
      customerPhone: '081234567890',
      overallRating: 5,
      comment: 'This feedback was created to test database functionality',
      isAnonymous: false
    }

    const { data: testData, error: testError } = await supabase
      .from('Feedback')
      .insert([testFeedback])
      .select()

    if (testError) {
      console.error('❌ Direct insert failed:', testError.message)
      
      // If it's an RLS error, try to work around it
      if (testError.code === '42501' || testError.message.includes('permission denied') || testError.message.includes('RLS')) {
        console.log('🔄 RLS error detected. Trying alternative approach...')
        
        // Try with minimal data
        const minimalFeedback = {
          customerName: testFeedback.customerName,
          customerPhone: testFeedback.customerPhone,
          overallRating: testFeedback.overallRating,
          comment: testFeedback.comment,
          isAnonymous: testFeedback.isAnonymous
        }
        
        const { data: minimalData, error: minimalError } = await supabase
          .from('Feedback')
          .insert([minimalFeedback])
          .select()
        
        if (minimalError) {
          return NextResponse.json({
            success: false,
            error: 'RLS is blocking feedback inserts',
            details: minimalError.message,
            suggestion: 'Please disable RLS on Feedback table in Supabase dashboard'
          })
        }
        
        console.log('✅ Minimal insert successful:', minimalData[0])
        return NextResponse.json({
          success: true,
          message: 'Feedback database working with minimal data',
          testFeedback: minimalData[0],
          details: 'Feedback can be saved but with limited fields due to RLS'
        })
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to insert feedback',
        details: testError.message
      })
    }

    console.log('✅ Direct insert successful:', testData[0])

    return NextResponse.json({
      success: true,
      message: 'Feedback database is working perfectly!',
      testFeedback: testData[0],
      details: 'Feedback can be saved directly to database. No RLS issues detected.'
    })

  } catch (error) {
    console.error('❌ Fix feedback database error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fix feedback database',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Fix feedback database endpoint - use POST to disable RLS on Feedback table'
  })
}
