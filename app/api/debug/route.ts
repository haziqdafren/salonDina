import { NextResponse } from 'next/server'
import { isSupabaseConfigured } from '../../../lib/supabase'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return NextResponse.json({
    environment: process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    supabase: {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      urlPrefix: supabaseUrl?.substring(0, 30) + '...',
      keyPrefix: supabaseKey?.substring(0, 20) + '...',
      isConfigured: isSupabaseConfigured()
    },
    vercel: {
      region: process.env.VERCEL_REGION || 'unknown',
      env: process.env.VERCEL_ENV || 'unknown'
    }
  })
}