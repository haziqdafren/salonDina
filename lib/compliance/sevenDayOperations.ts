// Business compliance and employee management for 7-day operations
// Ensuring legal compliance with Indonesian labor law while maintaining daily service

export interface EmployeeSchedule {
  id: string
  name: string
  role: 'therapist' | 'receptionist' | 'manager'
  workingDays: string[]
  shiftStart: string
  shiftEnd: string
  prayerBreaks: PrayerBreak[]
  weeklyHours: number
  restDay: string
}

export interface PrayerBreak {
  prayer: 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya'
  time: string
  duration: number // minutes
}

export interface ComplianceRule {
  id: string
  category: 'labor' | 'health' | 'islamic' | 'local'
  title: string
  description: string
  requirement: string
  isRequired: boolean
  applicableFor: string[]
}

// Indonesian Labor Law compliance for 7-day operations
export const INDONESIAN_LABOR_COMPLIANCE: ComplianceRule[] = [
  {
    id: 'max-hours-per-week',
    category: 'labor',
    title: 'Maksimal Jam Kerja per Minggu',
    description: 'Setiap karyawan maksimal 40 jam per minggu sesuai UU Ketenagakerjaan',
    requirement: 'Max 40 hours per week per employee',
    isRequired: true,
    applicableFor: ['all']
  },
  {
    id: 'rest-day-requirement', 
    category: 'labor',
    title: 'Hak Istirahat Mingguan',
    description: 'Setiap karyawan wajib mendapat 1 hari libur dalam seminggu',
    requirement: 'Minimum 1 rest day per week per employee',
    isRequired: true,
    applicableFor: ['all']
  },
  {
    id: 'overtime-compensation',
    category: 'labor', 
    title: 'Kompensasi Lembur',
    description: 'Kerja lebih dari 7 jam/hari atau 35 jam/minggu mendapat kompensasi lembur',
    requirement: 'Overtime payment for hours > 7 per day or 35 per week',
    isRequired: true,
    applicableFor: ['all']
  },
  {
    id: 'prayer-time-allowance',
    category: 'islamic',
    title: 'Waktu Sholat Karyawan',
    description: 'Memberikan waktu dan tempat yang layak untuk ibadah sholat',
    requirement: 'Prayer time accommodation for Muslim employees',
    isRequired: true,
    applicableFor: ['muslim_employees']
  },
  {
    id: 'health-safety-standards',
    category: 'health',
    title: 'Standar Kesehatan Salon',
    description: 'Mematuhi standar kesehatan Dinas Kesehatan Medan',
    requirement: 'Health department compliance for beauty salon',
    isRequired: true,
    applicableFor: ['salon_operations']
  }
]

// Prayer times for employee scheduling in Medan
export const MEDAN_EMPLOYEE_PRAYER_SCHEDULE: PrayerBreak[] = [
  { prayer: 'subuh', time: '05:00', duration: 15 },
  { prayer: 'dzuhur', time: '12:25', duration: 20 },
  { prayer: 'ashar', time: '15:46', duration: 15 },
  { prayer: 'maghrib', time: '18:32', duration: 15 }, // After business hours
  { prayer: 'isya', time: '19:45', duration: 15 }    // After business hours
]

/**
 * Generate compliant employee schedule for 7-day operations
 */
export function generateCompliantSchedule(
  employees: Pick<EmployeeSchedule, 'id' | 'name' | 'role'>[],
  businessHours: { start: string, end: string }
): EmployeeSchedule[] {
  const schedules: EmployeeSchedule[] = []
  const daysOfWeek = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
  
  employees.forEach((employee, index) => {
    // Rotate rest days to ensure coverage every day
    const restDayIndex = index % 7
    const restDay = daysOfWeek[restDayIndex]
    const workingDays = daysOfWeek.filter(day => day !== restDay)
    
    // Calculate working hours (max 40 hours per week)
    const dailyHours = Math.min(8, 40 / workingDays.length) // Max 8 hours per day
    const shiftDuration = dailyHours * 60 // in minutes
    
    // Adjust shift times to accommodate prayer breaks
    let shiftStart = businessHours.start
    let shiftEndTime = new Date(`1970-01-01 ${businessHours.start}`)
    shiftEndTime.setMinutes(shiftEndTime.getMinutes() + shiftDuration)
    
    const shiftEnd = shiftEndTime.toTimeString().slice(0, 5)
    
    // Only include prayer breaks during business hours
    const workingPrayerBreaks = MEDAN_EMPLOYEE_PRAYER_SCHEDULE.filter(prayer => {
      const prayerTime = new Date(`1970-01-01 ${prayer.time}`)
      const startTime = new Date(`1970-01-01 ${shiftStart}`)
      const endTime = new Date(`1970-01-01 ${shiftEnd}`)
      
      return prayerTime >= startTime && prayerTime <= endTime
    })
    
    schedules.push({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      workingDays,
      shiftStart,
      shiftEnd,
      prayerBreaks: workingPrayerBreaks,
      weeklyHours: dailyHours * workingDays.length,
      restDay
    })
  })
  
  return schedules
}

/**
 * Validate schedule compliance with Indonesian labor law
 */
export function validateScheduleCompliance(schedule: EmployeeSchedule): {
  isCompliant: boolean
  violations: string[]
  warnings: string[]
} {
  const violations: string[] = []
  const warnings: string[] = []
  
  // Check maximum weekly hours
  if (schedule.weeklyHours > 40) {
    violations.push(`Weekly hours (${schedule.weeklyHours}) exceeds maximum 40 hours`)
  }
  
  // Check rest day requirement
  if (schedule.workingDays.length > 6) {
    violations.push('Employee must have at least 1 rest day per week')
  }
  
  // Check daily working hours
  const dailyHours = schedule.weeklyHours / schedule.workingDays.length
  if (dailyHours > 8) {
    warnings.push(`Daily hours (${dailyHours.toFixed(1)}) may require overtime compensation`)
  }
  
  // Check prayer break accommodation for Muslim employees
  const businessHourPrayers = ['dzuhur', 'ashar']
  const accommodatedPrayers = schedule.prayerBreaks.map(p => p.prayer)
  
  businessHourPrayers.forEach(prayer => {
    if (!accommodatedPrayers.includes(prayer as any)) {
      warnings.push(`Consider accommodating ${prayer} prayer time`)
    }
  })
  
  return {
    isCompliant: violations.length === 0,
    violations,
    warnings
  }
}

/**
 * Generate coverage matrix to ensure salon is always staffed
 */
export function generateCoverageMatrix(schedules: EmployeeSchedule[]): {
  [day: string]: {
    therapists: string[]
    receptionists: string[]
    managers: string[]
    totalStaff: number
    hasMinimumCoverage: boolean
  }
} {
  const daysOfWeek = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
  const coverage: any = {}
  
  daysOfWeek.forEach(day => {
    const daySchedules = schedules.filter(schedule => 
      schedule.workingDays.includes(day)
    )
    
    const therapists = daySchedules.filter(s => s.role === 'therapist').map(s => s.name)
    const receptionists = daySchedules.filter(s => s.role === 'receptionist').map(s => s.name)
    const managers = daySchedules.filter(s => s.role === 'manager').map(s => s.name)
    
    const totalStaff = daySchedules.length
    
    // Minimum coverage: 1 receptionist, 2 therapists, 1 manager
    const hasMinimumCoverage = receptionists.length >= 1 && 
                               therapists.length >= 2 && 
                               managers.length >= 1
    
    coverage[day] = {
      therapists,
      receptionists, 
      managers,
      totalStaff,
      hasMinimumCoverage
    }
  })
  
  return coverage
}

/**
 * Calculate operational costs for 7-day operations
 */
export function calculateSevenDayOperationalCosts(
  schedules: EmployeeSchedule[],
  hourlyRates: { [role: string]: number }
): {
  dailyCosts: { [day: string]: number }
  weeklyCost: number
  overtimeCosts: number
  complianceCosts: number
} {
  const daysOfWeek = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
  const dailyCosts: { [day: string]: number } = {}
  let overtimeCosts = 0
  
  daysOfWeek.forEach(day => {
    const daySchedules = schedules.filter(schedule => 
      schedule.workingDays.includes(day)
    )
    
    let dayCost = 0
    
    daySchedules.forEach(schedule => {
      const dailyHours = schedule.weeklyHours / schedule.workingDays.length
      const regularHours = Math.min(dailyHours, 7)
      const overtimeHours = Math.max(0, dailyHours - 7)
      
      const hourlyRate = hourlyRates[schedule.role] || 25000 // Default IDR 25k/hour
      
      // Regular pay
      dayCost += regularHours * hourlyRate
      
      // Overtime pay (1.5x rate)
      if (overtimeHours > 0) {
        const overtimePay = overtimeHours * hourlyRate * 1.5
        dayCost += overtimePay
        overtimeCosts += overtimePay
      }
    })
    
    dailyCosts[day] = dayCost
  })
  
  const weeklyCost = Object.values(dailyCosts).reduce((sum, cost) => sum + cost, 0)
  
  // Additional compliance costs (benefits, insurance, etc.)
  const complianceCosts = weeklyCost * 0.2 // 20% for benefits and compliance
  
  return {
    dailyCosts,
    weeklyCost,
    overtimeCosts,
    complianceCosts
  }
}

/**
 * Generate staff rotation plan for sustainable 7-day operations
 */
export function generateStaffRotationPlan(
  numberOfWeeks: number = 4
): {
  rotationPlan: { [week: string]: { [employee: string]: string } }
  fairnessScore: number
} {
  const employees = ['Siti', 'Aisyah', 'Fatimah', 'Khadijah', 'Maryam', 'Zahra']
  const daysOfWeek = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
  const rotationPlan: any = {}
  
  for (let week = 1; week <= numberOfWeeks; week++) {
    rotationPlan[`minggu-${week}`] = {}
    
    employees.forEach((employee, index) => {
      // Rotate rest days fairly across weeks
      const restDayIndex = (index + week - 1) % 7
      const restDay = daysOfWeek[restDayIndex]
      
      rotationPlan[`minggu-${week}`][employee] = restDay
    })
  }
  
  // Calculate fairness score (how evenly rest days are distributed)
  const restDayCount: { [day: string]: number } = {}
  daysOfWeek.forEach(day => { restDayCount[day] = 0 })
  
  Object.values(rotationPlan).forEach((weekPlan: any) => {
    Object.values(weekPlan).forEach((restDay: any) => {
      restDayCount[restDay]++
    })
  })
  
  const restDayCounts = Object.values(restDayCount)
  const avgRestDays = restDayCounts.reduce((a, b) => a + b, 0) / restDayCounts.length
  const variance = restDayCounts.reduce((sum, count) => sum + Math.pow(count - avgRestDays, 2), 0) / restDayCounts.length
  const fairnessScore = Math.max(0, 100 - variance * 10) // Higher score = more fair
  
  return {
    rotationPlan,
    fairnessScore
  }
}

/**
 * Generate compliance report for authorities
 */
export function generateComplianceReport(
  schedules: EmployeeSchedule[]
): {
  summary: string
  laborCompliance: boolean
  islamicAccommodations: boolean
  healthSafety: boolean
  recommendations: string[]
} {
  const totalEmployees = schedules.length
  const avgWeeklyHours = schedules.reduce((sum, s) => sum + s.weeklyHours, 0) / totalEmployees
  const employeesWithRestDay = schedules.filter(s => s.workingDays.length <= 6).length
  
  const laborCompliance = avgWeeklyHours <= 40 && employeesWithRestDay === totalEmployees
  const islamicAccommodations = schedules.every(s => 
    s.prayerBreaks.some(p => p.prayer === 'dzuhur') // At least Dzuhur prayer accommodation
  )
  
  const recommendations: string[] = []
  
  if (!laborCompliance) {
    recommendations.push('Review employee schedules to ensure compliance with 40-hour work week limit')
  }
  
  if (!islamicAccommodations) {
    recommendations.push('Ensure all Muslim employees have adequate prayer time accommodations')
  }
  
  if (totalEmployees < 6) {
    recommendations.push('Consider hiring additional staff to ensure adequate coverage for 7-day operations')
  }
  
  const summary = `
Salon Muslimah Dina - Laporan Kepatuhan 7 Hari Operasi
Total Karyawan: ${totalEmployees}
Rata-rata Jam Kerja/Minggu: ${avgWeeklyHours.toFixed(1)}
Karyawan dengan Hari Libur: ${employeesWithRestDay}/${totalEmployees}
Status Kepatuhan: ${laborCompliance && islamicAccommodations ? 'SESUAI' : 'PERLU PERBAIKAN'}
  `.trim()
  
  return {
    summary,
    laborCompliance,
    islamicAccommodations,
    healthSafety: true, // Assume health standards are met
    recommendations
  }
}

// Default employee configuration for Medan salon
export const DEFAULT_MEDAN_SALON_STAFF: Pick<EmployeeSchedule, 'id' | 'name' | 'role'>[] = [
  { id: '1', name: 'Siti Aminah', role: 'manager' },
  { id: '2', name: 'Aisyah Rahman', role: 'therapist' },
  { id: '3', name: 'Fatimah Sari', role: 'therapist' }, 
  { id: '4', name: 'Khadijah Putri', role: 'therapist' },
  { id: '5', name: 'Maryam Dewi', role: 'receptionist' },
  { id: '6', name: 'Zahra Nasution', role: 'receptionist' }
]

// Medan salary ranges (IDR per hour)
export const MEDAN_HOURLY_RATES = {
  manager: 35000,     // IDR 35k/hour
  therapist: 30000,   // IDR 30k/hour  
  receptionist: 25000 // IDR 25k/hour
}