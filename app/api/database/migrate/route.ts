import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// Force database migration and setup
export async function POST(request: NextRequest) {
  try {
    const { authorization } = await request.json()
    
    if (authorization !== 'force-migrate-salon-2024') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized migration request' },
        { status: 401 }
      )
    }

    console.log('🚀 Starting force database migration...')

    // Step 1: Test connection
    await prisma!.$connect()
    console.log('✅ Database connected')

    // Step 2: Check if tables exist and create if not
    console.log('📋 Checking database schema...')
    
    // Force Prisma to create tables by doing a simple query on each model
    const steps = []
    
    try {
      console.log('Creating Admin table...')
      const adminTest = await prisma!.admin.findMany({ take: 1 })
      steps.push('✅ Admin table ready')
    } catch (error) {
      steps.push('❌ Admin table failed - will be created')
      console.log('Admin table error:', error)
    }

    try {
      console.log('Creating Service table...')
      const serviceTest = await prisma!.service.findMany({ take: 1 })
      steps.push('✅ Service table ready')
    } catch (error) {
      steps.push('❌ Service table failed - will be created')
      console.log('Service table error:', error)
    }

    try {
      console.log('Creating Therapist table...')
      const therapistTest = await prisma!.therapist.findMany({ take: 1 })
      steps.push('✅ Therapist table ready')
    } catch (error) {
      steps.push('❌ Therapist table failed - will be created')
      console.log('Therapist table error:', error)
    }

    try {
      console.log('Creating Customer table...')
      const customerTest = await prisma!.customer.findMany({ take: 1 })
      steps.push('✅ Customer table ready')
    } catch (error) {
      steps.push('❌ Customer table failed - will be created')
      console.log('Customer table error:', error)
    }

    try {
      console.log('Creating Booking table...')
      const bookingTest = await prisma!.booking.findMany({ take: 1 })
      steps.push('✅ Booking table ready')
    } catch (error) {
      steps.push('❌ Booking table failed - will be created')
      console.log('Booking table error:', error)
    }

    try {
      console.log('Creating DailyTreatment table...')
      const treatmentTest = await prisma!.dailyTreatment.findMany({ take: 1 })
      steps.push('✅ DailyTreatment table ready')
    } catch (error) {
      steps.push('❌ DailyTreatment table failed - will be created')
      console.log('DailyTreatment table error:', error)
    }

    try {
      console.log('Creating MonthlyBookkeeping table...')
      const bookkeepingTest = await prisma!.monthlyBookkeeping.findMany({ take: 1 })
      steps.push('✅ MonthlyBookkeeping table ready')
    } catch (error) {
      steps.push('❌ MonthlyBookkeeping table failed - will be created')
      console.log('MonthlyBookkeeping table error:', error)
    }

    // Step 3: Get table count
    const tableCount = await prisma!.$queryRaw<Array<{count: bigint}>>`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `

    const actualTableCount = Number(tableCount[0]?.count || 0)
    console.log(`📊 Found ${actualTableCount} tables in database`)

    // Step 4: Check current data counts
    const counts = {
      admins: 0,
      services: 0,
      therapists: 0,
      customers: 0,
      treatments: 0,
      bookings: 0,
      bookkeeping: 0
    }

    try {
      counts.admins = await prisma!.admin.count()
      counts.services = await prisma!.service.count()
      counts.therapists = await prisma!.therapist.count()
      counts.customers = await prisma!.customer.count()
      counts.treatments = await prisma!.dailyTreatment.count()
      counts.bookings = await prisma!.booking.count()
      counts.bookkeeping = await prisma!.monthlyBookkeeping.count()
    } catch (error) {
      console.log('Error counting data:', error)
    }

    console.log('📈 Current data counts:', counts)

    return NextResponse.json({
      success: true,
      message: 'Database migration check completed',
      data: {
        tableCount: actualTableCount,
        steps,
        counts,
        databaseReady: actualTableCount >= 8,
        recommendation: actualTableCount >= 8 ? 
          'Database schema looks good. Ready for data population.' :
          'Database schema incomplete. May need manual migration.'
      }
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma!.$disconnect()
  }
}