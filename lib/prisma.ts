import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if database is configured and not using dummy/placeholder URLs
const isDatabaseConfigured = () => {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) return false
  
  // Exclude dummy/placeholder URLs
  const dummyPatterns = [
    'postgresql://dummy:dummy@dummy:5432/dummy',
    'file:./dev.db',
    'placeholder',
    'your-database-url',
    'username:password@host'
  ]
  
  return !dummyPatterns.some(pattern => dbUrl.includes(pattern))
}

const dbConfigured = isDatabaseConfigured()

export const prisma = dbConfigured ? (
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
) : null

// Only set global in development to prevent memory leaks
if (dbConfigured && process.env.NODE_ENV === 'development' && globalForPrisma) {
  globalForPrisma.prisma = prisma as PrismaClient
}

// Graceful shutdown for production
if (dbConfigured && process.env.NODE_ENV === 'production' && prisma) {
  const gracefulShutdown = async () => {
    try {
      await (prisma as PrismaClient).$disconnect()
      console.log('Database disconnected gracefully')
    } catch (error) {
      console.error('Error during database disconnection:', error)
    }
  }

  process.on('beforeExit', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
}

// Helper functions
export const isDatabaseAvailable = () => dbConfigured && prisma !== null

export const testDatabaseConnection = async () => {
  if (!prisma) return false
  
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection test failed:', error)
    return false
  }
}