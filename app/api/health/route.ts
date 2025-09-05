import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '../../../lib/supabase'

export async function GET() {
  try {
    let databaseStatus = 'disconnected'
    
    // Test actual database connection if Supabase is configured
    if (isSupabaseConfigured() && supabase) {
      try {
        // Simple query to test database connection
        const { data, error } = await supabase
          .from('Service')
          .select('id')
          .limit(1)
        
        if (!error) {
          databaseStatus = 'connected'
        } else {
          console.log('Database connection test failed:', error.message)
          databaseStatus = 'error'
        }
      } catch (dbError) {
        console.log('Database connection test error:', dbError)
        databaseStatus = 'error'
      }
    } else {
      databaseStatus = 'not_configured'
    }

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: databaseStatus,
      supabase: {
        configured: isSupabaseConfigured(),
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      },
      jwt: {
        secret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      database: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}