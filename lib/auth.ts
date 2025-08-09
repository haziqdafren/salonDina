import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Username dan password wajib diisi')
        }

        try {
          const admin = await prisma.admin.findUnique({
            where: {
              username: credentials.username
            }
          })

          if (!admin) {
            throw new Error('Admin tidak ditemukan')
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, admin.password)

          if (!isPasswordValid) {
            throw new Error('Password salah')
          }

          return {
            id: admin.id,
            name: admin.name,
            username: admin.username
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Gagal login. Silakan coba lagi.')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes for security
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub
        session.user.username = token.username as string
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/masuk',
    error: '/admin/masuk',
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions