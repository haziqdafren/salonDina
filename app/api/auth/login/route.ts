import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { verifyPassword } from '../../../../lib/auth-utils'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'salon-dina-fallback-secret-2024'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    console.log('🔐 Simple login attempt:', username)

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username and password required'
      }, { status: 400 })
    }

    // Get admin user from database
    if (!supabase) {
      return NextResponse.json({
        success: false,
        message: 'Database connection error'
      }, { status: 500 })
    }

    const { data: admin, error } = await supabase
      .from('Admin')
      .select('id, username, password, name')
      .eq('username', username)
      .single()

    if (error || !admin) {
      console.log('❌ User not found:', username)
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.password)
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', username)
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 })
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '3h' }
    )

    console.log('✅ Login successful for:', username)

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: 'admin'
      }
    })

    // Set secure cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3 * 60 * 60, // 3 hours
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Login failed'
    }, { status: 500 })
  }
}