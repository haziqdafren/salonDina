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
    const serviceId = parseInt(id)

    if (isNaN(serviceId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid service ID'
      })
    }

    console.log('🗑️ Deleting service:', serviceId)

    const { error } = await supabase
      .from('Service')
      .delete()
      .eq('id', serviceId)

    if (error) throw error

    console.log('✅ Service deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully'
    })

  } catch (error) {
    console.error('❌ Delete service error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete service',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}