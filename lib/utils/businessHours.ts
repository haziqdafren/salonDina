// Business hours utility for Salon Muslimah Dina Medan
// Consistent 09:00-18:30 WIB daily operations

export interface BusinessHours {
  isOpen: boolean
  openTime: string
  closeTime: string
  nextOpenTime?: string
  hoursUntilClose?: number
  hoursUntilOpen?: number
}

export interface PrayerTimesMedan {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

// Medan daily operating hours - Competitive advantage: 7 days a week!
export const SALON_BUSINESS_HOURS = {
  open: '09:00',
  close: '18:30',
  timezone: 'Asia/Jakarta'
}

// Medan prayer times (accurate for North Sumatra)
export const MEDAN_PRAYER_TIMES: PrayerTimesMedan = {
  fajr: '05:00',
  sunrise: '06:15',
  dhuhr: '12:25',
  asr: '15:46',
  maghrib: '18:32',
  isha: '19:45'
}

/**
 * Get current business status for Medan location
 * Always checks against Asia/Jakarta timezone
 */
export function getCurrentBusinessStatus(): BusinessHours {
  const now = new Date()
  const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
  
  const currentHour = jakartaTime.getHours()
  const currentMinute = jakartaTime.getMinutes()
  const currentTimeMinutes = currentHour * 60 + currentMinute
  
  const openTimeMinutes = 9 * 60 // 09:00
  const closeTimeMinutes = 18 * 60 + 30 // 18:30
  
  const isOpen = currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes
  
  let hoursUntilClose: number | undefined
  let hoursUntilOpen: number | undefined
  let nextOpenTime: string | undefined
  
  if (isOpen) {
    hoursUntilClose = Math.round((closeTimeMinutes - currentTimeMinutes) / 60 * 10) / 10
  } else {
    if (currentTimeMinutes < openTimeMinutes) {
      // Before opening today
      hoursUntilOpen = Math.round((openTimeMinutes - currentTimeMinutes) / 60 * 10) / 10
      nextOpenTime = 'Hari ini'
    } else {
      // After closing, opens tomorrow
      const minutesUntilTomorrow = (24 * 60) - currentTimeMinutes + openTimeMinutes
      hoursUntilOpen = Math.round(minutesUntilTomorrow / 60 * 10) / 10
      nextOpenTime = 'Besok'
    }
  }
  
  return {
    isOpen,
    openTime: SALON_BUSINESS_HOURS.open,
    closeTime: SALON_BUSINESS_HOURS.close,
    nextOpenTime,
    hoursUntilClose,
    hoursUntilOpen
  }
}

/**
 * Check if current time is within prayer time (flexible scheduling)
 */
export function isWithinPrayerTime(): { isPrayerTime: boolean, currentPrayer?: string } {
  const now = new Date()
  const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
  const currentHour = jakartaTime.getHours()
  const currentMinute = jakartaTime.getMinutes()
  const currentTimeMinutes = currentHour * 60 + currentMinute
  
  const prayerRanges = [
    { name: 'Subuh', start: timeToMinutes(MEDAN_PRAYER_TIMES.fajr), end: timeToMinutes(MEDAN_PRAYER_TIMES.fajr) + 30 },
    { name: 'Dzuhur', start: timeToMinutes(MEDAN_PRAYER_TIMES.dhuhr), end: timeToMinutes(MEDAN_PRAYER_TIMES.dhuhr) + 30 },
    { name: 'Ashar', start: timeToMinutes(MEDAN_PRAYER_TIMES.asr), end: timeToMinutes(MEDAN_PRAYER_TIMES.asr) + 30 },
    { name: 'Maghrib', start: timeToMinutes(MEDAN_PRAYER_TIMES.maghrib), end: timeToMinutes(MEDAN_PRAYER_TIMES.maghrib) + 30 },
    { name: 'Isya', start: timeToMinutes(MEDAN_PRAYER_TIMES.isha), end: timeToMinutes(MEDAN_PRAYER_TIMES.isha) + 30 }
  ]
  
  for (const prayer of prayerRanges) {
    if (currentTimeMinutes >= prayer.start && currentTimeMinutes <= prayer.end) {
      return { isPrayerTime: true, currentPrayer: prayer.name }
    }
  }
  
  return { isPrayerTime: false }
}

/**
 * Get available appointment slots for a given date
 * Excludes prayer times and ensures within business hours
 */
export function getAvailableSlots(date: Date): string[] {
  const slots: string[] = []
  
  // Generate 30-minute slots from 09:00 to 18:00 (last appointment at 18:00 to finish by 18:30)
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const slotMinutes = hour * 60 + minute
      
      // Check if slot conflicts with prayer times (allow flexible scheduling)
      let isAvailable = true
      const prayerTimes = [
        timeToMinutes(MEDAN_PRAYER_TIMES.dhuhr), // Only check Dhuhr during business hours
        timeToMinutes(MEDAN_PRAYER_TIMES.asr)    // And Asr
      ]
      
      // Allow booking but note prayer time flexibility
      for (const prayerTime of prayerTimes) {
        if (Math.abs(slotMinutes - prayerTime) < 15) {
          // Mark as flexible prayer time slot
          slots.push(`${slotTime} *`)
          isAvailable = false
          break
        }
      }
      
      if (isAvailable) {
        slots.push(slotTime)
      }
    }
  }
  
  return slots
}

/**
 * Format time string to minutes
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Get business hours display text
 */
export function getBusinessHoursDisplay(): string {
  return `Setiap Hari: ${SALON_BUSINESS_HOURS.open} - ${SALON_BUSINESS_HOURS.close} WIB`
}

/**
 * Get competitive advantage text
 */
export function getCompetitiveAdvantage(): string {
  return "Satu-satunya salon muslimah di Medan yang buka 7 hari seminggu dengan jam konsisten!"
}

/**
 * Check if date is within business days (always true since we're 7 days a week)
 */
export function isBusinessDay(date: Date): boolean {
  return true // We're open every day!
}

/**
 * Get next business day (always today or tomorrow since we're open daily)
 */
export function getNextBusinessDay(date: Date): Date {
  const status = getCurrentBusinessStatus()
  if (status.isOpen) {
    return date
  } else {
    const tomorrow = new Date(date)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  }
}