import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../../lib/prisma'

// Quick setup endpoint with default admin and sample data
export async function POST(request: NextRequest) {
  try {
    const { authorization, skipIfExists } = await request.json()
    
    if (authorization !== 'quick-setup-salon-2024') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized quick setup attempt' },
        { status: 401 }
      )
    }

    if (!isDatabaseAvailable() || !prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if already set up
    const adminCount = await prisma.admin.count()
    if (adminCount > 0 && skipIfExists) {
      return NextResponse.json({
        success: true,
        message: 'Database already has admin users',
        skipReason: 'Admin exists, skipped setup'
      })
    }

    console.log('🚀 Starting quick database setup...')
    
    // Import bcryptjs
    const bcrypt = await import('bcryptjs')

    const setupResults = {
      adminsCreated: 0,
      servicesCreated: 0,
      therapistsCreated: 0,
      customersCreated: 0,
      treatmentsCreated: 0,
      bookingsCreated: 0
    }

    // 1. Create default admin (if not exists)
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('DinaAdmin123!', 12)
      await prisma.admin.create({
        data: {
          username: 'admin_dina',
          password: hashedPassword,
          name: 'Administrator Salon Dina',
        }
      })
      setupResults.adminsCreated = 1
    }

    // 2. Create comprehensive services
    const existingServices = await prisma.service.count()
    if (existingServices === 0) {
      const services = [
        {
          name: 'Facial Brightening Premium',
          category: 'Perawatan Wajah',
          normalPrice: 200000,
          promoPrice: 150000,
          duration: 90,
          description: 'Perawatan wajah premium untuk mencerahkan dan menghaluskan kulit dengan teknologi terbaru',
          isActive: true
        },
        {
          name: 'Facial Acne Treatment',
          category: 'Perawatan Wajah',
          normalPrice: 180000,
          promoPrice: 150000,
          duration: 75,
          description: 'Treatment khusus untuk mengatasi jerawat dan bekasnya',
          isActive: true
        },
        {
          name: 'Facial Anti Aging',
          category: 'Perawatan Wajah',
          normalPrice: 250000,
          duration: 90,
          description: 'Perawatan anti penuaan dengan serum premium dan teknologi canggih',
          isActive: true
        },
        {
          name: 'Hair Spa Aromatherapy',
          category: 'Perawatan Rambut',
          normalPrice: 150000,
          duration: 60,
          description: 'Perawatan rambut dengan aromaterapi untuk relaksasi maksimal',
          isActive: true
        },
        {
          name: 'Hair Treatment Keratin',
          category: 'Perawatan Rambut',
          normalPrice: 300000,
          duration: 120,
          description: 'Treatment keratin untuk rambut halus dan berkilau',
          isActive: true
        },
        {
          name: 'Hair Mask Intensive',
          category: 'Perawatan Rambut',
          normalPrice: 100000,
          duration: 45,
          description: 'Masker rambut intensif untuk nutrisi mendalam',
          isActive: true
        },
        {
          name: 'Full Body Massage',
          category: 'Body Treatment',
          normalPrice: 200000,
          duration: 90,
          description: 'Pijat seluruh tubuh untuk relaksasi dan kesehatan',
          isActive: true
        },
        {
          name: 'Hot Stone Massage',
          category: 'Body Treatment',
          normalPrice: 250000,
          duration: 90,
          description: 'Pijat dengan batu panas untuk relaksasi ekstra',
          isActive: true
        },
        {
          name: 'Body Scrub & Mask',
          category: 'Body Treatment',
          normalPrice: 180000,
          duration: 75,
          description: 'Scrub dan masker tubuh untuk kulit halus dan lembut',
          isActive: true
        },
        {
          name: 'Manicure Premium',
          category: 'Nail Care',
          normalPrice: 75000,
          duration: 45,
          description: 'Perawatan kuku tangan premium dengan nail art',
          isActive: true
        },
        {
          name: 'Pedicure Premium',
          category: 'Nail Care',
          normalPrice: 85000,
          duration: 60,
          description: 'Perawatan kuku kaki premium dengan pijat kaki',
          isActive: true
        },
        {
          name: 'Manicure Pedicure Package',
          category: 'Nail Care',
          normalPrice: 150000,
          promoPrice: 130000,
          duration: 90,
          description: 'Paket lengkap perawatan kuku tangan dan kaki',
          isActive: true
        },
        {
          name: 'Paket Pengantin Premium',
          category: 'Wedding Package',
          normalPrice: 2500000,
          promoPrice: 2000000,
          duration: 300,
          description: 'Paket lengkap perawatan pengantin dengan semua treatment premium',
          isActive: true
        },
        {
          name: 'Paket Pengantin Standard',
          category: 'Wedding Package',
          normalPrice: 1800000,
          duration: 240,
          description: 'Paket perawatan pengantin standar dengan treatment esensial',
          isActive: true
        },
        {
          name: 'Pre-Wedding Treatment',
          category: 'Wedding Package',
          normalPrice: 800000,
          duration: 180,
          description: 'Perawatan persiapan sebelum hari bahagia',
          isActive: true
        }
      ]

      for (const service of services) {
        await prisma.service.create({ data: service })
        setupResults.servicesCreated++
      }
    }

    // 3. Create comprehensive therapists
    const existingTherapists = await prisma.therapist.count()
    if (existingTherapists === 0) {
      const therapists = [
        {
          initial: 'R',
          fullName: 'Rina Sari Dewi',
          phone: '081234567890',
          isActive: true,
          baseFeePerTreatment: 20000,
          commissionRate: 0.12,
          totalTreatments: 45,
          totalEarnings: 2800000
        },
        {
          initial: 'A',
          fullName: 'Aisha Putri Maharani',
          phone: '081234567891',
          isActive: true,
          baseFeePerTreatment: 18000,
          commissionRate: 0.10,
          totalTreatments: 38,
          totalEarnings: 2200000
        },
        {
          initial: 'E',
          fullName: 'Elisa Rahman Sari',
          phone: '081234567892',
          isActive: true,
          baseFeePerTreatment: 22000,
          commissionRate: 0.15,
          totalTreatments: 52,
          totalEarnings: 3400000
        },
        {
          initial: 'T',
          fullName: 'Tina Wulandari',
          phone: '081234567893',
          isActive: true,
          baseFeePerTreatment: 20000,
          commissionRate: 0.12,
          totalTreatments: 41,
          totalEarnings: 2650000
        },
        {
          initial: 'S',
          fullName: 'Sari Indah Permata',
          phone: '081234567894',
          isActive: true,
          baseFeePerTreatment: 19000,
          commissionRate: 0.11,
          totalTreatments: 35,
          totalEarnings: 2100000
        }
      ]

      for (const therapist of therapists) {
        await prisma.therapist.create({ data: therapist })
        setupResults.therapistsCreated++
      }
    }

    // 4. Create sample customers
    const existingCustomers = await prisma.customer.count()
    if (existingCustomers === 0) {
      const customers = [
        {
          name: 'Siti Aminah',
          phone: '081234567801',
          email: 'siti.aminah@email.com',
          address: 'Jl. Merdeka No. 123, Medan',
          notes: 'Pelanggan VIP, suka treatment facial',
          totalVisits: 12,
          totalSpending: 2400000,
          isVip: true,
          lastVisit: new Date('2024-01-25')
        },
        {
          name: 'Fatimah Zahra',
          phone: '081234567802',
          email: 'fatimah.z@email.com', 
          address: 'Jl. Sudirman No. 456, Medan',
          totalVisits: 8,
          totalSpending: 1600000,
          isVip: false,
          lastVisit: new Date('2024-01-23')
        },
        {
          name: 'Khadijah Ahmad',
          phone: '081234567803',
          address: 'Jl. Ahmad Yani No. 789, Medan',
          notes: 'Rutin treatment setiap 2 minggu',
          totalVisits: 15,
          totalSpending: 3000000,
          isVip: true,
          lastVisit: new Date('2024-01-26')
        },
        {
          name: 'Maryam Husna',
          phone: '081234567804',
          email: 'maryam.h@email.com',
          totalVisits: 5,
          totalSpending: 750000,
          isVip: false,
          lastVisit: new Date('2024-01-20')
        },
        {
          name: 'Zahra Fitri',
          phone: '081234567805',
          address: 'Jl. Gatot Subroto No. 321, Medan',
          totalVisits: 20,
          totalSpending: 4500000,
          isVip: true,
          lastVisit: new Date('2024-01-27')
        }
      ]

      for (const customer of customers) {
        await prisma.customer.create({ data: customer })
        setupResults.customersCreated++
      }
    }

    // 5. Create sample treatments (recent history)
    const existingTreatments = await prisma.dailyTreatment.count()
    if (existingTreatments === 0) {
      const services = await prisma.service.findMany()
      const therapists = await prisma.therapist.findMany()
      const customers = await prisma.customer.findMany()

      if (services.length > 0 && therapists.length > 0) {
        const treatments = [
          {
            date: new Date('2024-01-27'),
            customerId: customers[0]?.id,
            customerName: 'Siti Aminah',
            serviceId: services[0].id,
            serviceName: services[0].name,
            servicePrice: services[0].normalPrice,
            therapistId: therapists[0].id,
            tipAmount: 25000,
            paymentMethod: 'cash',
            startTime: '09:00',
            endTime: '10:30',
            notes: 'Pelanggan sangat puas'
          },
          {
            date: new Date('2024-01-27'),
            customerId: customers[1]?.id,
            customerName: 'Fatimah Zahra',
            serviceId: services[3].id,
            serviceName: services[3].name,
            servicePrice: services[3].normalPrice,
            therapistId: therapists[1].id,
            tipAmount: 15000,
            paymentMethod: 'transfer',
            startTime: '10:00',
            endTime: '11:00',
          },
          {
            date: new Date('2024-01-26'),
            customerId: customers[2]?.id,
            customerName: 'Khadijah Ahmad',
            serviceId: services[6].id,
            serviceName: services[6].name,
            servicePrice: services[6].normalPrice,
            therapistId: therapists[2].id,
            tipAmount: 30000,
            paymentMethod: 'qris',
            startTime: '14:00',
            endTime: '15:30',
            notes: 'Treatment full body massage'
          }
        ]

        for (const treatment of treatments) {
          await prisma.dailyTreatment.create({ data: treatment })
          setupResults.treatmentsCreated++
        }
      }
    }

    // 6. Create sample bookings
    const existingBookings = await prisma.booking.count()
    if (existingBookings === 0) {
      const services = await prisma.service.findMany()
      
      if (services.length > 0) {
        const bookings = [
          {
            customerName: 'Aisyah Batubara',
            phone: '081234567806',
            service: services[1].name,
            servicePrice: services[1].normalPrice,
            date: new Date('2024-01-29'),
            time: '10:00',
            status: 'confirmed',
            notes: 'First time customer'
          },
          {
            customerName: 'Rahma Sari',
            phone: '081234567807',
            service: services[4].name,
            servicePrice: services[4].normalPrice,
            date: new Date('2024-01-29'),
            time: '14:00',
            status: 'pending',
            notes: 'Hair treatment keratin'
          },
          {
            customerName: 'Nurul Hasanah',
            phone: '081234567808',
            service: services[11].name,
            servicePrice: services[11].promoPrice || services[11].normalPrice,
            date: new Date('2024-01-30'),
            time: '11:00',
            status: 'confirmed'
          }
        ]

        for (const booking of bookings) {
          await prisma.booking.create({ data: booking })
          setupResults.bookingsCreated++
        }
      }
    }

    // 7. Create sample bookkeeping entries
    const existingBookkeeping = await prisma.monthlyBookkeeping.count()
    if (existingBookkeeping === 0) {
      const bookkeepingEntries = [
        {
          date: new Date('2024-01-25'),
          dailyRevenue: 650000,
          operationalCost: 150000,
          salaryExpense: 200000,
          therapistFee: 95000,
          otherExpenses: 50000,
          totalExpense: 495000,
          netIncome: 155000,
          runningTotal: 155000,
          notes: 'Hari Jumat - cukup ramai'
        },
        {
          date: new Date('2024-01-26'),
          dailyRevenue: 850000,
          operationalCost: 180000,
          salaryExpense: 200000,
          therapistFee: 125000,
          otherExpenses: 75000,
          totalExpense: 580000,
          netIncome: 270000,
          runningTotal: 425000,
          notes: 'Hari Sabtu - weekend rush'
        },
        {
          date: new Date('2024-01-27'),
          dailyRevenue: 750000,
          operationalCost: 160000,
          salaryExpense: 200000,
          therapistFee: 110000,
          otherExpenses: 60000,
          totalExpense: 530000,
          netIncome: 220000,
          runningTotal: 645000,
          notes: 'Hari Minggu - stabil'
        }
      ]

      for (const entry of bookkeepingEntries) {
        await prisma.monthlyBookkeeping.create({ data: entry })
      }
    }

    console.log('✅ Quick database setup completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Quick database setup completed successfully!',
      data: {
        setupResults,
        credentials: {
          username: 'admin_dina',
          password: 'DinaAdmin123!',
          note: 'Use these credentials to login to admin panel'
        },
        loginUrl: '/admin/masuk',
        dashboardUrl: '/admin/dashboard'
      }
    })

  } catch (error) {
    console.error('Quick setup error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Quick setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}