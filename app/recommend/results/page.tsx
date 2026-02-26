'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { WizardProfile, RecommendationResult } from '@/lib/types'
import { getTopRecommendations, scoreColorClass, scoreLabel, formatINR } from '@/lib/recommendationEngine'

// ─── Score badge ──────────────────────────────────────────────────────────────

function LucknowScoreBadge({ score }: { score: number }) {
  const colorClass = scoreColorClass(score)
  const label = scoreLabel(score)
  return (
    <div
      className={`inline-flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 font-bold ${colorClass}`}
    >
      <span className="text-2xl leading-none">{score}</span>
      <span className="text-[10px] leading-tight font-medium text-center mt-0.5">{label}</span>
      <span className="text-[9px] opacity-60 text-center">Lucknow Score</span>
    </div>
  )
}

// ─── Score breakdown bar ──────────────────────────────────────────────────────

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 85 ? 'bg-emerald-500' : score >= 65 ? 'bg-blue-500' : score >= 45 ? 'bg-amber-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-stone-600 w-8 text-right">{score}</span>
    </div>
  )
}

// ─── Vehicle result card ──────────────────────────────────────────────────────

function VehicleCard({
  result,
  allResults,
}: {
  result: RecommendationResult
  allResults: RecommendationResult[]
}) {
  const { vehicle, lucknowScore, whyItFitsYou, thingsToKnow, rank } = result
  const [expanded, setExpanded] = useState(false)

  const rankLabel = rank === 1 ? '🥇 Best match' : rank === 2 ? '🥈 Runner-up' : '🥉 Also consider'

  const others = allResults.filter((r) => r.vehicle.id !== vehicle.id)

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm animate-fade-in">
      {/* Vehicle header */}
      <div className={`bg-gradient-to-r ${vehicle.imageGradient} p-5 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">{rankLabel}</span>
            <p className="text-4xl mt-3">{vehicle.imageEmoji}</p>
            <h2 className="text-xl font-bold mt-1">{vehicle.name}</h2>
            <p className="text-sm text-white/80">
              {vehicle.fuelType.toUpperCase()} · {vehicle.specs.mileage} km/l ·{' '}
              {formatINR(vehicle.startingPrice)} starting
            </p>
          </div>
          <LucknowScoreBadge score={lucknowScore.total} />
        </div>
      </div>

      {/* Why it fits you */}
      <div className="px-5 py-4">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
          Why this fits you
        </h3>
        <ul className="space-y-2">
          {whyItFitsYou.map((reason, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
              <span className="text-sm text-stone-700">{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Things to know (honest cons) */}
      <div className="px-5 pb-4">
        <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
          Things to know
        </h3>
        <ul className="space-y-2">
          {thingsToKnow.map((con, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
              <span className="text-sm text-stone-600">{con}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lucknow Score breakdown (expandable) */}
      <div className="border-t border-stone-100">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-stone-500 hover:bg-stone-50 transition-colors"
        >
          <span>Lucknow Score breakdown</span>
          <span>{expanded ? '▲' : '▼'}</span>
        </button>
        {expanded && (
          <div className="px-5 pb-4 space-y-2">
            <ScoreBar label="Ground clearance" score={lucknowScore.groundClearance} />
            <ScoreBar label="Service centres" score={lucknowScore.serviceCenters} />
            <ScoreBar label="Fuel infra" score={lucknowScore.fuelInfra} />
            <ScoreBar label="Waiting period" score={lucknowScore.waitingPeriod} />
            <ScoreBar label="Spare parts" score={lucknowScore.spareParts} />
          </div>
        )}
      </div>

      {/* Compare CTA */}
      {others.length > 0 && (
        <div className="border-t border-stone-100 px-5 py-3 flex gap-2 flex-wrap">
          {others.map((other) => (
            <Link
              key={other.vehicle.id}
              href={`/recommend/compare/${vehicle.id}/${other.vehicle.id}`}
              className="text-xs px-3 py-1.5 rounded-full border border-orange-300 text-orange-600 hover:bg-orange-50 transition-colors font-medium"
            >
              Compare with {other.vehicle.name.split(' ').slice(-1)[0]}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Comparison table (all 3 side by side) ───────────────────────────────────

function ComparisonTable({ results }: { results: RecommendationResult[] }) {
  const rows: { label: string; getValue: (r: RecommendationResult) => string }[] = [
    { label: 'Starting price', getValue: (r) => formatINR(r.vehicle.startingPrice) },
    { label: 'Est. monthly cost', getValue: (r) => `${formatINR(r.vehicle.monthlyOwnership)}/mo` },
    { label: 'Fuel type', getValue: (r) => r.vehicle.fuelType.toUpperCase() },
    { label: 'Mileage (ARAI)', getValue: (r) => `${r.vehicle.specs.mileage} km/l` },
    { label: 'Ground clearance', getValue: (r) => `${r.vehicle.lucknow.groundClearanceMm}mm` },
    { label: 'Seating', getValue: (r) => `${r.vehicle.specs.seatingCapacity} seats` },
    { label: 'Boot space', getValue: (r) => r.vehicle.specs.bootSpaceLitres > 0 ? `${r.vehicle.specs.bootSpaceLitres}L` : 'N/A' },
    { label: 'Safety (NCAP)', getValue: (r) => r.vehicle.specs.safetyStars ? `${r.vehicle.specs.safetyStars}★` : 'Untested' },
    { label: 'Service centres', getValue: (r) => `${r.vehicle.lucknow.serviceCentersTotal} in Lucknow` },
    { label: 'Waiting period', getValue: (r) => r.vehicle.lucknow.waitingPeriodWeeks === 0 ? 'In stock' : `${r.vehicle.lucknow.waitingPeriodWeeks} weeks` },
    { label: 'Spare parts', getValue: (r) => r.vehicle.lucknow.sparePartsAvailability },
    { label: 'Lucknow Score', getValue: (r) => `${r.lucknowScore.total} / 100` },
  ]

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      <div className="bg-stone-50 border-b border-stone-200 p-4">
        <h2 className="font-bold text-stone-800">Side-by-side comparison</h2>
        <p className="text-xs text-stone-500 mt-0.5">Your top 3 matched vehicles</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left px-4 py-3 text-stone-400 font-medium text-xs w-36">Spec</th>
              {results.map((r) => (
                <th key={r.vehicle.id} className="px-3 py-3 text-center">
                  <p className="text-sm font-bold text-stone-800 leading-tight">
                    {r.vehicle.brand.split(' ').pop()}{' '}
                    {r.vehicle.name.split(' ').slice(-2).join(' ')}
                  </p>
                  <p className="text-xs text-stone-400">{r.vehicle.imageEmoji}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {rows.map((row) => (
              <tr key={row.label} className="hover:bg-stone-50/50">
                <td className="px-4 py-2.5 text-xs text-stone-500 font-medium">{row.label}</td>
                {results.map((r) => (
                  <td key={r.vehicle.id} className="px-3 py-2.5 text-center text-stone-800 font-medium text-xs">
                    {row.getValue(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Results page ─────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const [results, setResults] = useState<RecommendationResult[] | null>(null)
  const [noProfile, setNoProfile] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('sg_wizard_profile')
      if (!raw) {
        setNoProfile(true)
        return
      }
      const profile = JSON.parse(raw) as WizardProfile
      const top3 = getTopRecommendations(profile)
      setResults(top3)
    } catch {
      setNoProfile(true)
    }
  }, [])

  // Loading
  if (results === null && !noProfile) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-4xl animate-bounce">🔍</p>
            <p className="text-stone-600 font-medium">Matching vehicles to your Lucknow life…</p>
          </div>
        </div>
      </div>
    )
  }

  // No profile in session
  if (noProfile) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4">
          <p className="text-4xl">🤔</p>
          <p className="text-stone-700 font-medium text-center">
            We don't have your answers yet.
          </p>
          <Link
            href="/recommend"
            className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Start the questionnaire →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      <Header />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {/* Page title */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-stone-900">Your Lucknow-matched vehicles</h1>
          <p className="text-sm text-stone-500 mt-1">
            Scored on ground clearance, service centres, fuel access, waiting period, and spare
            parts — all specific to Lucknow.
          </p>
        </div>

        {/* Vehicle cards */}
        {results!.map((r) => (
          <VehicleCard key={r.vehicle.id} result={r} allResults={results!} />
        ))}

        {/* Comparison table */}
        {results!.length >= 2 && <ComparisonTable results={results!} />}

        {/* Consultation CTA */}
        <div className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm">
          <div className="flex gap-3 items-start">
            <span className="text-3xl">🎯</span>
            <div>
              <h3 className="font-bold text-stone-800">Still deciding?</h3>
              <p className="text-sm text-stone-600 mt-1">
                Our Lucknow consultant reviews your shortlist in a 45-minute call and gives you{' '}
                <strong>one clear recommendation</strong> — ₹499. Money-back if you're not
                satisfied.
              </p>
              <Link
                href="/book-consultation?type=recommendation"
                className="inline-block mt-3 bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors"
              >
                Book ₹499 consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Restart */}
        <div className="text-center pb-4">
          <Link href="/recommend" className="text-sm text-stone-400 hover:text-orange-600 transition-colors underline">
            ← Start over with different preferences
          </Link>
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header className="bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-10">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-600">SahiGaadi</span>
          <span className="text-stone-300">|</span>
          <span className="text-sm text-stone-500">Your results</span>
        </div>
        <Link href="/recommend" className="text-xs text-orange-600 hover:underline">
          Retake →
        </Link>
      </div>
    </header>
  )
}
