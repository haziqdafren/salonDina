import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

const MOCK_BOOKINGS = [
  {
    id: 1,
    customerName: 'Siti Aminah',
    customerPhone: '081234567890',
    serviceName: 'Facial Brightening',
    totalPrice: 40000,
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
    totalPrice: 25000,
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

    // Get bookings with related service and therapist data
    const { data: bookings, error } = await supabase
      .from('Booking')
      .select(`
        *,
        Service!serviceId(name, category, normalPrice),
        Therapist!therapistId(fullName, initial)
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
  console.log('🔥 BOOKING API CALLED!')
  
  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase not configured')
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
    console.log('📝 Received booking data:', body)
    
    // Parse date and time into proper timestamp
    let bookingDateTime
    try {
      if (body.date && body.time) {
        const dateStr = body.date
        const timeStr = body.time.replace(' 🕌', '') // Remove prayer time indicator
        bookingDateTime = new Date(`${dateStr}T${timeStr}:00`).toISOString()
      } else {
        bookingDateTime = new Date().toISOString()
      }
      console.log('📅 Parsed booking date:', bookingDateTime)
    } catch (dateError) {
      console.warn('⚠️ Date parsing error, using current time:', dateError)
      bookingDateTime = new Date().toISOString()
    }
    
    // Map BookingSystem data to Booking table structure (camelCase)
    const bookingData = {
      customerName: body.customerName || 'Unknown Customer',
      customerPhone: body.phone || '',
      customerEmail: null, // Optional field
      bookingDate: bookingDateTime,
      timeSlot: body.time?.replace(' 🕌', '') || '10:00',
      serviceId: null, // Will try to look up, otherwise null
      therapistId: null, // Will be assigned later
      totalPrice: body.servicePrice || 0,
      status: body.status || 'pending',
      notes: body.notes || 'No notes'
    }
    
    // Try to find matching service ID from service name
    if (body.service) {
      try {
        console.log('🔍 Looking up service:', body.service)
        const { data: services, error: serviceError } = await supabase
          .from('Service')
          .select('id')
          .ilike('name', `%${body.service.split(',')[0].trim()}%`) // Get first service if multiple
          .limit(1)
        
        if (!serviceError && services && services.length > 0) {
          bookingData.serviceId = services[0].id
          console.log('✅ Found service ID:', bookingData.serviceId)
        } else {
          console.log('⚠️ Service not found, leaving serviceId as null')
        }
      } catch (serviceError) {
        console.warn('⚠️ Service lookup error:', serviceError)
      }
    }
    
    console.log('🗂️ Final booking data for Booking table:', bookingData)
    
    const { data, error } = await supabase
      .from('Booking')
      .insert([bookingData])
      .select()

    if (error) {
      console.error('❌ Database error:', error)
      throw error
    }

    console.log('✅ Booking saved successfully to Booking table:', data)

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Booking saved to database successfully!'
    })

  } catch (error) {
    console.error('❌ Create booking error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create booking',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}