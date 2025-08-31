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
      error: 'Database not configured' 
    })
  }

  try {
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

    // Today's treatments with service details
    const todayTreatments = await prisma.treatment.findMany({
      where: {
        date: {
          gte: startOfToday,
          lt: endOfToday
        }
      },
      include: {
        customer: true,
        service: true,
        therapist: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // This month's treatments
    const monthlyTreatments = await prisma.treatment.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        service: true
      }
    })

    // Customer counts
    const totalCustomers = await prisma.customer.count()
    const readyForFree = await prisma.customer.count({
      where: { loyaltyVisits: 3 }
    })

    // Revenue calculations
    const todayRevenue = todayTreatments.reduce((sum, treatment) => {
      return treatment.isFreeVisit ? sum : sum + treatment.price
    }, 0)

    const monthlyRevenue = monthlyTreatments.reduce((sum, treatment) => {
      return treatment.isFreeVisit ? sum : sum + treatment.price
    }, 0)

    // Therapist fee calculations
    const todayTherapistFees = todayTreatments.reduce((sum, treatment) => {
      if (treatment.isFreeVisit) return sum
      return sum + (treatment.service?.therapistFee || 0)
    }, 0)

    const monthlyTherapistFees = monthlyTreatments.reduce((sum, treatment) => {
      if (treatment.isFreeVisit) return sum
      return sum + (treatment.service?.therapistFee || 0)
    }, 0)

    // Treatment counts
    const todayTreatmentCount = todayTreatments.length
    const monthlyTreatmentCount = monthlyTreatments.length
    const todayFreeTreatments = todayTreatments.filter(t => t.isFreeVisit).length
    const monthlyFreeTreatments = monthlyTreatments.filter(t => t.isFreeVisit).length

    // Service stats
    const serviceStats = await prisma.service.count({ where: { isActive: true } })
    const therapistCount = await prisma.therapist.count({ where: { isActive: true } })

    res.status(200).json({
      success: true,
      data: {
        today: {
          treatments: todayTreatmentCount,
          revenue: todayRevenue,
          therapistFees: todayTherapistFees,
          freeTreatments: todayFreeTreatments,
          treatments_detail: todayTreatments
        },
        monthly: {
          treatments: monthlyTreatmentCount,
          revenue: monthlyRevenue,
          therapistFees: monthlyTherapistFees,
          freeTreatments: monthlyFreeTreatments
        },
        customers: {
          total: totalCustomers,
          readyForFree: readyForFree
        },
        system: {
          activeServices: serviceStats,
          activeTherapists: therapistCount
        }
      }
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch dashboard data' 
    })
  }
}