// Updated Dashboard Analytics API - Works with new database schema
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
        todayStats: { treatments: 0, revenue: 0, customers: 0, therapistFees: 0, freeTreatments: 0 },
        monthlyStats: { treatments: 0, revenue: 0, customers: 0, therapistFees: 0, freeTreatments: 0 },
        recentTreatments: [],
        customerLoyalty: { readyForFree: 0, totalLoyaltyCustomers: 0 },
        therapistStats: [],
        bookingStats: { pending: 0, confirmed: 0, completed: 0 }
      }
    })
  }

  try {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    
    const todayString = today.toISOString().split('T')[0]
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toISOString().split('T')[0]

    // Get today's treatments
    const todayTreatments = await prisma!.dailyTreatment.findMany({
      where: { date: todayString },
      include: {
        service: true,
        therapist: true,
        customer: true
      }
    })

    // Get yesterday's treatments for comparison
    const yesterdayTreatments = await prisma!.dailyTreatment.findMany({
      where: { date: yesterdayString }
    })

    // Get monthly bookkeeping data
    const monthlyBookkeeping = await prisma!.monthlyBookkeeping.findUnique({
      where: {
        month_year: {
          month: currentMonth,
          year: currentYear
        }
      }
    }) || {
      totalRevenue: 0,
      totalTherapistFees: 0,
      totalTreatments: 0,
      freeTreatments: 0
    }

    // Get customer loyalty stats
    const loyaltyCustomers = await prisma!.customer.findMany({
      where: { loyaltyVisits: { gt: 0 } },
      select: { loyaltyVisits: true }
    })

    const readyForFree = await prisma!.customer.count({
      where: { loyaltyVisits: 3 }
    })

    // Get active therapists
    const activeTherapists = await prisma!.therapist.findMany({
      where: { isActive: true },
      include: {
        dailyTreatments: {
          where: { date: todayString },
          include: { service: true }
        }
      }
    })

    // Get recent bookings
    const recentBookings = await prisma!.booking.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        service: true,
        therapist: true
      }
    })

    // Calculate today's revenue and stats
    const todayRevenue = todayTreatments.reduce((sum, t) => sum + (t.isFreeVisit ? 0 : t.price), 0)
    const yesterdayRevenue = yesterdayTreatments.reduce((sum, t) => sum + (t.isFreeVisit ? 0 : t.price), 0)
    const todayFreeTreatments = todayTreatments.filter(t => t.isFreeVisit).length
    const yesterdayFreeTreatments = yesterdayTreatments.filter(t => t.isFreeVisit).length

    // Calculate today's therapist fees
    const todayTherapistFees = todayTreatments.reduce((sum, treatment) => {
      if (treatment.isFreeVisit) return sum
      return sum + (treatment.service?.therapistFee || 0)
    }, 0)

    // Calculate therapist performance
    const therapistPerformance = activeTherapists.map(therapist => {
      const todayTreatmentsCount = therapist.dailyTreatments.length
      const todayEarnings = therapist.dailyTreatments.reduce((sum, treatment) => {
        if (treatment.isFreeVisit) return sum
        return sum + (treatment.service?.therapistFee || 0)
      }, 0)

      return {
        initial: therapist.initial,
        name: therapist.fullName,
        todayEarnings,
        todayTreatments: todayTreatmentsCount
      }
    })

    // Get booking stats
    const bookingStats = {
      pending: recentBookings.filter(b => b.status === 'pending').length,
      confirmed: recentBookings.filter(b => b.status === 'confirmed').length,
      completed: recentBookings.filter(b => b.status === 'completed').length
    }

    // Format recent treatments
    const recentTreatments = todayTreatments.slice(0, 10).map(treatment => ({
      id: treatment.id,
      customerName: treatment.customer?.name || 'Unknown',
      serviceName: treatment.service?.name || 'Unknown Service',
      therapistName: treatment.therapist?.fullName || 'Unassigned',
      price: treatment.isFreeVisit ? 0 : treatment.price,
      therapistFee: treatment.isFreeVisit ? 0 : (treatment.service?.therapistFee || 0),
      isFreeVisit: treatment.isFreeVisit,
      date: treatment.date,
      notes: treatment.notes
    }))

    // Prepare dashboard data
    const dashboardData = {
      todayStats: {
        revenue: todayRevenue,
        treatments: todayTreatments.length,
        freeTreatments: todayFreeTreatments,
        therapistFees: todayTherapistFees,
        customers: new Set(todayTreatments.map(t => t.customerId)).size,
        revenueChange: yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0,
        treatmentsChange: yesterdayTreatments.length > 0 ? ((todayTreatments.length - yesterdayTreatments.length) / yesterdayTreatments.length * 100) : 0
      },
      monthlyStats: {
        revenue: monthlyBookkeeping.totalRevenue,
        treatments: monthlyBookkeeping.totalTreatments,
        therapistFees: monthlyBookkeeping.totalTherapistFees,
        freeTreatments: monthlyBookkeeping.freeTreatments,
        averagePerTreatment: monthlyBookkeeping.totalTreatments > 0 ? Math.round(monthlyBookkeeping.totalRevenue / monthlyBookkeeping.totalTreatments) : 0
      },
      customerLoyalty: {
        readyForFree,
        totalLoyaltyCustomers: loyaltyCustomers.length,
        loyaltyDistribution: {
          oneVisit: loyaltyCustomers.filter(c => c.loyaltyVisits === 1).length,
          twoVisits: loyaltyCustomers.filter(c => c.loyaltyVisits === 2).length,
          threeVisits: readyForFree
        }
      },
      therapistStats: therapistPerformance,
      bookingStats,
      recentTreatments,
      recentBookings: recentBookings.slice(0, 5).map(booking => ({
        id: booking.id,
        customerName: booking.customerName,
        serviceName: booking.service?.name || 'Unknown Service',
        therapistName: booking.therapist?.fullName || 'Unassigned',
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        status: booking.status,
        totalPrice: booking.totalPrice
      }))
    }

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/period-stats - Get statistics for specific period
export async function POST(request: NextRequest) {
  if (!isDatabaseAvailable() || !prisma) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  try {
    const data = await request.json()
    const { period, month, year } = data

    let treatments = []
    let dateFilter = ''

    if (period === 'month' && month && year) {
      // Get specific month data
      const monthlyBookkeeping = await prisma!.monthlyBookkeeping.findUnique({
        where: {
          month_year: { month: parseInt(month), year: parseInt(year) }
        }
      })

      // Get treatments for that month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]
      
      treatments = await prisma!.dailyTreatment.findMany({
        where: {
          date: { gte: startDate, lte: endDate }
        },
        include: {
          service: true,
          therapist: true,
          customer: true
        }
      })

      // Service popularity for the month
      const serviceStats = treatments.reduce((acc, treatment) => {
        const serviceName = treatment.service?.name || 'Unknown'
        if (!acc[serviceName]) {
          acc[serviceName] = { name: serviceName, count: 0, revenue: 0 }
        }
        acc[serviceName].count++
        acc[serviceName].revenue += treatment.isFreeVisit ? 0 : treatment.price
        return acc
      }, {} as any)

      const topServices = Object.values(serviceStats)
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 10)

      // Therapist performance for the month
      const therapistStats = treatments.reduce((acc, treatment) => {
        const therapistName = treatment.therapist?.fullName || 'Unknown'
        if (!acc[therapistName]) {
          acc[therapistName] = {
            name: therapistName,
            treatments: 0,
            revenue: 0,
            fees: 0,
            freeTreatments: 0
          }
        }
        acc[therapistName].treatments++
        if (treatment.isFreeVisit) {
          acc[therapistName].freeTreatments++
        } else {
          acc[therapistName].revenue += treatment.price
          acc[therapistName].fees += treatment.service?.therapistFee || 0
        }
        return acc
      }, {} as any)

      const therapistPerformance = Object.values(therapistStats)
        .sort((a: any, b: any) => b.treatments - a.treatments)

      return NextResponse.json({
        success: true,
        data: {
          period: `${month}/${year}`,
          summary: monthlyBookkeeping || {
            totalRevenue: 0,
            totalTreatments: 0,
            totalTherapistFees: 0,
            freeTreatments: 0
          },
          topServices,
          therapistPerformance,
          treatmentDetails: treatments.slice(0, 20).map(t => ({
            date: t.date,
            customerName: t.customer?.name || 'Unknown',
            serviceName: t.service?.name || 'Unknown',
            therapistName: t.therapist?.fullName || 'Unknown',
            price: t.isFreeVisit ? 0 : t.price,
            therapistFee: t.isFreeVisit ? 0 : (t.service?.therapistFee || 0),
            isFreeVisit: t.isFreeVisit
          }))
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid period specified'
    })

  } catch (error) {
    console.error('Error fetching period stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch period statistics' },
      { status: 500 }
    )
  }
}