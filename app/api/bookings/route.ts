import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

const MOCK_BOOKINGS = [
  {
    id: 1,
    customerName: 'Siti Aminah',
    customerPhone: '081234567890',
    serviceName: 'Facial Brightening',
    servicePrice: 40000,
    therapistName: 'Fatimah',
    bookingDate: new Date().toISOString(),
    status: 'confirmed',
    notes: 'Regular customer'
  },
  {
    id: 2,
    customerName: 'Nur Halimah',
    customerPhone: '081234567891',
    serviceName: 'Hair Spa Creambath', 
    servicePrice: 25000,
    therapistName: 'Khadijah',
    bookingDate: new Date().toISOString(),
    status: 'pending',
    notes: 'First time visit'
  }
]

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: MOCK_BOOKINGS,
      fallback: 'no_supabase',
      message: 'Using mock booking data - Supabase not configured'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

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
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

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
