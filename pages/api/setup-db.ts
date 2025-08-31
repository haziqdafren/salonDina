import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma, isDatabaseAvailable } from '../../lib/prisma'
import bcrypt from 'bcryptjs'

const servicesData = [
  // Facial Services
  { name: 'Facial Acne', category: 'facial', price: 35000, duration: 60, description: 'Perawatan wajah untuk kulit berjerawat', therapistFee: 15000 },
  { name: 'Facial Brightening', category: 'facial', price: 40000, duration: 60, description: 'Facial pencerah wajah alami', therapistFee: 15000 },
  { name: 'Facial Anti Aging', category: 'facial', price: 50000, duration: 75, description: 'Perawatan anti penuaan dini', therapistFee: 20000 },
  { name: 'Facial Whitening', category: 'facial', price: 45000, duration: 60, description: 'Facial pemutih wajah', therapistFee: 17500 },
  { name: 'Facial Basic', category: 'facial', price: 30000, duration: 45, description: 'Perawatan wajah dasar', therapistFee: 12500 },
  
  // Hair Spa
  { name: 'Hair Spa Creambath', category: 'hair_spa', price: 25000, duration: 45, description: 'Creambath dengan vitamin rambut', therapistFee: 10000 },
  { name: 'Hair Spa Protein', category: 'hair_spa', price: 35000, duration: 60, description: 'Perawatan protein untuk rambut rusak', therapistFee: 15000 },
  { name: 'Hair Spa Smoothing', category: 'hair_spa', price: 150000, duration: 120, description: 'Perawatan pelurus rambut alami', therapistFee: 50000 },
  { name: 'Hair Spa Keratin', category: 'hair_spa', price: 200000, duration: 150, description: 'Treatment keratin untuk rambut sehat', therapistFee: 75000 },
  
  // Body Treatment
  { name: 'Full Body Massage', category: 'body_treatment', price: 60000, duration: 90, description: 'Pijat seluruh tubuh relaksasi', therapistFee: 25000 },
  { name: 'Aromatherapy Massage', category: 'body_treatment', price: 70000, duration: 90, description: 'Pijat aromaterapi dengan essential oil', therapistFee: 30000 },
  { name: 'Hot Stone Massage', category: 'body_treatment', price: 85000, duration: 90, description: 'Pijat dengan batu panas', therapistFee: 35000 },
  { name: 'Body Scrub', category: 'body_treatment', price: 50000, duration: 60, description: 'Lulur seluruh tubuh', therapistFee: 20000 },
  { name: 'Body Whitening', category: 'body_treatment', price: 75000, duration: 75, description: 'Perawatan pemutih badan', therapistFee: 30000 },
]

const therapistsData = [
  { name: 'Siti Aminah', specialization: 'facial,hair_spa', phoneNumber: '081234567890', isActive: true },
  { name: 'Fatimah Zahra', specialization: 'body_treatment,facial', phoneNumber: '081234567891', isActive: true },
  { name: 'Khadijah Salsabila', specialization: 'hair_spa,body_treatment', phoneNumber: '081234567892', isActive: true },
  { name: 'Aisyah Rahma', specialization: 'facial', phoneNumber: '081234567893', isActive: true },
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isDatabaseAvailable() || !prisma) {
    return res.status(503).json({ 
      success: false, 
      error: 'Database not configured' 
    })
  }

  try {
    // Clear existing data
    await prisma.treatment.deleteMany({})
    await prisma.customer.deleteMany({})
    await prisma.therapist.deleteMany({})
    await prisma.service.deleteMany({})
    await prisma.user.deleteMany({})

    // Create services
    const createdServices = await Promise.all(
      servicesData.map(service => 
        prisma.service.create({ data: service })
      )
    )

    // Create therapists
    const createdTherapists = await Promise.all(
      therapistsData.map(therapist => 
        prisma.therapist.create({ data: therapist })
      )
    )

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.create({
      data: {
        id: 'admin-user-id',
        username: 'admin',
        email: 'admin@salondina.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      }
    })

    // Create some sample customers with loyalty visits
    const sampleCustomers = [
      { name: 'Nur Halimah', phoneNumber: '081234567800', address: 'Medan Selayang', loyaltyVisits: 2 },
      { name: 'Sari Dewi', phoneNumber: '081234567801', address: 'Medan Deli', loyaltyVisits: 3 },
      { name: 'Maya Sartika', phoneNumber: '081234567802', address: 'Medan Johor', loyaltyVisits: 1 },
      { name: 'Linda Sari', phoneNumber: '081234567803', address: 'Medan Helvetia', loyaltyVisits: 3 },
    ]

    const createdCustomers = await Promise.all(
      sampleCustomers.map(customer => 
        prisma.customer.create({ data: customer })
      )
    )

    res.status(200).json({
      success: true,
      message: 'Database setup completed successfully',
      data: {
        services: createdServices.length,
        therapists: createdTherapists.length,
        customers: createdCustomers.length,
        admin_created: !!adminUser
      }
    })
  } catch (error) {
    console.error('Database setup error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to setup database',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}