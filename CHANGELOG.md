# Changelog

## 1.0.0 — 2026-10-26 (MVP: recovery, stabilisation & completion)

Full PRSIC pass — see `docs/recovery/` for state, audits, plan, log, acceptance and handoff.

### Fixed (was broken)
- `/api/analyze` could never run: `BodySchema` was referenced but never defined (TS2304). The app only "worked" through a silent client fallback. Route rebuilt with a shared Zod contract, caps, calm errors, self-cleaning rate limit.
- `package-lock.json` out of sync → `npm ci` (and CI) failed for everyone. Regenerated.
- Deploy workflow triggered on `master` (default branch is `main`) with a wrong `basePath` (`/devpost-hackathon` → `/faultlines`).
- Exports contained literal `\n` text; tool error state was never rendered; share links could be read but never created; CSV uploads weren't parsed as CSV; settings language row sat outside its container; 16 ESLint errors → 0.

### Added
- Topic-agnostic heuristic engine (was hard-coded to one seasons topic): deterministic grouping for any subject, verbatim quotes, exact counts, honest unsure bucket, question-aware reteach templates.
- Real LLM provider (OpenAI-compatible, server-side key) with index-based output so counts/quotes are faithful by construction; visible degraded fallback; `GET /api/health`.
- Question field, live answer counter/cap notice, duplicate detection, drag-and-drop + CSV column detection.
- Results: "Start here" priority banner, per-belief share %, unsure answers finally viewable, copy-single-reteach, exports (plan/print/Markdown/CSV/JSON/share link with privacy note), print stylesheet.
- Two new example classrooms (fractions, photosynthesis); landing page with live example, how-it-works and FAQ; shared site header.
- Local history v2 (timestamps, question labels, delete/clear, v1 migration); Settings: analysis-mode display + clear-all-local-data.
- i18n wired into the tool (en/fr) + Spanish; accessibility (labels, aria-pressed/live, focus rings, reduced motion); real offline service-worker caching.
- Tests: 23 Vitest unit/API tests; CI now runs lint + typecheck + tests + build.
- Docs: README, ARCHITECTURE, SECURITY (client-secrets + tenancy audit), recovery pack.

## 0.1.0 — 2026-10-26
- Initial hackathon scaffold: landing, tool, settings, seasons-only mock, cached example, PWA shell, planning docs in `devpost/`.
