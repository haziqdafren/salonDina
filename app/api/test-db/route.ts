import { NextResponse } from 'next/server'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL
  
  return NextResponse.json({
    hasDbUrl: !!dbUrl,
    dbUrlStartsWith: dbUrl ? dbUrl.substring(0, 30) + '...' : 'undefined',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}