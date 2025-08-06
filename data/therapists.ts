// Sample therapist data for Salon Muslimah Dina
// These can be customized based on actual salon staff

export const sampleTherapists = [
  {
    initial: 'R',
    fullName: 'Ratna Sari',
    phone: '+628123456789',
    baseFeePerTreatment: 15000,
    commissionRate: 0.12, // 12% commission
    joinDate: new Date('2023-01-15'),
  },
  {
    initial: 'A', 
    fullName: 'Ayu Permata',
    phone: '+628123456790',
    baseFeePerTreatment: 12000,
    commissionRate: 0.10, // 10% commission
    joinDate: new Date('2023-03-03'),
  },
  {
    initial: 'E',
    fullName: 'Evi Susanti', 
    phone: '+628123456791',
    baseFeePerTreatment: 18000,
    commissionRate: 0.15, // 15% commission
    joinDate: new Date('2023-02-20'),
  },
  {
    initial: 'T',
    fullName: 'Tina Rahayu',
    phone: '+628123456792', 
    baseFeePerTreatment: 10000,
    commissionRate: 0.08, // 8% commission
    joinDate: new Date('2023-04-10'),
  }
]

export const sampleServices = [
  // Facial Services
  {
    name: 'Basic Facial',
    category: 'Perawatan Wajah',
    normalPrice: 150000,
    duration: 60,
    description: 'Pembersihan wajah dasar dengan produk halal dan organic',
  },
  {
    name: 'Whitening Facial',
    category: 'Perawatan Wajah',
    normalPrice: 200000,
    promoPrice: 180000,
    duration: 75,
    description: 'Facial untuk mencerahkan dan meratakan warna kulit',
  },
  {
    name: 'Anti-Aging Facial',
    category: 'Perawatan Wajah',
    normalPrice: 250000,
    duration: 90,
    description: 'Perawatan wajah untuk mengurangi tanda-tanda penuaan',
  },

  // Hair Services
  {
    name: 'Hair Wash & Styling',
    category: 'Perawatan Rambut',
    normalPrice: 75000,
    duration: 45,
    description: 'Keramas dan styling rambut dengan produk premium',
  },
  {
    name: 'Creambath',
    category: 'Perawatan Rambut',
    normalPrice: 125000,
    duration: 60,
    description: 'Perawatan rambut dengan cream dan pijat kepala',
  },
  {
    name: 'Hair Spa Treatment',
    category: 'Perawatan Rambut',
    normalPrice: 200000,
    promoPrice: 170000,
    duration: 90,
    description: 'Perawatan rambut lengkap dengan masker dan serum',
  },

  // Body Care
  {
    name: 'Body Massage',
    category: 'Perawatan Tubuh',
    normalPrice: 180000,
    duration: 90,
    description: 'Pijat tubuh relaksasi dengan minyak aromaterapi',
  },
  {
    name: 'Body Scrub',
    category: 'Perawatan Tubuh',
    normalPrice: 150000,
    duration: 60,
    description: 'Lulur tubuh untuk kulit halus dan sehat',
  },

  // Nail Care
  {
    name: 'Manicure',
    category: 'Perawatan Kuku',
    normalPrice: 80000,
    duration: 45,
    description: 'Perawatan kuku tangan dengan kutek halal',
  },
  {
    name: 'Pedicure',
    category: 'Perawatan Kuku',
    normalPrice: 90000,
    duration: 60,
    description: 'Perawatan kuku kaki dengan foot spa',
  },

  // Special Packages
  {
    name: 'Bridal Package',
    category: 'Paket Spesial',
    normalPrice: 1500000,
    duration: 240,
    description: 'Paket lengkap untuk pengantin: makeup, hair do, dan spa',
  },
  {
    name: 'Monthly Membership',
    category: 'Paket Spesial',
    normalPrice: 800000,
    promoPrice: 650000,
    duration: 0, // Package
    description: 'Paket bulanan dengan 4x treatment pilihan',
  }
]

export const sampleCustomers = [
  {
    name: 'Siti Aminah',
    phone: '+628111222333',
    email: 'siti.aminah@email.com',
    address: 'Jl. Mawar No. 15, Jakarta Selatan',
    notes: 'Alergi produk berbahan alkohol'
  },
  {
    name: 'Fatimah Zahra',
    phone: '+628111222334',
    email: 'fatimah.z@email.com',
    address: 'Jl. Melati No. 22, Jakarta Timur',
    isVip: true
  },
  {
    name: 'Khadijah Rahmah',
    phone: '+628111222335',
    address: 'Jl. Anggrek No. 8, Jakarta Pusat',
    notes: 'Prefer therapist wanita'
  },
  {
    name: 'Aisyah Putri',
    phone: '+628111222336',
    email: 'aisyah.putri@email.com',
    address: 'Jl. Kenanga No. 12, Jakarta Barat'
  },
  {
    name: 'Maryam Salma',
    phone: '+628111222337',
    address: 'Jl. Cempaka No. 5, Jakarta Utara',
    notes: 'Langganan bulanan'
  }
]

export const serviceCategories = [
  {
    name: 'Perawatan Wajah',
    description: 'Berbagai layanan perawatan untuk kecantikan wajah',
    icon: '✨',
    sortOrder: 1
  },
  {
    name: 'Perawatan Rambut',
    description: 'Layanan perawatan untuk kesehatan dan keindahan rambut',
    icon: '💇‍♀️',
    sortOrder: 2
  },
  {
    name: 'Perawatan Tubuh',
    description: 'Layanan spa dan perawatan tubuh relaksasi',
    icon: '🤲',
    sortOrder: 3
  },
  {
    name: 'Perawatan Kuku',
    description: 'Perawatan kuku tangan dan kaki',
    icon: '💅',
    sortOrder: 4
  },
  {
    name: 'Paket Spesial',
    description: 'Paket perawatan lengkap dan membership',
    icon: '🎁',
    sortOrder: 5
  }
]