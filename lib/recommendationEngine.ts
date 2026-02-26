import type {
  Vehicle,
  WizardProfile,
  LucknowZone,
  ScoreBreakdown,
  RecommendationResult,
  SparePartsAvailability,
} from './types'
import { VEHICLES } from './vehicleDatabase'

// ─── Scoring weights (sum = 1.0) ──────────────────────────────────────────────
const W = {
  groundClearance: 0.30,
  serviceCenters: 0.25,
  fuelInfra: 0.20,
  waitingPeriod: 0.10,
  spareParts: 0.15,
} as const

// ─── Sub-scorers (each returns 0–100) ────────────────────────────────────────

function scoreGroundClearance(mm: number): number {
  if (mm >= 200) return 100
  if (mm >= 185) return 90
  if (mm >= 170) return 75
  if (mm >= 160) return 55
  return 40
}

function scoreServiceCenters(vehicle: Vehicle, zone: LucknowZone): number {
  const count = vehicle.lucknow.serviceCentersByZone[zone] ?? 0
  if (count >= 6) return 100
  if (count >= 5) return 95
  if (count >= 4) return 88
  if (count >= 3) return 75
  if (count >= 2) return 55
  if (count >= 1) return 35
  return 5
}

function scoreFuelInfra(vehicle: Vehicle, zone: LucknowZone): number {
  const { fuelType, lucknow } = vehicle
  if (fuelType === 'electric') {
    // Gomti Nagar has the most EV chargers in Lucknow
    const evScoreByZone: Record<LucknowZone, number> = {
      gomti_nagar: 80,
      alambagh: 45,
      rajajipuram: 30,
      outskirts: 35,
    }
    return evScoreByZone[zone]
  }
  if (fuelType === 'cng' && lucknow.cngFactoryFitted) {
    // CNG widely available but density varies by zone
    const cngScoreByZone: Record<LucknowZone, number> = {
      gomti_nagar: 85,
      alambagh: 82,
      rajajipuram: 72,
      outskirts: 65,
    }
    return cngScoreByZone[zone]
  }
  // Petrol/diesel universally available
  return 70
}

function scoreWaitingPeriod(weeks: number): number {
  if (weeks === 0) return 100
  if (weeks <= 1) return 95
  if (weeks <= 2) return 88
  if (weeks <= 4) return 78
  if (weeks <= 8) return 65
  if (weeks <= 12) return 48
  return 25
}

function scoreSpareParts(availability: SparePartsAvailability): number {
  const map: Record<SparePartsAvailability, number> = {
    excellent: 100,
    good: 75,
    fair: 50,
    poor: 25,
  }
  return map[availability]
}

// ─── Compute full Lucknow Suitability Score ───────────────────────────────────

export function computeLucknowScore(vehicle: Vehicle, zone: LucknowZone): ScoreBreakdown {
  const gc = scoreGroundClearance(vehicle.lucknow.groundClearanceMm)
  const sc = scoreServiceCenters(vehicle, zone)
  const fi = scoreFuelInfra(vehicle, zone)
  const wp = scoreWaitingPeriod(vehicle.lucknow.waitingPeriodWeeks)
  const sp = scoreSpareParts(vehicle.lucknow.sparePartsAvailability)

  const total = Math.round(
    gc * W.groundClearance +
    sc * W.serviceCenters +
    fi * W.fuelInfra +
    wp * W.waitingPeriod +
    sp * W.spareParts,
  )

  return {
    groundClearance: gc,
    serviceCenters: sc,
    fuelInfra: fi,
    waitingPeriod: wp,
    spareParts: sp,
    total,
  }
}

// ─── Filtering ────────────────────────────────────────────────────────────────

function filterByType(profile: WizardProfile): Vehicle[] {
  if (profile.vehicleType === 'all') return VEHICLES
  return VEHICLES.filter((v) => v.category === profile.vehicleType)
}

function filterByBudget(vehicles: Vehicle[], profile: WizardProfile, tolerance = 1.15): Vehicle[] {
  return vehicles.filter((v) => {
    if (profile.budgetType === 'purchase') {
      return v.startingPrice <= profile.budgetAmount * tolerance
    }
    return v.monthlyOwnership <= profile.budgetAmount * tolerance
  })
}

function filterByParking(vehicles: Vehicle[], profile: WizardProfile): Vehicle[] {
  if (profile.parking !== 'basement') return vehicles
  // Tight basement: exclude wide cars (>1800mm) but keep 2-wheelers
  return vehicles.filter((v) => v.category !== 'car' || v.specs.widthMm <= 1800)
}

// ─── Reason generators ────────────────────────────────────────────────────────

function generateWhyItFitsYou(
  vehicle: Vehicle,
  profile: WizardProfile,
  score: ScoreBreakdown,
): string[] {
  const reasons: string[] = []

  // Ground clearance reasoning
  if (score.groundClearance >= 90) {
    reasons.push(
      `${vehicle.lucknow.groundClearanceMm}mm ground clearance — confidently handles Lucknow's worst potholes without underbody scraping`,
    )
  } else if (score.groundClearance >= 75) {
    reasons.push(
      `${vehicle.lucknow.groundClearanceMm}mm ground clearance meets Lucknow's recommended 170mm threshold for pothole-heavy roads`,
    )
  } else {
    reasons.push(
      `${vehicle.lucknow.groundClearanceMm}mm ground clearance adequate for main roads — best avoided in Rajajipuram / Chowk inner lanes`,
    )
  }

  // Service center reasoning (zone-specific)
  const zoneCount = vehicle.lucknow.serviceCentersByZone[profile.zone]
  if (zoneCount >= 4) {
    reasons.push(
      `${zoneCount} authorized ${vehicle.brand} service centers in your zone — maintenance never means a long cross-city drive`,
    )
  } else if (zoneCount >= 2) {
    reasons.push(
      `${zoneCount} authorized ${vehicle.brand} service centers near you — call ahead to book during busy Eid/Diwali periods`,
    )
  } else if (zoneCount === 1) {
    reasons.push(
      `1 authorized ${vehicle.brand} center in your zone; spare parts rated "${vehicle.lucknow.sparePartsAvailability}" locally — routine service is manageable`,
    )
  } else {
    reasons.push(
      `Spare parts availability rated "${vehicle.lucknow.sparePartsAvailability}" in Lucknow — quality multi-brand workshops can service this vehicle`,
    )
  }

  // Top priority match
  const topPriority = profile.priorities[0]
  if (topPriority === 'fuel_economy') {
    const monthlyCost = Math.round((profile.dailyDistance * 26 * 90) / vehicle.specs.mileage)
    reasons.push(
      `${vehicle.specs.mileage} km/l — at ${profile.dailyDistance} km/day, your estimated monthly fuel spend is ₹${monthlyCost.toLocaleString('en-IN')}`,
    )
  } else if (topPriority === 'safety' && vehicle.specs.safetyStars) {
    reasons.push(
      `${vehicle.specs.safetyStars}-star Global NCAP safety rating — independently verified crash protection for your family`,
    )
  } else if (topPriority === 'safety') {
    reasons.push(
      `Standard dual airbags, ABS, and rear parking sensors included — solid safety foundation for urban Lucknow use`,
    )
  } else if (topPriority === 'comfort') {
    const hasAuto = vehicle.specs.hasAutoTransmission
    reasons.push(
      `${vehicle.specs.seatingCapacity}-seat ${vehicle.category}${hasAuto ? ' with available automatic transmission' : ''} — designed for Lucknow's stop-start traffic`,
    )
  } else if (topPriority === 'brand_reputation') {
    reasons.push(
      `${vehicle.brand} ranks among the top-3 most trusted brands in Uttar Pradesh — strong resale confidence`,
    )
  } else if (topPriority === 'resale_value') {
    const highResale = ['Maruti Suzuki', 'Honda', 'Hero', 'TVS']
    if (highResale.includes(vehicle.brand)) {
      reasons.push(
        `${vehicle.brand} vehicles retain 60–65% value at 3 years in Lucknow's active OLX / Cars24 market`,
      )
    } else {
      reasons.push(
        `Strong brand recognition in Lucknow ensures a liquid resale market — easy to sell when upgrading`,
      )
    }
  } else {
    reasons.push(
      `Starting at ₹${(vehicle.startingPrice / 100000).toFixed(2)} lakh — excellent value-for-money in its segment`,
    )
  }

  return reasons.slice(0, 3)
}

// ─── Main recommendation function ─────────────────────────────────────────────

export function getTopRecommendations(profile: WizardProfile): RecommendationResult[] {
  // Stage 1: type filter
  let candidates = filterByType(profile)

  // Stage 2: budget filter (relaxes if too few results)
  let budgetFiltered = filterByBudget(candidates, profile, 1.0)
  if (budgetFiltered.length < 3) budgetFiltered = filterByBudget(candidates, profile, 1.3)
  if (budgetFiltered.length < 3) budgetFiltered = filterByBudget(candidates, profile, 2.0)
  if (budgetFiltered.length < 3) budgetFiltered = candidates // remove budget filter

  // Stage 3: parking filter (only if enough vehicles remain)
  const parkingFiltered = filterByParking(budgetFiltered, profile)
  const finalCandidates = parkingFiltered.length >= 3 ? parkingFiltered : budgetFiltered

  // Stage 4: score all candidates by Lucknow Suitability Score
  const scored = finalCandidates.map((vehicle) => ({
    vehicle,
    lucknowScore: computeLucknowScore(vehicle, profile.zone),
  }))

  // Sort descending by Lucknow score
  scored.sort((a, b) => b.lucknowScore.total - a.lucknowScore.total)

  // Return top 3 with generated reasons
  return scored.slice(0, 3).map((item, idx) => ({
    vehicle: item.vehicle,
    rank: (idx + 1) as 1 | 2 | 3,
    lucknowScore: item.lucknowScore,
    whyItFitsYou: generateWhyItFitsYou(item.vehicle, profile, item.lucknowScore),
    thingsToKnow: [...item.vehicle.lucknow.commonIssues],
  }))
}

// ─── Utility: score label + colour ───────────────────────────────────────────

export function scoreLabel(score: number): string {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Moderate'
  return 'Low'
}

export function scoreColorClass(score: number): string {
  if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200'
  if (score >= 70) return 'text-blue-700 bg-blue-50 border-blue-200'
  if (score >= 55) return 'text-amber-700 bg-amber-50 border-amber-200'
  return 'text-red-700 bg-red-50 border-red-200'
}

export function formatINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount}`
}
