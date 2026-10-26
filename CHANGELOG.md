# Changelog

## 1.2.0 — 2026-10-26 (Frontend: the design system actually ships)

### Fixed (why the deployed site looked half-built)
- **Tailwind CSS was never compiled.** There was no `postcss.config.mjs` and the
  `@tailwindcss/turbopack` loader was installed but never registered, so
  `@import "tailwindcss"` and `@theme` were passed through untouched: every
  utility class (`bg-paper`, `grid`, `text-ink`, …) was missing from the build
  and the whole product rendered as unstyled HTML. Added
  `@tailwindcss/postcss` + `postcss.config.mjs`; the compiled stylesheet now
  contains the full utility set (verified: 65 KB production CSS).
- **Circular font token**: `--font-display: var(--font-display)` made the brand
  type fall back to Times. Tokens now resolve to real families.
- **Fonts no longer fetched from Google at build time.** A blocked
  `fonts.googleapis.com` fails `next build` outright; switched to self-hosted
  `@fontsource-variable` (Fraunces + Inter), which also makes the PWA render real
  typography offline.
- **Dark mode was half-broken**: `ThemeProvider` toggled a `.dark` class while
  Tailwind's `dark:` variant followed the OS preference. Dark is now
  class-driven (`@custom-variant`), and the whole palette is re-declared as
  theme tokens inside `.dark`, so every surface flips — not just the two rules
  that were hand-patched.
- **Hydration mismatches** for non-English users and for stored themes:
  `t()` and the theme settings read `localStorage` during render. Language now
  goes through a hydration-safe `useT()` hook, and settings through
  `useSyncExternalStore` (`lib/use-local-store.ts`).
- **Changing theme or text size reloaded the page.** Both now apply instantly
  (and cross-tab).
- **CSP/COOP blocked local previews** (no `unsafe-eval` for Turbopack dev,
  `frame-ancestors 'none'`). Dev and production policies are now separate.
- Starter-template SVGs removed from `public/`; service worker bumped to v4.

### Added
- **Real design system** (`app/globals.css`): paper/ink/rust/ochre/slate/moss
  token set with dark overrides, Fraunces + Inter type scale, elevation tokens,
  shared primitives (`shell`, `card`, `btn` family, `field`, `chip`, `eyebrow`),
  paper grain, on-brand focus rings and scrollbars, scan/drift/strata keyframes.
- **Rebuilt landing page**: interactive live example map (click a band for its
  verbatim evidence), topographic hero, stat rail, "the gap" narrative section,
  three-step how-it-works, feature grid, evidence-principles panel, example
  classroom cards, richer FAQ, closing CTA and a full site footer.
- **Rebuilt tool workspace**: two-column composer with drag-and-drop, cap/duplicate
  meter and `⌘/Ctrl + ↵` shortcut; example rail and local-history rail; results
  view with a belief map (risk filters, staggered bars, keyboard/screen-reader
  labels), sticky detail panel with prev/next, share/export card, and a
  `?example=` deep link.
- **Settings**: live theme/text-size segmented controls with previews, language
  grid, engine status, local-data controls and an About block.
- **Chrome**: sticky header with active-route underline, theme toggle, mobile
  sheet, skip link, shared footer; consistent 404/error/offline/play pages.
- **SEO/a11y**: `metadataBase`, OpenGraph/Twitter metadata, JSON-LD
  `SoftwareApplication`, `sitemap.xml`, `robots.txt`, canonical URLs,
  reduced-motion-safe reveal animations.

## 1.1.0 — 2026-10-26 (Polish, play, reach & proof)

### Added
- **Strata Drop**: original programmatic offline game (canvas, zero assets) on 404, error, `/offline` and `/play`; high score, keyboard/mouse/touch, reduced-motion aware.
- **Supercharged programmatic identity**: redesigned SVG logo (static + animated fault-slip variants, crack draw-in), generated PNG icon set (PWA any/maskable, apple-touch, favicon), animated StrataLoader for routes + analysing state.
- **Tests for every core system**: 23 → **61 tests** incl. messy-data fixtures (French, unicode, duplicates, 120-class), fetch-stubbed LLM provider & key hygiene, env-selection matrix, 413/415/429 API hardening, history migration/corruption, 7-locale parity, extension codec/manifest, PWA/SW/security assets; 4th example classroom (WWI causation, History).
- **Working browser extension** (MV3): popup paste/grab-selection, right-click send, options, minimal permissions, `#a=` prefill in the web app, store-submission guide.
- **7-language UI** (en/fr/es/de/pt/yo/ar with RTL + auto-detect), localised header/game/settings; sticky blurred nav, entrance/card animations, site-wide micro-interactions.
- **PWA to cross-device standard**: full manifest (shortcuts, any orientation), SW v3 (offline page fallback, update toast), install sheet for Chromium + iOS instructions + dismissal memory, viewport/theme-color.
- **Docs**: SUBMISSION.md (Devpost steps/copy/prompts), docs/operations/ (release, readiness, capacity, DR, verification), fully annotated STRUCTURE.md.

### Security
- CSP + HSTS + COOP/CORP + extended Permissions-Policy; `/.well-known/security.txt`; API enforces JSON content-type (415); **CSV spreadsheet formula-injection** neutralised; headerless-CSV column detection fixed via longest-text heuristic.

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
