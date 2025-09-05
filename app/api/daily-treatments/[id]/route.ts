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
    const recordId = parseInt(id)

    if (isNaN(recordId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid record ID'
      })
    }

    const { error } = await supabase
      .from('DailyTreatment')
      .delete()
      .eq('id', recordId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Daily treatment record deleted successfully'
    })

  } catch (error) {
    console.error('❌ Delete daily treatment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete daily treatment record',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}