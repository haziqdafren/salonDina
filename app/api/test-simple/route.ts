import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: '🎉 APP ROUTER API IS WORKING!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    status: 'ALL SYSTEMS GO!'
  })
}