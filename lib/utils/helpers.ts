import bcrypt from 'bcryptjs'

// Format Indonesian Rupiah currency
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format Indonesian phone number
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Convert to international format
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.substring(1)
  } else if (cleaned.startsWith('62')) {
    return '+' + cleaned
  } else if (cleaned.startsWith('+62')) {
    return cleaned
  }
  
  return '+62' + cleaned
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

// Generate booking code
export function generateBookingCode(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const timestamp = Date.now().toString().slice(-4)
  
  return `SMD-${year}${month}${day}-${timestamp}`
}

// Format Indonesian date
export function formatIndonesianDate(date: Date): string {
  const days = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 
    'Kamis', 'Jumat', 'Sabtu'
  ]
  
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  
  const dayName = days[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  
  return `${dayName}, ${day} ${month} ${year}`
}

// Format time to Indonesian format
export function formatIndonesianTime(time: string): string {
  const [hours, minutes] = time.split(':')
  return `${hours}.${minutes} WIB`
}

// Get Indonesian greeting based on time
export function getIndonesianGreeting(): string {
  const hour = new Date().getHours()
  
  if (hour >= 4 && hour < 10) {
    return 'Selamat pagi'
  } else if (hour >= 10 && hour < 15) {
    return 'Selamat siang'
  } else if (hour >= 15 && hour < 18) {
    return 'Selamat sore'
  } else {
    return 'Selamat malam'
  }
}

// Validate Indonesian phone number
export function isValidIndonesianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  
  // Indonesian phone numbers are typically 10-13 digits
  // Starting with 08, 628, or +628
  return /^(08|628|\+628)[0-9]{8,11}$/.test(cleaned) || /^(8)[0-9]{8,11}$/.test(cleaned)
}

// Generate WhatsApp link
export function generateWhatsAppLink(phone: string, message: string = ''): string {
  const formattedPhone = formatPhoneNumber(phone).replace('+', '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formattedPhone}${message ? `?text=${encodedMessage}` : ''}`
}

// Get Indonesian day name
export function getIndonesianDayName(dayIndex: number): string {
  const days = [
    'Minggu', 'Senin', 'Selasa', 'Rabu', 
    'Kamis', 'Jumat', 'Sabtu'
  ]
  return days[dayIndex]
}

// Calculate duration between times
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  return endMinutes - startMinutes
}

// Format duration in Indonesian
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} jam ${remainingMinutes} menit`
  } else if (hours > 0) {
    return `${hours} jam`
  } else {
    return `${remainingMinutes} menit`
  }
}

// Indonesian status translations
export const statusTranslations = {
  PENDING: 'Menunggu Konfirmasi',
  CONFIRMED: 'Dikonfirmasi',
  IN_PROGRESS: 'Sedang Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  NO_SHOW: 'Tidak Datang'
}

export const paymentStatusTranslations = {
  PENDING: 'Belum Dibayar',
  PARTIAL: 'Dibayar Sebagian',
  PAID: 'Lunas',
  REFUNDED: 'Dikembalikan'
}