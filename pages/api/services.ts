import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma, isDatabaseAvailable } from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isDatabaseAvailable() || !prisma) {
    return res.status(503).json({ 
      success: false, 
      error: 'Database not configured',
      data: [],
      categories: [],
      total: 0
    })
  }

  try {
    const { active, category, search } = req.query
    
    const where: any = {}
    
    if (active === 'true') {
      where.isActive = true
    }
    
    if (category && category !== 'semua') {
      where.category = category as string
    }
    
    if (search) {
      where.name = {
        contains: search as string,
        mode: 'insensitive'
      }
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        description: true,
        category: true,
        therapistFee: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    const categories = await prisma.service.groupBy({
      by: ['category'],
      where: active === 'true' ? { isActive: true } : {},
      _count: {
        category: true
      },
      orderBy: {
        category: 'asc'
      }
    })

    const categoriesWithCount = categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }))

    res.status(200).json({
      success: true,
      data: services,
      categories: categoriesWithCount,
      total: services.length
    })
  } catch (error) {
    console.error('Services API error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch services',
      data: [],
      categories: [],
      total: 0
    })
  }
}