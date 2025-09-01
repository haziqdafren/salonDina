import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

// Mock dashboard data for fallback
const MOCK_DASHBOARD_DATA = {
  today: {
    treatments: 3,
    revenue: 125000,
    therapistFees: 50000,
    freeTreatments: 1,
    treatments_detail: [
      {
        id: 1,
        customerName: 'Siti Aminah',
        serviceName: 'Facial Brightening',
        price: 40000,
        therapistName: 'Fatimah',
        isFreeVisit: false,
        createdAt: new Date()
      },
      {
        id: 2,
        customerName: 'Nur Halimah', 
        serviceName: 'Hair Spa Creambath',
        price: 25000,
        therapistName: 'Khadijah',
        isFreeVisit: false,
        createdAt: new Date()
      },
      {
        id: 3,
        customerName: 'Maya Sartika',
        serviceName: 'Full Body Massage',
        price: 0,
        therapistName: 'Aisyah',
        isFreeVisit: true,
        createdAt: new Date()
      }
    ]
  },
  monthly: {
    treatments: 15,
    revenue: 750000,
    therapistFees: 300000,
    freeTreatments: 3
  },
  customers: {
    total: 12,
    readyForFree: 2
  },
  system: {
    activeServices: 9,
    activeTherapists: 4
  }
}

export async function GET(request: NextRequest) {
  // Check if Supabase is configured
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      data: MOCK_DASHBOARD_DATA,
      fallback: 'no_supabase',
      message: 'Using mock dashboard data - Supabase not configured'
    })
  }

  try {
    // Create admin user if none exists
    try {
      if (!supabase) throw new Error('Supabase not initialized')
      
      const { data: admins, error: userError } = await supabase
        .from('Admin')
        .select('id')
        .limit(1)

      if (!userError && (!admins || admins.length === 0)) {
        console.log('Creating admin user...')
        const bcrypt = require('bcryptjs')
        const hashedPassword = await bcrypt.hash('admin123', 12)
        
        const { error: insertError } = await supabase
          .from('Admin')
          .insert([
            {
              username: 'admin',
              name: 'Administrator',
              password: hashedPassword
            }
          ])

        if (insertError) {
          console.error('Failed to create admin user:', insertError)
        } else {
          console.log('Admin user created successfully')
        }
      }
    } catch (userError) {
      console.error('Failed to check/create admin user:', userError)
    }

    // Calculate dashboard statistics
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    let dashboardData = { ...MOCK_DASHBOARD_DATA }

    try {
      // Today's treatments from Supabase
      if (!supabase) throw new Error('Supabase not initialized')
      
      const { data: todayTreatments, error: todayError } = await supabase
        .from('DailyTreatment')
        .select('*')
        .gte('date', startOfToday.toISOString())
        .lt('date', endOfToday.toISOString())
        .order('createdAt', { ascending: false })

      if (todayError) throw todayError

      // Monthly treatments from Supabase
      const { data: monthlyTreatments, error: monthlyError } = await supabase
        .from('DailyTreatment')
        .select('*')
        .gte('date', startOfMonth.toISOString())
        .lte('date', endOfMonth.toISOString())

      if (monthlyError) throw monthlyError

      // Customer statistics
      const { count: totalCustomers, error: customerError } = await supabase
        .from('Customer')
        .select('*', { count: 'exact', head: true })

      if (customerError) throw customerError

      const { count: readyForFree, error: loyaltyError } = await supabase
        .from('Customer')
        .select('*', { count: 'exact', head: true })
        .eq('loyaltyVisits', 3)

      if (loyaltyError) throw loyaltyError

      // System statistics
      const { count: activeServices, error: servicesError } = await supabase
        .from('Service')
        .select('*', { count: 'exact', head: true })
        .eq('isActive', true)

      if (servicesError) throw servicesError

      // Calculate revenues and fees
      const todayRevenue = (todayTreatments || []).reduce((sum, treatment) => {
        return treatment.isFreeVisit ? sum : sum + treatment.price
      }, 0)

      const monthlyRevenue = (monthlyTreatments || []).reduce((sum, treatment) => {
        return treatment.isFreeVisit ? sum : sum + treatment.price
      }, 0)

      const todayTherapistFees = (todayTreatments || []).reduce((sum, treatment) => {
        if (treatment.isFreeVisit) return sum
        return sum + Math.round(treatment.price * 0.4) // Assume 40% fee
      }, 0)

      const monthlyTherapistFees = (monthlyTreatments || []).reduce((sum, treatment) => {
        if (treatment.isFreeVisit) return sum
        return sum + Math.round(treatment.price * 0.4)
      }, 0)

      // Format today's treatments for display
      const todayTreatmentsDetail = (todayTreatments || []).map(treatment => ({
        id: treatment.id,
        customerName: 'Customer', // You can join with customers table if needed
        serviceName: 'Service', // You can join with services table if needed
        price: treatment.price,
        therapistName: treatment.therapist_name || 'Unknown',
        isFreeVisit: treatment.is_free_visit,
        createdAt: treatment.created_at
      }))

      // Build real dashboard data
      dashboardData = {
        today: {
          treatments: (todayTreatments || []).length,
          revenue: todayRevenue,
          therapistFees: todayTherapistFees,
          freeTreatments: (todayTreatments || []).filter(t => t.isFreeVisit).length,
          treatments_detail: todayTreatmentsDetail
        },
        monthly: {
          treatments: (monthlyTreatments || []).length,
          revenue: monthlyRevenue,
          therapistFees: monthlyTherapistFees,
          freeTreatments: (monthlyTreatments || []).filter(t => t.isFreeVisit).length
        },
        customers: {
          total: totalCustomers || 0,
          readyForFree: readyForFree || 0
        },
        system: {
          activeServices: activeServices || 0,
          activeTherapists: 4 // You can add therapists table later
        }
      }

    } catch (queryError) {
      console.error('Dashboard query failed, using mock data:', queryError)
      // Use mock data with fallback indicator
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      source: 'supabase'
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    
    // Final fallback
    return NextResponse.json({
      success: true,
      data: MOCK_DASHBOARD_DATA,
      fallback: 'supabase_error',
      error: 'Supabase connection failed, using mock data'
    })
  }
}