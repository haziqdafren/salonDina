import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        message: 'Supabase not configured'
      }, { status: 500 })
    }

    // Test Admin table structure
    const { data: admins, error } = await supabase
      .from('Admin')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Error querying Admin table',
        error: error.message,
        details: error
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Admin table accessible',
      data: {
        tableExists: true,
        sampleData: admins,
        columnInfo: admins.length > 0 ? Object.keys(admins[0]) : []
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        message: 'Supabase not configured'
      }, { status: 500 })
    }

    // Test inserting a test admin user
    const { data, error } = await supabase
      .from('Admin')
      .insert({
        username: 'test_admin',
        password: 'hashed_password_here',
        name: 'Test Admin'
      })
      .select()

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Error inserting test admin',
        error: error.message,
        details: error
      }, { status: 500 })
    }

    // Clean up test data
    await supabase
      .from('Admin')
      .delete()
      .eq('username', 'test_admin')

    return NextResponse.json({
      success: true,
      message: 'Admin table insert/delete test successful',
      data
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
