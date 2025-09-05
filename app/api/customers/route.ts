import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
      data: []
    })
  }

  try {
    if (!supabase) throw new Error('Supabase not initialized')
    
    const { data: customers, error } = await supabase
      .from('Customer')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) throw error

    const enriched = (customers || []).map((c: any) => ({
      ...c,
      eligibleForFree: Number(c.loyaltyVisits || 0) >= 3
    }))

    return NextResponse.json({
      success: true,
      data: enriched
    })

  } catch (error) {
    console.error('Customers API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch customers',
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
    if (!supabase) throw new Error('Supabase not initialized')
    
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('Customer')
      .insert([body])
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create customer'
    })
  }
}