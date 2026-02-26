### SPEC — SahiGaadi Recommender

**Problem Addressed:** Pain Points — Buyers pick vehicles without considering their real life context.

**Proposed Solution:**
A conversational quiz-style recommender that asks:
- Primary use: Office commute / family trips / intercity / all of above
- Average daily distance in Lucknow
- Parking situation: street / covered / tight space
- Who will drive: self / spouse / elderly parent
- Budget: purchase + monthly ownership
- Service preference: frequent but cheap / infrequent but premium
- Feature priorities: mileage / comfort / boot space / style

Based on inputs, it generates a shortlist of 3 vehicles with:
- "Lucknow Suitability Score" — factoring ground clearance (Lucknow roads), service center presence in Lucknow, waiting period at Lucknow dealers, fuel availability (CNG infrastructure assessment), spare parts availability locally
- Honest cons: "This vehicle has no service center within 20km of Gomti Nagar" or "Spare parts for this model have a 3-month lead time in Lucknow"
- Model comparison table: side-by-side on the 6 most important parameters for this buyer's profile

**How It Fixes the Gap:**
Generic national car comparison sites (like CarDekho, CarWale) don't know that road conditions in Rajajipuram differ from Gomti Nagar, or that certain brands have no authorized service center in east Lucknow. This hyper-local intelligence is what a knowledgeable friend would provide.

**Page Structure:**
```
/recommend (Questionnaire — step-by-step wizard)
/recommend/results (Shortlist + comparison)
/recommend/compare/:vehicle1/:vehicle2 (Detailed comparison)
/book-consultation?type=recommendation (CTA)
```

**Functional Requirements:**

1. **Questionnaire Wizard (8 steps, mobile card-swipe style):**
   - Step 1: Vehicle type preference (Car / Motorcycle / Scooty / Open to all)
   - Step 2: Primary use (Office daily + icons / Family trips / Long highway rides / All-purpose)
   - Step 3: Lucknow zone (Gomti Nagar/Hazratganj, Alambagh/Aliganj, Rajajipuram/Chowk, Outskirts/highway)
   - Step 4: Daily distance (slider: 0–100km)
   - Step 5: Parking situation (street/open / building parking / tight basement)
   - Step 6: Drivers in family (just me / spouse also / elderly parent / kids learning)
   - Step 7: Budget range (monthly ownership all-in, or one-time purchase amount — let user choose)
   - Step 8: Top priority (rank: fuel economy / comfort / safety / brand reputation / resale value)

2. **Recommendation Engine:**
   - Match user profile against vehicle database
   - **Lucknow Suitability Score** = weighted average of:
     - Ground clearance score (Lucknow avg pothole depth → >170mm ground clearance preferred)
     - Service center density score (number of authorized centers within 15km of user's zone)
     - Fuel station compatibility (CNG/EV infrastructure by zone — Gomti Nagar has more EV chargers)
     - Waiting period score (current Lucknow dealer waiting period — shorter = better score)
     - Spare parts availability score (local availability vs. order from Delhi/Mumbai)
   - Return top 3 vehicles with scores

3. **Results Page:**
   - 3 vehicle cards: Photo, name, starting price, Lucknow Suitability Score (badge)
   - For each vehicle: "Why this fits you" (3 bullets) + "Things to know" (2 honest cons)
   - Side-by-side comparison table (all 3): Key specs + Lucknow-specific data
   - User can click "Compare any 2" for deeper comparison

4. **Lucknow Context Database** (manually curated, quarterly updated):
```sql
Table: vehicle_lucknow_context
  vehicle_id UUID FK
  ground_clearance_mm SMALLINT
  authorized_service_centers_lucknow INTEGER
  ev_charger_compatible BOOLEAN
  cng_available BOOLEAN
  lucknow_waiting_period_weeks SMALLINT
  spare_parts_local_availability ENUM('excellent','good','fair','poor')
  common_issues_lucknow TEXT (e.g., "AC struggles in Lucknow summers above 42°C")
  last_updated TIMESTAMP
```

**CTA Module:**
"Still deciding? Our consultant will do a final 45-minute call, look at your shortlist, and give you one clear recommendation — ₹499. Money-back if you're not satisfied."