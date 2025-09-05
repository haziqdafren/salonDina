import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

const MOCK_DAILY_TREATMENTS = [
  {
    id: 1,
    date: new Date().toISOString(),
    customerName: 'Siti Aminah',
    customerPhone: '081234567890',
    serviceName: 'Facial Brightening',
    servicePrice: 40000,
    therapistName: 'Fatimah',
    therapistFee: 16000,
    revenue: 40000,
    profit: 24000,
    notes: 'Regular customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: MOCK_DAILY_TREATMENTS,
      fallback: 'no_supabase',
      message: 'Using mock daily treatment data - Supabase not configured'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    let query = supabase
      .from('DailyTreatment')
      .select('*')
      .order('createdAt', { ascending: false })

    // Filter by specific date if provided
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      query = query
        .gte('date', startOfDay.toISOString())
        .lte('date', endOfDay.toISOString())
    }

    const { data: dailyTreatments, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: dailyTreatments || []
    })

  } catch (error) {
    console.error('Daily treatments API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch daily treatments',
      data: []
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
    console.log('📝 Creating daily treatment record:', body)

    // Validate required fields
    if (!body.customerName || !body.serviceName || !body.servicePrice) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: customerName, serviceName, servicePrice'
      })
    }

    const treatmentData = {
      date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
      customerName: body.customerName,
      customerPhone: body.customerPhone || '',
      serviceName: body.serviceName,
      servicePrice: Number(body.servicePrice),
      therapistName: body.therapistName || '',
      therapistFee: Number(body.therapistFee) || 0,
      revenue: Number(body.servicePrice),
      profit: Number(body.servicePrice) - (Number(body.therapistFee) || 0),
      notes: body.notes || ''
    }

    const { data, error } = await supabase
      .from('DailyTreatment')
      .insert([treatmentData])
      .select()

    if (error) {
      console.error('❌ Create daily treatment error:', error)
      throw error
    }

    console.log('✅ Daily treatment created successfully:', data[0])

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Daily treatment record created successfully'
    })

  } catch (error) {
    console.error('❌ Create daily treatment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create daily treatment record',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Record ID is required for update'
      })
    }

    // Recalculate profit if servicePrice or therapistFee changed
    if (updateData.servicePrice !== undefined || updateData.therapistFee !== undefined) {
      const servicePrice = Number(updateData.servicePrice || 0)
      const therapistFee = Number(updateData.therapistFee || 0)
      updateData.revenue = servicePrice
      updateData.profit = servicePrice - therapistFee
    }

    const { data, error } = await supabase
      .from('DailyTreatment')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Daily treatment record updated successfully'
    })

  } catch (error) {
    console.error('❌ Update daily treatment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update daily treatment record',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}