import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

export async function PATCH(
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
    const bookingId = parseInt(id)
    const body = await request.json()
    console.log('🔄 Updating booking status:', { bookingId, status: body.status })

    if (!body.status) {
      return NextResponse.json({
        success: false,
        error: 'Missing status in request body'
      })
    }

    const { data, error } = await supabase
      .from('Booking')
      .update({ status: body.status })
      .eq('id', bookingId)
      .select()

    if (error) {
      console.error('❌ Update booking error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      })
    }

    console.log('✅ Booking status updated successfully:', data[0])

    return NextResponse.json({
      success: true,
      data: data[0],
      message: 'Booking status updated successfully'
    })

  } catch (error) {
    console.error('❌ Update booking status error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update booking status',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}