'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  VehicleTypeFilter,
  PrimaryUse,
  LucknowZone,
  ParkingSituation,
  DriverProfile,
  BudgetType,
  Priority,
} from '@/lib/types'

// ─── Profile state ────────────────────────────────────────────────────────────

interface ProfileState {
  vehicleType: VehicleTypeFilter | null
  primaryUse: PrimaryUse | null
  zone: LucknowZone | null
  dailyDistance: number
  parking: ParkingSituation | null
  drivers: DriverProfile[]
  budgetType: BudgetType
  budgetAmount: number
  priorities: Priority[]
}

const INITIAL: ProfileState = {
  vehicleType: null,
  primaryUse: null,
  zone: null,
  dailyDistance: 20,
  parking: null,
  drivers: ['self'],
  budgetType: 'purchase',
  budgetAmount: 800000,
  priorities: [],
}

const TOTAL_STEPS = 8

// ─── Reusable option tile ─────────────────────────────────────────────────────

function OptionTile({
  emoji,
  label,
  description,
  selected,
  onClick,
}: {
  emoji: string
  label: string
  description?: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-150 active:scale-95 ${
        selected
          ? 'border-orange-500 bg-orange-50 shadow-sm'
          : 'border-stone-200 bg-white hover:border-orange-300'
      }`}
    >
      <div className="text-3xl mb-2">{emoji}</div>
      <p className={`font-semibold ${selected ? 'text-orange-900' : 'text-stone-800'}`}>{label}</p>
      {description && (
        <p className={`text-xs mt-0.5 ${selected ? 'text-orange-700' : 'text-stone-500'}`}>
          {description}
        </p>
      )}
      <div className="flex justify-end mt-2">
        <span
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
            selected ? 'border-orange-500 bg-orange-500' : 'border-stone-300'
          }`}
        >
          {selected && <span className="w-2 h-2 rounded-full bg-white block" />}
        </span>
      </div>
    </button>
  )
}

// ─── Step components ──────────────────────────────────────────────────────────

function Step1({
  value,
  onChange,
}: {
  value: VehicleTypeFilter | null
  onChange: (v: VehicleTypeFilter) => void
}) {
  const opts: { id: VehicleTypeFilter; emoji: string; label: string; desc: string }[] = [
    { id: 'car', emoji: '🚗', label: 'Car', desc: 'Hatchback, sedan, SUV' },
    { id: 'motorcycle', emoji: '🏍️', label: 'Motorcycle', desc: 'Bike, cruiser, sport' },
    { id: 'scooty', emoji: '🛵', label: 'Scooty', desc: 'Automatic scooter' },
    { id: 'all', emoji: '✨', label: 'Open to all', desc: 'Show best match' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {opts.map((o) => (
        <OptionTile
          key={o.id}
          emoji={o.emoji}
          label={o.label}
          description={o.desc}
          selected={value === o.id}
          onClick={() => onChange(o.id)}
        />
      ))}
    </div>
  )
}

function Step2({
  value,
  onChange,
}: {
  value: PrimaryUse | null
  onChange: (v: PrimaryUse) => void
}) {
  const opts: { id: PrimaryUse; emoji: string; label: string; desc: string }[] = [
    { id: 'office_daily', emoji: '💼', label: 'Office commute', desc: 'Daily city driving' },
    { id: 'family_trips', emoji: '👨‍👩‍👧‍👦', label: 'Family trips', desc: 'Weekend outings, school runs' },
    { id: 'highway', emoji: '🛣️', label: 'Highway rides', desc: 'Lucknow–Kanpur, long routes' },
    { id: 'all_purpose', emoji: '🌐', label: 'All purpose', desc: 'A bit of everything' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {opts.map((o) => (
        <OptionTile
          key={o.id}
          emoji={o.emoji}
          label={o.label}
          description={o.desc}
          selected={value === o.id}
          onClick={() => onChange(o.id)}
        />
      ))}
    </div>
  )
}

function Step3({
  value,
  onChange,
}: {
  value: LucknowZone | null
  onChange: (v: LucknowZone) => void
}) {
  const opts: { id: LucknowZone; emoji: string; label: string; desc: string }[] = [
    {
      id: 'gomti_nagar',
      emoji: '🏙️',
      label: 'Gomti Nagar / Hazratganj',
      desc: 'Best roads, most EV chargers',
    },
    {
      id: 'alambagh',
      emoji: '🏘️',
      label: 'Alambagh / Aliganj',
      desc: 'Mixed roads, good CNG access',
    },
    {
      id: 'rajajipuram',
      emoji: '🏚️',
      label: 'Rajajipuram / Chowk',
      desc: 'Narrow lanes, needs high clearance',
    },
    {
      id: 'outskirts',
      emoji: '🌾',
      label: 'Outskirts / Highway',
      desc: 'Kanpur Rd, Faizabad Rd, Sitapur Rd',
    },
  ]
  return (
    <div className="flex flex-col gap-3">
      {opts.map((o) => (
        <OptionTile
          key={o.id}
          emoji={o.emoji}
          label={o.label}
          description={o.desc}
          selected={value === o.id}
          onClick={() => onChange(o.id)}
        />
      ))}
    </div>
  )
}

function Step4({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const label =
    value === 0
      ? 'Less than 5 km'
      : value <= 15
      ? 'Short — mostly local errands'
      : value <= 30
      ? 'Moderate — typical office commute'
      : value <= 60
      ? 'High — outer office or multi-stop'
      : 'Very high — near highway use'

  return (
    <div className="space-y-6">
      <div className="text-center">
        <span className="text-5xl font-bold text-orange-600">{value}</span>
        <span className="text-xl text-stone-500 ml-1">km</span>
        <p className="text-sm text-stone-500 mt-1">{label}</p>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full accent-orange-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-stone-400">
        <span>0 km</span>
        <span>50 km</span>
        <span>100 km</span>
      </div>
      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
        <p className="text-xs text-amber-800">
          💡 This affects fuel cost estimates and mileage importance in your recommendation
        </p>
      </div>
    </div>
  )
}

function Step5({
  value,
  onChange,
}: {
  value: ParkingSituation | null
  onChange: (v: ParkingSituation) => void
}) {
  const opts: { id: ParkingSituation; emoji: string; label: string; desc: string }[] = [
    {
      id: 'street',
      emoji: '🌤️',
      label: 'Street / Open',
      desc: 'Parking on road, no size constraints',
    },
    {
      id: 'building',
      emoji: '🏢',
      label: 'Building parking',
      desc: 'Society or office covered parking',
    },
    {
      id: 'basement',
      emoji: '🔲',
      label: 'Tight basement',
      desc: 'Low ceiling, narrow lanes — size matters',
    },
  ]
  return (
    <div className="flex flex-col gap-3">
      {opts.map((o) => (
        <OptionTile
          key={o.id}
          emoji={o.emoji}
          label={o.label}
          description={o.desc}
          selected={value === o.id}
          onClick={() => onChange(o.id)}
        />
      ))}
    </div>
  )
}

function Step6({
  value,
  onChange,
}: {
  value: DriverProfile[]
  onChange: (v: DriverProfile[]) => void
}) {
  const opts: { id: DriverProfile; emoji: string; label: string; desc: string }[] = [
    { id: 'self', emoji: '👤', label: 'Just me', desc: 'Primary daily driver' },
    { id: 'spouse', emoji: '👫', label: 'Spouse also', desc: 'Both partners drive' },
    { id: 'elderly', emoji: '👴', label: 'Elderly parent', desc: 'Needs easy entry / automatic' },
    { id: 'learner', emoji: '🎓', label: 'Kids learning', desc: 'Lighter, forgiving vehicle' },
  ]
  const toggle = (id: DriverProfile) => {
    if (value.includes(id)) {
      const next = value.filter((d) => d !== id)
      onChange(next.length > 0 ? next : [id]) // keep at least one
    } else {
      onChange([...value, id])
    }
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => toggle(o.id)}
          className={`text-left rounded-2xl border-2 p-4 transition-all duration-150 active:scale-95 ${
            value.includes(o.id)
              ? 'border-orange-500 bg-orange-50'
              : 'border-stone-200 bg-white hover:border-orange-300'
          }`}
        >
          <div className="text-3xl mb-2">{o.emoji}</div>
          <p
            className={`font-semibold text-sm ${
              value.includes(o.id) ? 'text-orange-900' : 'text-stone-800'
            }`}
          >
            {o.label}
          </p>
          <p
            className={`text-xs mt-0.5 ${
              value.includes(o.id) ? 'text-orange-700' : 'text-stone-500'
            }`}
          >
            {o.desc}
          </p>
          <div className="flex justify-end mt-2">
            <span
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                value.includes(o.id) ? 'border-orange-500 bg-orange-500' : 'border-stone-300'
              }`}
            >
              {value.includes(o.id) && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

function Step7({
  budgetType,
  budgetAmount,
  onTypeChange,
  onAmountChange,
}: {
  budgetType: BudgetType
  budgetAmount: number
  onTypeChange: (t: BudgetType) => void
  onAmountChange: (a: number) => void
}) {
  const isPurchase = budgetType === 'purchase'
  const min = isPurchase ? 100000 : 5000
  const max = isPurchase ? 3000000 : 100000
  const step = isPurchase ? 50000 : 1000

  const formatAmount = (n: number) => {
    if (isPurchase) {
      return n >= 100000 ? `₹${(n / 100000).toFixed(1)} Lakh` : `₹${(n / 1000).toFixed(0)}K`
    }
    return `₹${n.toLocaleString('en-IN')}/month`
  }

  return (
    <div className="space-y-5">
      {/* Toggle */}
      <div className="flex rounded-xl border-2 border-stone-200 overflow-hidden">
        {(['purchase', 'monthly'] as BudgetType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              onTypeChange(t)
              onAmountChange(t === 'purchase' ? 800000 : 20000)
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              budgetType === t
                ? 'bg-orange-500 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            {t === 'purchase' ? '🏷️ One-time purchase' : '📅 Monthly all-in'}
          </button>
        ))}
      </div>

      {/* Amount display */}
      <div className="text-center py-2">
        <p className="text-4xl font-bold text-orange-600">{formatAmount(budgetAmount)}</p>
        <p className="text-xs text-stone-500 mt-1">
          {isPurchase ? 'on-road price (incl. insurance + registration)' : 'EMI + fuel + maintenance'}
        </p>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={budgetAmount}
        onChange={(e) => onAmountChange(Number(e.target.value))}
        className="w-full h-2 rounded-full accent-orange-500 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-stone-400">
        <span>{formatAmount(min)}</span>
        <span>{formatAmount(Math.round((min + max) / 2))}</span>
        <span>{formatAmount(max)}</span>
      </div>
    </div>
  )
}

const ALL_PRIORITIES: { id: Priority; emoji: string; label: string }[] = [
  { id: 'fuel_economy', emoji: '⛽', label: 'Fuel Economy' },
  { id: 'comfort', emoji: '🛋️', label: 'Comfort' },
  { id: 'safety', emoji: '🛡️', label: 'Safety' },
  { id: 'brand_reputation', emoji: '⭐', label: 'Brand Reputation' },
  { id: 'resale_value', emoji: '💰', label: 'Resale Value' },
]

function Step8({
  priorities,
  onChange,
}: {
  priorities: Priority[]
  onChange: (p: Priority[]) => void
}) {
  const handleClick = (id: Priority) => {
    const idx = priorities.indexOf(id)
    if (idx >= 0) {
      // Remove from ranking (and all after it)
      onChange(priorities.slice(0, idx))
    } else {
      onChange([...priorities, id])
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-500 text-center">
        Tap in order of importance — #1 first
      </p>
      {ALL_PRIORITIES.map((p) => {
        const rank = priorities.indexOf(p.id) + 1
        const isRanked = rank > 0
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => handleClick(p.id)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-150 active:scale-95 ${
              isRanked
                ? 'border-orange-500 bg-orange-50'
                : 'border-stone-200 bg-white hover:border-orange-300'
            }`}
          >
            <span className="text-2xl">{p.emoji}</span>
            <span className={`flex-1 font-semibold text-left ${isRanked ? 'text-orange-900' : 'text-stone-700'}`}>
              {p.label}
            </span>
            <span
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                isRanked
                  ? 'bg-orange-500 text-white'
                  : 'bg-stone-100 text-stone-400'
              }`}
            >
              {isRanked ? rank : '—'}
            </span>
          </button>
        )
      })}
      {priorities.length > 0 && priorities.length < 5 && (
        <p className="text-xs text-center text-amber-700 mt-1">
          {5 - priorities.length} more to rank
        </p>
      )}
      {priorities.length === 5 && (
        <p className="text-xs text-center text-emerald-700 mt-1 font-medium">
          ✓ All priorities ranked — tap Continue
        </p>
      )}
    </div>
  )
}

// ─── Step metadata ────────────────────────────────────────────────────────────

const STEP_META: { title: string; subtitle: string }[] = [
  { title: 'What type of vehicle?', subtitle: "Or stay open — we'll find the best fit" },
  { title: 'How will you use it?', subtitle: 'Your primary use shapes the entire recommendation' },
  { title: 'Which area of Lucknow?', subtitle: 'Service centers and road quality vary significantly' },
  { title: 'Daily driving distance?', subtitle: 'This determines how critical mileage is for you' },
  { title: 'Parking situation?', subtitle: 'Size and turning radius matter for your space' },
  { title: 'Who drives in your family?', subtitle: 'Select all that apply' },
  { title: "What's your budget?", subtitle: "We'll match vehicles you can actually buy or afford monthly" },
  { title: 'What matters most?', subtitle: 'Rank all 5 from highest to lowest priority' },
]

// ─── Main wizard page ─────────────────────────────────────────────────────────

export default function RecommendPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<ProfileState>(INITIAL)

  const update = <K extends keyof ProfileState>(key: K, val: ProfileState[K]) =>
    setProfile((p) => ({ ...p, [key]: val }))

  const canProceed = () => {
    switch (step) {
      case 1: return profile.vehicleType !== null
      case 2: return profile.primaryUse !== null
      case 3: return profile.zone !== null
      case 4: return true
      case 5: return profile.parking !== null
      case 6: return profile.drivers.length > 0
      case 7: return profile.budgetAmount > 0
      case 8: return profile.priorities.length === 5
      default: return false
    }
  }

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    } else {
      // Save and navigate to results
      const complete = {
        vehicleType: profile.vehicleType ?? 'all',
        primaryUse: profile.primaryUse ?? 'all_purpose',
        zone: profile.zone ?? 'gomti_nagar',
        dailyDistance: profile.dailyDistance,
        parking: profile.parking ?? 'street',
        drivers: profile.drivers,
        budgetType: profile.budgetType,
        budgetAmount: profile.budgetAmount,
        priorities: profile.priorities,
      }
      sessionStorage.setItem('sg_wizard_profile', JSON.stringify(complete))
      router.push('/recommend/results')
    }
  }

  const meta = STEP_META[step - 1]

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1 value={profile.vehicleType} onChange={(v) => update('vehicleType', v)} />
      case 2:
        return <Step2 value={profile.primaryUse} onChange={(v) => update('primaryUse', v)} />
      case 3:
        return <Step3 value={profile.zone} onChange={(v) => update('zone', v)} />
      case 4:
        return <Step4 value={profile.dailyDistance} onChange={(v) => update('dailyDistance', v)} />
      case 5:
        return <Step5 value={profile.parking} onChange={(v) => update('parking', v)} />
      case 6:
        return <Step6 value={profile.drivers} onChange={(v) => update('drivers', v)} />
      case 7:
        return (
          <Step7
            budgetType={profile.budgetType}
            budgetAmount={profile.budgetAmount}
            onTypeChange={(t) => update('budgetType', t)}
            onAmountChange={(a) => update('budgetAmount', a)}
          />
        )
      case 8:
        return (
          <Step8 priorities={profile.priorities} onChange={(p) => update('priorities', p)} />
        )
      default:
        return null
    }
  }

  const progressPct = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <span className="text-lg font-bold text-orange-600">SahiGaadi</span>
          <span className="text-stone-300">|</span>
          <span className="text-sm text-stone-500">Lucknow Vehicle Finder</span>
        </div>
      </header>

      {/* Progress bar */}
      <div className="bg-white px-4 pt-1 pb-3 border-b border-stone-100">
        <div className="max-w-lg mx-auto">
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-lg mx-auto">
          {/* Step title */}
          <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-stone-900">{meta.title}</h1>
            <p className="text-sm text-stone-500 mt-1">{meta.subtitle}</p>
          </div>

          {/* Step body */}
          <div key={step} className="animate-slide-in">
            {renderStep()}
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="bg-white border-t border-stone-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3 rounded-xl border-2 border-stone-300 text-stone-600 font-semibold hover:bg-stone-50 transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {step === TOTAL_STEPS ? 'Find My Vehicle →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
