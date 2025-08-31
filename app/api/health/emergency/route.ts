import { NextResponse } from 'next/server'

// EMERGENCY: Test database connection without authentication
export async function GET() {
  try {
    console.log('🚨 EMERGENCY HEALTH CHECK...')
    
    // Check environment
    const dbUrl = process.env.DATABASE_URL
    const hasDbUrl = !!dbUrl
    const dbUrlInfo = dbUrl ? (
      dbUrl.includes('neon') ? 'Neon database detected' : 
      dbUrl.includes('postgresql') ? 'PostgreSQL connection' : 
      'Other database type'
    ) : 'No DATABASE_URL'

    console.log('Environment check:', { hasDbUrl, dbUrlInfo })

    // Try to import and test Prisma
    let prismaStatus = 'not tested'
    let connectionTest = false
    let adminCount = 0
    let serviceCount = 0
    let error = null

    try {
      const { prisma, isDatabaseAvailable } = await import('../../../../lib/prisma')
      
      if (!isDatabaseAvailable() || !prisma) {
        prismaStatus = 'unavailable - check DATABASE_URL'
      } else {
        prismaStatus = 'client created'
        
        // Test connection
        await prisma.$connect()
        connectionTest = true
        prismaStatus = 'connected successfully'
        
        // Test queries
        adminCount = await prisma.admin.count()
        serviceCount = await prisma.service.count()
        
        await prisma.$disconnect()
        prismaStatus = `connected - ${adminCount} admins, ${serviceCount} services`
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown prisma error'
      prismaStatus = `error: ${error}`
    }

    const diagnosis = {
      timestamp: new Date().toISOString(),
      environment: {
        hasDbUrl,
        dbUrlInfo,
        nodeEnv: process.env.NODE_ENV
      },
      database: {
        prismaStatus,
        connectionTest,
        adminCount,
        serviceCount
      },
      recommendations: []
    }

    // Add recommendations
    if (!hasDbUrl) {
      diagnosis.recommendations.push('Add DATABASE_URL to Vercel environment variables')
    } else if (!connectionTest) {
      diagnosis.recommendations.push('Check Neon database connection string and permissions')
    } else if (adminCount === 0) {
      diagnosis.recommendations.push('Database connected but empty - need to populate admin users')
    } else if (serviceCount === 0) {
      diagnosis.recommendations.push('Admin users exist but no services - need to populate treatments')
    } else {
      diagnosis.recommendations.push('Database looks healthy! Try logging in with admin_dina / DinaAdmin123!')
    }

    if (error) {
      diagnosis.recommendations.push(`Error details: ${error}`)
    }

    return NextResponse.json({
      success: connectionTest,
      message: connectionTest ? 'Database connection successful' : 'Database connection failed',
      data: diagnosis
    })

  } catch (error) {
    console.error('Emergency health check failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Emergency health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Also create a simple setup endpoint
export async function POST() {
  try {
    console.log('🚨 EMERGENCY SETUP...')
    
    const { prisma, isDatabaseAvailable } = await import('../../../../lib/prisma')
    
    if (!isDatabaseAvailable() || !prisma) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 503 })
    }

    const bcrypt = await import('bcryptjs')
    
    // Create admin if doesn't exist
    let adminCreated = false
    try {
      const existing = await prisma.admin.findUnique({
        where: { username: 'admin_dina' }
      })

      if (!existing) {
        const hashedPassword = await bcrypt.hash('DinaAdmin123!', 12)
        await prisma.admin.create({
          data: {
            username: 'admin_dina',
            password: hashedPassword,
            name: 'Administrator Salon Dina'
          }
        })
        adminCreated = true
      }
    } catch (err) {
      console.error('Admin creation error:', err)
    }

    // Create service if doesn't exist
    let serviceCreated = false
    try {
      const existing = await prisma.service.findFirst({
        where: { name: 'Facial Brightening Premium' }
      })

      if (!existing) {
        await prisma.service.create({
          data: {
            name: 'Facial Brightening Premium',
            category: 'Perawatan Wajah',
            normalPrice: 200000,
            promoPrice: 150000,
            duration: 90,
            description: 'Perawatan wajah premium untuk mencerahkan kulit',
            isActive: true
          }
        })
        serviceCreated = true
      }
    } catch (err) {
      console.error('Service creation error:', err)
    }

    const finalCounts = {
      admins: await prisma.admin.count(),
      services: await prisma.service.count()
    }

    return NextResponse.json({
      success: true,
      message: 'Emergency setup completed',
      data: {
        adminCreated,
        serviceCreated,
        finalCounts,
        credentials: { username: 'admin_dina', password: 'DinaAdmin123!' }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Setup failed'
    }, { status: 500 })
  }
}