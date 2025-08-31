#!/usr/bin/env node

/**
 * Production Database Setup Script
 * Sets up the database schema and initial data for Vercel deployment
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function setupProductionDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🚀 Setting up production database...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `
    
    console.log(`📊 Found ${tables.length} existing tables`)
    
    // Create admin user if doesn't exist
    const existingAdmin = await prisma.admin.findFirst()
    
    if (!existingAdmin) {
      console.log('👤 Creating admin user...')
      const hashedPassword = await bcrypt.hash('admin123', 12)
      
      await prisma.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: 'Administrator',
        }
      })
      
      console.log('✅ Admin user created')
    } else {
      console.log('👤 Admin user already exists')
    }
    
    // Create initial service categories if none exist
    const existingServices = await prisma.service.count()
    
    if (existingServices === 0) {
      console.log('💆‍♀️ Creating initial services...')
      
      const initialServices = [
        {
          name: 'Facial Brightening',
          category: 'Perawatan Wajah',
          normalPrice: 150000,
          promoPrice: 125000,
          duration: 60,
          description: 'Perawatan wajah untuk mencerahkan kulit',
          isActive: true
        },
        {
          name: 'Hair Spa Treatment',
          category: 'Perawatan Rambut',
          normalPrice: 200000,
          duration: 90,
          description: 'Perawatan rambut lengkap dengan masker',
          isActive: true
        },
        {
          name: 'Full Body Massage',
          category: 'Body Treatment',
          normalPrice: 250000,
          duration: 120,
          description: 'Pijat seluruh tubuh untuk relaksasi',
          isActive: true
        },
        {
          name: 'Manicure Pedicure',
          category: 'Nail Care',
          normalPrice: 100000,
          duration: 60,
          description: 'Perawatan kuku tangan dan kaki',
          isActive: true
        }
      ]
      
      for (const service of initialServices) {
        await prisma.service.create({ data: service })
      }
      
      console.log(`✅ Created ${initialServices.length} initial services`)
    } else {
      console.log(`💆‍♀️ Found ${existingServices} existing services`)
    }
    
    // Create initial therapists if none exist
    const existingTherapists = await prisma.therapist.count()
    
    if (existingTherapists === 0) {
      console.log('👩‍⚕️ Creating initial therapists...')
      
      const initialTherapists = [
        {
          initial: 'R',
          fullName: 'Rina Sari',
          phone: '081234567890',
          isActive: true,
          baseFeePerTreatment: 15000,
          commissionRate: 0.1
        },
        {
          initial: 'A',
          fullName: 'Aisha Putri',
          phone: '081234567891',
          isActive: true,
          baseFeePerTreatment: 15000,
          commissionRate: 0.1
        }
      ]
      
      for (const therapist of initialTherapists) {
        await prisma.therapist.create({ data: therapist })
      }
      
      console.log(`✅ Created ${initialTherapists.length} initial therapists`)
    } else {
      console.log(`👩‍⚕️ Found ${existingTherapists} existing therapists`)
    }
    
    // Final statistics
    const stats = {
      admins: await prisma.admin.count(),
      customers: await prisma.customer.count(),
      services: await prisma.service.count(),
      therapists: await prisma.therapist.count(),
      treatments: await prisma.dailyTreatment.count(),
      bookings: await prisma.booking.count()
    }
    
    console.log('\n📈 Database Statistics:')
    console.log(`   Admins: ${stats.admins}`)
    console.log(`   Customers: ${stats.customers}`)
    console.log(`   Services: ${stats.services}`)
    console.log(`   Therapists: ${stats.therapists}`)
    console.log(`   Treatments: ${stats.treatments}`)
    console.log(`   Bookings: ${stats.bookings}`)
    
    console.log('\n🎉 Production database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the setup
if (require.main === module) {
  setupProductionDatabase()
    .then(() => {
      console.log('✅ Script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script failed:', error)
      process.exit(1)
    })
}

module.exports = { setupProductionDatabase }