import { NextRequest, NextResponse } from 'next/server'
import { createDefaultAdmins, updateAdminPassword } from '../../../lib/admin-seeder'

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting admin setup...')
    
    const body = await request.json().catch(() => ({}))
    
    if (body.action === 'remove_test_user') {
      // Remove insecure test user
      const { supabase } = await import('../../../lib/supabase')
      if (supabase) {
        await supabase.from('Admin').delete().eq('username', 'test')
        console.log('🗑️ Removed insecure test user')
      }
      
      return NextResponse.json({
        success: true,
        message: 'Test user removed for security',
        credentials: {
          admin_dina: 'DinaAdmin123!',
          admin: 'SalonDina2024!',
          super_admin: 'SuperDina2024!'
        }
      })
    }
    
    const success = await createDefaultAdmins()
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Admin users created successfully',
        credentials: {
          admin_dina: 'DinaAdmin123!',
          admin: 'SalonDina2024!',
          super_admin: 'SuperDina2024!'
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to create admin users'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({
      success: false,
      message: 'Setup failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Admin setup endpoint - use POST to create admin users'
  })
}