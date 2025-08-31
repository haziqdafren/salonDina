import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

// Force populate database with all required data
export async function POST(request: NextRequest) {
  try {
    const { authorization, forceOverwrite } = await request.json()
    
    if (authorization !== 'populate-salon-database-2024') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized population request' },
        { status: 401 }
      )
    }

    console.log('🚀 Starting comprehensive database population...')

    const results = {
      admins: { created: 0, existing: 0 },
      services: { created: 0, existing: 0 },
      therapists: { created: 0, existing: 0 },
      customers: { created: 0, existing: 0 },
      treatments: { created: 0, existing: 0 },
      bookings: { created: 0, existing: 0 },
      bookkeeping: { created: 0, existing: 0 }
    }

    // Import bcrypt for password hashing
    const bcrypt = await import('bcryptjs')

    // 1. CREATE ADMIN USERS
    console.log('👤 Creating admin users...')
    const adminUsers = [
      {
        username: 'admin_dina',
        password: 'DinaAdmin123!',
        name: 'Administrator Salon Dina'
      },
      {
        username: 'owner_dina',
        password: 'OwnerDina2024!',
        name: 'Owner Salon Muslimah Dina'
      }
    ]

    for (const adminData of adminUsers) {
      try {
        const existing = await prisma!.admin.findUnique({
          where: { username: adminData.username }
        })

        if (!existing || forceOverwrite) {
          if (existing && forceOverwrite) {
            await prisma!.admin.delete({ where: { id: existing.id } })
          }
          
          const hashedPassword = await bcrypt.hash(adminData.password, 12)
          await prisma!.admin.create({
            data: {
              username: adminData.username,
              password: hashedPassword,
              name: adminData.name
            }
          })
          results.admins.created++
        } else {
          results.admins.existing++
        }
      } catch (error) {
        console.error('Error creating admin:', adminData.username, error)
      }
    }

    // 2. CREATE SERVICES (ESSENTIAL FOR HOMEPAGE)
    console.log('💆‍♀️ Creating salon services...')
    const services = [
      // FACIAL TREATMENTS
      {
        name: 'Facial Brightening Premium',
        category: 'Perawatan Wajah',
        normalPrice: 200000,
        promoPrice: 150000,
        duration: 90,
        description: 'Perawatan wajah premium untuk mencerahkan dan menghaluskan kulit wajah',
        isActive: true
      },
      {
        name: 'Facial Acne Treatment',
        category: 'Perawatan Wajah',
        normalPrice: 180000,
        duration: 75,
        description: 'Treatment khusus untuk mengatasi jerawat dan bekasnya',
        isActive: true
      },
      {
        name: 'Facial Anti Aging',
        category: 'Perawatan Wajah',
        normalPrice: 250000,
        duration: 90,
        description: 'Perawatan anti penuaan dengan serum premium',
        isActive: true
      },
      {
        name: 'Facial Hydrating',
        category: 'Perawatan Wajah',
        normalPrice: 160000,
        duration: 60,
        description: 'Perawatan untuk melembabkan kulit wajah yang kering',
        isActive: true
      },

      // HAIR TREATMENTS
      {
        name: 'Hair Spa Aromatherapy',
        category: 'Perawatan Rambut',
        normalPrice: 150000,
        duration: 60,
        description: 'Perawatan rambut dengan aromaterapi untuk relaksasi',
        isActive: true
      },
      {
        name: 'Hair Treatment Keratin',
        category: 'Perawatan Rambut',
        normalPrice: 300000,
        promoPrice: 250000,
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
        name: 'Hair Coloring Natural',
        category: 'Perawatan Rambut',
        normalPrice: 200000,
        duration: 120,
        description: 'Pewarnaan rambut dengan bahan natural',
        isActive: true
      },

      // BODY TREATMENTS
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
        name: 'Body Scrub Premium',
        category: 'Body Treatment',
        normalPrice: 180000,
        duration: 75,
        description: 'Scrub tubuh premium untuk kulit halus',
        isActive: true
      },
      {
        name: 'Body Wrap Detox',
        category: 'Body Treatment',
        normalPrice: 220000,
        duration: 90,
        description: 'Body wrap untuk detoksifikasi tubuh',
        isActive: true
      },

      // NAIL CARE
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

      // WEDDING PACKAGES
      {
        name: 'Paket Pengantin Premium',
        category: 'Wedding Package',
        normalPrice: 2500000,
        promoPrice: 2000000,
        duration: 300,
        description: 'Paket lengkap perawatan pengantin dengan treatment premium',
        isActive: true
      },
      {
        name: 'Paket Pengantin Standard',
        category: 'Wedding Package',
        normalPrice: 1800000,
        duration: 240,
        description: 'Paket perawatan pengantin dengan treatment esensial',
        isActive: true
      },
      {
        name: 'Pre-Wedding Treatment',
        category: 'Wedding Package',
        normalPrice: 800000,
        duration: 180,
        description: 'Perawatan persiapan sebelum hari pernikahan',
        isActive: true
      },

      // SPECIAL TREATMENTS
      {
        name: 'Pregnancy Massage',
        category: 'Special Treatment',
        normalPrice: 220000,
        duration: 60,
        description: 'Pijat khusus untuk ibu hamil yang aman dan nyaman',
        isActive: true
      },
      {
        name: 'Postnatal Care Package',
        category: 'Special Treatment',
        normalPrice: 350000,
        duration: 120,
        description: 'Paket perawatan setelah melahirkan',
        isActive: true
      }
    ]

    for (const serviceData of services) {
      try {
        const existing = await prisma!.service.findFirst({
          where: { name: serviceData.name }
        })

        if (!existing || forceOverwrite) {
          if (existing && forceOverwrite) {
            await prisma!.service.delete({ where: { id: existing.id } })
          }

          await prisma!.service.create({
            data: serviceData
          })
          results.services.created++
        } else {
          results.services.existing++
        }
      } catch (error) {
        console.error('Error creating service:', serviceData.name, error)
      }
    }

    // 3. CREATE THERAPISTS
    console.log('👩‍⚕️ Creating therapists...')
    const therapists = [
      {
        initial: 'R',
        fullName: 'Rina Sari Dewi',
        phone: '081234567890',
        isActive: true,
        baseFeePerTreatment: 20000,
        commissionRate: 0.12
      },
      {
        initial: 'A',
        fullName: 'Aisha Putri Maharani',
        phone: '081234567891',
        isActive: true,
        baseFeePerTreatment: 18000,
        commissionRate: 0.10
      },
      {
        initial: 'E',
        fullName: 'Elisa Rahman Sari',
        phone: '081234567892',
        isActive: true,
        baseFeePerTreatment: 22000,
        commissionRate: 0.15
      },
      {
        initial: 'T',
        fullName: 'Tina Wulandari',
        phone: '081234567893',
        isActive: true,
        baseFeePerTreatment: 20000,
        commissionRate: 0.12
      },
      {
        initial: 'S',
        fullName: 'Sari Indah Permata',
        phone: '081234567894',
        isActive: true,
        baseFeePerTreatment: 19000,
        commissionRate: 0.11
      },
      {
        initial: 'D',
        fullName: 'Dina Muslimah',
        phone: '081234567895',
        isActive: true,
        baseFeePerTreatment: 25000,
        commissionRate: 0.18
      }
    ]

    for (const therapistData of therapists) {
      try {
        const existing = await prisma!.therapist.findUnique({
          where: { initial: therapistData.initial }
        })

        if (!existing || forceOverwrite) {
          if (existing && forceOverwrite) {
            await prisma!.therapist.delete({ where: { id: existing.id } })
          }

          await prisma!.therapist.create({
            data: therapistData
          })
          results.therapists.created++
        } else {
          results.therapists.existing++
        }
      } catch (error) {
        console.error('Error creating therapist:', therapistData.fullName, error)
      }
    }

    // 4. CREATE SAMPLE CUSTOMERS
    console.log('👥 Creating sample customers...')
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

    for (const customerData of customers) {
      try {
        const existing = await prisma!.customer.findUnique({
          where: { phone: customerData.phone }
        })

        if (!existing || forceOverwrite) {
          if (existing && forceOverwrite) {
            await prisma!.customer.delete({ where: { id: existing.id } })
          }

          await prisma!.customer.create({
            data: customerData
          })
          results.customers.created++
        } else {
          results.customers.existing++
        }
      } catch (error) {
        console.error('Error creating customer:', customerData.name, error)
      }
    }

    console.log('✅ Database population completed')

    return NextResponse.json({
      success: true,
      message: 'Database population completed successfully!',
      data: {
        results,
        summary: {
          totalCreated: Object.values(results).reduce((sum, r) => sum + r.created, 0),
          totalExisting: Object.values(results).reduce((sum, r) => sum + r.existing, 0)
        },
        credentials: [
          {
            username: 'admin_dina',
            password: 'DinaAdmin123!',
            role: 'Main Administrator'
          },
          {
            username: 'owner_dina', 
            password: 'OwnerDina2024!',
            role: 'Owner Account'
          }
        ]
      }
    })

  } catch (error) {
    console.error('Population error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database population failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma!.$disconnect()
  }
}