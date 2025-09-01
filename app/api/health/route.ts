import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '../../../lib/supabase'

export async function GET() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        status: 'warning',
        database: 'disconnected',
        message: 'Database belum terhubung - Environment variables not configured',
        timestamp: new Date().toISOString()
      })
    }

    // Test Supabase connection
    if (!supabase) {
      return NextResponse.json({
        status: 'error',
        database: 'disconnected',
        message: 'Database belum terhubung - Supabase client not initialized',
        timestamp: new Date().toISOString()
      })
    }

    // Simple health check query
    const { data, error } = await supabase
      .from('Service')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json({
        status: 'error',
        database: 'disconnected',
        message: 'Database belum terhubung - Connection failed',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      message: 'Database terhubung dengan baik',
      services_available: data ? data.length > 0 : false,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      message: 'Database belum terhubung - Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}