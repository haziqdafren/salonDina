import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../../lib/prisma'

// Debug authentication system
export async function POST(request: NextRequest) {
  try {
    const { authorization } = await request.json()
    
    if (authorization !== 'debug-auth-salon-2024') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized debug request' },
        { status: 401 }
      )
    }

    if (!isDatabaseAvailable() || !prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      )
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      database: {
        available: isDatabaseAvailable(),
        connected: false,
        tables: 0,
        adminCount: 0,
        adminUsers: [] as any[]
      },
      auth: {
        bcryptAvailable: false,
        testHash: null as string | null,
        testVerification: false
      }
    }

    // Test database connection
    try {
      await prisma.$connect()
      debugInfo.database.connected = true
      
      // Count tables
      const tables = await prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `
      debugInfo.database.tables = Number(tables[0]?.count || 0)
      
      // Check admin users
      debugInfo.database.adminCount = await prisma.admin.count()
      
      if (debugInfo.database.adminCount > 0) {
        const admins = await prisma.admin.findMany({
          select: {
            id: true,
            username: true,
            name: true,
            createdAt: true,
            // Don't include password for security
          }
        })
        debugInfo.database.adminUsers = admins
      }
      
    } catch (error) {
      debugInfo.database.connected = false
      console.error('Database connection error:', error)
    }

    // Test bcrypt functionality
    try {
      const bcrypt = await import('bcryptjs')
      debugInfo.auth.bcryptAvailable = true
      
      // Test password hashing
      const testPassword = 'DinaAdmin123!'
      const testHash = await bcrypt.hash(testPassword, 12)
      debugInfo.auth.testHash = testHash.substring(0, 20) + '...' // Truncate for security
      
      // Test password verification
      debugInfo.auth.testVerification = await bcrypt.compare(testPassword, testHash)
      
    } catch (error) {
      debugInfo.auth.bcryptAvailable = false
      console.error('Bcrypt error:', error)
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication debug completed',
      data: debugInfo
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Also create a simple admin creation endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { authorization, username, password, name } = body
    
    if (authorization !== 'create-admin-salon-2024') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin creation' },
        { status: 401 }
      )
    }

    if (!isDatabaseAvailable() || !prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      )
    }

    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Username, password, and name are required' },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin with this username already exists' },
        { status: 409 }
      )
    }

    // Create admin
    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      data: {
        admin,
        credentials: {
          username,
          password,
          note: 'Store these credentials securely'
        }
      }
    })

  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Admin creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}