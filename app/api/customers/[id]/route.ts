import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully (mock mode)'
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

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured()) {
    const body = await request.json()
    const { id } = await params
    return NextResponse.json({
      success: true,
      data: { id: parseInt(id), ...body, updatedAt: new Date().toISOString() },
      message: 'Customer updated successfully (mock mode)'
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

    const body = await request.json()
    console.log('📝 Updating customer:', customerId, body)

    const { data, error } = await supabase
      .from('Customer')
      .update(body)
      .eq('id', customerId)
      .select()

    if (error) throw error

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