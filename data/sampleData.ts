// Sample data for salon seeding - extracted from real treatment menu
import { treatmentCategories } from './treatments'

// Convert treatment categories to services format for database seeding
export const sampleServices = Object.entries(treatmentCategories).flatMap(([categoryKey, category]) =>
  category.items.map(item => ({
    name: item.name,
    category: category.title,
    normalPrice: item.hargaNormal,
    promoPrice: item.hargaPromo || undefined,
    duration: item.duration,
    description: `${category.description} - ${item.name}`,
    isActive: true,
    popularity: item.popularity
  }))
)

// Service categories for database
export const serviceCategories = [
  {
    name: 'Penghilang Bulu (Wax)',
    description: 'Perawatan waxing profesional dengan produk halal',
    icon: '🌿',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Perawatan Tangan & Kaki',
    description: 'Perawatan lengkap untuk tangan dan kaki yang cantik',
    icon: '💅',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Terapi Bekam',
    description: 'Terapi bekam sesuai sunnah dengan peralatan steril',
    icon: '🩸',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Perawatan Tubuh',
    description: 'Perawatan tubuh relaksasi dengan produk alami',
    icon: '🧴',
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Perawatan Rambut',
    description: 'Perawatan profesional untuk rambut sehat dan indah',
    icon: '💇‍♀️',
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Facial & Perawatan Wajah',
    description: 'Perawatan wajah dengan teknologi modern dan produk halal',
    icon: '✨',
    isActive: true,
    sortOrder: 6
  },
  {
    name: 'Paket Premium',
    description: 'Paket lengkap dengan berbagai perawatan eksklusif',
    icon: '👑',
    isActive: true,
    sortOrder: 7
  }
]

// Sample Medan therapists
export const sampleTherapists = [
  {
    initial: 'R',
    fullName: 'Rina Sari Dewi',
    phone: '+62813-1234-5678',
    isActive: true,
    baseFeePerTreatment: 20000,
    commissionRate: 0.12
  },
  {
    initial: 'A',
    fullName: 'Aisyah Putri Maharani',
    phone: '+62813-2345-6789',
    isActive: true,
    baseFeePerTreatment: 18000,
    commissionRate: 0.10
  },
  {
    initial: 'E',
    fullName: 'Elisa Rahman Sari',
    phone: '+62813-3456-7890',
    isActive: true,
    baseFeePerTreatment: 22000,
    commissionRate: 0.15
  },
  {
    initial: 'T',
    fullName: 'Tina Wulandari Hasibuan',
    phone: '+62813-4567-8901',
    isActive: true,
    baseFeePerTreatment: 25000,
    commissionRate: 0.18
  },
  {
    initial: 'S',
    fullName: 'Sari Indah Nasution',
    phone: '+62813-5678-9012',
    isActive: true,
    baseFeePerTreatment: 15000,
    commissionRate: 0.08
  },
  {
    initial: 'M',
    fullName: 'Maryam Fitri Siregar',
    phone: '+62813-6789-0123',
    isActive: true,
    baseFeePerTreatment: 20000,
    commissionRate: 0.12
  }
]

// Sample Medan customers  
export const sampleCustomers = [
  {
    name: 'Siti Aminah Lubis',
    phone: '+62812-1111-1111',
    email: 'siti.aminah@gmail.com',
    address: 'Jl. Gatot Subroto No. 15, Medan Petisah',
    notes: 'Pelanggan VIP, suka facial premium'
  },
  {
    name: 'Fatimah Zahra Harahap',
    phone: '+62812-2222-2222',
    address: 'Jl. Imam Bonjol No. 88, Medan Polonia',
    notes: 'Rutin hair spa setiap bulan'
  },
  {
    name: 'Khadijah Ahmad Dalimunthe',
    phone: '+62812-3333-3333',
    email: 'khadijah.ahmad@yahoo.com',
    address: 'Jl. Diponegoro No. 45, Medan Timur'
  },
  {
    name: 'Maryam Husna Purba',
    phone: '+62812-4444-4444',
    address: 'Jl. Kartini No. 12, Medan Deli',
    notes: 'Suka treatment bekam dan massage'
  },
  {
    name: 'Zahra Fitri Panggabean',
    phone: '+62812-5555-5555',
    email: 'zahra.fitri@gmail.com',
    address: 'Jl. Mawar No. 67, Medan Selayang'
  },
  {
    name: 'Aisyah Rahmah Sinaga',
    phone: '+62812-6666-6666',
    address: 'Jl. Melati No. 34, Medan Helvetia',
    notes: 'Booking biasanya weekend'
  },
  {
    name: 'Halimah Sari Batubara',
    phone: '+62812-7777-7777',
    email: 'halimah.sari@hotmail.com',
    address: 'Jl. Cempaka No. 21, Medan Johor'
  },
  {
    name: 'Ruqayyah Indira Simanjuntak',
    phone: '+62812-8888-8888',
    address: 'Jl. Flamboyan No. 56, Medan Area',
    notes: 'Pelanggan setia sejak 2023'
  },
  {
    name: 'Safiyyah Dewi Tarigan',
    phone: '+62812-9999-9999',
    email: 'safiyyah.dewi@gmail.com',
    address: 'Jl. Anggrek No. 78, Medan Barat'
  },
  {
    name: 'Ummu Kalsum Pohan',
    phone: '+62812-0000-0000',
    address: 'Jl. Kenanga No. 43, Medan Amplas',
    notes: 'Suka paket lengkap treatment'
  }
]