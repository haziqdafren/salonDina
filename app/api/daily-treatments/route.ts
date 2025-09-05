import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

// In-memory mock store for fallback mode
type MockTreatment = {
  id: number
  date: string
  customerName: string
  customerPhone: string
  serviceName: string
  servicePrice: number
  therapistName: string
  therapistFee: number
  revenue: number
  profit: number
  notes?: string
  createdAt: string
  updatedAt: string
}
const MOCK_DAILY_TREATMENTS: MockTreatment[] = []

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')

  if (!isSupabaseConfigured()) {
    // Filter by date if provided
    let data = [...MOCK_DAILY_TREATMENTS]
    if (date) {
      const day = new Date(date)
      const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0))
      const end = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 23, 59, 59, 999))
      data = data.filter(t => {
        const ts = new Date(t.date).getTime()
        return ts >= start.getTime() && ts <= end.getTime()
      })
    }
    return NextResponse.json({
      success: true,
      data,
      fallback: 'no_supabase',
      message: 'Using mock daily treatment data - Supabase not configured'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    let query = supabase
      .from('DailyTreatment')
      .select(`
        id, date, price, isFreeVisit, notes, createdAt,
        Customer:customerId(id, name, phone),
        Service:serviceId(id, name, therapistFee),
        Therapist:therapistId(id, fullName)
      `)
      .order('createdAt', { ascending: false })

    // Filter by specific date if provided
    if (date) {
      // DailyTreatment.date is a DATE column; filter by equality
      query = query.eq('date', date)
    }

    const { data: rawTreatments, error } = await query

    if (error) {
      console.error('Daily treatments GET error:', error)
      
      // If table doesn't exist, return in-memory store
      if (error.code === 'PGRST204' || error.message.includes('relation "DailyTreatment" does not exist')) {
        console.log('🔄 DailyTreatment table not found, returning in-memory daily treatments')
        return NextResponse.json({
          success: true,
          data: MOCK_DAILY_TREATMENTS,
          fallback: 'table_not_found',
          message: 'DailyTreatment table not found, returning in-memory daily treatments'
        })
      }
      
      throw error
    }

    // Map DB rows to UI-friendly shape
    const mapped = (rawTreatments || []).map((r: any) => {
      const servicePrice = Number(r.price || 0)
      const therapistFee = Number(r.Service?.therapistFee || 0)
      return {
        id: r.id,
        date: new Date(r.date).toISOString(),
        customerName: r.Customer?.name || '',
        customerPhone: r.Customer?.phone || '',
        serviceName: r.Service?.name || '',
        servicePrice,
        therapistName: r.Therapist?.fullName || '',
        therapistFee,
        revenue: servicePrice,
        profit: servicePrice - therapistFee,
        notes: r.notes || '',
        createdAt: r.createdAt
      }
    })

    return NextResponse.json({
      success: true,
      data: mapped
    })

  } catch (error) {
    console.error('Daily treatments API error:', error)
    return NextResponse.json({
      success: true,
      data: MOCK_DAILY_TREATMENTS,
      fallback: 'error',
      message: 'Using in-memory daily treatments due to error'
    })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    // For mock mode, simulate successful creation
    const body = await request.json()
    const mockTreatment: MockTreatment = {
      id: Date.now(),
      date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
      customerName: body.customerName,
      customerPhone: body.customerPhone || '',
      serviceName: body.serviceName,
      servicePrice: Number(body.servicePrice),
      therapistName: body.therapistName || '',
      therapistFee: Number(body.therapistFee) || 0,
      revenue: Number(body.servicePrice),
      profit: Number(body.servicePrice) - (Number(body.therapistFee) || 0),
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    MOCK_DAILY_TREATMENTS.unshift(mockTreatment)
    
    return NextResponse.json({
      success: true,
      data: mockTreatment,
      message: 'Daily treatment record created successfully (mock mode)'
    })
  }

  let parsedBody: any = null
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const body = await request.json()
    parsedBody = body
    console.log('📝 Creating daily treatment record:', body)
    // Validate minimal fields
    if (!body.customerName && !body.customerId) {
      return NextResponse.json({ success: false, error: 'Missing customer info' })
    }
    if (!body.serviceName && !body.serviceId) {
      return NextResponse.json({ success: false, error: 'Missing service info' })
    }
    const price = Number(body.servicePrice ?? body.price)
    if (!price || price <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid price' })
    }

    // Resolve or upsert Customer by phone (preferred) or name
    let customerId = body.customerId
    let customerRecord: any = null
    if (!customerId) {
      if (body.customerPhone) {
        const { data: found, error: findErr } = await supabase
          .from('Customer')
          .select('id, phone, loyaltyVisits, totalVisits, totalSpending')
          .eq('phone', body.customerPhone)
          .limit(1)
        if (findErr) throw findErr
        if (found && found.length > 0) {
          customerId = found[0].id
          customerRecord = found[0]
        } else {
          const { data: inserted, error: insErr } = await supabase
            .from('Customer')
            .insert([{ name: body.customerName || 'Customer', phone: body.customerPhone }])
            .select('id, loyaltyVisits, totalVisits, totalSpending')
            .single()
          if (insErr) throw insErr
          customerId = inserted.id
          customerRecord = inserted
        }
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('Customer')
          .insert([{ name: body.customerName || 'Customer', phone: body.customerPhone || '' }])
          .select('id, loyaltyVisits, totalVisits, totalSpending')
          .single()
        if (insErr) throw insErr
        customerId = inserted.id
        customerRecord = inserted
      }
    }
    if (!customerRecord) {
      const { data: cRec } = await supabase
        .from('Customer')
        .select('id, loyaltyVisits, totalVisits, totalSpending')
        .eq('id', customerId)
        .single()
      customerRecord = cRec
    }

    // Resolve Service
    let serviceId = body.serviceId
    let serviceTherapistFee = 0
    if (!serviceId && body.serviceName) {
      const { data: svc, error: svcErr } = await supabase
        .from('Service')
        .select('id, therapistFee, name')
        .ilike('name', body.serviceName)
        .limit(1)
      if (svcErr) throw svcErr
      if (svc && svc.length > 0) {
        serviceId = svc[0].id
        serviceTherapistFee = Number(svc[0].therapistFee || 0)
      }
    }
    if (serviceId) {
      const { data: svc, error: svcErr } = await supabase
        .from('Service')
        .select('therapistFee')
        .eq('id', serviceId)
        .single()
      if (!svcErr && svc) serviceTherapistFee = Number(svc.therapistFee || 0)
    }

    // Resolve Therapist
    let therapistId = body.therapistId || null
    if (!therapistId && body.therapistName) {
      const { data: th, error: thErr } = await supabase
        .from('Therapist')
        .select('id, fullName')
        .ilike('fullName', body.therapistName)
        .limit(1)
      if (thErr) throw thErr
      if (th && th.length > 0) therapistId = th[0].id
    }

    const dateOnly = body.date ? body.date : new Date().toISOString().slice(0, 10)

    // Loyalty logic: every 4th treatment is free (after 3 paid visits)
    const currentLoyalty = Number(customerRecord?.loyaltyVisits || 0)
    const shouldBeFree = currentLoyalty >= 3

    const insertData: any = {
      date: dateOnly,
      customerId,
      serviceId,
      therapistId,
      price,
      isFreeVisit: shouldBeFree ? true : false,
      notes: body.notes || ''
    }

    // Insert into DailyTreatment
    const { data: created, error: insError } = await supabase
      .from('DailyTreatment')
      .insert([insertData])
      .select(`
        id, date, price, isFreeVisit, notes, createdAt,
        Customer:customerId(id, name, phone),
        Service:serviceId(id, name, therapistFee),
        Therapist:therapistId(id, fullName)
      `)
      .single()

    if (insError) {
      console.error('❌ Create daily treatment error:', insError)
      
      // If table doesn't exist, try to create it or use alternative approach
      if (insError.code === 'PGRST204' || (insError.message || '').includes('relation "DailyTreatment" does not exist')) {
        console.log('🔄 DailyTreatment table not found, using mock mode')
        
        // Create a mock response for now
        const mockTreatment: MockTreatment = {
          id: Date.now(),
          date: new Date(insertData.date).toISOString(),
          customerName: body.customerName || '',
          customerPhone: body.customerPhone || '',
          serviceName: body.serviceName || '',
          servicePrice: Number(insertData.price) || 0,
          therapistName: body.therapistName || '',
          therapistFee: Number(serviceTherapistFee) || 0,
          revenue: Number(insertData.price) || 0,
          profit: (Number(insertData.price) || 0) - (Number(serviceTherapistFee) || 0),
          notes: insertData.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        MOCK_DAILY_TREATMENTS.unshift(mockTreatment)
        
      return NextResponse.json({
          success: true,
          data: mockTreatment,
          fallback: 'table_not_found',
          message: 'Daily treatment record created successfully (mock mode - table not found)'
        })
      }
      
      throw insError
    }

    console.log('✅ Daily treatment created successfully:', created)

    const servicePrice = Number(created.price || 0)
    const tFee = Number((created.Service as any)?.therapistFee ?? serviceTherapistFee)
    const enriched = {
      id: created.id,
      date: new Date(created.date).toISOString(),
      customerName: (created.Customer as any)?.name || '',
      customerPhone: (created.Customer as any)?.phone || '',
      serviceName: (created.Service as any)?.name || '',
      servicePrice,
      therapistName: (created.Therapist as any)?.fullName || '',
      therapistFee: tFee,
      revenue: servicePrice,
      profit: servicePrice - tFee,
      notes: created.notes || '',
      createdAt: created.createdAt,
      isFreeVisit: !!created.isFreeVisit,
      loyalty: {
        previousLoyalty: currentLoyalty,
        thisVisitFree: shouldBeFree
      }
    }

    // Update customer counters based on loyalty
    try {
      const addVisit = 1
      const newTotalVisits = Number(customerRecord?.totalVisits || 0) + addVisit
      const newLoyalty = shouldBeFree ? 0 : currentLoyalty + 1
      const newSpending = Number(customerRecord?.totalSpending || 0) + (shouldBeFree ? 0 : servicePrice)
      await supabase
        .from('Customer')
        .update({
          totalVisits: newTotalVisits,
          loyaltyVisits: newLoyalty,
          totalSpending: newSpending,
          lastVisit: new Date().toISOString()
        })
        .eq('id', customerId)
    } catch (custErr) {
      console.error('Failed updating customer loyalty counters:', custErr)
    }

    // Upsert MonthlyBookkeeping for the month of this treatment
    try {
      const d = new Date(dateOnly)
      const month = d.getUTCMonth() + 1
      const year = d.getUTCFullYear()
      // Recompute sums for that month
      const { data: monthRows } = await supabase
        .from('DailyTreatment')
        .select('price, isFreeVisit, date')
        .gte('date', new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)).toISOString())
        .lte('date', new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString())

      const paidRevenue = (monthRows || []).reduce((sum, r: any) => r.isFreeVisit ? sum : sum + Number(r.price || 0), 0)
      const totalTreatments = (monthRows || []).length
      const freeTreatments = (monthRows || []).filter((r: any) => r.isFreeVisit).length
      const totalTherapistFees = Math.round(paidRevenue * 0.4)

      // Try update then insert if missing
      const { data: existing } = await supabase
        .from('MonthlyBookkeeping')
        .select('id')
        .eq('month', month)
        .eq('year', year)
        .single()

      if (existing && (existing as any).id) {
        await supabase
          .from('MonthlyBookkeeping')
          .update({ totalRevenue: paidRevenue, totalTherapistFees, totalTreatments, freeTreatments })
          .eq('id', (existing as any).id)
      } else {
        await supabase
          .from('MonthlyBookkeeping')
          .insert([{ month, year, totalRevenue: paidRevenue, totalTherapistFees, totalTreatments, freeTreatments }])
      }
    } catch (rollupErr) {
      console.error('Monthly rollup update failed:', rollupErr)
    }

    return NextResponse.json({
      success: true,
      data: enriched,
      message: 'Daily treatment record created successfully'
    })

  } catch (error) {
    console.error('❌ Create daily treatment error:', error)
    
    // Fallback to mock mode if there's any error
    const body = parsedBody || {}
    const mockTreatment: MockTreatment = {
      id: Date.now(),
      date: body.date ? new Date(body.date).toISOString() : new Date().toISOString(),
      customerName: body.customerName,
      customerPhone: body.customerPhone || '',
      serviceName: body.serviceName,
      servicePrice: Number(body.servicePrice),
      therapistName: body.therapistName || '',
      therapistFee: Number(body.therapistFee) || 0,
      revenue: Number(body.servicePrice),
      profit: Number(body.servicePrice) - (Number(body.therapistFee) || 0),
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    MOCK_DAILY_TREATMENTS.unshift(mockTreatment)

    return NextResponse.json({
      success: true,
      data: mockTreatment,
      fallback: 'error_fallback',
      message: 'Daily treatment record created successfully (fallback mode)'
    })
  }
}

export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    // For mock mode, simulate successful update
    const body = await request.json()
    const { id, ...updateData } = body
    
    const index = MOCK_DAILY_TREATMENTS.findIndex(t => t.id === id)
    const servicePrice = updateData.servicePrice ? Number(updateData.servicePrice) : (index >= 0 ? MOCK_DAILY_TREATMENTS[index].servicePrice : 0)
    const therapistFee = updateData.therapistFee ? Number(updateData.therapistFee) : (index >= 0 ? MOCK_DAILY_TREATMENTS[index].therapistFee : 0)
    const mockUpdatedTreatment: MockTreatment = {
      ...(index >= 0 ? MOCK_DAILY_TREATMENTS[index] : ({} as MockTreatment)),
      id,
      ...updateData,
      revenue: servicePrice,
      profit: servicePrice - therapistFee,
      updatedAt: new Date().toISOString()
    }
    if (index >= 0) {
      MOCK_DAILY_TREATMENTS[index] = mockUpdatedTreatment
    } else {
      MOCK_DAILY_TREATMENTS.unshift(mockUpdatedTreatment)
    }
    
    return NextResponse.json({
      success: true,
      data: mockUpdatedTreatment,
      message: 'Daily treatment record updated successfully (mock mode)'
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
        error: 'Record ID is required for update'
      })
    }

    // Resolve mapping to schema fields
    const patch: any = {}
    if (updateData.date) patch.date = updateData.date
    if (updateData.servicePrice !== undefined || updateData.price !== undefined) {
      patch.price = Number(updateData.servicePrice ?? updateData.price)
    }
    if (updateData.notes !== undefined) patch.notes = updateData.notes
    if (updateData.customerId) patch.customerId = updateData.customerId
    if (updateData.serviceId) patch.serviceId = updateData.serviceId
    if (updateData.therapistId) patch.therapistId = updateData.therapistId

    const { data: updated, error } = await supabase
      .from('DailyTreatment')
      .update(patch)
      .eq('id', id)
      .select(`
        id, date, price, isFreeVisit, notes, createdAt,
        Customer:customerId(id, name, phone),
        Service:serviceId(id, name, therapistFee),
        Therapist:therapistId(id, fullName)
      `)
      .single()

    if (error) throw error

    const servicePrice = Number(updated.price || 0)
    const tFee = Number((updated.Service as any)?.therapistFee || 0)
    const enriched = {
      id: updated.id,
      date: new Date(updated.date).toISOString(),
      customerName: (updated.Customer as any)?.name || '',
      customerPhone: (updated.Customer as any)?.phone || '',
      serviceName: (updated.Service as any)?.name || '',
      servicePrice,
      therapistName: (updated.Therapist as any)?.fullName || '',
      therapistFee: tFee,
      revenue: servicePrice,
      profit: servicePrice - tFee,
      notes: updated.notes || '',
      createdAt: updated.createdAt
    }
    // Upsert MonthlyBookkeeping after update
    try {
      const d = new Date(updated.date)
      const month = d.getUTCMonth() + 1
      const year = d.getUTCFullYear()
      const { data: monthRows } = await supabase
        .from('DailyTreatment')
        .select('price, isFreeVisit, date')
        .gte('date', new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)).toISOString())
        .lte('date', new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)).toISOString())

      const paidRevenue = (monthRows || []).reduce((sum, r: any) => r.isFreeVisit ? sum : sum + Number(r.price || 0), 0)
      const totalTreatments = (monthRows || []).length
      const freeTreatments = (monthRows || []).filter((r: any) => r.isFreeVisit).length
      const totalTherapistFees = Math.round(paidRevenue * 0.4)

      const { data: existing } = await supabase
        .from('MonthlyBookkeeping')
        .select('id')
        .eq('month', month)
        .eq('year', year)
        .single()

      if (existing && (existing as any).id) {
        await supabase
          .from('MonthlyBookkeeping')
          .update({ totalRevenue: paidRevenue, totalTherapistFees, totalTreatments, freeTreatments })
          .eq('id', (existing as any).id)
      } else {
        await supabase
          .from('MonthlyBookkeeping')
          .insert([{ month, year, totalRevenue: paidRevenue, totalTherapistFees, totalTreatments, freeTreatments }])
      }
    } catch (rollupErr) {
      console.error('Monthly rollup update failed:', rollupErr)
    }

    return NextResponse.json({
      success: true,
      data: enriched,
      message: 'Daily treatment record updated successfully'
    })

  } catch (error) {
    console.error('❌ Update daily treatment error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update daily treatment record',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}