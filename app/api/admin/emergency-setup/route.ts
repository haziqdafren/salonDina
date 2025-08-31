import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../../lib/prisma'

// Emergency database setup without authentication - REMOVE AFTER SETUP
export async function GET(request: NextRequest) {
  try {
    console.log('🚨 EMERGENCY DATABASE SETUP STARTING...')
    
    // Check if database is available
    if (!isDatabaseAvailable() || !prisma) {
      return NextResponse.json({
        success: false,
        error: 'Database not available - check DATABASE_URL environment variable',
        databaseUrl: process.env.DATABASE_URL ? 'Present but may be invalid' : 'Missing'
      })
    }

    console.log('✅ Database client available')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Import bcrypt
    const bcrypt = await import('bcryptjs')
    console.log('✅ Bcrypt imported')

    const results = {
      admins: { created: 0, existing: 0 },
      services: { created: 0, existing: 0 },
      total: 0
    }

    // 1. CREATE ADMIN USERS FIRST
    console.log('👤 Creating emergency admin...')
    
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
        // Check if exists
        const existing = await prisma.admin.findUnique({
          where: { username: adminData.username }
        })

        if (!existing) {
          const hashedPassword = await bcrypt.hash(adminData.password, 12)
          
          await prisma.admin.create({
            data: {
              username: adminData.username,
              password: hashedPassword,
              name: adminData.name
            }
          })
          
          results.admins.created++
          console.log(`✅ Created admin: ${adminData.username}`)
        } else {
          results.admins.existing++
          console.log(`⚠️ Admin exists: ${adminData.username}`)
        }
      } catch (error) {
        console.error(`❌ Error creating admin ${adminData.username}:`, error)
      }
    }

    // 2. CREATE ESSENTIAL SERVICES
    console.log('💆‍♀️ Creating essential salon services...')
    
    const essentialServices = [
      {
        name: 'Facial Brightening Premium',
        category: 'Perawatan Wajah',
        normalPrice: 200000,
        promoPrice: 150000,
        duration: 90,
        description: 'Perawatan wajah premium untuk mencerahkan kulit',
        isActive: true
      },
      {
        name: 'Hair Spa Aromatherapy',
        category: 'Perawatan Rambut', 
        normalPrice: 150000,
        duration: 60,
        description: 'Perawatan rambut dengan aromaterapi',
        isActive: true
      },
      {
        name: 'Full Body Massage',
        category: 'Body Treatment',
        normalPrice: 200000,
        duration: 90,
        description: 'Pijat seluruh tubuh untuk relaksasi',
        isActive: true
      },
      {
        name: 'Manicure Premium',
        category: 'Nail Care',
        normalPrice: 75000,
        duration: 45,
        description: 'Perawatan kuku tangan premium',
        isActive: true
      },
      {
        name: 'Paket Pengantin Premium',
        category: 'Wedding Package',
        normalPrice: 2500000,
        promoPrice: 2000000,
        duration: 300,
        description: 'Paket lengkap perawatan pengantin',
        isActive: true
      }
    ]

    for (const serviceData of essentialServices) {
      try {
        const existing = await prisma.service.findFirst({
          where: { name: serviceData.name }
        })

        if (!existing) {
          await prisma.service.create({
            data: serviceData
          })
          results.services.created++
          console.log(`✅ Created service: ${serviceData.name}`)
        } else {
          results.services.existing++
          console.log(`⚠️ Service exists: ${serviceData.name}`)
        }
      } catch (error) {
        console.error(`❌ Error creating service ${serviceData.name}:`, error)
      }
    }

    results.total = results.admins.created + results.services.created

    // Get current counts
    const finalCounts = {
      admins: await prisma.admin.count(),
      services: await prisma.service.count()
    }

    console.log('🎉 EMERGENCY SETUP COMPLETED')

    return NextResponse.json({
      success: true,
      message: 'Emergency database setup completed!',
      data: {
        results,
        finalCounts,
        loginCredentials: [
          { username: 'admin_dina', password: 'DinaAdmin123!' },
          { username: 'owner_dina', password: 'OwnerDina2024!' }
        ],
        nextSteps: [
          '1. Try logging in with admin_dina / DinaAdmin123!',
          '2. Check homepage for treatments',
          '3. Access /admin/database-manager for full setup',
          '4. DELETE this emergency route after setup'
        ]
      }
    })

  } catch (error) {
    console.error('🚨 Emergency setup failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Emergency setup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      troubleshooting: {
        checkDatabase: 'Verify DATABASE_URL in Vercel environment variables',
        checkConnection: 'Ensure Neon database is accessible',
        checkTables: 'Database schema might not be deployed'
      }
    }, { status: 500 })
    
  } finally {
    if (prisma) {
      await prisma.$disconnect()
    }
  }
}