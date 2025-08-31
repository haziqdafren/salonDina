import { MonthlyBookkeeping, DailyTreatment } from '@prisma/client'
import { prisma, isDatabaseAvailable } from './prisma'
import { calculateDailyTherapistFees } from './therapist'

// Daily bookkeeping entry interface
export interface DailyBookkeepingEntry {
  date: Date
  dailyRevenue: number
  operationalCost: number
  salaryExpense: number
  therapistFee: number
  otherExpenses: number
  totalExpense: number
  netIncome: number
  runningTotal: number
  notes?: string
}

// Calculate daily revenue from treatments
export const calculateDailyRevenue = async (date: Date): Promise<number> => {
  if (!isDatabaseAvailable() || !prisma) {
    return 0
  }
  
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const treatments = await prisma!.dailyTreatment.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  })

  return treatments.reduce((total, treatment) => total + treatment.servicePrice, 0)
}

// Create or update daily bookkeeping entry
export const createOrUpdateDailyEntry = async (
  entry: Omit<DailyBookkeepingEntry, 'totalExpense' | 'netIncome' | 'runningTotal'>
): Promise<MonthlyBookkeeping> => {
  if (!isDatabaseAvailable() || !prisma) {
    throw new Error('Database not available')
  }
  
  const { date, dailyRevenue, operationalCost, salaryExpense, therapistFee, otherExpenses, notes } = entry

  // Calculate totals
  const totalExpense = operationalCost + salaryExpense + therapistFee + otherExpenses
  const netIncome = dailyRevenue - totalExpense

  // Get previous day's running total
  const previousDay = new Date(date)
  previousDay.setDate(previousDay.getDate() - 1)
  
  const previousEntry = await prisma!.monthlyBookkeeping.findFirst({
    where: {
      date: {
        lt: date
      }
    },
    orderBy: { date: 'desc' }
  })

  const runningTotal = (previousEntry?.runningTotal || 0) + netIncome

  // Upsert the entry
  const bookkeepingEntry = await prisma!.monthlyBookkeeping.upsert({
    where: { date },
    update: {
      dailyRevenue,
      operationalCost,
      salaryExpense,
      therapistFee,
      otherExpenses,
      totalExpense,
      netIncome,
      runningTotal,
      notes
    },
    create: {
      date,
      dailyRevenue,
      operationalCost,
      salaryExpense,
      therapistFee,
      otherExpenses,
      totalExpense,
      netIncome,
      runningTotal,
      notes
    }
  })

  // Update running totals for subsequent entries
  await updateSubsequentRunningTotals(date)

  return bookkeepingEntry
}

// Update running totals for all entries after the given date
const updateSubsequentRunningTotals = async (fromDate: Date) => {
  const subsequentEntries = await prisma!.monthlyBookkeeping.findMany({
    where: {
      date: {
        gt: fromDate
      }
    },
    orderBy: { date: 'asc' }
  })

  let cumulativeTotal = 0
  
  // Get the running total up to fromDate
  const baseEntry = await prisma!.monthlyBookkeeping.findUnique({
    where: { date: fromDate }
  })
  
  if (baseEntry) {
    cumulativeTotal = baseEntry.runningTotal
  }

  // Update each subsequent entry
  for (const entry of subsequentEntries) {
    cumulativeTotal += entry.netIncome
    
    await prisma!.monthlyBookkeeping.update({
      where: { id: entry.id },
      data: { runningTotal: cumulativeTotal }
    })
  }
}

// Get monthly bookkeeping summary
export const getMonthlyBookkeeping = async (month: number, year: number) => {
  if (!isDatabaseAvailable() || !prisma) { throw new Error("Database not available") }
  const startOfMonth = new Date(year, month - 1, 1)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999)

  const entries = await prisma!.monthlyBookkeeping.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    orderBy: { date: 'asc' }
  })

  // Calculate monthly totals
  const monthlyTotals = entries.reduce((totals, entry) => {
    totals.totalRevenue += entry.dailyRevenue
    totals.totalOperationalCost += entry.operationalCost
    totals.totalSalaryExpense += entry.salaryExpense
    totals.totalTherapistFee += entry.therapistFee
    totals.totalOtherExpenses += entry.otherExpenses
    totals.totalExpense += entry.totalExpense
    totals.totalNetIncome += entry.netIncome
    
    return totals
  }, {
    totalRevenue: 0,
    totalOperationalCost: 0,
    totalSalaryExpense: 0,
    totalTherapistFee: 0,
    totalOtherExpenses: 0,
    totalExpense: 0,
    totalNetIncome: 0
  })

  return {
    entries,
    monthlyTotals,
    averageDailyRevenue: entries.length > 0 ? monthlyTotals.totalRevenue / entries.length : 0,
    profitMargin: monthlyTotals.totalRevenue > 0 
      ? (monthlyTotals.totalNetIncome / monthlyTotals.totalRevenue) * 100 
      : 0
  }
}

// Auto-calculate daily entry with treatment data
export const autoCalculateDailyEntry = async (
  date: Date,
  operationalCost: number = 0,
  salaryExpense: number = 0,
  otherExpenses: number = 0,
  notes?: string
): Promise<MonthlyBookkeeping> => {
  // Calculate revenue from treatments
  const dailyRevenue = await calculateDailyRevenue(date)
  
  // Calculate therapist fees
  const therapistFee = await calculateDailyTherapistFees(date)

  return await createOrUpdateDailyEntry({
    date,
    dailyRevenue,
    operationalCost,
    salaryExpense,
    therapistFee,
    otherExpenses,
    notes
  })
}

// Get bookkeeping analytics
export const getBookkeepingAnalytics = async (startDate: Date, endDate: Date) => {
  const entries = await prisma!.monthlyBookkeeping.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'asc' }
  })

  const analytics = entries.reduce((acc, entry) => {
    acc.totalRevenue += entry.dailyRevenue
    acc.totalExpenses += entry.totalExpense
    acc.totalNetIncome += entry.netIncome
    acc.operationalCosts += entry.operationalCost
    acc.therapistFees += entry.therapistFee
    acc.salaryExpenses += entry.salaryExpense
    
    // Track best and worst days
    if (entry.dailyRevenue > acc.bestDay.revenue) {
      acc.bestDay = { date: entry.date, revenue: entry.dailyRevenue }
    }
    
    if (entry.dailyRevenue < acc.worstDay.revenue || acc.worstDay.revenue === 0) {
      acc.worstDay = { date: entry.date, revenue: entry.dailyRevenue }
    }
    
    return acc
  }, {
    totalRevenue: 0,
    totalExpenses: 0,
    totalNetIncome: 0,
    operationalCosts: 0,
    therapistFees: 0,
    salaryExpenses: 0,
    bestDay: { date: new Date(), revenue: 0 },
    worstDay: { date: new Date(), revenue: Number.MAX_SAFE_INTEGER },
    averageRevenue: 0,
    profitMargin: 0,
    trendData: entries
  })

  analytics.averageRevenue = entries.length > 0 ? analytics.totalRevenue / entries.length : 0
  analytics.profitMargin = analytics.totalRevenue > 0 ? (analytics.totalNetIncome / analytics.totalRevenue) * 100 : 0

  return analytics
}

// Get current month running total
export const getCurrentMonthRunningTotal = async (): Promise<number> => {
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  const latestEntry = await prisma!.monthlyBookkeeping.findFirst({
    where: {
      date: {
        gte: new Date(currentYear, currentMonth - 1, 1),
        lte: new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)
      }
    },
    orderBy: { date: 'desc' }
  })

  return latestEntry?.runningTotal || 0
}

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Export types
export type BookkeepingAnalytics = {
  totalRevenue: number
  totalExpenses: number
  totalNetIncome: number
  operationalCosts: number
  therapistFees: number
  salaryExpenses: number
  bestDay: { date: Date; revenue: number }
  worstDay: { date: Date; revenue: number }
  averageRevenue: number
  profitMargin: number
  trendData: MonthlyBookkeeping[]
}