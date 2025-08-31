import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma, isDatabaseAvailable } from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!isDatabaseAvailable() || !prisma) {
    return res.status(503).json({ 
      success: false, 
      error: 'Database not configured' 
    })
  }

  try {
    // Test database connection
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    
    // Count existing services
    const serviceCount = await prisma.service.count()
    
    if (serviceCount === 0) {
      // Create basic services
      await prisma.service.createMany({
        data: [
          { name: 'Facial Basic', category: 'facial', price: 30000, duration: 45, description: 'Perawatan wajah dasar', therapistFee: 12500 },
          { name: 'Hair Spa Creambath', category: 'hair_spa', price: 25000, duration: 45, description: 'Creambath dengan vitamin rambut', therapistFee: 10000 },
          { name: 'Full Body Massage', category: 'body_treatment', price: 60000, duration: 90, description: 'Pijat seluruh tubuh relaksasi', therapistFee: 25000 },
        ]
      })
    }

    const finalCount = await prisma.service.count()
    
    res.status(200).json({
      success: true,
      message: 'Database initialized successfully',
      serviceCount: finalCount,
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    console.error('Database init error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}