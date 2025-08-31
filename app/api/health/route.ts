import { NextResponse } from 'next/server'
import { isDatabaseAvailable, testDatabaseConnection, prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const databaseConfigured = isDatabaseAvailable()
    let databaseConnected = false
    let dbVersion = null
    let tableCount = 0
    
    // Test actual connection if database is configured
    if (databaseConfigured && prisma) {
      try {
        databaseConnected = await testDatabaseConnection()
        
        if (databaseConnected) {
          // Get database version
          const versionResult = await prisma.$queryRaw<Array<{version: string}>>`SELECT version()`
          dbVersion = versionResult[0]?.version || 'Unknown'
          
          // Count tables to verify schema exists
          const tables = await prisma.$queryRaw<Array<{count: bigint}>>`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          `
          tableCount = Number(tables[0]?.count || 0)
        }
      } catch (error) {
        console.error('Database connection test error:', error)
      }
    }
    
    const health = {
      status: databaseConfigured && databaseConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      database: {
        configured: databaseConfigured,
        connected: databaseConnected,
        version: dbVersion,
        tables: tableCount,
        url: process.env.DATABASE_URL ? 'Set' : 'Not set'
      },
      build: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    }
    
    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503
    })
    
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        configured: false,
        connected: false
      }
    }, { status: 500 })
  }
}