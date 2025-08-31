import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma, isDatabaseAvailable } from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
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
        if (!isDatabaseAvailable() || !prisma) {
          console.error('Database not available for authentication')
          throw new Error('Database not configured')
        }

        try {
          // Try to connect to database first
          await prisma.$connect()
          
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { username: credentials.username },
                { email: credentials.username }
              ],
              isActive: true
            }
          })

          if (!user) {
            console.log('User not found:', credentials.username)
            throw new Error('Invalid credentials')
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            console.log('Invalid password for user:', credentials.username)
            throw new Error('Invalid credentials')
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