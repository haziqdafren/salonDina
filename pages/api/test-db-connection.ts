import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma, isDatabaseAvailable, testDatabaseConnection } from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const dbUrl = process.env.DATABASE_URL
    const isAvailable = isDatabaseAvailable()
    const prismaExists = !!prisma
    
    let connectionTest = false
    let testError = null
    
    if (prisma) {
      try {
        connectionTest = await testDatabaseConnection()
      } catch (error) {
        testError = error instanceof Error ? error.message : 'Connection test failed'
      }
    }

    res.status(200).json({
      success: true,
      database: {
        hasDbUrl: !!dbUrl,
        dbUrlPrefix: dbUrl ? dbUrl.substring(0, 50) + '...' : 'undefined',
        isDatabaseAvailable: isAvailable,
        prismaExists,
        connectionTest,
        testError,
        nodeEnv: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}