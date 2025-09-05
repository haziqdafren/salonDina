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
    const customerId = parseInt(id)

    if (isNaN(customerId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid customer ID'
      })
    }

    console.log('🗑️ Deleting customer:', customerId)

    const { error } = await supabase
      .from('Customer')
      .delete()
      .eq('id', customerId)

    if (error) throw error

    console.log('✅ Customer deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    })

  } catch (error) {
    console.error('❌ Delete customer error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}