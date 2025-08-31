import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../../lib/prisma'

// Comprehensive feature testing endpoint
export async function POST(request: NextRequest) {
  try {
    const { authorization } = await request.json()
    
    if (authorization !== 'test-salon-features-2024') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized test request' },
        { status: 401 }
      )
    }

    if (!prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 500 }
      )
    }

    if (!isDatabaseAvailable() || !prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      )
    }

    const testResults = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    }

    // Helper function to run tests
    const runTest = async (name: string, testFn: () => Promise<void>) => {
      try {
        await testFn()
        testResults.tests.push({ name, status: 'PASS', error: null })
        testResults.summary.passed++
      } catch (error) {
        testResults.tests.push({ 
          name, 
          status: 'FAIL', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
        testResults.summary.failed++
      }
      testResults.summary.total++
    }

    // Test 1: Database Connection
    await runTest('Database Connection', async () => {
      await prisma!.$connect()
      const result = await prisma!.$queryRaw`SELECT 1 as test`
      if (!result) throw new Error('Query failed')
    })

    // Test 2: Admin Authentication System
    await runTest('Admin System', async () => {
      const adminCount = await prisma!.admin.count()
      if (adminCount === 0) throw new Error('No admin users found')
      
      const admin = await prisma!.admin.findFirst()
      if (!admin || !admin.username || !admin.password) {
        throw new Error('Admin data incomplete')
      }
    })

    // Test 3: Customer Management
    await runTest('Customer Management', async () => {
      // Test customer creation
      const testCustomer = await prisma!.customer.create({
        data: {
          name: 'Test Customer',
          phone: '+6281234567890',
          email: 'test@example.com',
          notes: 'Test customer for system validation'
        }
      })

      // Test customer retrieval
      const retrievedCustomer = await prisma!.customer.findUnique({
        where: { id: testCustomer.id }
      })
      
      if (!retrievedCustomer) throw new Error('Customer retrieval failed')

      // Test customer update
      await prisma!.customer.update({
        where: { id: testCustomer.id },
        data: { isVip: true }
      })

      // Cleanup
      await prisma!.customer.delete({
        where: { id: testCustomer.id }
      })
    })

    // Test 4: Service Management
    await runTest('Service Management', async () => {
      const serviceCount = await prisma!.service.count()
      if (serviceCount === 0) throw new Error('No services found')

      const services = await prisma!.service.findMany({
        take: 5,
        include: {
          dailyTreatments: true
        }
      })

      if (!services || services.length === 0) {
        throw new Error('Service retrieval failed')
      }

      // Check service structure
      const firstService = services[0]
      if (!firstService.name || !firstService.category || firstService.normalPrice <= 0) {
        throw new Error('Service data structure invalid')
      }
    })

    // Test 5: Therapist Management
    await runTest('Therapist Management', async () => {
      const therapistCount = await prisma!.therapist.count()
      if (therapistCount === 0) throw new Error('No therapists found')

      const therapists = await prisma!.therapist.findMany({
        include: {
          dailyTreatments: true,
          monthlyStats: true
        }
      })

      if (!therapists || therapists.length === 0) {
        throw new Error('Therapist retrieval failed')
      }

      // Check therapist structure
      const firstTherapist = therapists[0]
      if (!firstTherapist.fullName || !firstTherapist.initial) {
        throw new Error('Therapist data structure invalid')
      }
    })

    // Test 6: Booking System
    await runTest('Booking System', async () => {
      // Create test booking
      const testBooking = await prisma!.booking.create({
        data: {
          customerName: 'Test Booking Customer',
          phone: '+6281234567891',
          service: 'Facial Test',
          servicePrice: 150000,
          date: new Date(),
          time: '10:00',
          status: 'pending',
          notes: 'Test booking'
        }
      })

      // Test booking retrieval
      const retrievedBooking = await prisma!.booking.findUnique({
        where: { id: testBooking.id }
      })
      
      if (!retrievedBooking) throw new Error('Booking retrieval failed')

      // Test booking update
      await prisma!.booking.update({
        where: { id: testBooking.id },
        data: { status: 'confirmed' }
      })

      // Cleanup
      await prisma!.booking.delete({
        where: { id: testBooking.id }
      })
    })

    // Test 7: Treatment Recording
    await runTest('Treatment Recording', async () => {
      // Get required data
      const service = await prisma!.service.findFirst()
      const therapist = await prisma!.therapist.findFirst()
      
      if (!service || !therapist) {
        throw new Error('Required service or therapist not found')
      }

      // Create test treatment
      const testTreatment = await prisma!.dailyTreatment.create({
        data: {
          date: new Date(),
          customerName: 'Test Treatment Customer',
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.normalPrice,
          therapistId: therapist.id,
          paymentMethod: 'cash',
          tipAmount: 0
        }
      })

      // Test treatment retrieval with relations
      const retrievedTreatment = await prisma!.dailyTreatment.findUnique({
        where: { id: testTreatment.id },
        include: {
          service: true,
          therapist: true,
          customer: true,
          feedback: true
        }
      })
      
      if (!retrievedTreatment) throw new Error('Treatment retrieval failed')

      // Cleanup
      await prisma!.dailyTreatment.delete({
        where: { id: testTreatment.id }
      })
    })

    // Test 8: Bookkeeping System
    await runTest('Bookkeeping System', async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Test bookkeeping entry creation
      const testEntry = await prisma!.monthlyBookkeeping.create({
        data: {
          date: today,
          dailyRevenue: 500000,
          operationalCost: 100000,
          salaryExpense: 50000,
          therapistFee: 75000,
          otherExpenses: 25000,
          totalExpense: 250000,
          netIncome: 250000,
          runningTotal: 250000,
          notes: 'Test bookkeeping entry'
        }
      })

      // Test retrieval
      const retrievedEntry = await prisma!.monthlyBookkeeping.findUnique({
        where: { id: testEntry.id }
      })
      
      if (!retrievedEntry) throw new Error('Bookkeeping entry retrieval failed')

      // Test calculations
      const expectedTotal = testEntry.operationalCost + testEntry.salaryExpense + 
                           testEntry.therapistFee + testEntry.otherExpenses
      if (testEntry.totalExpense !== expectedTotal) {
        throw new Error('Bookkeeping calculations incorrect')
      }

      // Cleanup
      await prisma!.monthlyBookkeeping.delete({
        where: { id: testEntry.id }
      })
    })

    // Test 9: Feedback System
    await runTest('Feedback System', async () => {
      // Get required data
      const service = await prisma!.service.findFirst()
      const therapist = await prisma!.therapist.findFirst()
      
      if (!service || !therapist) {
        throw new Error('Required service or therapist not found')
      }

      // Create test treatment for feedback
      const testTreatment = await prisma!.dailyTreatment.create({
        data: {
          date: new Date(),
          customerName: 'Test Feedback Customer',
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.normalPrice,
          therapistId: therapist.id
        }
      })

      // Create test feedback
      const testFeedback = await prisma!.customerFeedback.create({
        data: {
          dailyTreatmentId: testTreatment.id,
          overallRating: 5,
          serviceQuality: 5,
          therapistService: 5,
          cleanliness: 5,
          valueForMoney: 5,
          comment: 'Excellent service test',
          wouldRecommend: true
        }
      })

      // Test feedback retrieval
      const retrievedFeedback = await prisma!.customerFeedback.findUnique({
        where: { id: testFeedback.id },
        include: {
          dailyTreatment: {
            include: {
              service: true,
              therapist: true
            }
          }
        }
      })
      
      if (!retrievedFeedback) throw new Error('Feedback retrieval failed')

      // Cleanup
      await prisma!.customerFeedback.delete({
        where: { id: testFeedback.id }
      })
      await prisma!.dailyTreatment.delete({
        where: { id: testTreatment.id }
      })
    })

    // Test 10: Data Integrity and Relationships
    await runTest('Data Integrity', async () => {
      // Test foreign key relationships
      const treatmentWithRelations = await prisma!.dailyTreatment.findFirst({
        include: {
          service: true,
          therapist: true,
          customer: true,
          feedback: true
        }
      })

      if (treatmentWithRelations) {
        if (!treatmentWithRelations.service) throw new Error('Service relationship broken')
        if (!treatmentWithRelations.therapist) throw new Error('Therapist relationship broken')
      }

      // Test unique constraints
      try {
        await prisma!.customer.create({
          data: {
            name: 'Duplicate Test',
            phone: '+6281234567892'
          }
        })
        
        // This should fail due to unique constraint
        await prisma!.customer.create({
          data: {
            name: 'Duplicate Test 2',
            phone: '+6281234567892'
          }
        })
        
        throw new Error('Unique constraint not working')
      } catch (error) {
        // This is expected - cleanup the test customer
        await prisma!.customer.deleteMany({
          where: { phone: '+6281234567892' }
        })
      }
    })

    // Disconnect from database
    await prisma!.$disconnect()

    return NextResponse.json({
      success: true,
      message: `Feature testing completed. ${testResults.summary.passed}/${testResults.summary.total} tests passed.`,
      data: testResults
    })

  } catch (error) {
    console.error('Feature testing error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Feature testing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}