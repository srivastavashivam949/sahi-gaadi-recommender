// ─── Wizard input types ───────────────────────────────────────────────────────

export type VehicleTypeFilter = 'car' | 'motorcycle' | 'scooty' | 'all'
export type PrimaryUse = 'office_daily' | 'family_trips' | 'highway' | 'all_purpose'
export type LucknowZone = 'gomti_nagar' | 'alambagh' | 'rajajipuram' | 'outskirts'
export type ParkingSituation = 'street' | 'building' | 'basement'
export type DriverProfile = 'self' | 'spouse' | 'elderly' | 'learner'
export type BudgetType = 'purchase' | 'monthly'
export type Priority =
  | 'fuel_economy'
  | 'comfort'
  | 'safety'
  | 'brand_reputation'
  | 'resale_value'

export interface WizardProfile {
  vehicleType: VehicleTypeFilter
  primaryUse: PrimaryUse
  zone: LucknowZone
  dailyDistance: number       // km/day
  parking: ParkingSituation
  drivers: DriverProfile[]
  budgetType: BudgetType
  budgetAmount: number        // INR (purchase) or INR/month
  priorities: Priority[]      // index 0 = highest priority, must have all 5
}

// ─── Vehicle data types ───────────────────────────────────────────────────────

export type VehicleCategory = 'car' | 'motorcycle' | 'scooty'
export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric'
export type SparePartsAvailability = 'excellent' | 'good' | 'fair' | 'poor'

export interface Vehicle {
  id: string                  // URL-safe slug
  name: string
  brand: string
  category: VehicleCategory
  fuelType: FuelType
  startingPrice: number       // INR
  monthlyOwnership: number    // estimated INR/month
  imageEmoji: string
  imageGradient: string       // Tailwind gradient bg classes
  specs: {
    mileage: number           // km/l (or km/kg for CNG)
    engineCC: number
    seatingCapacity: number
    bootSpaceLitres: number
    lengthMm: number
    widthMm: number
    safetyStars: number | null
    hasAutoTransmission: boolean
  }
  lucknow: {
    groundClearanceMm: number
    serviceCentersTotal: number
    serviceCentersByZone: Record<LucknowZone, number>
    evChargerCompatible: boolean
    cngFactoryFitted: boolean
    waitingPeriodWeeks: number
    sparePartsAvailability: SparePartsAvailability
    commonIssues: [string, string]  // exactly 2 honest cons
    lastUpdated: string
  }
}

// ─── Recommendation output types ──────────────────────────────────────────────

export interface ScoreBreakdown {
  groundClearance: number     // 0–100
  serviceCenters: number      // 0–100 (zone-aware)
  fuelInfra: number           // 0–100
  waitingPeriod: number       // 0–100
  spareParts: number          // 0–100
  total: number               // weighted average 0–100
}

export interface RecommendationResult {
  vehicle: Vehicle
  rank: 1 | 2 | 3
  lucknowScore: ScoreBreakdown
  whyItFitsYou: string[]      // 3 personalized bullets
  thingsToKnow: string[]      // 2 honest cons
}
