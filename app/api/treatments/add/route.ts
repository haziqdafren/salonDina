import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseAvailable } from '../../../../lib/prisma'

// POST /api/treatments/add - Add new daily treatment with updated logic
export async function POST(request: NextRequest) {
  if (!isDatabaseAvailable() || !prisma) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  try {
    const data = await request.json()
    const {
      date,
      customerId,
      customerName, 
      customerPhone,
      serviceId,
      therapistId,
      price,
      notes,
      isFreeVisit = false
    } = data

    // Validate required fields
    if (!date || !serviceId || !therapistId || (!customerId && !customerName)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: date, serviceId, therapistId, and customer info'
      }, { status: 400 })
    }

    let finalCustomerId = customerId

    // Handle customer creation/lookup
    if (!finalCustomerId) {
      if (!customerPhone) {
        return NextResponse.json({
          success: false,
          error: 'Customer phone is required for new customers'
        }, { status: 400 })
      }

      // Check if customer exists by phone
      let customer = await prisma!.customer.findUnique({
        where: { phone: customerPhone }
      })

      // Create new customer if doesn't exist
      if (!customer) {
        customer = await prisma!.customer.create({
          data: {
            name: customerName,
            phone: customerPhone,
            totalVisits: 0,
            totalSpending: 0,
            loyaltyVisits: 0
          }
        })
      }

      finalCustomerId = customer.id
    }

    // Get customer to check loyalty status
    const customer = await prisma!.customer.findUnique({
      where: { id: finalCustomerId }
    })

    if (!customer) {
      return NextResponse.json({
        success: false,
        error: 'Customer not found'
      }, { status: 404 })
    }

    // Check if customer is eligible for free treatment
    let actualIsFreeVisit = isFreeVisit
    if (customer.loyaltyVisits >= 3 && !isFreeVisit) {
      // Customer is eligible for free treatment
      actualIsFreeVisit = true
    }

    // Get service details
    const service = await prisma!.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json({
        success: false,
        error: 'Service not found'
      }, { status: 404 })
    }

    // Create daily treatment
    const treatment = await prisma!.dailyTreatment.create({
      data: {
        date,
        customerId: finalCustomerId,
        serviceId,
        therapistId,
        price: actualIsFreeVisit ? 0 : price || service.normalPrice,
        isFreeVisit: actualIsFreeVisit,
        notes
      },
      include: {
        service: true,
        therapist: true,
        customer: true
      }
    })

    // The database triggers will automatically:
    // 1. Update customer loyalty and visit counts
    // 2. Update monthly bookkeeping

    return NextResponse.json({
      success: true,
      message: actualIsFreeVisit ? 
        'Free treatment added successfully! Customer loyalty reset.' :
        'Treatment added successfully!',
      data: {
        treatment: {
          id: treatment.id,
          date: treatment.date,
          customerName: treatment.customer?.name,
          serviceName: treatment.service?.name,
          therapistName: treatment.therapist?.fullName,
          price: treatment.price,
          therapistFee: actualIsFreeVisit ? 0 : service.therapistFee,
          isFreeVisit: treatment.isFreeVisit,
          notes: treatment.notes
        },
        customerLoyalty: {
          name: customer.name,
          loyaltyVisits: actualIsFreeVisit ? 0 : customer.loyaltyVisits + 1,
          nextFreeIn: actualIsFreeVisit ? 3 : (3 - (customer.loyaltyVisits + 1)),
          wasFreeTreatment: actualIsFreeVisit
        }
      }
    })

  } catch (error) {
    console.error('Error adding treatment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to add treatment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET /api/treatments/add - Get form data for adding treatments
export async function GET(request: NextRequest) {
  if (!isDatabaseAvailable() || !prisma) {
    return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
  }

  try {
    // Get active services and therapists
    const [services, therapists] = await Promise.all([
      prisma!.service.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          category: true,
          normalPrice: true,
          promoPrice: true,
          duration: true,
          therapistFee: true,
          description: true
        },
        orderBy: { category: 'asc' }
      }),
      prisma!.therapist.findMany({
        where: { isActive: true },
        select: {
          id: true,
          initial: true,
          fullName: true,
          phone: true
        },
        orderBy: { fullName: 'asc' }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        services,
        therapists
      }
    })

  } catch (error) {
    console.error('Error fetching form data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch form data'
    }, { status: 500 })
  }
}