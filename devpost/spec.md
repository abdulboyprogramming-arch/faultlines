---
doc: spec
status: approved
---

# Fault Lines — Technical Spec

## How This Works, In Plain Language
The teacher pastes answers into a Next.js page running in the browser. Clicking "Map my class" sends the text to one serverless API route on the same app. That route validates input, calls a provider-agnostic LLM interface (real provider or deterministic mock), validates/normalizes the JSON result, and returns it. The browser renders the strata map, quotes, reteach cards, and diagnostic question, and exports a plan. Nothing is stored; state lives in the browser for that session.

## The Core Journey Through the System
Teacher opens page → types/pastes answers → client validates → POST /api/analyze → server validates → LLM provider (mock or real) → JSON validated/normalized → response → client renders map → user clicks band → quotes + reteach + diagnostic → export copies/prints. PRD ref: `prd.md > The Core Journey`.

## Stack
- Next.js 14+ App Router, TypeScript, Tailwind CSS.
- One serverless API route (`app/api/analyze/route.ts`).
- Zod for input/output validation.
- No DB, no auth, no background jobs.
- LLM provider-agnostic interface with mock + real adapters.

## Where It Runs and How Someone Tries It
Local: `npm install && npm run dev` → open http://localhost:3000. Mock mode by default (no key). Real mode via env var `LLM_PROVIDER` + key. Optional Vercel deploy documented; not required for demo.

## Look and Feel
Paper `#F4F1EA`, ink `#14110E`, rust `#B5471F`, slate `#3E5C63`. Serif display (Fraunces) + grotesque UI. Strata bands, hand-drawn cracks, single ~900ms top-to-bottom reveal with counts ticking up.

## Components
- `InputPanel` — paste box, validation, example loader, privacy cue. PRD ref: `prd.md > Features and Behavior > Input and validation`.
- `AnalyzeButton` — triggers POST, shows progress text.
- `StrataMap` — bands sized by share, ordered by risk; click selects. PRD ref: Results map.
- `BandDetail` — quotes + reteach card + diagnostic question.
- `ExportPlan` — copy/print one-page summary.
- `api/analyze` — validates, calls provider, normalizes, returns.

## Data Model
No persistence. Client state: `{ answers: string[], result: AnalysisResult | null, loading, error, selectedCluster }`. AnalysisResult: `{ clusters: Cluster[], unsure: Unsure[] }`. Cluster: `{ label, plain_name, count, risk, why_it_matters, quotes: string[], reteach: { title, minutes, steps: string[], check_question } }`.

## File Structure
```
project/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/analyze/route.ts
├── components/
│   ├── InputPanel.tsx
│   ├── StrataMap.tsx
│   ├── BandDetail.tsx
│   └── ExportPlan.tsx
├── lib/
│   ├── llm/
│   │   ├── provider.ts        # interface
│   │   ├── mock.ts
│   │   └── real.ts            # env-gated
│   ├── schema.ts              # zod
│   └── validate.ts
├── data/example-classroom.json  # cached
├── devpost/
├── package.json
└── .env.example
```

## External Services and Dependencies
- LLM provider behind interface; mock default. Real provider requires env vars (documented, no hardcoded keys). Doc links TBD at build; flag to verify.
- Next.js, Tailwind, Zod. No other services.

## Important Failure Modes
- Malformed JSON → fall back to cached example + calm notice.
- Bad/missing key → mock mode or calm error, never stack trace.
- Too many answers → cap + notice.
- Empty/vague → "Not sure — needs your eyes" bucket.
- Timeout/rate limit → retry once then fallback.

## What Was Simplified and Why
- No DB/auth → single session, paste-and-go.
- Mock provider default → demo works without keys.
- Cached example → zero-network demo safety net.
- One batched call → 28 calls would be slow/expensive.

## Decisions and Open Issues
- Stack: Next.js App Router + TS + Tailwind (learner decision).
- Hosting: local-first + optional Vercel (learner decision).
- Provider-agnostic interface with mock (learner requirement).
- Genuine uncertainty: which real provider/key the learner has — to be verified when wiring real adapter; non-blocking (mock covers MVP). Need to verify provider docs/limits before real integration.