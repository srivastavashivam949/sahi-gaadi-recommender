'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { WizardProfile, Vehicle, ScoreBreakdown } from '@/lib/types'
import { getVehicleById } from '@/lib/vehicleDatabase'
import { computeLucknowScore, scoreColorClass, scoreLabel, formatINR } from '@/lib/recommendationEngine'

// ─── Score breakdown bar ──────────────────────────────────────────────────────

function MiniBar({ score, max = 100 }: { score: number; max?: number }) {
  const pct = Math.round((score / max) * 100)
  const color =
    score >= 85 ? 'bg-emerald-500' : score >= 65 ? 'bg-blue-500' : score >= 45 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

// ─── Comparison row ───────────────────────────────────────────────────────────

function CompareRow({
  label,
  v1,
  v2,
  rawV1,
  rawV2,
  higherIsBetter,
  lowerIsBetter,
}: {
  label: string
  v1: string
  v2: string
  rawV1?: number
  rawV2?: number
  higherIsBetter?: boolean
  lowerIsBetter?: boolean
}) {
  let winV1 = false
  let winV2 = false
  if (rawV1 !== undefined && rawV2 !== undefined && rawV1 !== rawV2) {
    if (higherIsBetter) {
      winV1 = rawV1 > rawV2
      winV2 = rawV2 > rawV1
    } else if (lowerIsBetter) {
      winV1 = rawV1 < rawV2
      winV2 = rawV2 < rawV1
    }
  }

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-3 px-4 border-b border-stone-100 last:border-0">
      <div
        className={`text-sm font-medium text-right ${
          winV1 ? 'text-emerald-700 font-bold' : 'text-stone-700'
        }`}
      >
        {v1}
        {winV1 && <span className="ml-1">✓</span>}
      </div>
      <div className="text-xs text-stone-400 text-center w-28 shrink-0 font-medium">{label}</div>
      <div
        className={`text-sm font-medium ${
          winV2 ? 'text-emerald-700 font-bold' : 'text-stone-700'
        }`}
      >
        {winV2 && <span className="mr-1">✓</span>}
        {v2}
      </div>
    </div>
  )
}

// ─── Score breakdown comparison ───────────────────────────────────────────────

function ScoreComparison({
  s1,
  s2,
  label,
}: {
  s1: number
  s2: number
  label: string
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-2">
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-stone-600 font-semibold">{s1}</span>
        <MiniBar score={s1} />
      </div>
      <span className="text-[10px] text-stone-400 text-center w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-2">
        <MiniBar score={s2} />
        <span className="text-xs text-stone-600 font-semibold">{s2}</span>
      </div>
    </div>
  )
}

// ─── Compare page ─────────────────────────────────────────────────────────────

export default function ComparePage() {
  const params = useParams<{ vehicle1: string; vehicle2: string }>()
  const [v1, setV1] = useState<Vehicle | null>(null)
  const [v2, setV2] = useState<Vehicle | null>(null)
  const [s1, setS1] = useState<ScoreBreakdown | null>(null)
  const [s2, setS2] = useState<ScoreBreakdown | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const vehicle1 = getVehicleById(params.vehicle1)
    const vehicle2 = getVehicleById(params.vehicle2)

    if (!vehicle1 || !vehicle2) {
      setNotFound(true)
      return
    }

    setV1(vehicle1)
    setV2(vehicle2)

    // Try to get zone from saved profile for zone-aware scoring
    try {
      const raw = sessionStorage.getItem('sg_wizard_profile')
      const profile = raw ? (JSON.parse(raw) as WizardProfile) : null
      const zone = profile?.zone ?? 'gomti_nagar'
      setS1(computeLucknowScore(vehicle1, zone))
      setS2(computeLucknowScore(vehicle2, zone))
    } catch {
      setS1(computeLucknowScore(vehicle1, 'gomti_nagar'))
      setS2(computeLucknowScore(vehicle2, 'gomti_nagar'))
    }
  }, [params.vehicle1, params.vehicle2])

  if (notFound) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-4xl">🔍</p>
        <p className="text-stone-600">Vehicle not found in our database.</p>
        <Link href="/recommend/results" className="text-orange-600 underline text-sm">
          ← Back to results
        </Link>
      </div>
    )
  }

  if (!v1 || !v2 || !s1 || !s2) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <p className="text-stone-500 animate-pulse">Loading comparison…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <span className="text-lg font-bold text-orange-600">SahiGaadi</span>
          <Link href="/recommend/results" className="text-xs text-orange-600 hover:underline">
            ← All results
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Vehicle headers */}
        <div className="grid grid-cols-2 gap-3">
          {[{ v: v1, s: s1 }, { v: v2, s: s2 }].map(({ v, s }) => (
            <div
              key={v.id}
              className={`rounded-2xl bg-gradient-to-br ${v.imageGradient} p-4 text-white`}
            >
              <p className="text-3xl">{v.imageEmoji}</p>
              <p className="font-bold text-sm mt-2 leading-tight">{v.name}</p>
              <div className={`mt-2 inline-block rounded-lg px-2 py-1 text-xs font-bold border-2 ${scoreColorClass(s.total)}`}>
                {s.total}/100 {scoreLabel(s.total)}
              </div>
            </div>
          ))}
        </div>

        {/* Lucknow Score breakdown */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
            Lucknow Suitability Score breakdown
          </h2>
          <ScoreComparison s1={s1.groundClearance} s2={s2.groundClearance} label="Ground clearance" />
          <ScoreComparison s1={s1.serviceCenters} s2={s2.serviceCenters} label="Service centres" />
          <ScoreComparison s1={s1.fuelInfra} s2={s2.fuelInfra} label="Fuel infra" />
          <ScoreComparison s1={s1.waitingPeriod} s2={s2.waitingPeriod} label="Waiting period" />
          <ScoreComparison s1={s1.spareParts} s2={s2.spareParts} label="Spare parts" />

          {/* Total score row */}
          <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-3 text-center">
            <span className={`text-lg font-bold ${s1.total >= s2.total ? 'text-emerald-600' : 'text-stone-600'}`}>
              {s1.total}
            </span>
            <span className="text-xs text-stone-400 self-center font-semibold">Total score</span>
            <span className={`text-lg font-bold ${s2.total >= s1.total ? 'text-emerald-600' : 'text-stone-600'}`}>
              {s2.total}
            </span>
          </div>
        </div>

        {/* Specs comparison */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="bg-stone-50 border-b border-stone-200 px-4 py-3">
            <h2 className="font-bold text-stone-800 text-sm">Detailed spec comparison</h2>
          </div>
          <div className="divide-y divide-stone-50">
            <CompareRow
              label="Starting price"
              v1={formatINR(v1.startingPrice)}
              v2={formatINR(v2.startingPrice)}
              rawV1={v1.startingPrice}
              rawV2={v2.startingPrice}
              lowerIsBetter
            />
            <CompareRow
              label="Monthly cost"
              v1={`${formatINR(v1.monthlyOwnership)}/mo`}
              v2={`${formatINR(v2.monthlyOwnership)}/mo`}
              rawV1={v1.monthlyOwnership}
              rawV2={v2.monthlyOwnership}
              lowerIsBetter
            />
            <CompareRow
              label="Fuel type"
              v1={v1.fuelType.toUpperCase()}
              v2={v2.fuelType.toUpperCase()}
            />
            <CompareRow
              label="Mileage (ARAI)"
              v1={`${v1.specs.mileage} km/l`}
              v2={`${v2.specs.mileage} km/l`}
              rawV1={v1.specs.mileage}
              rawV2={v2.specs.mileage}
              higherIsBetter
            />
            <CompareRow
              label="Ground clearance"
              v1={`${v1.lucknow.groundClearanceMm}mm`}
              v2={`${v2.lucknow.groundClearanceMm}mm`}
              rawV1={v1.lucknow.groundClearanceMm}
              rawV2={v2.lucknow.groundClearanceMm}
              higherIsBetter
            />
            <CompareRow
              label="Seating"
              v1={`${v1.specs.seatingCapacity} seats`}
              v2={`${v2.specs.seatingCapacity} seats`}
              rawV1={v1.specs.seatingCapacity}
              rawV2={v2.specs.seatingCapacity}
              higherIsBetter
            />
            <CompareRow
              label="Boot space"
              v1={v1.specs.bootSpaceLitres > 0 ? `${v1.specs.bootSpaceLitres}L` : 'N/A'}
              v2={v2.specs.bootSpaceLitres > 0 ? `${v2.specs.bootSpaceLitres}L` : 'N/A'}
              rawV1={v1.specs.bootSpaceLitres}
              rawV2={v2.specs.bootSpaceLitres}
              higherIsBetter
            />
            <CompareRow
              label="Auto transmission"
              v1={v1.specs.hasAutoTransmission ? '✓ Available' : '✗ Manual only'}
              v2={v2.specs.hasAutoTransmission ? '✓ Available' : '✗ Manual only'}
            />
            <CompareRow
              label="Safety (NCAP)"
              v1={v1.specs.safetyStars ? `${v1.specs.safetyStars} ★` : 'Untested'}
              v2={v2.specs.safetyStars ? `${v2.specs.safetyStars} ★` : 'Untested'}
              rawV1={v1.specs.safetyStars ?? 0}
              rawV2={v2.specs.safetyStars ?? 0}
              higherIsBetter
            />
            <CompareRow
              label="Service centres"
              v1={`${v1.lucknow.serviceCentersTotal} in city`}
              v2={`${v2.lucknow.serviceCentersTotal} in city`}
              rawV1={v1.lucknow.serviceCentersTotal}
              rawV2={v2.lucknow.serviceCentersTotal}
              higherIsBetter
            />
            <CompareRow
              label="Waiting period"
              v1={v1.lucknow.waitingPeriodWeeks === 0 ? 'In stock' : `${v1.lucknow.waitingPeriodWeeks} weeks`}
              v2={v2.lucknow.waitingPeriodWeeks === 0 ? 'In stock' : `${v2.lucknow.waitingPeriodWeeks} weeks`}
              rawV1={v1.lucknow.waitingPeriodWeeks}
              rawV2={v2.lucknow.waitingPeriodWeeks}
              lowerIsBetter
            />
            <CompareRow
              label="Spare parts"
              v1={v1.lucknow.sparePartsAvailability}
              v2={v2.lucknow.sparePartsAvailability}
            />
          </div>
        </div>

        {/* Honest cons side by side */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4">
          <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
            Lucknow-specific considerations
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[{ v: v1 }, { v: v2 }].map(({ v }) => (
              <div key={v.id}>
                <p className="text-xs font-bold text-stone-700 mb-2">{v.name.split(' ').slice(-2).join(' ')}</p>
                <ul className="space-y-2">
                  {v.lucknow.commonIssues.map((issue, i) => (
                    <li key={i} className="text-xs text-stone-600 flex gap-1.5">
                      <span className="text-amber-500 shrink-0 mt-0.5">⚠</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-orange-500 rounded-2xl p-5 text-white text-center space-y-2">
          <p className="font-bold">Not sure which one to choose?</p>
          <p className="text-sm text-orange-100">
            A 45-min consultant call for ₹499 gives you a single clear answer.
          </p>
          <Link
            href="/book-consultation?type=recommendation"
            className="inline-block mt-1 bg-white text-orange-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-orange-50 transition-colors"
          >
            Book consultation →
          </Link>
        </div>

        <div className="text-center pb-4">
          <Link href="/recommend/results" className="text-sm text-stone-400 hover:text-orange-600 underline">
            ← Back to all results
          </Link>
        </div>
      </div>
    </div>
  )
}
