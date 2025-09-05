import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

const MOCK_THERAPISTS = [
  {
    id: 1,
    initial: 'F',
    fullName: 'Fatimah',
    phone: '081234567801',
    isActive: true,
    createdAt: new Date('2023-01-15').toISOString(),
    updatedAt: new Date('2024-03-01').toISOString()
  },
  {
    id: 2,
    initial: 'K',
    fullName: 'Khadijah',
    phone: '081234567802',
    isActive: true,
    createdAt: new Date('2023-02-10').toISOString(),
    updatedAt: new Date('2024-02-28').toISOString()
  },
  {
    id: 3,
    initial: 'A',
    fullName: 'Aisyah',
    phone: '081234567803',
    isActive: true,
    createdAt: new Date('2023-03-05').toISOString(),
    updatedAt: new Date('2024-03-10').toISOString()
  },
  {
    id: 4,
    initial: 'S',
    fullName: 'Siti Aminah',
    phone: '081234567804',
    isActive: false,
    createdAt: new Date('2023-01-20').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  }
]

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: MOCK_THERAPISTS,
      fallback: 'no_supabase',
      message: 'Using mock therapist data - Supabase not configured'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { data: therapists, error } = await supabase
      .from('Therapist')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: therapists || []
    })

  } catch (error) {
    console.error('Therapists API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch therapists',
      data: []
    })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    const body = await request.json()
    const mockTherapist = {
      id: Date.now(),
      ...body,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return NextResponse.json({
      success: true,
      data: mockTherapist,
      message: 'Therapist created successfully (mock mode)'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const body = await request.json()
    console.log('📝 Creating new therapist:', body)

    const therapistData = {
      initial: body.initial || '',
      fullName: body.fullName || '',
      phone: body.phone || null,
      isActive: body.isActive !== undefined ? body.isActive : true
    }

    const { data, error } = await supabase
      .from('Therapist')
      .insert([therapistData])
      .select()

    if (error) {
      console.error('❌ Create therapist error:', error)
      throw error
    }

    console.log('✅ Therapist created successfully:', data[0])

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Therapist created successfully'
    })

  } catch (error) {
    console.error('❌ Create therapist error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create therapist',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    const body = await request.json()
    const { id, ...updateData } = body
    return NextResponse.json({
      success: true,
      data: { id, ...updateData, updatedAt: new Date().toISOString() },
      message: 'Therapist updated successfully (mock mode)'
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
        error: 'Therapist ID is required for update'
      })
    }

    console.log('📝 Updating therapist:', id, updateData)

    const therapistData = {
      initial: updateData.initial || '',
      fullName: updateData.fullName || '',
      phone: updateData.phone || null,
      isActive: updateData.isActive !== undefined ? updateData.isActive : true
    }

    const { data, error } = await supabase
      .from('Therapist')
      .update(therapistData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('❌ Update therapist error:', error)
      throw error
    }

    console.log('✅ Therapist updated successfully:', data[0])

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Therapist updated successfully'
    })

  } catch (error) {
    console.error('❌ Update therapist error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update therapist',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}