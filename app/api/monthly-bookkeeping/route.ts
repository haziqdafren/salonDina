import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Database not configured', data: [] })
  }
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const query = supabase.from('MonthlyBookkeeping').select('*').order('year', { ascending: false }).order('month', { ascending: false })
    const { data, error } = year ? await query.eq('year', Number(year)) : await query
    if (error) throw error
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('MonthlyBookkeeping GET error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch monthly bookkeeping', data: [] })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Database not configured' })
  }
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    const body = await request.json()
    const insertData = {
      month: Number(body.month),
      year: Number(body.year),
      totalRevenue: Number(body.totalRevenue) || 0,
      totalTherapistFees: Number(body.totalTherapistFees) || 0,
      totalTreatments: Number(body.totalTreatments) || 0,
      freeTreatments: Number(body.freeTreatments) || 0
    }
    const { data, error } = await supabase.from('MonthlyBookkeeping').insert([insertData]).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('MonthlyBookkeeping POST error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create monthly bookkeeping' })
  }
}

export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Database not configured' })
  }
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    const body = await request.json()
    const { id, ...rest } = body
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' })
    const patch: any = {}
    if (rest.month !== undefined) patch.month = Number(rest.month)
    if (rest.year !== undefined) patch.year = Number(rest.year)
    if (rest.totalRevenue !== undefined) patch.totalRevenue = Number(rest.totalRevenue)
    if (rest.totalTherapistFees !== undefined) patch.totalTherapistFees = Number(rest.totalTherapistFees)
    if (rest.totalTreatments !== undefined) patch.totalTreatments = Number(rest.totalTreatments)
    if (rest.freeTreatments !== undefined) patch.freeTreatments = Number(rest.freeTreatments)
    const { data, error } = await supabase.from('MonthlyBookkeeping').update(patch).eq('id', id).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('MonthlyBookkeeping PUT error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update monthly bookkeeping' })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: false, error: 'Database not configured' })
  }
  try {
    if (!supabase) throw new Error('Supabase not initialized')
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID is required' })
    const { error } = await supabase.from('MonthlyBookkeeping').delete().eq('id', Number(id))
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('MonthlyBookkeeping DELETE error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete monthly bookkeeping' })
  }
}


