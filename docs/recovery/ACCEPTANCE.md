# REC-P07a — Acceptance (end-to-end proof, executed 2026-10-26)

No completion claim without an end-to-end run — here is the run. All commands executed in the recovery sandbox against this branch; production server = `npm run start` on the production build (fonts stubbed during the sandbox build only — sandboxes here cannot reach fonts.googleapis.com; restored in the committed code, verified by diff).

## Gates

| Gate | At preserved HEAD | Now |
|---|---|---|
| `npm ci` | ❌ lockfile out of sync | ✅ clean install from empty `node_modules` |
| `npx tsc --noEmit` | ❌ TS2304 `BodySchema` (+1) | ✅ 0 errors |
| `npm run lint` | ❌ 16 errors | ✅ 0 problems |
| `npm test` | — no tests existed | ✅ 23/23 (4 files) |
| `npm run build` | ❌ (cannot compile route) | ✅ all 6 routes |
| `POST /api/analyze` | ❌ never executed | ✅ see below |

## Teacher journey (live HTTP against the built app)

- `GET /`, `/tool`, `/settings` → 200; unknown path → 404 page. Security headers present (`nosniff`, `DENY`, referrer/permissions policies).
- `GET /api/health` → `{"ok":true,"provider":"mock"}`.
- `POST /api/analyze` with each example classroom **through the generic engine** (not the cached results):
  - seasons (28): 2 beliefs, 2 unsure, **28/28 accounted**, top = "sun · closer · earth" ×17, all quotes verbatim ✓
  - fractions (17): 2 beliefs, 7 unsure, **17/17**, top = "add · top · bottom" ×6 — exactly the genuine misconception group ✓
  - photosynthesis (14): 3 beliefs, 5 unsure, **14/14**, top = "soil · plant · food" ×4 ✓
- Error paths: empty answers / junk body → `400 {"error":"Invalid input — …"}` (calm, no stack trace); >120 answers → 400 (test-covered).

## PRD acceptance criteria check

Evidence-linked findings (`18 of 28` + %) ✓ · faithful verbatim quotations (enforced in `lib/validate.ts`, by-construction in both providers) ✓ · unsure bucket, never invented ✓ (and now *viewable*) · counts sum to total (tests + live run) ✓ · 5-min reteach + check question per belief ✓ · follow-up diagnostic ✓ · privacy (no accounts/storage, names notice, clear-data) ✓ · accessibility (labels, keyboard bands, aria-live, contrast palette kept, responsive, reduced motion) ✓ · input validation + calm cap ✓ · graceful failure (provider fallback flagged, API fallback in-browser on static hosts, calm notices) ✓.

## Honest limits of this acceptance

- The heuristic groups *wording*, not correctness: on fractions it leaves 7/17 unsure rather than forcing them (by design). Judgement-grade maps need `LLM_PROVIDER` configured — that path is unit-tested for faithfulness (`resultFromIndexes`) but was **not** live-tested against a real model (no API key in the sandbox).
- Browser-level checks (clipboard, print rendering, PWA install prompt, share-link open) were verified by code path + unit tests of the codecs, not with a real browser in this environment.
