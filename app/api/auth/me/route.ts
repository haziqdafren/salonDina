import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'salon-dina-fallback-secret-2024'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No token provided'
      }, { status: 401 })
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        name: decoded.name,
        role: decoded.role
      }
    })

  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json({
      success: false,
      authenticated: false,
      message: 'Invalid token'
    }, { status: 401 })
  }
}