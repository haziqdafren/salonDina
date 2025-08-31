// Dashboard Analytics API - Real-time business insights
import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../lib/prisma'

// GET /api/dashboard - Get comprehensive dashboard data
export async function GET(request: NextRequest) {
  // Check if database is available
  if (!isDatabaseAvailable() || !prisma) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured yet',
      data: {
        todayStats: { treatments: 0, revenue: 0, customers: 0 },
        weeklyStats: { treatments: 0, revenue: 0, customers: 0 },
        monthlyStats: { treatments: 0, revenue: 0, customers: 0 },
        recentTreatments: [],
        popularServices: [],
        therapistStats: [],
        feedbackStats: { averageRating: 0, totalFeedback: 0, recentFeedback: [] }
      }
    })
  }
  try {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const startOfToday = new Date(today)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(today)
    endOfToday.setHours(23, 59, 59, 999)
    
    const startOfYesterday = new Date(yesterday)
    startOfYesterday.setHours(0, 0, 0, 0)
    const endOfYesterday = new Date(yesterday)
    endOfYesterday.setHours(23, 59, 59, 999)

    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1)
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999)

    // Get today's treatments and revenue
    const todayTreatments = await prisma!.dailyTreatment.findMany({
      where: {
        date: { gte: startOfToday, lte: endOfToday }
      },
      include: {
        service: true,
        therapist: true,
        customer: true
      }
    })

    // Get yesterday's treatments for comparison
    const yesterdayTreatments = await prisma!.dailyTreatment.findMany({
      where: {
        date: { gte: startOfYesterday, lte: endOfYesterday }
      }
    })

    // Get today's bookings
    const todayBookings = await prisma!.booking.findMany({
      where: {
        date: { gte: startOfToday, lte: endOfToday }
      }
    })

    // Get new customers this month
    const newCustomersThisMonth = await prisma!.customer.findMany({
      where: {
        createdAt: { gte: startOfMonth, lte: endOfMonth }
      }
    })

    const newCustomersToday = await prisma!.customer.findMany({
      where: {
        createdAt: { gte: startOfToday, lte: endOfToday }
      }
    })

    // Get active therapists with today's performance
    const activeTherapists = await prisma!.therapist.findMany({
      where: { isActive: true },
      include: {
        dailyTreatments: {
          where: {
            date: { gte: startOfToday, lte: endOfToday }
          }
        }
      }
    })

    // Get popular treatments
    const popularTreatments = await prisma!.dailyTreatment.groupBy({
      by: ['serviceName'],
      where: {
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 1
    })

    // Calculate revenue
    const todayRevenue = todayTreatments.reduce((sum, t) => sum + t.servicePrice, 0)
    const yesterdayRevenue = yesterdayTreatments.reduce((sum, t) => sum + t.servicePrice, 0)
    const todayTips = todayTreatments.reduce((sum, t) => sum + t.tipAmount, 0)

    // Get recent bookings for display
    const recentBookings = await prisma!.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: true
      }
    })

    // Calculate therapist performance for today
    const therapistPerformance = activeTherapists.map(therapist => {
      const todayTreatmentsForTherapist = therapist.dailyTreatments
      const todayEarnings = todayTreatmentsForTherapist.reduce((sum, treatment) => {
        return sum + therapist.baseFeePerTreatment + 
               (treatment.servicePrice * therapist.commissionRate) + 
               treatment.tipAmount
      }, 0)

      return {
        initial: therapist.initial,
        name: therapist.fullName,
        todayEarnings: Math.round(todayEarnings),
        todayTreatments: todayTreatmentsForTherapist.length
      }
    })

    // Get monthly statistics
    const monthlyTreatments = await prisma!.dailyTreatment.findMany({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth }
      }
    })

    const monthlyRevenue = monthlyTreatments.reduce((sum, t) => sum + t.servicePrice, 0)
    const monthlyTherapistFees = await prisma!.monthlyBookkeeping.aggregate({
      where: {
        date: { gte: startOfMonth, lte: endOfMonth }
      },
      _sum: {
        therapistFee: true
      }
    })

    // Format recent bookings
    const formattedRecentBookings = recentBookings.map((booking, index) => ({
      id: index + 1,
      customer: booking.customerName,
      service: booking.service,
      therapist: 'TBD', // To be assigned
      time: booking.time,
      status: booking.status as 'completed' | 'in-progress' | 'confirmed' | 'pending',
      amount: booking.servicePrice
    }))

    // Prepare dashboard data
    const dashboardData = {
      todayRevenue,
      yesterdayRevenue,
      todayBookings: {
        confirmed: todayBookings.filter(b => b.status === 'confirmed').length,
        pending: todayBookings.filter(b => b.status === 'pending').length,
        completed: todayBookings.filter(b => b.status === 'completed').length
      },
      newCustomers: newCustomersToday.length,
      monthlyNewCustomers: newCustomersThisMonth.length,
      popularTreatment: {
        name: popularTreatments[0]?.serviceName || 'No data',
        count: popularTreatments[0]?._count.id || 0
      },
      therapistTips: todayTips,
      activeTherapists: activeTherapists.length,
      therapistList: therapistPerformance,
      recentBookings: formattedRecentBookings,
      monthlyStats: {
        totalRevenue: monthlyRevenue,
        totalBookings: monthlyTreatments.length,
        averagePerBooking: monthlyTreatments.length > 0 ? Math.round(monthlyRevenue / monthlyTreatments.length) : 0,
        therapistFees: monthlyTherapistFees._sum.therapistFee || 0
      }
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

// GET /api/dashboard/stats - Get additional statistics
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { period } = data // 'today', 'week', 'month', 'year'

    const today = new Date()
    let startDate: Date
    let endDate = new Date(today)
    endDate.setHours(23, 59, 59, 999)

    switch (period) {
      case 'today':
        startDate = new Date(today)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        startDate = new Date(today)
        startDate.setDate(today.getDate() - 7)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(today)
        startDate.setHours(0, 0, 0, 0)
    }

    // Get treatments for the period
    const treatments = await prisma!.dailyTreatment.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      },
      include: {
        service: true,
        therapist: true,
        feedback: true
      }
    })

    // Get bookings for the period
    const bookings = await prisma!.booking.findMany({
      where: {
        date: { gte: startDate, lte: endDate }
      }
    })

    // Calculate statistics
    const totalRevenue = treatments.reduce((sum, t) => sum + t.servicePrice, 0)
    const totalTips = treatments.reduce((sum, t) => sum + t.tipAmount, 0)
    const totalTreatments = treatments.length
    const totalBookings = bookings.length

    // Service popularity
    const serviceStats = treatments.reduce((acc, treatment) => {
      if (!acc[treatment.serviceName]) {
        acc[treatment.serviceName] = {
          name: treatment.serviceName,
          count: 0,
          revenue: 0
        }
      }
      acc[treatment.serviceName].count++
      acc[treatment.serviceName].revenue += treatment.servicePrice
      return acc
    }, {} as any)

    const topServices = Object.values(serviceStats)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)

    // Therapist performance
    const therapistStats = treatments.reduce((acc, treatment) => {
      const therapistId = treatment.therapist.id
      if (!acc[therapistId]) {
        acc[therapistId] = {
          name: treatment.therapist.fullName,
          initial: treatment.therapist.initial,
          treatments: 0,
          revenue: 0,
          tips: 0,
          earnings: 0
        }
      }
      acc[therapistId].treatments++
      acc[therapistId].revenue += treatment.servicePrice
      acc[therapistId].tips += treatment.tipAmount
      acc[therapistId].earnings += treatment.therapist.baseFeePerTreatment + 
        (treatment.servicePrice * treatment.therapist.commissionRate) + 
        treatment.tipAmount
      return acc
    }, {} as any)

    const topTherapists = Object.values(therapistStats)
      .sort((a: any, b: any) => b.treatments - a.treatments)

    // Customer satisfaction
    const feedbacks = treatments.filter(t => t.feedback).map(t => t.feedback!)
    const averageRating = feedbacks.length > 0 
      ? feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / feedbacks.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        summary: {
          totalRevenue,
          totalTips,
          totalTreatments,
          totalBookings,
          averagePerTreatment: totalTreatments > 0 ? Math.round(totalRevenue / totalTreatments) : 0,
          averageRating: Math.round(averageRating * 10) / 10
        },
        topServices,
        therapistPerformance: topTherapists,
        bookingStatus: {
          confirmed: bookings.filter(b => b.status === 'confirmed').length,
          pending: bookings.filter(b => b.status === 'pending').length,
          completed: bookings.filter(b => b.status === 'completed').length,
          cancelled: bookings.filter(b => b.status === 'cancelled').length
        }
      }
    })

  } catch (error) {
    console.error('Error fetching period stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}