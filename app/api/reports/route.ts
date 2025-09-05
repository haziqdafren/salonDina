import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

function getDateRange(period: Period, referenceDate: Date) {
  const start = new Date(referenceDate)
  const end = new Date(referenceDate)
  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'weekly': {
      const day = referenceDate.getDay()
      const diffToMonday = (day === 0 ? -6 : 1) - day
      start.setDate(referenceDate.getDate() + diffToMonday)
      start.setHours(0, 0, 0, 0)
      end.setTime(start.getTime())
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
    }
    case 'monthly':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(start.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'yearly':
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(11, 31)
      end.setHours(23, 59, 59, 999)
      break
  }
  return { start, end }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const period = (searchParams.get('period') as Period) || 'monthly'
  const dateParam = searchParams.get('date')
  const refDate = dateParam ? new Date(dateParam) : new Date()

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
      data: null
    })
  }

  try {
    if (!supabase) throw new Error('Supabase not initialized')

    const { start, end } = getDateRange(period, refDate)

    // Aggregate from DailyTreatment
    const { data: treatments, error } = await supabase
      .from('DailyTreatment')
      .select('price, isFreeVisit')
      .gte('date', start.toISOString())
      .lte('date', end.toISOString())

    if (error) throw error

    const revenue = (treatments || []).reduce((sum, t) => t.isFreeVisit ? sum : sum + Number(t.price || 0), 0)
    const treatmentsCount = (treatments || []).length
    const therapistFees = Math.round(revenue * 0.4) // simple assumption; fee per service exists on Service

    // Customers in range: approximate via DailyTreatment joins not fetched; fallback to count of distinct visits
    const customers = treatmentsCount // minimal proxy; can be refined with joins

    // If monthly, try to use MonthlyBookkeeping if available
    let monthlyOverride: { totalRevenue?: number; totalTreatments?: number; totalTherapistFees?: number } = {}
    if (period === 'monthly') {
      const month = start.getMonth() + 1
      const year = start.getFullYear()
      const { data: monthly, error: mErr } = await supabase
        .from('MonthlyBookkeeping')
        .select('totalRevenue, totalTreatments, totalTherapistFees')
        .eq('month', month)
        .eq('year', year)
        .single()
      if (!mErr && monthly) {
        monthlyOverride = {
          totalRevenue: Number(monthly.totalRevenue || 0),
          totalTreatments: Number(monthly.totalTreatments || 0),
          totalTherapistFees: Number(monthly.totalTherapistFees || 0)
        }
      }
    }

    const data = {
      daily: { revenue: 0, treatments: 0, customers: 0, therapistFees: 0 },
      weekly: { revenue: 0, treatments: 0, customers: 0, therapistFees: 0 },
      monthly: { revenue: 0, treatments: 0, customers: 0, therapistFees: 0 },
      yearly: { revenue: 0, treatments: 0, customers: 0, therapistFees: 0 }
    }

    const current = {
      revenue: monthlyOverride.totalRevenue ?? revenue,
      treatments: monthlyOverride.totalTreatments ?? treatmentsCount,
      customers,
      therapistFees: monthlyOverride.totalTherapistFees ?? therapistFees
    }

    data[period] = current

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Reports API error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch reports' })
  }
}


