import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase'
import { verifyPassword } from '../../../../lib/auth-utils'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🚀🚀🚀 AUTHORIZE FUNCTION CALLED! 🚀🚀🚀')
        console.log('📝 Received credentials:', {
          username: credentials?.username,
          hasPassword: !!credentials?.password,
          timestamp: new Date().toISOString()
        })

        if (!credentials?.username || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        // Try database authentication first
        if (isSupabaseConfigured() && supabase) {
          console.log('✅ Supabase configured - attempting database authentication')
          
          try {
            const { data: admin, error } = await supabase
              .from('Admin')
              .select('id, username, password, name')
              .eq('username', credentials.username)
              .single()

            if (!error && admin) {
              console.log('👤 Found admin in database:', admin.username)
              
              const isPasswordValid = await verifyPassword(credentials.password, admin.password)
              
              if (isPasswordValid) {
                console.log('✅ Database authentication SUCCESS')
                return {
                  id: admin.id.toString(),
                  name: admin.name,
                  email: 'admin@salondina.com',
                  role: 'admin'
                }
              } else {
                console.log('❌ Invalid password for database user')
              }
            } else {
              console.log('❌ User not found in database')
            }
          } catch (dbError) {
            console.log('❌ Database authentication failed:', dbError)
          }
        }
        
        // Fallback to hardcoded credentials
        console.log('⚠️ Trying fallback authentication...')
        const fallbackCredentials = [
          { username: 'admin', password: 'admin123', name: 'Administrator' },
          { username: 'admin_dina', password: 'DinaAdmin123!', name: 'Dina Admin' }
        ]

        const fallbackUser = fallbackCredentials.find(
          cred => cred.username === credentials.username && cred.password === credentials.password
        )

        if (fallbackUser) {
          console.log('✅ Fallback authentication SUCCESS for:', fallbackUser.username)
          return {
            id: fallbackUser.username,
            name: fallbackUser.name,
            email: 'admin@salondina.com',
            role: 'admin'
          }
        }
        
        console.log('❌ All authentication methods failed')
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 3 * 60 * 60, // 3 hours
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 3 * 60 * 60, // 3 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('🔑 JWT CALLBACK - User:', !!user, 'Token sub:', token.sub)
      if (user) {
        token.role = user.role
        console.log('🔑 JWT created for user:', user.name, 'Role:', user.role)
      } else {
        console.log('🔑 JWT callback without user, existing token sub:', token.sub)
      }
      return token
    },
    async session({ session, token }) {
      console.log('📋 SESSION CALLBACK - Token sub:', token.sub, 'Session user:', !!session.user)
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        console.log('📋 Session created for:', session.user.name, 'Role:', session.user.role)
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/masuk',
    error: '/admin/masuk'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }