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
    // Check if database is empty and auto-populate
    const serviceCount = await prisma.service.count()
    
    if (serviceCount === 0) {
      // Auto-populate with basic services
      await prisma.service.createMany({
        data: [
          { name: 'Facial Acne', category: 'facial', price: 35000, duration: 60, description: 'Perawatan wajah untuk kulit berjerawat', therapistFee: 15000 },
          { name: 'Facial Brightening', category: 'facial', price: 40000, duration: 60, description: 'Facial pencerah wajah alami', therapistFee: 15000 },
          { name: 'Facial Anti Aging', category: 'facial', price: 50000, duration: 75, description: 'Perawatan anti penuaan dini', therapistFee: 20000 },
          { name: 'Hair Spa Creambath', category: 'hair_spa', price: 25000, duration: 45, description: 'Creambath dengan vitamin rambut', therapistFee: 10000 },
          { name: 'Hair Spa Protein', category: 'hair_spa', price: 35000, duration: 60, description: 'Perawatan protein untuk rambut rusak', therapistFee: 15000 },
          { name: 'Hair Spa Smoothing', category: 'hair_spa', price: 150000, duration: 120, description: 'Perawatan pelurus rambut alami', therapistFee: 50000 },
          { name: 'Full Body Massage', category: 'body_treatment', price: 60000, duration: 90, description: 'Pijat seluruh tubuh relaksasi', therapistFee: 25000 },
          { name: 'Aromatherapy Massage', category: 'body_treatment', price: 70000, duration: 90, description: 'Pijat aromaterapi dengan essential oil', therapistFee: 30000 },
          { name: 'Body Scrub', category: 'body_treatment', price: 50000, duration: 60, description: 'Lulur seluruh tubuh', therapistFee: 20000 },
        ]
      })
    }

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