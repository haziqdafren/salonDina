import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: 'Siti Aminah',
    phone: '081234567890',
    email: 'siti@email.com',
    loyaltyVisits: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Nur Halimah',
    phone: '081234567891', 
    email: 'nur@email.com',
    loyaltyVisits: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Maya Sartika',
    phone: '081234567892',
    email: 'maya@email.com', 
    loyaltyVisits: 3,
    createdAt: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: MOCK_CUSTOMERS,
      fallback: 'no_supabase',
      message: 'Using mock customer data - Supabase not configured'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data: customers, error } = await supabase
      .from('Customer')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: customers || []
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
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

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
