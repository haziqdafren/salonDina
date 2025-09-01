import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'
import bcrypt from 'bcryptjs'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username dan password harus diisi')
        }

        // Enhanced database check
        if (!isSupabaseConfigured()) {
          console.error('Supabase not available for authentication')
          throw new Error('Database not configured')
        }

        try {
          // Query user from Supabase
          if (!supabase) {
            throw new Error('Supabase client not initialized')
          }

          // Try to get user from database, but fallback to hardcoded admin if no users table
          let user = null
          try {
            const { data: users, error } = await supabase
              .from('users')
              .select('*')
              .or(`username.eq.${credentials.username},email.eq.${credentials.username}`)
              .eq('isActive', true)
              .limit(1)

            if (!error && users && users.length > 0) {
              user = users[0]
            }
          } catch (dbError) {
            console.log('Users table not found, using fallback admin')
          }

          // Fallback for admin login if no users table
          if (!user && (credentials.username === 'admin' || credentials.username === 'admin_dina')) {
            // Allow admin login with hardcoded credentials
            if ((credentials.username === 'admin' && credentials.password === 'admin123') ||
                (credentials.username === 'admin_dina' && credentials.password === 'DinaAdmin123!')) {
              user = {
                id: credentials.username,
                username: credentials.username,
                email: 'admin@salondina.com',
                role: 'admin',
                isActive: true
              }
            }
          }

          if (!user) {
            console.log('User not found:', credentials.username)
            throw new Error('Invalid credentials')
          }

          // Verify password (skip for fallback admin)
          if (user.password) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
            if (!isPasswordValid) {
              console.log('Invalid password for user:', credentials.username)
              throw new Error('Invalid credentials')
            }
          }

          console.log('User authenticated successfully:', user.username)
          return {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          
          // Fallback authentication for development/emergency
          if (process.env.NODE_ENV === 'development' && 
              credentials.username === 'admin' && 
              credentials.password === 'admin123') {
            console.log('Using fallback admin authentication')
            return {
              id: 'fallback-admin',
              name: 'admin',
              email: 'admin@salondina.com',
              role: 'admin'
            }
          }
          
          throw new Error('Authentication failed')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/masuk',
    error: '/admin/masuk'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

// App Router NextAuth handler
const handler = NextAuth(authOptions)

// Export handlers for GET and POST requests
export { handler as GET, handler as POST }