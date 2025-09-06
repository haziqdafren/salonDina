import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'

export async function GET(request: NextRequest) {
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

    console.log('📊 Fetching optimized dashboard data...')

    // Calculate date ranges
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    // Execute all queries in parallel for better performance
    const [
      todayTreatmentsResult,
      monthlyTreatmentsResult,
      customersResult,
      servicesResult,
      therapistsResult,
      loyaltyCustomersResult
    ] = await Promise.all([
      // Today's treatments with service and therapist data
      supabase
        .from('DailyTreatment')
        .select(`
          id, price, isFreeVisit, createdAt, date,
          Service:serviceId(name, therapistFee),
          Therapist:therapistId(fullName, initial),
          Customer:customerId(name, phone)
        `)
        .gte('date', startOfToday.toISOString())
        .lt('date', endOfToday.toISOString())
        .order('createdAt', { ascending: false }),

      // Monthly treatments for statistics
      supabase
        .from('DailyTreatment')
        .select('price, isFreeVisit, Service:serviceId(therapistFee)')
        .gte('date', startOfMonth.toISOString())
        .lte('date', endOfMonth.toISOString()),

      // Total customers count
      supabase
        .from('Customer')
        .select('id', { count: 'exact', head: true }),

      // Active services count
      supabase
        .from('Service')
        .select('id', { count: 'exact', head: true })
        .eq('isActive', true),

      // Active therapists count
      supabase
        .from('Therapist')
        .select('id', { count: 'exact', head: true })
        .eq('isActive', true),

      // Customers ready for free visit
      supabase
        .from('Customer')
        .select('id', { count: 'exact', head: true })
        .eq('loyaltyVisits', 3)
    ])

    // Check for errors
    const errors = [
      todayTreatmentsResult.error,
      monthlyTreatmentsResult.error,
      customersResult.error,
      servicesResult.error,
      therapistsResult.error,
      loyaltyCustomersResult.error
    ].filter(Boolean)

    if (errors.length > 0) {
      console.error('❌ Dashboard query errors:', errors)
      throw new Error('Database query failed')
    }

    const todayTreatments = todayTreatmentsResult.data || []
    const monthlyTreatments = monthlyTreatmentsResult.data || []

    // Calculate today's statistics
    const todayRevenue = todayTreatments.reduce((sum, treatment) => {
      return treatment.isFreeVisit ? sum : sum + Number(treatment.price || 0)
    }, 0)

    const todayTherapistFees = todayTreatments.reduce((sum, treatment) => {
      if (treatment.isFreeVisit) return sum
      const serviceFee = Number((treatment.Service as any)?.therapistFee || 0)
      return sum + serviceFee
    }, 0)

    const todayFreeTreatments = todayTreatments.filter(t => t.isFreeVisit).length

    // Calculate monthly statistics
    const monthlyRevenue = monthlyTreatments.reduce((sum, treatment) => {
      return treatment.isFreeVisit ? sum : sum + Number(treatment.price || 0)
    }, 0)

    const monthlyTherapistFees = monthlyTreatments.reduce((sum, treatment) => {
      if (treatment.isFreeVisit) return sum
      const serviceFee = Number((treatment.Service as any)?.therapistFee || 0)
      return sum + serviceFee
    }, 0)

    const monthlyFreeTreatments = monthlyTreatments.filter(t => t.isFreeVisit).length

    // Format today's treatments for display
    const todayTreatmentsDetail = todayTreatments.map(treatment => ({
      id: treatment.id,
      customerName: (treatment.Customer as any)?.name || 'Customer',
      serviceName: (treatment.Service as any)?.name || 'Service',
      price: Number(treatment.price || 0),
      therapistName: (treatment.Therapist as any)?.fullName || 'Unknown',
      isFreeVisit: !!treatment.isFreeVisit,
      createdAt: treatment.createdAt
    }))

    // Build optimized dashboard data
    const dashboardData = {
      today: {
        treatments: todayTreatments.length,
        revenue: todayRevenue,
        therapistFees: todayTherapistFees,
        freeTreatments: todayFreeTreatments,
        treatments_detail: todayTreatmentsDetail
      },
      monthly: {
        treatments: monthlyTreatments.length,
        revenue: monthlyRevenue,
        therapistFees: monthlyTherapistFees,
        freeTreatments: monthlyFreeTreatments
      },
      customers: {
        total: customersResult.count || 0,
        readyForFree: loyaltyCustomersResult.count || 0
      },
      system: {
        activeServices: servicesResult.count || 0,
        activeTherapists: therapistsResult.count || 0
      }
    }

    console.log('✅ Dashboard data fetched successfully:', {
      todayTreatments: todayTreatments.length,
      monthlyTreatments: monthlyTreatments.length,
      totalCustomers: customersResult.count,
      activeServices: servicesResult.count,
      activeTherapists: therapistsResult.count
    })

    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data fetched successfully'
    })

  } catch (error) {
    console.error('❌ Dashboard API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
