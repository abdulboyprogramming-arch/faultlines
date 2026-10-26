# Project Structure — every file, and what it's for

_Inspector's map: each path has a one-line purpose. Start at `README.md` for the product, `ARCHITECTURE.md` for design, `docs/recovery/` for how it got here, `docs/operations/` for running it, `SUBMISSION.md` for the Devpost entry._

## App surface (`app/` — Next.js App Router)

| File | Role |
|---|---|
| `app/layout.tsx` | Root layout: fonts, metadata/OG, viewport + theme-color, PWA icons, ThemeProvider, install prompt |
| `app/page.tsx` | Landing: hero, live example strata, how-it-works, why, FAQ, footer |
| `app/tool/page.tsx` | **The core loop**: paste/upload → counters → analyse → map → detail → export → local history; share-link (`#…`) and extension-prefill (`#a=…`) readers |
| `app/tool/loading.tsx` | Route loading screen (StrataLoader) for the tool |
| `app/settings/page.tsx` | Theme, text size, 7-language picker, analysis-engine status, clear-all-local-data |
| `app/play/page.tsx` | Strata Drop game page (also a PWA shortcut) |
| `app/offline/page.tsx` | Custom offline page: what still works offline + the game; served by the service worker when navigation fails |
| `app/not-found.tsx` | 404 with the built-in game and recovery links |
| `app/error.tsx` | Error boundary with retry + the game |
| `app/loading.tsx` | Global route loading screen (StrataLoader) |
| `app/globals.css` | Tailwind theme (paper/ink/rust/ochre/slate), keyframes (fade-up, strata-load, seismic…), dark/text-size variants, print stylesheet, reduced-motion |
| `app/icon.svg` / `app/favicon.ico` | Favicon (programmatic strata mark) |
| `app/api/analyze/route.ts` | **The single analysis endpoint**: rate limit → JSON/size guards → Zod → provider → normalise → Zod → result |
| `app/api/health/route.ts` | `{ ok, provider }` only — engine status for Settings/monitoring, zero secrets |

## Components (`components/`)

| File | Role |
|---|---|
| `components/Logo.tsx` | Programmatic SVG logo, `static` + `animated` (crack draw-in + seismic fault-slip) variants |
| `components/StrataMap.tsx` | Belief bands sized by class share, risk-sorted, staggered 900ms reveal, keyboard/ARIA |
| `components/BandDetail.tsx` | Selected belief: verbatim quotes, reteach card, diagnostic, copy-card |
| `components/ExportBar.tsx` | Copy plan, print/PDF, Markdown, CSV, JSON, share link (+ bearer-data warning) |
| `components/StrataGame.tsx` | **Strata Drop** — original offline canvas game (404/error/offline/play) |
| `components/StrataLoader.tsx` | Animated programmatic loading object (breathing strata + animated logo) |
| `components/SiteHeader.tsx` | Sticky nav with backdrop blur, localised |
| `components/InstallPrompt.tsx` | Cross-device PWA install sheet (Chromium prompt, iOS instructions, update-ready toast, 14-day dismissal memory) |
| `components/ThemeProvider.tsx` | Light/dark/system theme, text size, `lang`/`dir` (RTL) sync |

## Core logic (`lib/`)

| File | Role |
|---|---|
| `lib/schema.ts` | Shared client/server Zod contract + limits (120 answers, caps) |
| `lib/validate.ts` | Normalisation: quote dedupe, **verbatim-quote enforcement**, risk ordering, totals |
| `lib/llm/provider.ts` | `LLMProvider` interface (+ `AnalyzeOptions.question`) |
| `lib/llm/mock.ts` | Deterministic topic-agnostic heuristic engine (tokenise → unsure → leader-cluster) |
| `lib/llm/real.ts` | OpenAI-compatible LLM provider; index-based output → faithful counts/quotes by construction |
| `lib/llm/index.ts` | Provider selection from env + resilient visible-degradation fallback + `providerMode()` |
| `lib/parse-input.ts` | Line splitting, real CSV parsing (quoted cells; header/longest-column detection), caps + duplicate counting |
| `lib/export.ts` | Plain-text/Markdown/CSV plan builders (CSV formula-injection safe) + download helper |
| `lib/share.ts` | Share-report codec (`#…`) and answers-prefill codec (`#a=…`, shared with the extension), Zod/size-validated |
| `lib/history.ts` | Local-only history v2 (localStorage): labels, cap, v1 migration, clear-all |
| `lib/i18n.ts` | 7 locales (en fr es de pt yo ar), identical keys, auto-detect, RTL flag |

## Data (`data/`) — cached example classrooms (zero-network demo)

| File | Role |
|---|---|
| `data/examples.ts` | Registry of the 4 example classrooms |
| `data/example-answers.json` / `example-result.json` | Seasons (28) — answers / cached map |
| `data/example-fractions-*.json` | Adding fractions (17) |
| `data/example-photosynthesis-*.json` | Tree mass / photosynthesis (14) |
| `data/example-ww1-*.json` | Causes of WWI (12, humanities proof) |

## Browser extension (`extension/` — Chrome/Edge MV3, also loads in Firefox dev)

| File | Role |
|---|---|
| `extension/manifest.json` | MV3 manifest: minimal permissions (activeTab, scripting, contextMenus, storage), strict CSP, no host permissions |
| `extension/popup.html/css/js` | Paste/grab selected text → open Fault Lines prefilled (`#a=`); app-address setting |
| `extension/background.js` | Right-click "Send selection to Fault Lines" |
| `extension/options.html/js` | App address + privacy explanation |
| `extension/icons/*.png` | Programmatically generated strata icons (16–128) |
| `extension/README.md` | Load-unpacked + Web Store submission steps |

## PWA & static (`public/`)

| File | Role |
|---|---|
| `public/manifest.json` | Full PWA manifest: any+maskable icons, shortcuts, standalone, any orientation |
| `public/sw.js` | Service worker v3: precache shell + `/offline`, network-first navigations, cache-first assets, network-only `/api`, update flow |
| `public/icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png` | Generated brand icon set (static logo variant) |
| `public/.well-known/security.txt` | Responsible-disclosure contact |
| `public/{file,globe,next,vercel,window}.svg` | Leftover create-next-app samples (unused, harmless) |

## Tests (`tests/` — Vitest, 61 tests, `npm test`)

| File | Covers |
|---|---|
| `tests/mock.test.ts` | Heuristic: sums, verbatim, unsure, determinism |
| `tests/core-systems.test.ts` | Messy data (French, unicode, dupes, 120-class), schema limits, CSV edges + formula injection, extension codec/manifest, health, PWA/SW/security assets, examples |
| `tests/providers.test.ts` | LLM prompt, fetch-stubbed provider paths, key hygiene, env selection matrix, visible degradation |
| `tests/real-and-api.test.ts` | Index→result faithfulness, `/api/analyze` contract (200/400/415) |
| `tests/api-hardening.test.ts` | 413 oversized, 429 rate limit + per-IP isolation |
| `tests/validate.test.ts` | Normalisation: sorting, dedupe, verbatim enforcement |
| `tests/export-share-parse.test.ts` | Exports (incl. newline regression), share codec, input prep, example integrity |
| `tests/i18n-and-history.test.ts` | Locale key parity ×7, RTL, detection; history round-trip/cap/migration/corruption/clear |
| `tests/fixtures.ts` | Shared messy datasets (multilingual, unicode, duplicates, vague, big class, tricky CSV) |

## Docs & process

| File | Role |
|---|---|
| `README.md` | Product, quick start, providers, privacy, deployment |
| `ARCHITECTURE.md` | Pipeline + why index-based LLM output |
| `SECURITY.md` | Client-secrets + tenancy audits, hardening inventory |
| `SUBMISSION.md` | Devpost submission pack: exact steps, copy blocks, demo script, AI prompts |
| `ROADMAP.md` / `CHANGELOG.md` / `CONTRIBUTING.md` / `LICENSE` | Future plans, history, how to help, MIT |
| `docs/recovery/*.md` | PRSIC record: state → intent → completeness → integration → plan → log → acceptance → handoff |
| `docs/operations/*.md` | Release engineering, operational readiness, capacity planning, disaster recovery, independent verification |
| `devpost/{scope,prd,spec,checklist}.md`, `scope.html` | Original plan-first product documents |
| `presentation/` | Pitch assets + prompt |

## Config & tooling (root)

| File | Role |
|---|---|
| `package.json` / `package-lock.json` | faultlines v1.1.0; scripts: dev/build/start/lint/typecheck/test/check |
| `next.config.ts` | Security headers + CSP, GitHub-Pages static-export mode |
| `tsconfig.json`, `eslint.config.mjs`, `vitest.config.mts`, `next-env.d.ts` | TS / lint / tests configuration |
| `.env.example` | Server-side-only `LLM_*` variables (mock default) |
| `.github/workflows/ci.yml` | lint → typecheck → test → build on push/PR |
| `.github/workflows/deploy.yml` | GitHub Pages static deploy from `main` |
| `vercel.json`, `.gitignore`, `skills-lock.json` | Vercel config, ignores, agent-skills lock |
| `.agents/`, `.claude/`, `agent/` | AI-assistant skill packs used during the original build (tooling, not product) |
