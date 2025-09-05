import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Supabase not configured'
    })
  }

  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    console.log('🌱 Populating sample data...')

    // Sample customers
    const sampleCustomers = [
      {
        name: 'Siti Aminah',
        phone: '081234567890',
        email: 'siti.aminah@email.com',
        address: 'Jl. Medan Selayang No. 123',
        totalVisits: 0,
        totalSpending: 0,
        loyaltyVisits: 0,
        isVip: false
      },
      {
        name: 'Rina Sari Dewi',
        phone: '081234567891',
        email: 'rina.sari@email.com',
        address: 'Jl. Medan Selayang No. 456',
        totalVisits: 0,
        totalSpending: 0,
        loyaltyVisits: 0,
        isVip: false
      },
      {
        name: 'Fatimah Zahra',
        phone: '081234567892',
        email: 'fatimah.zahra@email.com',
        address: 'Jl. Medan Selayang No. 789',
        totalVisits: 0,
        totalSpending: 0,
        loyaltyVisits: 0,
        isVip: true
      }
    ]

    // Sample services
    const sampleServices = [
      {
        name: 'Facial Treatment',
        category: 'Facial',
        normalPrice: 150000,
        promoPrice: 120000,
        duration: 90,
        description: 'Perawatan facial lengkap dengan produk halal',
        therapistFee: 60000,
        isActive: true
      },
      {
        name: 'Hair Spa',
        category: 'Hair Care',
        normalPrice: 100000,
        promoPrice: 80000,
        duration: 60,
        description: 'Perawatan rambut dengan minyak zaitun',
        therapistFee: 40000,
        isActive: true
      },
      {
        name: 'Body Treatment',
        category: 'Body Care',
        normalPrice: 200000,
        promoPrice: 160000,
        duration: 120,
        description: 'Perawatan tubuh lengkap dengan lulur halal',
        therapistFee: 80000,
        isActive: true
      }
    ]

    // Sample therapists
    const sampleTherapists = [
      {
        initial: 'RSD',
        fullName: 'Rina Sari Dewi',
        phone: '081234567893',
        isActive: true
      },
      {
        initial: 'FZ',
        fullName: 'Fatimah Zahra',
        phone: '081234567894',
        isActive: true
      },
      {
        initial: 'AS',
        fullName: 'Aisyah Salsabila',
        phone: '081234567895',
        isActive: true
      }
    ]

    const results: any = {}

    // Insert customers
    console.log('📝 Creating sample customers...')
    const { data: customers, error: customersError } = await supabase
      .from('Customer')
      .insert(sampleCustomers)
      .select('id, name, phone')

    if (customersError) {
      console.error('❌ Customers creation error:', customersError)
      results.customers = { error: customersError.message }
    } else {
      console.log('✅ Sample customers created:', customers?.length || 0)
      results.customers = customers
    }

    // Insert services
    console.log('📝 Creating sample services...')
    const { data: services, error: servicesError } = await supabase
      .from('Service')
      .insert(sampleServices)
      .select('id, name, normalPrice')

    if (servicesError) {
      console.error('❌ Services creation error:', servicesError)
      results.services = { error: servicesError.message }
    } else {
      console.log('✅ Sample services created:', services?.length || 0)
      results.services = services
    }

    // Insert therapists
    console.log('📝 Creating sample therapists...')
    const { data: therapists, error: therapistsError } = await supabase
      .from('Therapist')
      .insert(sampleTherapists)
      .select('id, fullName, initial')

    if (therapistsError) {
      console.error('❌ Therapists creation error:', therapistsError)
      results.therapists = { error: therapistsError.message }
    } else {
      console.log('✅ Sample therapists created:', therapists?.length || 0)
      results.therapists = therapists
    }

    // Create some sample daily treatments to test loyalty
    if (customers && services && therapists) {
      console.log('📝 Creating sample daily treatments...')
      
      const today = new Date().toISOString().slice(0, 10)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      
      const sampleTreatments = [
        {
          date: today,
          customerId: customers[0].id,
          serviceId: services[0].id,
          therapistId: therapists[0].id,
          price: services[0].normalPrice,
          isFreeVisit: false,
          notes: 'Sample treatment 1'
        },
        {
          date: yesterday,
          customerId: customers[1].id,
          serviceId: services[1].id,
          therapistId: therapists[1].id,
          price: services[1].normalPrice,
          isFreeVisit: false,
          notes: 'Sample treatment 2'
        }
      ]

      const { data: treatments, error: treatmentsError } = await supabase
        .from('DailyTreatment')
        .insert(sampleTreatments)
        .select('id, date, price, customerId')

      if (treatmentsError) {
        console.error('❌ Treatments creation error:', treatmentsError)
        results.treatments = { error: treatmentsError.message }
      } else {
        console.log('✅ Sample treatments created:', treatments?.length || 0)
        results.treatments = treatments
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data populated successfully',
      data: results
    })

  } catch (error) {
    console.error('❌ Sample data population error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to populate sample data',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
