import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: 'Siti Aminah',
    phone: '081234567890',
    email: 'aminah@email.com',
    address: 'Jl. Masjid No. 123, Medan',
    totalVisits: 15,
    totalSpending: 2850000,
    loyaltyVisits: 2,
    isVip: true,
    lastVisit: new Date('2024-03-10').toISOString(),
    createdAt: new Date('2023-06-15').toISOString()
  },
  {
    id: 2,
    name: 'Fatimah Zahra',
    phone: '081234567891',
    email: null,
    address: 'Jl. Islamic Center No. 456, Medan',
    totalVisits: 8,
    totalSpending: 1450000,
    loyaltyVisits: 1,
    isVip: false,
    lastVisit: new Date('2024-03-12').toISOString(),
    createdAt: new Date('2023-08-20').toISOString()
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
    console.log('📝 Creating new customer:', body)

    const customerData = {
      name: body.name || '',
      phone: body.phone || '',
      email: body.email || null,
      address: body.address || null,
      totalVisits: 0,
      totalSpending: 0,
      loyaltyVisits: 0,
      isVip: false
    }

    const { data, error } = await supabase
      .from('Customer')
      .insert([customerData])
      .select()

    if (error) {
      console.error('❌ Create customer error:', error)
      throw error
    }

    console.log('✅ Customer created successfully:', data[0])

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Customer created successfully'
    })

  } catch (error) {
    console.error('❌ Create customer error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create customer',
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
        error: 'Customer ID is required for update'
      })
    }

    console.log('📝 Updating customer:', id, updateData)

    const customerData = {
      name: updateData.name || '',
      phone: updateData.phone || '',
      email: updateData.email || null,
      address: updateData.address || null,
      isVip: updateData.isVip !== undefined ? updateData.isVip : false
    }

    const { data, error } = await supabase
      .from('Customer')
      .update(customerData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('❌ Update customer error:', error)
      throw error
    }

    console.log('✅ Customer updated successfully:', data[0])

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Customer updated successfully'
    })

  } catch (error) {
    console.error('❌ Update customer error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}