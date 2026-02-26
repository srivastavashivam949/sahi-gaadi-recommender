# SahiGaadi Recommender

A hyper-local vehicle recommender built for Lucknow buyers. Unlike generic national comparison sites (CarDekho, CarWale), SahiGaadi factors in ground clearance for Lucknow's pothole-heavy roads, authorized service centre presence by city zone, CNG/EV infrastructure availability, current dealer waiting periods, and local spare parts availability — the things a knowledgeable friend would actually tell you.

---

## Features

### 8-Step Questionnaire Wizard (`/recommend`)

A mobile-first, card-swipe style wizard that collects:

1. **Vehicle type** — Car / Motorcycle / Scooty / Open to all
2. **Primary use** — Office commute / Family trips / Highway / All-purpose
3. **Lucknow zone** — Gomti Nagar–Hazratganj / Alambagh–Aliganj / Rajajipuram–Chowk / Outskirts–Highway
4. **Daily distance** — Slider from 0–100 km (drives mileage importance)
5. **Parking situation** — Street / Building / Tight basement (drives size constraints)
6. **Drivers in family** — Multi-select: self / spouse / elderly parent / kids learning
7. **Budget** — Toggle between one-time purchase or monthly all-in, with a range slider
8. **Priority ranking** — Tap-to-rank: fuel economy / comfort / safety / brand reputation / resale value

Answers are persisted in `sessionStorage` and passed to the results page.

### Recommendation Engine (`lib/recommendationEngine.ts`)

Filters vehicles by type, budget, and parking constraints, then ranks by a **Lucknow Suitability Score**:

| Factor | Weight | How it's scored |
|--------|--------|-----------------|
| Ground clearance | 30% | ≥200mm → 100, ≥185mm → 90, ≥170mm → 75, ≥160mm → 55, <160mm → 40 |
| Service centres | 25% | Zone-specific count from the vehicle database (0 → 5, 6+ → 100) |
| Fuel infrastructure | 20% | EV scored by zone EV charger count; CNG by zone CNG station count; petrol/diesel flat 70 |
| Waiting period | 10% | In stock → 100; 1 week → 95; 2 weeks → 88; ≤4 weeks → 78; ≤8 weeks → 65; ≤12 weeks → 48 |
| Spare parts | 15% | Excellent → 100; Good → 75; Fair → 50; Poor → 25 |

### Results Page (`/recommend/results`)

- Top 3 vehicle cards with gradient headers, starting price, and the Lucknow Suitability Score badge
- **"Why this fits you"** — 3 personalized bullets generated from the user's answers (zone-specific service centre count, ground clearance narrative, top priority match)
- **"Things to know"** — 2 curated honest cons from the vehicle database (e.g. "No authorized service center east of Gomti river — 15km drive for Rajajipuram residents")
- Expandable score breakdown (bar chart of all 5 sub-scores)
- Side-by-side comparison table for all 3 vehicles
- "Compare with X" links on each card

### Deep Comparison Page (`/recommend/compare/[vehicle1]/[vehicle2]`)

- Side-by-side Lucknow Score breakdown with horizontal bars
- Full spec comparison table with winner highlighting (green checkmark on the better value for each row)
- Lucknow-specific honest cons displayed side by side

### Book Consultation (`/book-consultation`)

- Linked from results and compare pages with `?type=recommendation`
- ₹499 flat-rate booking for a 45-minute consultant call
- Form: name, phone, preferred time slot, optional notes
- FAQ section and trust signals

---

## Vehicle Database (`lib/vehicleDatabase.ts`)

13 vehicles curated for the Lucknow market, each with:

- Standard specs: mileage, engine CC, seating, boot space, dimensions, NCAP stars
- Lucknow-specific context:
  - `groundClearanceMm` — critical for road suitability
  - `serviceCentersTotal` + `serviceCentersByZone` — zone-aware service access
  - `cngFactoryFitted` — only factory CNG counts (aftermarket voids warranty)
  - `waitingPeriodWeeks` — current Lucknow dealer lead time
  - `sparePartsAvailability` — excellent / good / fair / poor
  - `commonIssues` — exactly 2 honest, Lucknow-specific cons

**Vehicles included:**

| Vehicle | Category | Fuel |
|---------|----------|------|
| Maruti Suzuki Alto K10 | Car | Petrol / CNG |
| Maruti Suzuki Swift | Car | Petrol |
| Maruti Suzuki WagonR CNG | Car | CNG |
| Maruti Suzuki Ertiga | Car | Petrol / CNG |
| Maruti Suzuki Brezza | Car | Petrol |
| Tata Nexon | Car | Petrol |
| Hyundai Creta | Car | Petrol |
| Honda City 5th Gen | Car | Petrol |
| Hero Splendor Plus | Motorcycle | Petrol |
| Royal Enfield Meteor 350 | Motorcycle | Petrol |
| TVS Apache RTR 160 4V | Motorcycle | Petrol |
| Honda Activa 125 H-Smart | Scooty | Petrol |
| TVS Jupiter Classic | Scooty | Petrol |

The database is intended to be **manually curated and updated quarterly**. To add a vehicle, add an entry to the `VEHICLES` array in `lib/vehicleDatabase.ts` following the `Vehicle` type defined in `lib/types.ts`.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **State:** React `useState` + `sessionStorage` (no external state library)
- **Data:** Static TypeScript arrays (no database, no API calls)
- **Fonts:** Inter (Google Fonts via `next/font`)

---

## How to Run

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/recommend` automatically.

### Build for production

```bash
npm run build
```

### Start production server

```bash
npm start
```

---

## Project Structure

```
sahi-gaadi-recommender/
├── app/
│   ├── globals.css                          # Tailwind base + global styles
│   ├── layout.tsx                           # Root layout with metadata
│   ├── page.tsx                             # Redirects / → /recommend
│   ├── recommend/
│   │   ├── page.tsx                         # 8-step wizard (client component)
│   │   ├── results/
│   │   │   └── page.tsx                     # Results + comparison table
│   │   └── compare/
│   │       └── [vehicle1]/[vehicle2]/
│   │           └── page.tsx                 # Deep 2-vehicle comparison
│   └── book-consultation/
│       └── page.tsx                         # Consultation booking form
├── lib/
│   ├── types.ts                             # All TypeScript interfaces
│   ├── vehicleDatabase.ts                   # Static vehicle data (update quarterly)
│   └── recommendationEngine.ts             # Lucknow Suitability Score + matching logic
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
└── tsconfig.json
```

---

## Updating the Data

**To add or update a vehicle:** Edit `lib/vehicleDatabase.ts`. Each entry follows the `Vehicle` type from `lib/types.ts`. The Lucknow context fields — especially `serviceCentersByZone`, `waitingPeriodWeeks`, and `commonIssues` — should be verified at Lucknow dealerships before each quarterly update.

**To adjust scoring weights:** Edit the `W` constant at the top of `lib/recommendationEngine.ts`. Weights must sum to `1.0`.

**To add a new Lucknow zone:** Add the zone key to the `LucknowZone` union type in `lib/types.ts`, then update every `serviceCentersByZone` entry in `lib/vehicleDatabase.ts`, and the zone-specific scoring maps in `lib/recommendationEngine.ts`.
