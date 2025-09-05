import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'
import { hashPassword } from '../../../lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        message: 'Supabase not configured'
      }, { status: 500 })
    }

    const { username, password, name } = await request.json()

    if (!username || !password || !name) {
      return NextResponse.json({
        success: false,
        message: 'Username, password, and name are required'
      }, { status: 400 })
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('Admin')
      .select('id')
      .eq('username', username)
      .single()

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Admin user already exists'
      }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Create admin user
    const { data, error } = await supabase
      .from('Admin')
      .insert({
        username,
        password: hashedPassword,
        name
      })
      .select()

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to create admin user',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: data[0].id,
        username: data[0].username,
        name: data[0].name
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to create admin user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        message: 'Supabase not configured'
      }, { status: 500 })
    }

    // List all admin users (without passwords)
    const { data, error } = await supabase
      .from('Admin')
      .select('id, username, name, createdAt')
      .order('createdAt', { ascending: false })

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch admin users',
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin users fetched successfully',
      data
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch admin users',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
