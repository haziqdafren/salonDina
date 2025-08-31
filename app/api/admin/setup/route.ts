import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../../lib/prisma'

// Secure database setup endpoint for production
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { authorization, adminData } = body
    
    // Validate authorization
    if (authorization !== 'setup-salon-dina-2024') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized setup attempt' },
        { status: 401 }
      )
    }

    // Validate admin data
    if (!adminData || !adminData.username || !adminData.password || !adminData.name) {
      return NextResponse.json(
        { success: false, error: 'Missing required admin data: username, password, and name are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    const { password } = adminData
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      )
    }

    // Validate username
    if (adminData.username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(adminData.username)) {
      return NextResponse.json(
        { success: false, error: 'Username must be at least 3 characters and contain only letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    if (!isDatabaseAvailable() || !prisma) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check if setup is already done
    const adminCount = await prisma.admin.count()
    if (adminCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'Database already initialized',
        message: 'Setup has already been completed. Contact administrator to reset.'
      }, { status: 409 })
    }

    console.log('🚀 Starting secure database setup...')

    // Import bcryptjs dynamically
    const bcrypt = await import('bcryptjs')

    // 1. Create secure admin user
    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.admin.create({
      data: {
        username: adminData.username,
        password: hashedPassword,
        name: adminData.name,
      }
    })

    // 2. Create initial services
    const initialServices = [
      {
        name: 'Facial Brightening',
        category: 'Perawatan Wajah',
        normalPrice: 150000,
        promoPrice: 125000,
        duration: 60,
        description: 'Perawatan wajah untuk mencerahkan kulit',
        isActive: true
      },
      {
        name: 'Hair Spa Treatment',
        category: 'Perawatan Rambut', 
        normalPrice: 200000,
        duration: 90,
        description: 'Perawatan rambut lengkap dengan masker',
        isActive: true
      },
      {
        name: 'Full Body Massage',
        category: 'Body Treatment',
        normalPrice: 250000,
        duration: 120,
        description: 'Pijat seluruh tubuh untuk relaksasi',
        isActive: true
      },
      {
        name: 'Manicure Pedicure',
        category: 'Nail Care',
        normalPrice: 100000,
        duration: 60,
        description: 'Perawatan kuku tangan dan kaki',
        isActive: true
      },
      {
        name: 'Paket Pengantin',
        category: 'Wedding Package',
        normalPrice: 1500000,
        duration: 240,
        description: 'Paket lengkap perawatan untuk pengantin',
        isActive: true
      }
    ]

    for (const service of initialServices) {
      await prisma.service.create({ data: service })
    }

    // 3. Create initial therapists
    const initialTherapists = [
      {
        initial: 'R',
        fullName: 'Rina Sari',
        phone: '081234567890',
        isActive: true,
        baseFeePerTreatment: 15000,
        commissionRate: 0.1
      },
      {
        initial: 'A',
        fullName: 'Aisha Putri',
        phone: '081234567891',
        isActive: true,
        baseFeePerTreatment: 15000,
        commissionRate: 0.1
      },
      {
        initial: 'E',
        fullName: 'Elisa Rahman',
        phone: '081234567892',
        isActive: true,
        baseFeePerTreatment: 15000,
        commissionRate: 0.1
      },
      {
        initial: 'T',
        fullName: 'Tina Wulandari',
        phone: '081234567893',
        isActive: true,
        baseFeePerTreatment: 15000,
        commissionRate: 0.1
      }
    ]

    for (const therapist of initialTherapists) {
      await prisma.therapist.create({ data: therapist })
    }

    // 4. Get final statistics
    const stats = {
      admins: await prisma.admin.count(),
      services: await prisma.service.count(),
      therapists: await prisma.therapist.count(),
      customers: await prisma.customer.count()
    }

    console.log('✅ Database setup completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      data: {
        statistics: stats,
        adminCreated: {
          username: adminData.username,
          name: adminData.name,
          note: 'Admin user created successfully. Keep credentials secure.'
        },
        setupTimestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}