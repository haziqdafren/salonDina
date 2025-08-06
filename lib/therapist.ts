import { Therapist, DailyTreatment, Customer } from '@prisma/client'
import { prisma } from './prisma'

// Flexible salary calculation system that can be easily customized
export interface TherapistEarnings {
  baseFee: number
  commission: number
  tips: number
  total: number
  treatmentCount: number
}

// Main calculation function - can be modified when client provides specific logic
export const calculateTherapistEarnings = (
  treatments: DailyTreatment[],
  therapist: Therapist
): TherapistEarnings => {
  let totalBaseFee = 0
  let totalCommission = 0
  let totalTips = 0
  
  treatments.forEach(treatment => {
    // Base fee calculation (can be customized per therapist)
    totalBaseFee += therapist.baseFeePerTreatment
    
    // Commission calculation (percentage of service price)
    const commission = treatment.servicePrice * therapist.commissionRate
    totalCommission += commission
    
    // Tips from customers
    totalTips += treatment.tipAmount
  })
  
  return {
    baseFee: totalBaseFee,
    commission: totalCommission,
    tips: totalTips,
    total: totalBaseFee + totalCommission + totalTips,
    treatmentCount: treatments.length
  }
}

// Get daily earnings for a therapist
export const getDailyTherapistEarnings = async (
  therapistId: string,
  date: Date
): Promise<TherapistEarnings> => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId }
  })

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  const treatments = await prisma.dailyTreatment.findMany({
    where: {
      therapistId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  })

  return calculateTherapistEarnings(treatments, therapist)
}

// Get monthly earnings for a therapist
export const getMonthlyTherapistEarnings = async (
  therapistId: string,
  month: number,
  year: number
) => {
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId }
  })

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  const treatments = await prisma.dailyTreatment.findMany({
    where: {
      therapistId,
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    }
  })

  const earnings = calculateTherapistEarnings(treatments, therapist)

  // Update or create monthly stats
  await prisma.therapistMonthlyStats.upsert({
    where: {
      therapistId_month_year: {
        therapistId,
        month,
        year
      }
    },
    update: {
      treatmentCount: earnings.treatmentCount,
      totalRevenue: treatments.reduce((sum, t) => sum + t.servicePrice, 0),
      totalFees: earnings.baseFee + earnings.commission,
      totalTips: earnings.tips
    },
    create: {
      therapistId,
      month,
      year,
      treatmentCount: earnings.treatmentCount,
      totalRevenue: treatments.reduce((sum, t) => sum + t.servicePrice, 0),
      totalFees: earnings.baseFee + earnings.commission,
      totalTips: earnings.tips
    }
  })

  return earnings
}

// Get therapist performance data
export const getTherapistPerformance = async (therapistId: string) => {
  const therapist = await prisma.therapist.findUnique({
    where: { id: therapistId },
    include: {
      monthlyStats: {
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ],
        take: 12 // Last 12 months
      },
      dailyTreatments: {
        include: {
          feedback: true
        },
        orderBy: { date: 'desc' },
        take: 50 // Last 50 treatments
      }
    }
  })

  if (!therapist) {
    throw new Error('Therapist not found')
  }

  // Calculate average rating
  const ratingsSum = therapist.dailyTreatments.reduce((sum, treatment) => {
    return sum + (treatment.feedback?.therapistService || 0)
  }, 0)
  
  const ratingsCount = therapist.dailyTreatments.filter(
    treatment => treatment.feedback?.therapistService
  ).length

  const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0

  // Update therapist average rating
  await prisma.therapist.update({
    where: { id: therapistId },
    data: { averageRating }
  })

  return {
    ...therapist,
    averageRating,
    recentTreatments: therapist.dailyTreatments
  }
}

// Update therapist fee structure (for admin customization)
export const updateTherapistFees = async (
  therapistId: string,
  baseFeePerTreatment?: number,
  commissionRate?: number
) => {
  const updateData: any = {}
  
  if (baseFeePerTreatment !== undefined) {
    updateData.baseFeePerTreatment = baseFeePerTreatment
  }
  
  if (commissionRate !== undefined) {
    updateData.commissionRate = commissionRate
  }

  return await prisma.therapist.update({
    where: { id: therapistId },
    data: updateData
  })
}

// Get all therapists with their performance
export const getAllTherapistsWithPerformance = async () => {
  const therapists = await prisma.therapist.findMany({
    where: { isActive: true },
    include: {
      monthlyStats: {
        where: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }
      },
      dailyTreatments: {
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }
    }
  })

  return therapists.map(therapist => ({
    ...therapist,
    todayTreatmentCount: therapist.dailyTreatments.length,
    monthlyStats: therapist.monthlyStats[0] || null
  }))
}

// Format currency for Indonesian Rupiah
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Calculate daily total fees for all therapists (for bookkeeping)
export const calculateDailyTherapistFees = async (date: Date): Promise<number> => {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const treatments = await prisma.dailyTreatment.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      therapist: true
    }
  })

  let totalFees = 0

  treatments.forEach(treatment => {
    const baseFee = treatment.therapist.baseFeePerTreatment
    const commission = treatment.servicePrice * treatment.therapist.commissionRate
    totalFees += baseFee + commission
  })

  return totalFees
}

// Therapist types for TypeScript
export type TherapistWithPerformance = Therapist & {
  monthlyStats: any[]
  dailyTreatments: (DailyTreatment & { feedback?: any })[]
  averageRating: number
  recentTreatments: any[]
}

export type TherapistWithStats = Therapist & {
  todayTreatmentCount: number
  monthlyStats: any
}