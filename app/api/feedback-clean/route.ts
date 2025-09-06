import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
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

    // Validate required fields
    if (!body.customerName || !body.customerPhone) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: customerName, customerPhone'
      })
    }

    const feedbackData = {
      treatmentId: body.treatmentId || null,
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
    if (body.customerName && body.customerPhone) {
      try {
        console.log('🎯 Updating customer loyalty for:', body.customerName)
        
        // Get current customer data
        const { data: customerData, error: customerError } = await supabase
          .from('Customer')
          .select('*')
          .eq('name', body.customerName)
          .eq('phone', body.customerPhone)
          .single()

        if (customerData && !customerError) {
          // Update loyalty counters
          const newTotalVisits = (customerData.totalVisits || 0) + 1
          const newLoyaltyVisits = (customerData.loyaltyVisits || 0) + 1
          const newTotalSpending = (customerData.totalSpending || 0) + (body.servicePrice || 0)
          
          const { error: updateError } = await supabase
            .from('Customer')
            .update({
              totalVisits: newTotalVisits,
              loyaltyVisits: newLoyaltyVisits,
              totalSpending: newTotalSpending,
              lastVisit: new Date().toISOString()
            })
            .eq('id', customerData.id)

          if (updateError) {
            console.error('❌ Failed to update customer loyalty:', updateError)
          } else {
            console.log('✅ Customer loyalty updated successfully')
          }
        } else {
          console.log('ℹ️ Customer not found for loyalty update:', body.customerName)
        }
      } catch (loyaltyError) {
        console.error('❌ Loyalty system error:', loyaltyError)
        // Don't fail the feedback creation if loyalty update fails
      }
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Feedback saved successfully to database'
    })

  } catch (error) {
    console.error('❌ Create feedback error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
