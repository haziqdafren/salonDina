import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const therapistId = parseInt(id)

    if (isNaN(therapistId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid therapist ID'
      })
    }

    console.log('🗑️ Deleting therapist:', therapistId)

    const { error } = await supabase
      .from('Therapist')
      .delete()
      .eq('id', therapistId)

    if (error) throw error

    console.log('✅ Therapist deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Therapist deleted successfully'
    })

  } catch (error) {
    console.error('❌ Delete therapist error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete therapist',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const therapistId = parseInt(id)

    if (isNaN(therapistId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid therapist ID'
      })
    }

    const body = await request.json()
    console.log('📝 Updating therapist status:', therapistId, body)

    const { data, error } = await supabase
      .from('Therapist')
      .update(body)
      .eq('id', therapistId)
      .select()

    if (error) throw error

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