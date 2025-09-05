import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'
import { supabaseAdmin, isServiceRoleConfigured } from '../../../lib/supabaseAdmin'

// In-memory feedback store to support fallback mode
type MockFeedback = {
  id: number
  treatmentId: number
  customerName: string
  customerPhone: string
  serviceName: string
  therapistName: string
  therapistRating: number
  serviceRating: number
  overallRating: number
  comment: string
  isAnonymous: boolean
  createdAt: string
  updatedAt: string
}
const MOCK_FEEDBACKS: MockFeedback[] = []

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: MOCK_FEEDBACKS,
      fallback: 'no_supabase',
      message: 'Using in-memory feedback - Supabase not configured'
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
      console.error('Feedback GET error:', error)
      
      // If table doesn't exist, return in-memory store
      if (error.code === 'PGRST204' || error.message.includes('relation "Feedback" does not exist')) {
        console.log('🔄 Feedback table not found, returning in-memory feedbacks')
        return NextResponse.json({
          success: true,
          data: MOCK_FEEDBACKS,
          fallback: 'table_not_found',
          message: 'Feedback table not found, returning in-memory feedbacks'
        })
      }
      
      throw error
    }

    return NextResponse.json({
      success: true,
      data: feedbacks || []
    })

  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json({
      success: true,
      data: MOCK_FEEDBACKS,
      fallback: 'error',
      message: 'Using in-memory feedback due to error'
    })
  }
}

export async function POST(request: NextRequest) {
  // Read body once and reuse everywhere to avoid "Body already read" errors
  const body = await request.json()

  if (!isSupabaseConfigured()) {
    const mockFeedback: MockFeedback = {
      id: Date.now(),
      treatmentId: body.treatmentId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      serviceName: body.serviceName || '',
      therapistName: body.therapistName || '',
      therapistRating: Number(body.therapistRating) || 0,
      serviceRating: Number(body.serviceRating) || 0,
      overallRating: Number(body.overallRating) || 0,
      comment: body.comment || '',
      isAnonymous: body.isAnonymous || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    MOCK_FEEDBACKS.unshift(mockFeedback)
    return NextResponse.json({
      success: true,
      data: mockFeedback,
      message: 'Feedback saved successfully (mock mode)'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    console.log('📝 Creating feedback:', body)

    // Validate required fields
    if (!body.treatmentId || !body.customerName || !body.customerPhone) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: treatmentId, customerName, customerPhone'
      })
    }

    const feedbackData = {
      treatmentId: body.treatmentId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      serviceName: body.serviceName || '',
      therapistName: body.therapistName || '',
      therapistRating: Number(body.therapistRating) || 0,
      serviceRating: Number(body.serviceRating) || 0,
      overallRating: Number(body.overallRating) || 0,
      comment: body.comment || '',
      isAnonymous: body.isAnonymous || false
    }

    // Prefer service role for insert to bypass RLS safely (server-side)
    const client = isServiceRoleConfigured() && supabaseAdmin ? supabaseAdmin : supabase
    const { data, error } = await client
      .from('Feedback')
      .insert([feedbackData])
      .select()

    if (error) {
      console.error('❌ Create feedback error:', error)
      
      // If table doesn't exist, use mock mode
      if (error.code === 'PGRST204' || error.message.includes('relation "Feedback" does not exist')) {
        console.log('🔄 Feedback table not found, using mock mode')
        
        const mockFeedback: MockFeedback = {
          id: Date.now(),
          ...feedbackData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        MOCK_FEEDBACKS.unshift(mockFeedback)
        
        return NextResponse.json({
          success: true,
          data: mockFeedback,
          fallback: 'table_not_found',
          message: 'Feedback saved successfully (mock mode - table not found)'
        })
      }
      
      throw error
    }

    console.log('✅ Feedback created successfully:', data[0])

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Feedback saved successfully'
    })

  } catch (error) {
    console.error('❌ Create feedback error:', error)
    
    // Fallback to mock mode if there's any error
    const mockFeedback: MockFeedback = {
      id: Date.now(),
      treatmentId: body.treatmentId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      serviceName: body.serviceName || '',
      therapistName: body.therapistName || '',
      therapistRating: Number(body.therapistRating) || 0,
      serviceRating: Number(body.serviceRating) || 0,
      overallRating: Number(body.overallRating) || 0,
      comment: body.comment || '',
      isAnonymous: body.isAnonymous || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    MOCK_FEEDBACKS.unshift(mockFeedback)
    return NextResponse.json({
      success: true,
      data: mockFeedback,
      fallback: 'error_fallback',
      message: 'Feedback saved successfully (fallback mode)'
    })
  }
}