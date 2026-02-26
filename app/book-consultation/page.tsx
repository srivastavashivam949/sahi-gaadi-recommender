'use client'

import { useState, Suspense } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ConsultationContent() {
  const searchParams = useSearchParams()
  const isFromRecommendation = searchParams.get('type') === 'recommendation'

  const [form, setForm] = useState({
    name: '',
    phone: '',
    preferredTime: 'morning',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center max-w-sm w-full shadow-sm">
          <p className="text-5xl mb-4">checkmark</p>
          <h2 className="text-xl font-bold text-stone-800">Booking received!</h2>
          <p className="text-sm text-stone-600 mt-2">
            Our Lucknow consultant will call you at{' '}
            <span className="font-bold text-stone-800">{form.phone}</span> within 2 working hours
            to confirm your slot.
          </p>
          <p className="text-xs text-stone-400 mt-4">
            Payment link will be shared on WhatsApp once your slot is confirmed.
          </p>
          <Link
            href="/recommend/results"
            className="inline-block mt-5 text-sm text-orange-600 hover:underline"
          >
            Back to your vehicle results
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-lg font-bold text-orange-600">SahiGaadi</span>
          {isFromRecommendation && (
            <Link href="/recommend/results" className="text-xs text-orange-600 hover:underline">
              Your results
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Hero section */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-white">
          <p className="text-4xl mb-3">🎯</p>
          <h1 className="text-2xl font-bold leading-tight">
            One clear recommendation. No confusion.
          </h1>
          <p className="text-orange-100 text-sm mt-2 leading-relaxed">
            Our Lucknow-based consultant reviews your shortlist, asks 5 targeted questions, and
            tells you exactly which vehicle to buy in a focused 45-minute call.
          </p>
          <div className="mt-4 bg-white/20 rounded-xl p-3">
            <p className="font-bold text-white">Rs. 499 flat</p>
            <p className="text-xs text-orange-100 mt-0.5">
              100% money-back if you are not satisfied with the advice
            </p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { emoji: '🏙️', label: 'Lucknow local', desc: 'Our consultant lives and drives here' },
            { emoji: '🔄', label: 'Money-back', desc: 'No questions asked refund policy' },
            { emoji: '⏱️', label: '45 minutes', desc: 'Focused, no-fluff advice session' },
          ].map((t) => (
            <div key={t.label} className="bg-white rounded-xl border border-stone-200 p-3 text-center">
              <p className="text-2xl">{t.emoji}</p>
              <p className="text-xs font-bold text-stone-800 mt-1">{t.label}</p>
              <p className="text-[10px] text-stone-500 mt-0.5">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* What we cover */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
          <h2 className="font-bold text-stone-800 mb-3">What we cover in the call</h2>
          <ul className="space-y-2">
            {[
              'Review your shortlist and filter out the wrong options',
              'Lucknow-specific dealer negotiation tips (which dealers to avoid)',
              'Insurance: which add-ons are worth it for Lucknow roads',
              'Test drive checklist — what to look for on local roads',
              'Final verdict: one vehicle, one variant, one colour recommendation',
            ].map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-stone-700">
                <span className="text-emerald-500 shrink-0 mt-0.5">+</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Booking form */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h2 className="font-bold text-stone-800 mb-4">Book your consultation</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                Your name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ramesh Kumar"
                className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                WhatsApp / phone number
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                Preferred call time
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'morning', label: 'Morning', sub: '9 AM - 12 PM' },
                  { id: 'afternoon', label: 'Afternoon', sub: '12 PM - 4 PM' },
                  { id: 'evening', label: 'Evening', sub: '4 PM - 7 PM' },
                ].map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, preferredTime: slot.id }))}
                    className={`rounded-xl border-2 py-2 px-1 text-center transition-all ${
                      form.preferredTime === slot.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <p className="text-sm font-medium text-stone-800">{slot.label}</p>
                    <p className="text-[10px] text-stone-500">{slot.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                Anything specific to discuss? (optional)
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. torn between Brezza and Nexon, also considering a used car..."
                className="w-full border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-colors text-sm"
            >
              Book consultation — Rs. 499
            </button>

            <p className="text-[10px] text-stone-400 text-center">
              Payment via UPI or card will be collected after your slot is confirmed. No spam, no
              broker calls.
            </p>
          </form>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm space-y-3">
          <h2 className="font-bold text-stone-800">Quick FAQs</h2>
          {[
            {
              q: 'Is the consultant actually from Lucknow?',
              a: 'Yes — our consultant has lived in Gomti Nagar for 10+ years and has personally test-driven vehicles at Lucknow dealerships.',
            },
            {
              q: 'What if I am not happy with the advice?',
              a: 'Email us within 48 hours of the call and we refund the full Rs. 499, no questions asked.',
            },
            {
              q: 'Can I share my SahiGaadi recommendation shortlist?',
              a: 'Yes — just screenshot your results page and share it on WhatsApp before the call.',
            },
          ].map((faq, i) => (
            <div key={i}>
              <p className="text-sm font-semibold text-stone-800">{faq.q}</p>
              <p className="text-sm text-stone-600 mt-0.5">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center pb-6">
          <Link href="/recommend" className="text-sm text-stone-400 hover:text-orange-600 underline">
            Go back to vehicle finder
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function BookConsultationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-orange-50 flex items-center justify-center">
          <p className="text-stone-500">Loading...</p>
        </div>
      }
    >
      <ConsultationContent />
    </Suspense>
  )
}
