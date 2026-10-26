# REC-P07b — Handoff

**Fault Lines is at MVP (v1.0.0) and shippable.** The core loop from `devpost/prd.md` works end to end with no API key, and gets judgement-grade analysis by setting three env vars.

## Run it
```bash
npm ci && npm run dev     # http://localhost:3000 → Map my class
npm run check             # lint + typecheck + 23 tests (all green)
npm run build && npm start
```
Optional real AI: copy `.env.example` → `.env.local`, set `LLM_PROVIDER=openai`, `LLM_API_KEY=…` (server-side only). Verify at `/api/health` or Settings → "Analysis engine".

## What changed in this recovery (one line each)
Fixed the never-compiled API route and broken lockfile/CI; replaced the one-topic mock with a tuned topic-agnostic heuristic; added the env-gated LLM provider with by-construction faithfulness; completed the tool (question, CSV, counters, unsure view, exports incl. CSV/print/share, history v2, 3 examples, i18n en/fr/es, a11y); finished landing/settings; added tests, offline caching, and full docs. Details: `RECOVERY_LOG.md`, evidence: `ACCEPTANCE.md`.

## Known limits (honest)
1. Heuristic ≠ judgement: it clusters similar wording and labels risk by prevalence. For misconception *correctness*, configure the LLM. The UI says which engine produced every map.
2. LLM path is unit-tested but not yet live-tested against a real model — first thing to do with a key: run the 3 examples through it and eyeball the maps.
3. Fonts load from Google Fonts at build (standard Next.js); self-hosting is roadmapped for fully-offline builds.
4. Rate limiting is per-instance in-memory (fine for MVP/serverless; use a shared store if you scale out).
5. `extension/` remains a manifest scaffold; the duplicated `.agents/`, `.claude/`, `agent/` skill trees are tooling, untouched.

## Suggested next steps (priority order)
1. Plug in an LLM key on a staging deploy; compare maps on the 3 examples; tune the prompt in `lib/llm/real.ts` if needed.
2. Put it in front of 2–3 teachers with *their* real (anonymised) answers; watch where the heuristic's unsure rate hurts.
3. Pick ONE roadmap item based on that feedback (likely: over-time tracking or extension) — and if accounts ever appear, re-run the tenancy audit in `SECURITY.md` first.

## Where things live
Product truth: `devpost/` · Architecture: `ARCHITECTURE.md` · Security/tenancy: `SECURITY.md` · This recovery: `docs/recovery/` (STATE → INTENT → COMPLETENESS → INTEGRATION → PLAN → LOG → ACCEPTANCE → HANDOFF).
