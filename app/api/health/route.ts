import { NextResponse } from 'next/server'
import { isSupabaseConfigured } from '../../../lib/supabase'

export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
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
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}