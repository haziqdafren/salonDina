import { NextRequest, NextResponse } from 'next/server'
import { ensureAdminTable, createDefaultAdmins } from '../../../lib/admin-seeder'
import { isSupabaseConfigured } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database setup...')

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: false,
        error: 'Supabase is not configured. Please check your environment variables.',
        details: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
      }, { status: 500 })
    }

    // Check if admin table exists
    const tableExists = await ensureAdminTable()
    if (!tableExists) {
      return NextResponse.json({
        success: false,
        error: 'Admin table does not exist',
        details: 'Please run the database setup SQL in your Supabase dashboard first.',
        sqlFile: 'lib/database-setup.sql'
      }, { status: 500 })
    }

    // Create default admin users
    const adminsCreated = await createDefaultAdmins()
    if (!adminsCreated) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create admin users',
        details: 'There was an error creating the default admin users.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully!',
      adminCredentials: [
        {
          username: 'admin',
          password: 'SalonDina2024!',
          name: 'Administrator',
          note: 'Primary admin account'
        },
        {
          username: 'admin_dina',
          password: 'DinaAdmin2024!',
          name: 'Dina Admin',
          note: 'Salon owner account'
        },
        {
          username: 'super_admin',
          password: 'SuperDina2024!',
          name: 'Super Administrator',
          note: 'System administrator account'
        }
      ],
      instructions: [
        'Admin users have been created with secure passwords',
        'Please change the default passwords after first login',
        'Store these credentials securely',
        'The old hardcoded credentials are now disabled'
      ]
    })

  } catch (error) {
    console.error('❌ Setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Salon Muslimah Dina - Database Setup Endpoint',
    instructions: [
      '1. First, run the SQL setup script in your Supabase dashboard',
      '2. Then POST to this endpoint to create admin users',
      '3. Use the returned credentials to login'
    ],
    sqlFile: 'lib/database-setup.sql'
  })
}