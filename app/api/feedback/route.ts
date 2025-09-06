import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin, isSupabaseConfigured, isServiceRoleConfigured } from '../../../lib/supabase'

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
    console.error('Feedback API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feedbacks',
      details: error instanceof Error ? error.message : 'Unknown error'
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

    // Insert feedback directly to database
    console.log('📝 Inserting feedback to database:', feedbackData)
    
    const { data, error } = await supabase
      .from('Feedback')
      .insert([feedbackData])
      .select()

    if (error) {
      console.error('❌ Create feedback error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to create feedback',
        details: error.message
      })
    }

    console.log('✅ Feedback created successfully:', data[0])

    // 🎯 LOYALTY SYSTEM INTEGRATION
    // Update customer loyalty counters when feedback is submitted
    try {
      console.log('🔄 Updating customer loyalty counters...')
      
      // Find customer by phone number
      const { data: customer, error: customerError } = await supabase
        .from('Customer')
        .select('id, phone, loyaltyVisits, totalVisits, totalSpending')
        .eq('phone', body.customerPhone)
        .single()

      if (customerError) {
        console.error('❌ Customer lookup error:', customerError)
      } else if (customer) {
        console.log('👤 Found customer:', customer.name, 'Current loyalty:', customer.loyaltyVisits)
        
        // Update loyalty counters
        const newLoyaltyVisits = Number(customer.loyaltyVisits || 0) + 1
        const newTotalVisits = Number(customer.totalVisits || 0) + 1
        
        // Calculate spending from the treatment (if we can find it)
        let additionalSpending = 0
        try {
          const { data: treatment } = await supabase
            .from('DailyTreatment')
            .select('price, isFreeVisit')
            .eq('id', body.treatmentId)
            .single()
          
          if (treatment && !treatment.isFreeVisit) {
            additionalSpending = Number(treatment.price || 0)
          }
        } catch (treatmentError) {
          console.log('⚠️ Could not find treatment for spending calculation:', treatmentError)
        }
        
        const newTotalSpending = Number(customer.totalSpending || 0) + additionalSpending
        
        // Update customer record
        const { error: updateError } = await supabase
          .from('Customer')
          .update({
            loyaltyVisits: newLoyaltyVisits,
            totalVisits: newTotalVisits,
            totalSpending: newTotalSpending,
            lastVisit: new Date().toISOString()
          })
          .eq('id', customer.id)

        if (updateError) {
          console.error('❌ Customer update error:', updateError)
        } else {
          console.log('✅ Customer loyalty updated:', {
            id: customer.id,
            newLoyaltyVisits,
            newTotalVisits,
            newTotalSpending
          })
        }
      } else {
        console.log('⚠️ Customer not found for phone:', body.customerPhone)
      }
    } catch (loyaltyError) {
      console.error('❌ Loyalty update error:', loyaltyError)
      // Don't fail the feedback creation if loyalty update fails
    }

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