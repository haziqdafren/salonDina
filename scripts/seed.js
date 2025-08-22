// Database Seeder for Salon Muslimah Dina
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  try {
    // 1. Create Admin User
    console.log('👤 Creating admin user...')
    const adminPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.admin.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword,
        name: 'Administrator'
      }
    })
    console.log('✅ Admin user created (username: admin, password: admin123)')

    // 2. Create Service Categories
    console.log('📂 Creating service categories...')
    const categories = [
      { name: 'wajah', description: 'Perawatan Wajah', icon: '✨' },
      { name: 'rambut', description: 'Perawatan Rambut', icon: '💇‍♀️' },
      { name: 'tubuh', description: 'Perawatan Tubuh', icon: '🤲' },
      { name: 'tangan-kaki', description: 'Perawatan Tangan & Kaki', icon: '💅' },
      { name: 'pengantin', description: 'Paket Pengantin', icon: '👰' },
      { name: 'bekam', description: 'Terapi Bekam', icon: '🩸' }
    ]

    for (const category of categories) {
      await prisma.serviceCategory.upsert({
        where: { name: category.name },
        update: category,
        create: category
      })
    }

    // 3. Create Services
    console.log('💄 Creating services...')
    const services = [
      // Perawatan Wajah
      {
        name: 'Facial Basic',
        category: 'wajah',
        normalPrice: 45000,
        promoPrice: 40000,
        duration: 60,
        description: 'Perawatan wajah dasar dengan pembersihan mendalam',
        popularity: 8
      },
      {
        name: 'Facial Whitening',
        category: 'wajah',
        normalPrice: 65000,
        promoPrice: 55000,
        duration: 75,
        description: 'Perawatan wajah untuk mencerahkan kulit',
        popularity: 9
      },
      {
        name: 'Facial PDT Technology',
        category: 'wajah',
        normalPrice: 85000,
        promoPrice: 75000,
        duration: 90,
        description: 'Perawatan wajah dengan teknologi PDT terkini',
        popularity: 10
      },
      {
        name: 'Microdermabrasi',
        category: 'wajah',
        normalPrice: 95000,
        duration: 80,
        description: 'Pengangkatan sel kulit mati dengan teknologi modern',
        popularity: 7
      },
      {
        name: 'Lumiface Treatment',
        category: 'wajah',
        normalPrice: 120000,
        promoPrice: 100000,
        duration: 100,
        description: 'Treatment premium untuk kulit wajah bercahaya',
        popularity: 9
      },

      // Perawatan Rambut
      {
        name: 'Creambath Traditional',
        category: 'rambut',
        normalPrice: 35000,
        promoPrice: 30000,
        duration: 60,
        description: 'Perawatan rambut dengan bahan alami tradisional',
        popularity: 8
      },
      {
        name: 'Hair SPA',
        category: 'rambut',
        normalPrice: 45000,
        promoPrice: 40000,
        duration: 75,
        description: 'Spa rambut untuk kelembutan dan kilau alami',
        popularity: 9
      },
      {
        name: 'Japanese Head SPA',
        category: 'rambut',
        normalPrice: 65000,
        promoPrice: 55000,
        duration: 90,
        description: 'Teknik head spa ala Jepang untuk relaksasi maksimal',
        popularity: 8
      },
      {
        name: 'Hair Smoothing',
        category: 'rambut',
        normalPrice: 150000,
        promoPrice: 130000,
        duration: 180,
        description: 'Pelurusan rambut dengan hasil natural',
        popularity: 7
      },
      {
        name: 'Nano Technology Treatment',
        category: 'rambut',
        normalPrice: 85000,
        duration: 120,
        description: 'Perawatan rambut dengan teknologi nano',
        popularity: 6
      },

      // Perawatan Tubuh
      {
        name: 'Body Massage Relaxing',
        category: 'tubuh',
        normalPrice: 65000,
        promoPrice: 55000,
        duration: 90,
        description: 'Pijat tubuh untuk relaksasi dan menghilangkan stress',
        popularity: 9
      },
      {
        name: 'Lulur Traditional',
        category: 'tubuh',
        normalPrice: 55000,
        promoPrice: 45000,
        duration: 75,
        description: 'Lulur tradisional dengan rempah-rempah pilihan',
        popularity: 8
      },
      {
        name: 'Sauna Treatment',
        category: 'tubuh',
        normalPrice: 40000,
        promoPrice: 35000,
        duration: 45,
        description: 'Terapi sauna untuk detoksifikasi tubuh',
        popularity: 7
      },
      {
        name: 'Rempah Ratus Therapy',
        category: 'tubuh',
        normalPrice: 75000,
        duration: 60,
        description: 'Terapi rempah ratus untuk kesehatan wanita',
        popularity: 6
      },

      // Perawatan Tangan & Kaki
      {
        name: 'Manicure Premium',
        category: 'tangan-kaki',
        normalPrice: 55000,
        promoPrice: 45000,
        duration: 60,
        description: 'Perawatan kuku tangan dengan polish premium',
        popularity: 8
      },
      {
        name: 'Pedicure Premium',
        category: 'tangan-kaki',
        normalPrice: 65000,
        promoPrice: 55000,
        duration: 75,
        description: 'Perawatan kuku kaki dengan perawatan kulit',
        popularity: 8
      },
      {
        name: 'Refleksi Kaki',
        category: 'tangan-kaki',
        normalPrice: 45000,
        duration: 45,
        description: 'Pijat refleksi untuk kesehatan melalui titik kaki',
        popularity: 7
      },
      {
        name: 'Callus Treatment',
        category: 'tangan-kaki',
        normalPrice: 35000,
        duration: 30,
        description: 'Perawatan khusus untuk mengangkat kapalan',
        popularity: 6
      },

      // Paket Pengantin
      {
        name: 'Paket Pengantin Basic',
        category: 'pengantin',
        normalPrice: 500000,
        promoPrice: 450000,
        duration: 240,
        description: 'Paket perawatan pengantin dengan facial + body treatment',
        popularity: 9
      },
      {
        name: 'Paket Pengantin Premium',
        category: 'pengantin',
        normalPrice: 750000,
        promoPrice: 650000,
        duration: 300,
        description: 'Paket lengkap pengantin dengan semua treatment premium',
        popularity: 10
      },
      {
        name: 'Paket Pre-Wedding',
        category: 'pengantin',
        normalPrice: 350000,
        promoPrice: 300000,
        duration: 180,
        description: 'Paket persiapan sebelum hari pernikahan',
        popularity: 8
      },

      // Terapi Bekam
      {
        name: 'Bekam Traditional',
        category: 'bekam',
        normalPrice: 85000,
        promoPrice: 70000,
        duration: 90,
        description: 'Terapi bekam sesuai sunnah dengan peralatan steril',
        popularity: 7
      },
      {
        name: 'Bekam + Massage Combo',
        category: 'bekam',
        normalPrice: 120000,
        promoPrice: 100000,
        duration: 120,
        description: 'Kombinasi bekam dengan massage therapy',
        popularity: 8
      },
      {
        name: 'Holistic Healing Package',
        category: 'bekam',
        normalPrice: 150000,
        duration: 150,
        description: 'Paket penyembuhan holistik dengan bekam dan herbal',
        popularity: 6
      }
    ]

    // Clear existing services first
    await prisma.service.deleteMany({})
    
    for (const service of services) {
      await prisma.service.create({
        data: {
          ...service,
          isActive: true
        }
      })
    }

    // 4. Create Therapists
    console.log('👩‍⚕️ Creating therapists...')
    const therapists = [
      {
        initial: 'R',
        fullName: 'Rini Sari',
        phone: '081234567890',
        baseFeePerTreatment: 20000,
        commissionRate: 0.12,
        totalTreatments: 45,
        totalEarnings: 950000,
        averageRating: 4.8
      },
      {
        initial: 'A',
        fullName: 'Aisyah Rahman',
        phone: '081234567891',
        baseFeePerTreatment: 18000,
        commissionRate: 0.10,
        totalTreatments: 38,
        totalEarnings: 780000,
        averageRating: 4.7
      },
      {
        initial: 'E',
        fullName: 'Eka Putri',
        phone: '081234567892',
        baseFeePerTreatment: 22000,
        commissionRate: 0.15,
        totalTreatments: 52,
        totalEarnings: 1200000,
        averageRating: 4.9
      },
      {
        initial: 'T',
        fullName: 'Tari Indah',
        phone: '081234567893',
        baseFeePerTreatment: 15000,
        commissionRate: 0.08,
        totalTreatments: 25,
        totalEarnings: 450000,
        averageRating: 4.6
      }
    ]

    // Clear existing therapists first
    await prisma.therapist.deleteMany({})
    
    for (const therapist of therapists) {
      await prisma.therapist.create({
        data: {
          ...therapist,
          isActive: true
        }
      })
    }

    // 5. Create Business Hours
    console.log('🕐 Setting business hours...')
    const businessHours = [
      { dayOfWeek: 0, openTime: '09:00', closeTime: '18:30' }, // Sunday
      { dayOfWeek: 1, openTime: '09:00', closeTime: '18:30' }, // Monday
      { dayOfWeek: 2, openTime: '09:00', closeTime: '18:30' }, // Tuesday
      { dayOfWeek: 3, openTime: '09:00', closeTime: '18:30' }, // Wednesday
      { dayOfWeek: 4, openTime: '09:00', closeTime: '18:30' }, // Thursday
      { dayOfWeek: 5, openTime: '09:00', closeTime: '18:30' }, // Friday
      { dayOfWeek: 6, openTime: '09:00', closeTime: '18:30' }  // Saturday
    ]

    for (const hours of businessHours) {
      await prisma.businessHour.upsert({
        where: { dayOfWeek: hours.dayOfWeek },
        update: hours,
        create: {
          ...hours,
          isOpen: true
        }
      })
    }

    console.log('✅ Database seeding completed successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log('- Admin user created: username=admin, password=admin123')
    console.log(`- Services created: ${services.length} services`)
    console.log(`- Therapists created: ${therapists.length} therapists`)
    console.log('- Business hours set for all 7 days')
    console.log('')
    console.log('🔗 You can now:')
    console.log('1. Login to admin dashboard with admin/admin123')
    console.log('2. View treatments on the main page')
    console.log('3. Make bookings from the guest interface')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()