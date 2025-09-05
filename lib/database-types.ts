// Database types matching your existing Supabase schema

export interface Admin {
  id: number
  username: string
  password: string // bcrypt hashed
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface Customer {
  id: number
  name: string
  phone: string
  email?: string
  address?: string
  totalVisits: number
  totalSpending: number
  loyaltyVisits: number
  isVip: boolean
  lastVisit?: string
  createdAt?: string
  updatedAt?: string
}

export interface Therapist {
  id: number
  initial: string
  fullName: string
  phone?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Service {
  id: number
  name: string
  category: string
  normalPrice: number
  duration: number // in minutes
  description?: string
  therapistFee: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Treatment {
  id: number
  customerId: number
  serviceId: number
  therapistId?: number
  price: number
  therapistFee?: number
  isFreeVisit: boolean
  createdAt: string
  updatedAt?: string
}

export interface BookingStatus {
  pending: number
  confirmed: number
  inProgress: number
  completed: number
  cancelled: number
}

export interface DashboardStats {
  today: {
    revenue: number
    treatments: number
    therapistFees: number
    treatments_detail: Treatment[]
  }
  monthly: {
    revenue: number
    treatments: number
    therapistFees: number
  }
  system: {
    activeTherapists: number
    totalCustomers: number
    totalServices: number
  }
}