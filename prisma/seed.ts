import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { sampleTherapists, sampleServices, sampleCustomers, serviceCategories } from '../data/therapists'

const prisma = new PrismaClient()

async function main() {
  console.log('🌸 Seeding Salon Muslimah Dina database...')

  // Create default admin user (or update if exists)
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {
      password: hashedPassword,
      name: 'Admin Salon Dina',
    },
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Admin Salon Dina',
    },
  })

  console.log('✅ Admin user created/updated:', admin.name)

  // Create service categories
  const categories = await Promise.all(
    serviceCategories.map(category =>
      prisma.serviceCategory.upsert({
        where: { name: category.name },
        update: category,
        create: category
      })
    )
  )

  console.log('✅ Service categories created:', categories.length)

  // Create services (check if they exist first)
  const services = []
  for (const service of sampleServices) {
    const existingService = await prisma.service.findFirst({
      where: { name: service.name }
    })
    
    if (existingService) {
      services.push(existingService)
    } else {
      const newService = await prisma.service.create({
        data: service
      })
      services.push(newService)
    }
  }

  console.log('✅ Services created:', services.length)

  // Create therapists
  const therapists = await Promise.all(
    sampleTherapists.map(therapist =>
      prisma.therapist.upsert({
        where: { initial: therapist.initial },
        update: therapist,
        create: therapist
      })
    )
  )

  console.log('✅ Therapists created:', therapists.length)

  // Create sample customers
  const customers = await Promise.all(
    sampleCustomers.map(customer =>
      prisma.customer.upsert({
        where: { phone: customer.phone },
        update: customer,
        create: customer
      })
    )
  )

  console.log('✅ Customers created:', customers.length)

  // Create business hours
  const businessHours = await Promise.all([
    ...Array.from({ length: 7 }, (_, i) => {
      const isWorkingDay = i >= 1 && i <= 6 // Monday to Saturday
      const isFriday = i === 5

      return prisma.businessHour.upsert({
        where: { dayOfWeek: i },
        update: {
          openTime: isWorkingDay ? (i === 0 ? '10:00' : '09:00') : '10:00',
          closeTime: isWorkingDay ? (i === 0 ? '15:00' : '17:00') : '15:00',
          isOpen: i !== 0 || i === 0, // Sunday has different hours
          notes: isFriday ? 'Tutup 12:00-13:30 untuk sholat Jumat' : undefined,
        },
        create: {
          dayOfWeek: i,
          openTime: isWorkingDay ? (i === 0 ? '10:00' : '09:00') : '10:00',
          closeTime: isWorkingDay ? (i === 0 ? '15:00' : '17:00') : '15:00',
          isOpen: i !== 0 || i === 0, // Sunday has different hours
          notes: isFriday ? 'Tutup 12:00-13:30 untuk sholat Jumat' : undefined,
        },
      })
    })
  ])

  console.log('✅ Business hours created:', businessHours.length)

  // Create sample daily treatments for the last 30 days
  const today = new Date()
  const sampleTreatments = []

  // Check if treatments already exist
  const existingTreatments = await prisma.dailyTreatment.count()
  if (existingTreatments > 0) {
    console.log('⚠️  Sample treatments already exist, skipping...')
  } else {
    for (let i = 0; i < 30; i++) {
      const treatmentDate = new Date(today)
      treatmentDate.setDate(today.getDate() - i)
      
      // Skip Sundays
      if (treatmentDate.getDay() === 0) continue

      // Random number of treatments per day (2-8)
      const treatmentsPerDay = Math.floor(Math.random() * 7) + 2
      
      for (let j = 0; j < treatmentsPerDay; j++) {
        const randomService = services[Math.floor(Math.random() * services.length)]
        const randomTherapist = therapists[Math.floor(Math.random() * therapists.length)]
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)]
        const randomTip = Math.floor(Math.random() * 4) * 5000 // 0, 5k, 10k, 15k tips

        const treatment = await prisma.dailyTreatment.create({
          data: {
            date: treatmentDate,
            customerId: randomCustomer.id,
            customerName: randomCustomer.name,
            serviceId: randomService.id,
            serviceName: randomService.name,
            servicePrice: randomService.promoPrice || randomService.normalPrice,
            therapistId: randomTherapist.id,
            tipAmount: randomTip,
            paymentMethod: ['cash', 'transfer', 'qris'][Math.floor(Math.random() * 3)],
            startTime: `${8 + Math.floor(Math.random() * 8)}:00`,
            notes: Math.random() > 0.7 ? 'Customer sangat puas dengan layanan' : undefined
          }
        })

        sampleTreatments.push(treatment)

        // Create feedback for some treatments (70% chance)
        if (Math.random() > 0.3) {
          await prisma.customerFeedback.create({
            data: {
              dailyTreatmentId: treatment.id,
              customerId: randomCustomer.id,
              overallRating: Math.floor(Math.random() * 2) + 4, // 4-5 rating
              serviceQuality: Math.floor(Math.random() * 2) + 4,
              therapistService: Math.floor(Math.random() * 2) + 4,
              cleanliness: Math.floor(Math.random() * 2) + 4,
              valueForMoney: Math.floor(Math.random() * 2) + 4,
              comment: Math.random() > 0.5 ? 'Pelayanan sangat memuaskan, akan kembali lagi!' : undefined,
              wouldRecommend: Math.random() > 0.1 // 90% would recommend
            }
          })
        }
      }
    }
  }

  console.log('✅ Sample treatments created:', sampleTreatments.length)

  // Create sample bookkeeping entries for the last 30 days
  const existingBookkeeping = await prisma.monthlyBookkeeping.count()
  if (existingBookkeeping > 0) {
    console.log('⚠️  Sample bookkeeping entries already exist, skipping...')
  } else {
    for (let i = 0; i < 30; i++) {
      const entryDate = new Date(today)
      entryDate.setDate(today.getDate() - i)
      
      // Skip Sundays
      if (entryDate.getDay() === 0) continue

      // Calculate daily revenue from treatments
      const startOfDay = new Date(entryDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(entryDate)
      endOfDay.setHours(23, 59, 59, 999)

      const dayTreatments = await prisma.dailyTreatment.findMany({
        where: {
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          therapist: true
        }
      })

      const dailyRevenue = dayTreatments.reduce((sum, t) => sum + t.servicePrice, 0)
      
      // Calculate therapist fees
      const therapistFee = dayTreatments.reduce((sum, t) => {
        return sum + t.therapist.baseFeePerTreatment + (t.servicePrice * t.therapist.commissionRate)
      }, 0)

      // Random operational costs
      const operationalCost = Math.floor(Math.random() * 200000) + 100000 // 100k-300k
      const otherExpenses = Math.floor(Math.random() * 100000) // 0-100k

      const totalExpense = operationalCost + therapistFee + otherExpenses
      const netIncome = dailyRevenue - totalExpense

      await prisma.monthlyBookkeeping.create({
        data: {
          date: entryDate,
          dailyRevenue,
          operationalCost,
          salaryExpense: 0, // Monthly salary not daily
          therapistFee: Math.round(therapistFee),
          otherExpenses,
          totalExpense,
          netIncome,
          runningTotal: netIncome, // Will be recalculated
          notes: i === 0 ? 'Entry hari ini' : undefined
        }
      })
    }
  }

  // Recalculate running totals
  const allEntries = await prisma.monthlyBookkeeping.findMany({
    orderBy: { date: 'asc' }
  })

  let runningTotal = 0
  for (const entry of allEntries) {
    runningTotal += entry.netIncome
    await prisma.monthlyBookkeeping.update({
      where: { id: entry.id },
      data: { runningTotal }
    })
  }

  console.log('✅ Sample bookkeeping entries created:', allEntries.length)

  // Update therapist statistics
  for (const therapist of therapists) {
    const therapistTreatments = await prisma.dailyTreatment.findMany({
      where: { therapistId: therapist.id },
      include: { feedback: true }
    })

    const totalEarnings = therapistTreatments.reduce((sum, t) => {
      return sum + therapist.baseFeePerTreatment + (t.servicePrice * therapist.commissionRate) + t.tipAmount
    }, 0)

    const ratings = therapistTreatments
      .filter(t => t.feedback?.therapistService)
      .map(t => t.feedback!.therapistService)
    
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : undefined

    await prisma.therapist.update({
      where: { id: therapist.id },
      data: {
        totalTreatments: therapistTreatments.length,
        totalEarnings: Math.round(totalEarnings),
        averageRating
      }
    })

    // Create monthly stats for current month
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    
    const monthlyTreatments = therapistTreatments.filter(t => {
      const treatmentDate = new Date(t.date)
      return treatmentDate.getMonth() + 1 === currentMonth && treatmentDate.getFullYear() === currentYear
    })

    const monthlyRevenue = monthlyTreatments.reduce((sum, t) => sum + t.servicePrice, 0)
    const monthlyFees = monthlyTreatments.reduce((sum, t) => {
      return sum + therapist.baseFeePerTreatment + (t.servicePrice * therapist.commissionRate)
    }, 0)
    const monthlyTips = monthlyTreatments.reduce((sum, t) => sum + t.tipAmount, 0)

    await prisma.therapistMonthlyStats.upsert({
      where: {
        therapistId_month_year: {
          therapistId: therapist.id,
          month: currentMonth,
          year: currentYear
        }
      },
      update: {
        treatmentCount: monthlyTreatments.length,
        totalRevenue: monthlyRevenue,
        totalFees: Math.round(monthlyFees),
        totalTips: monthlyTips,
        averageRating
      },
      create: {
        therapistId: therapist.id,
        month: currentMonth,
        year: currentYear,
        treatmentCount: monthlyTreatments.length,
        totalRevenue: monthlyRevenue,
        totalFees: Math.round(monthlyFees),
        totalTips: monthlyTips,
        averageRating
      }
    })
  }

  console.log('✅ Therapist statistics updated')

  // Create initial settings
  const settings = await Promise.all([
    prisma.setting.upsert({
      where: { key: 'salon_name' },
      update: { value: 'Salon Muslimah Dina' },
      create: {
        key: 'salon_name',
        value: 'Salon Muslimah Dina',
        category: 'general',
      }
    }),
    prisma.setting.upsert({
      where: { key: 'salon_address' },
      update: { value: 'Jl. Mawar Indah No. 123, Jakarta Selatan' },
      create: {
        key: 'salon_address',
        value: 'Jl. Mawar Indah No. 123, Jakarta Selatan',
        category: 'general',
      }
    }),
    prisma.setting.upsert({
      where: { key: 'salon_phone' },
      update: { value: '+62 812-3456-7890' },
      create: {
        key: 'salon_phone',
        value: '+62 812-3456-7890',
        category: 'contact',
      }
    }),
    prisma.setting.upsert({
      where: { key: 'salon_instagram' },
      update: { value: '@dina_salon_muslimah' },
      create: {
        key: 'salon_instagram',
        value: '@dina_salon_muslimah',
        category: 'social',
      }
    }),
    prisma.setting.upsert({
      where: { key: 'booking_advance_days' },
      update: { value: '30' },
      create: {
        key: 'booking_advance_days',
        value: '30',
        type: 'number',
        category: 'booking',
      }
    }),
  ])

  console.log('✅ Settings created:', settings.length)

  console.log('\n🎉 Seeding completed successfully!')
  console.log(`
📋 Summary:
- Admin user: 1
- Service categories: ${categories.length}
- Services: ${services.length}
- Therapists: ${therapists.length}
- Customers: ${customers.length}
- Sample treatments: ${sampleTreatments.length}
- Bookkeeping entries: ${allEntries.length}
- Business hours: ${businessHours.length}
- Settings: ${settings.length}

🔐 Login credentials:
- Username: admin
- Password: admin123
- URL: http://localhost:3000/admin/masuk

👩‍💼 Sample Therapists:
${therapists.map(t => `- ${t.initial}: ${t.fullName} (Fee: ${t.baseFeePerTreatment.toLocaleString('id-ID')}, Commission: ${(t.commissionRate * 100)}%)`).join('\n')}
`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })