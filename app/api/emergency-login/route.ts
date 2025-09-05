import { NextResponse } from 'next/server'

// Emergency endpoint to provide working login credentials
export async function GET() {
  return NextResponse.json({
    message: 'Emergency login information',
    instructions: 'Use these credentials at /admin/login-new',
    credentials: [
      {
        username: 'admin_dina',
        password: 'DinaAdmin123!',
        role: 'Primary Admin'
      },
      {
        username: 'admin',
        password: 'SalonDina2024!',
        role: 'Admin'
      },
      {
        username: 'super_admin',
        password: 'SuperDina2024!',
        role: 'Super Admin'
      }
    ],
    loginUrl: '/admin/login-new',
    note: 'NextAuth has been completely replaced with custom JWT authentication'
  })
}