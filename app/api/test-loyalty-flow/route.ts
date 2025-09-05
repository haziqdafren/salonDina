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

    console.log('🧪 Testing complete loyalty flow...')

    // Step 1: Create a test customer
    const testCustomer = {
      name: 'Test Customer Loyalty',
      phone: '081234567890',
      email: 'test@loyalty.com',
      address: 'Test Address'
    }

    console.log('📝 Step 1: Creating test customer...')
    const { data: customer, error: customerError } = await supabase
      .from('Customer')
      .insert([testCustomer])
      .select('id, name, phone, loyaltyVisits, totalVisits, totalSpending')
      .single()

    if (customerError) {
      console.error('❌ Customer creation error:', customerError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create test customer',
        details: customerError.message
      })
    }

    console.log('✅ Test customer created:', customer)

    // Step 2: Create a test service
    const testService = {
      name: 'Test Service for Loyalty',
      category: 'Test Category',
      normalPrice: 100000,
      duration: 60,
      therapistFee: 40000,
      isActive: true
    }

    console.log('📝 Step 2: Creating test service...')
    const { data: service, error: serviceError } = await supabase
      .from('Service')
      .insert([testService])
      .select('id, name, normalPrice, therapistFee')
      .single()

    if (serviceError) {
      console.error('❌ Service creation error:', serviceError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create test service',
        details: serviceError.message
      })
    }

    console.log('✅ Test service created:', service)

    // Step 3: Create a test therapist
    const testTherapist = {
      initial: 'TT',
      fullName: 'Test Therapist',
      phone: '081234567891',
      isActive: true
    }

    console.log('📝 Step 3: Creating test therapist...')
    const { data: therapist, error: therapistError } = await supabase
      .from('Therapist')
      .insert([testTherapist])
      .select('id, fullName')
      .single()

    if (therapistError) {
      console.error('❌ Therapist creation error:', therapistError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create test therapist',
        details: therapistError.message
      })
    }

    console.log('✅ Test therapist created:', therapist)

    // Step 4: Create a daily treatment (this should trigger loyalty update)
    const testTreatment = {
      date: new Date().toISOString().slice(0, 10),
      customerId: customer.id,
      serviceId: service.id,
      therapistId: therapist.id,
      price: service.normalPrice,
      isFreeVisit: false,
      notes: 'Test treatment for loyalty flow'
    }

    console.log('📝 Step 4: Creating daily treatment...')
    const { data: treatment, error: treatmentError } = await supabase
      .from('DailyTreatment')
      .insert([testTreatment])
      .select('id, date, price, isFreeVisit, customerId')
      .single()

    if (treatmentError) {
      console.error('❌ Treatment creation error:', treatmentError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create test treatment',
        details: treatmentError.message
      })
    }

    console.log('✅ Test treatment created:', treatment)

    // Step 5: Check customer loyalty after treatment creation
    console.log('📝 Step 5: Checking customer loyalty after treatment...')
    const { data: customerAfterTreatment, error: customerCheckError } = await supabase
      .from('Customer')
      .select('id, name, loyaltyVisits, totalVisits, totalSpending, lastVisit')
      .eq('id', customer.id)
      .single()

    if (customerCheckError) {
      console.error('❌ Customer check error:', customerCheckError)
    } else {
      console.log('✅ Customer after treatment:', customerAfterTreatment)
    }

    // Step 6: Submit feedback (this should trigger additional loyalty update)
    const testFeedback = {
      treatmentId: treatment.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      serviceName: service.name,
      therapistName: therapist.fullName,
      therapistRating: 5,
      serviceRating: 5,
      overallRating: 5,
      comment: 'Test feedback for loyalty flow',
      isAnonymous: false
    }

    console.log('📝 Step 6: Submitting feedback...')
    const feedbackResponse = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testFeedback),
    })

    const feedbackResult = await feedbackResponse.json()
    console.log('✅ Feedback submission result:', feedbackResult)

    // Step 7: Check final customer loyalty after feedback
    console.log('📝 Step 7: Checking final customer loyalty...')
    const { data: finalCustomer, error: finalCustomerError } = await supabase
      .from('Customer')
      .select('id, name, loyaltyVisits, totalVisits, totalSpending, lastVisit')
      .eq('id', customer.id)
      .single()

    if (finalCustomerError) {
      console.error('❌ Final customer check error:', finalCustomerError)
    } else {
      console.log('✅ Final customer state:', finalCustomer)
    }

    // Step 8: Check if feedback was created
    console.log('📝 Step 8: Checking feedback creation...')
    const { data: feedbacks, error: feedbacksError } = await supabase
      .from('Feedback')
      .select('*')
      .eq('treatmentId', treatment.id)

    if (feedbacksError) {
      console.error('❌ Feedback check error:', feedbacksError)
    } else {
      console.log('✅ Feedbacks found:', feedbacks?.length || 0)
    }

    return NextResponse.json({
      success: true,
      message: 'Loyalty flow test completed',
      data: {
        customer: {
          initial: customer,
          afterTreatment: customerAfterTreatment,
          final: finalCustomer
        },
        treatment: treatment,
        service: service,
        therapist: therapist,
        feedback: feedbackResult,
        feedbacks: feedbacks || []
      }
    })

  } catch (error) {
    console.error('❌ Loyalty flow test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Loyalty flow test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
