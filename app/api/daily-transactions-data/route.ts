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

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    console.log('🚀 Fetching combined daily transactions data for:', date, '- v2')

    // Fetch all data in parallel for better performance
    const [transactionsResult, therapistsResult, servicesResult, customersResult] = await Promise.all([
      // Daily transactions
      supabase
        .from('DailyTreatment')
        .select(`
          id, date, price, isFreeVisit, notes, createdAt, updatedAt,
          Customer:customerId(id, name, phone),
          Service:serviceId(id, name, therapistFee),
          Therapist:therapistId(id, fullName)
        `)
        .eq('date', date)
        .order('createdAt', { ascending: false }),

      // Therapists
      supabase
        .from('Therapist')
        .select('id, fullName, phone, isActive')
        .eq('isActive', true)
        .order('fullName'),

      // Services
      supabase
        .from('Service')
        .select('id, name, category, normalPrice, promoPrice, duration, therapistFee, isActive')
        .eq('isActive', true)
        .order('name'),

      // Customers
      supabase
        .from('Customer')
        .select('id, name, phone, email, totalVisits, loyaltyVisits, totalSpending, isVip')
        .order('name')
    ])

    // Check for errors
    if (transactionsResult.error) throw transactionsResult.error
    if (therapistsResult.error) throw therapistsResult.error
    if (servicesResult.error) throw servicesResult.error
    if (customersResult.error) throw customersResult.error

    // Transform transactions data to match UI expectations
    const transformedTransactions = (transactionsResult.data || []).map((treatment: any) => {
      const servicePrice = Number(treatment.price || 0)
      const therapistFee = Number((treatment.Service as any)?.therapistFee || 0)
      
      return {
        id: treatment.id,
        date: new Date(treatment.date).toISOString(),
        customerName: (treatment.Customer as any)?.name || '',
        customerPhone: (treatment.Customer as any)?.phone || '',
        serviceName: (treatment.Service as any)?.name || '',
        servicePrice,
        therapistName: (treatment.Therapist as any)?.fullName || '',
        therapistFee,
        revenue: servicePrice,
        profit: servicePrice - therapistFee,
        notes: treatment.notes || '',
        isFreeVisit: treatment.isFreeVisit || false,
        createdAt: treatment.createdAt
      }
    })

    console.log('✅ Combined data fetched successfully:', {
      transactions: transformedTransactions.length,
      therapists: therapistsResult.data?.length || 0,
      services: servicesResult.data?.length || 0,
      customers: customersResult.data?.length || 0
    })

    return NextResponse.json({
      success: true,
      data: {
        transactions: transformedTransactions,
        therapists: therapistsResult.data || [],
        services: servicesResult.data || [],
        customers: customersResult.data || []
      },
      message: 'Daily transactions data fetched successfully'
    })

  } catch (error) {
    console.error('❌ Daily transactions data fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch daily transactions data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
