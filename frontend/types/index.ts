export interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'provider' | 'admin'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE'
  isFirstLogin: boolean
  isActive: boolean
  isOnline: boolean
  avatar?: string
  walletBalance: number
  currentLocation?: { lat: number; lng: number; updatedAt?: string }
  address?: { street: string; city: string; state: string; pincode: string }
  createdAt: string
  // Security and 2FA
  twoFactorEnabled?: boolean
  twoFactorMethod?: 'SMS' | 'APP'
  twoFactorSecret?: string
  // Linked Profiles
  providerProfile?: ProviderProfile
}


export interface ProviderProfile {
  _id: string
  userId: string
  skills: string[]
  rating: number
  totalReviews: number
  totalJobs: number
  hourlyRate: number
  experience: string
  bio: string
  totalEarnings: number
  pendingPayout: number
}

export interface Service {
  _id: string
  name: string
  slug: string
  category: 'indoor_living' | 'kitchen_dining' | 'floor_surface' | 'outdoor' | 'deep_cleaning'
  categoryLabel: string
  description: string
  whatIncluded: string[]
  icon: string
  basePrice: number
  priceUnit: string
  priceLabel: string
  addOns: { name: string; description: string; price: number }[]
  duration: { min: number; max: number }
  isActive: boolean
  isPopular: boolean
  isImmediate: boolean
  tags: string[]
}

export interface Booking {
  _id: string
  bookingRef: string
  customerId: User | string
  providerId: User | string | null
  serviceId: Service | string
  status: BookingStatus
  scheduledDate: string
  scheduledTime: string
  isImmediate: boolean
  serviceAddress: {
    street: string
    city: string
    state: string
    pincode: string
    lat?: number
    lng?: number
  }
  liveLocation?: { lat: number; lng: number; updatedAt: string }
  pricing: {
    subtotal: number
    addOnsTotal: number
    discount: number
    total: number
    commissionRate: number
    adminCommission: number
    providerEarning: number
  }
  paymentMethod: 'CARD' | 'COD'
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED'
  specialInstructions?: string
  etaMinutes?: number
  distanceKm?: number
  createdAt: string
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROVIDER_ASSIGNED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REVIEWED'
  | 'CANCELLED'

export interface Transaction {
  _id: string
  bookingId: Booking | string
  customerId: User | string
  providerId: User | string
  customerPaid: number
  commissionRate: number
  adminCommission: number
  providerPayout: number
  paymentMethod: 'CARD' | 'COD'
  status: 'PENDING' | 'COMPLETED' | 'REFUNDED'
  createdAt: string
}

export interface AvailableProvider {
  provider: User
  profile: ProviderProfile
  distanceKm: number | null
  etaMinutes: number | null
  distanceText: string | null
  durationText: string | null
}

export interface BookingFlowState {
  step: 1 | 2 | 3
  service: Service | null
  selectedAddOns: { name: string; price: number }[]
  scheduledDate: string
  scheduledTime: string
  isImmediate: boolean
  serviceAddress: Booking['serviceAddress'] | null
  selectedProvider: AvailableProvider | null
  paymentMethod: 'CARD' | 'COD'
  specialInstructions: string
}
