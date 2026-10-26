---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. Scaffold + input workspace + example classroom renders the map**
  Becomes usable: A running Next.js app where you can paste answers or load the example classroom and see the strata map with mock data.
  Why now: Bootstrapping lives in slice one; proves the whole path end to end on the first slice.
  PRD ref: `prd.md > The Core Journey` (steps 1-4), `prd.md > Features and Behavior > Input and validation`
  Spec ref: `spec.md > File Structure`, `spec.md > Components`, `spec.md > Look and Feel`
  Build: Scaffold Next.js App Router + TS + Tailwind, install Zod, create layout/page with geological-survey styling, InputPanel with paste box + validation + "Load example classroom", render StrataMap from cached example data.
  Verify (mechanical): `npm run build` succeeds; dev server starts; example classroom renders 4 bands with counts.
  Learner check: Open the app, click "Load example classroom", and confirm the map appears with 4 strata bands.
  Commit: `Scaffold app with input workspace and example strata map`

- [x] **2. Paste answers → mock analysis → real results map**
  Becomes usable: Pasting your own answers and clicking "Map my class" produces a real strata map via the mock provider.
  Why now: Delivers the core journey end to end before touching any real LLM.
  PRD ref: `prd.md > The Core Journey` (steps 2-5)
  Spec ref: `spec.md > Components`, `spec.md > Data Model`, `spec.md > External Services and Dependencies`
  Build: Implement provider interface + mock adapter, /api/analyze route with Zod validation/normalization, wire AnalyzeButton and loading state ("Reading N answers…"), render results + band click detail + unsure bucket.
  Verify (mechanical): POST /api/analyze with sample input returns validated JSON; UI shows map + detail + unsure bucket.
  Learner check: Paste 5-6 sample answers, click "Map my class", and confirm a map with counts and a "Not sure" band.
  Commit: `Wire paste-to-analysis with mock provider`

- [x] **3. Reteach cards, diagnostic question, and export**
  Becomes usable: Clicking a band shows quotes + reteach card + follow-up diagnostic question; export copies/prints a plan.
  Why now: Completes the core journey's actionable output.
  PRD ref: `prd.md > Features and Behavior > Reteach and export`, `prd.md > Acceptance Criteria`
  Spec ref: `spec.md > Components`
  Build: BandDetail with quotes/reteach/diagnostic; ExportPlan copy+print; accessibility (keyboard, focus).
  Verify (mechanical): Band click reveals detail; export produces text containing counts and reteach steps.
  Learner check: Click the biggest band, read the quotes and reteach, then export and confirm the plan.
  Commit: `Add reteach cards, diagnostic question, and export`

- [ ] **4. Real provider adapter (env-gated) + graceful failures**
  Becomes usable: With env vars set, real LLM analysis runs; without them, mock mode; failures fall back calmly.
  Why now: Risky integration last, after the demo already works; env-gated keeps demo safe.
  PRD ref: `prd.md > States and Boundaries`, `prd.md > Product Decisions`
  Spec ref: `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`
  Build: Real adapter behind interface, env validation, timeout, malformed-JSON fallback to cached example + calm notice, rate-limit handling.
  Verify (mechanical): Unit-ish manual: mock mode runs; invalid key path shows calm notice; cached fallback renders.
  Learner check: Run with no key (mock) and confirm it still works; confirm no stack traces on bad input.
  Commit: `Add env-gated real provider with graceful fallbacks`

- [ ] **5. Polish and final verification**
  Becomes usable: Empty/error states, responsive layout, motion reveal, final acceptance checks.
  Why now: Last mile after core works.
  PRD ref: `prd.md > Acceptance Criteria`
  Spec ref: `spec.md > Look and Feel`
  Build: Empty state copy, loading state, error states, ~900ms strata reveal with count tick, responsive, final acceptance test pass.
  Verify (mechanical): `npm run build` + `npm run lint` (if present) + manual acceptance checklist.
  Learner check: Full core journey end to end; try awkward inputs.
  Commit: `Polish states, motion, and accessibility`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 1
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete
- [ ] Optional edit and transfer reflection addressed
- [ ] `devpost/app-map.html` generated

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions
