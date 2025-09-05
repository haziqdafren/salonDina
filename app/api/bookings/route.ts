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
    
    const { data: bookings, error } = await supabase
      .from('Booking')
      .select(`
        *,
        Service:serviceId(name, category),
        Therapist:therapistId(fullName, initial)
      `)
      .order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: bookings || []
    })

  } catch (error) {
    console.error('Bookings API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch bookings',
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
      .from('Booking')
      .insert([body])
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error) {
    console.error('Create booking error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create booking'
    })
  }
}