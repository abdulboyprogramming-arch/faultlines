# Changelog

## 1.4.0 — 2026-10-26 (Assistance: suggestions, notifications, a proper tour)

### Added
- **Answer autocomplete in the composer.** As a teacher types a line, the field offers
  answers they have already used — drawn from the four example classrooms and from the
  quotes in their own local history. `Tab`/`Enter` accepts, `↑ ↓` moves, `Esc` dismisses.
  Matching is accent- and case-insensitive, prefix matches outrank mid-word matches, and
  the completion replaces only the line being typed (`lib/suggest.ts`).
- **Question autocomplete.** The question field is now a real combobox (`role="combobox"`,
  `aria-activedescendant`) over the example questions plus every question saved in local
  history, replacing the browser `datalist` — which ignored styling and could not show
  where a suggestion came from.
- **Search in saved maps, with its own suggestions.** A search box in the "Recent" rail
  filters by question, belief name, plain-language label or date; every term must match,
  so `seasons high` narrows instead of widening. A suggestion list offers past questions
  and belief names while typing, and the rail says “2 of 5 saved” with an honest empty
  state.
- **Completion notifications.** Optional browser notification when a map finishes, so a
  teacher can mark while the analysis runs. Bodies carry **counts only**
  (“28 answers · 5 beliefs”) — never student words — and the notification collapses via a
  tag rather than stacking. Permission is requested only when the switch is turned on,
  and the switch explains itself when the browser has blocked notifications
  (`lib/notify.ts`).
- **Guided tour.** A first-run walkthrough that dims the page, cuts a spotlight around
  the area being described, points an arrow at it and explains it in a card — five steps
  for the composer, four for a finished report, three for the landing page. Steps whose
  anchor is not on the page are skipped, so one definition covers every state. Keyboard:
  `← →`, `Enter`, `Esc`. Replayable from **Settings → Assistance** or the **“Show me
  around”** button on a report (`components/TourHost.tsx`, `lib/tour.ts`).
- **Settings → Assistance**, with switches for answer suggestions, search suggestions,
  notifications (plus a test notification) and the tour. Every helper is off-able and
  remembered per browser (`lib/prefs.ts`).

### Fixed / answered
- **Report prose is now localised, not just the interface.** Previously the *chrome* was
  translated but belief names, “why it matters”, reteach steps and diagnostics were
  English — the engine had no idea which language to write in. The composer now sends
  `locale` with the analysis request; the LLM prompt asks for prose in that language, and
  the built-in heuristic reads its own strings from the dictionaries. A chip on the
  report states which language it was written in. **Student quotes are never touched** in
  any locale — verified by tests. Exports carry the localised prose through
  unchanged; only the CSV column headers stay English machine keys, and the
  export labels themselves come from the dictionary.

### Tests
- `tests/suggest.test.ts` (10) — ranking, dedupe, minimum query length, line-scoped
  answer completion, history filtering with all-terms-required.
- `tests/report-language.test.ts` (7) — prompt instruction per locale, heuristic prose
  localised, quotes still verbatim, counts still sum, unknown locale degrades to English.
- `tests/assistance.test.ts` (9) — safe defaults, persistence, blocked storage, missing
  Notification API, denied permission, tour steps referencing real dictionary keys.
- Total: **110 tests across 14 files**.

## 1.3.0 — 2026-10-26 (Every word, in every language)

### Fixed
- **Switching language now actually translates the whole product.** Locale
  dictionaries used to be built as `{ ...en, ...overrides }`, so any key without a
  translation silently fell back to English — and most of the interface was never
  in a dictionary at all. Every locale is now a *complete* `Dict`
  (`lib/i18n/{en,fr,es,de,pt,yo,ar}.ts`, typed against English), so a missing key is
  a compile error, not an English sentence on a Yorùbá page.
- **Every user-visible string moved into the dictionary**: landing page (hero, stat
  rail, the gap, how-it-works, features, trust panel, receipt, example cards, FAQ,
  closing CTA), the whole tool (composer, counters, name guard, risk mix, run
  comparison, top-risk call-out, map, belief detail, unsure list, exports, history,
  toasts, live-region announcements, aria labels), Settings, Privacy, Play, offline /
  404 / error pages, header, footer, install sheet, offline banner, loader and the
  Strata Drop game. Only brand/product nouns, student answers and sample-class data
  stay as they are — see `docs/i18n.md`.
- **Exported plans are localised too**: the copied reteach plan, Markdown report and
  CSV “not sure” rows now read in the teacher's language (`lib/export.ts` takes the
  translator). CSV column headers stay English by design — they are machine keys.
- **Screen-reader text is localised**: the personal-data warning summary, the
  run-comparison announcement, the belief-map aria labels and the keyboard hints were
  English-only, so assistive-tech users got a different product.

### Added
- **Complete dictionaries for 7 locales** (en, fr, es, de, pt, yo, ar) with ~410 keys
  each, including Arabic RTL copy and Yorùbá.
- **`components/T.tsx`** — a small client island so server-rendered pages (landing,
  privacy, play, 404/offline/error, footer, loader) can translate without becoming
  client components, and so translated sentences keep inline markup:
  `<T k="keyboardHint" vars={{ j: <kbd>j</kbd> }} />`.
- **`components/LanguageSwitcher.tsx`** — a compact, accessible language `<select>` in
  the header (desktop) and mobile sheet, so changing language no longer requires
  hunting through Settings. Every mounted string re-renders instantly via the
  `faultlines:locale` event; `dir` flips for Arabic.
- **Locale-aware formatting** — `formatNumber` / `formatDate` / `formatDateTime`
  (`Intl`) exposed as `t.num`, `t.date`, `t.dateTime` for counts and history rows.
- **`tests/i18n-coverage.test.ts`** (8 tests) — key parity across all seven locales,
  no empty strings, identical placeholder sets per key, a "no English left" check with
  a documented allowlist, and RTL assertions. Total: **84 tests across 11 files**.
- **`docs/i18n.md`** — the localisation system end to end, including what is
  deliberately *not* translated and how to add a language.

### Improved (adjacent MVP polish)
- Settings shows each language's short code and native name, and the engine chip is
  translated rather than a hard-coded English sentence.
- RTL refinements in `app/globals.css`: letter-spacing is dropped for Arabic
  headings and eyebrows, blockquote rules mirror, and numerals/`code`/`kbd` stay
  left-to-right inside RTL text.
- The locale boot script now whitelists the seven supported codes, so an unsupported
  browser language no longer sets a misleading `<html lang>` on an English page.
- Service worker cache bumped to `v5` so returning visitors get the new copy.
- `package.json` / docs raised to 1.3.0.

## 1.2.0 — 2026-10-26 (Frontend: the design system actually ships)

### Added in the follow-up pass (privacy, continuity, resilience)
- **Name & personal-data guard**: the composer scans pastes for emails, phone-shaped
  numbers, “Name:” labels and name-like word pairs (`lib/privacy.ts`) and warns before
  anything is mapped, quoted or shared. Runs entirely in the browser; the warning
  clears itself when the answers change. No false positives on place names or
  determiners (`The Earth`, `World War`).
- **“Since your last run of this question”**: local history is diffed against the
  current map by belief name (`lib/compare.ts`), showing which beliefs shrank or grew —
  the reteach-effect signal the product is really about. Refuses to compare classes
  of clearly different sizes and says so honestly when nothing moved.
- **Local data backup & restore** (`lib/backup.ts` + Settings): download every
  `faultlines-*` key as one JSON file, restore it later on another machine. The file
  is validated (app, version, key namespace, strings only, size cap) before a single
  key is written; nothing leaves the browser.
- **Plain-language `/privacy` page**: what is stored (nothing, server-side), where
  local data lives, what the AI provider setting actually sends, how share links work,
  and what to do on a shared school computer. Linked from the footer and FAQ.
- **Social preview image** generated at build time (`app/opengraph-image.tsx`) — shared
  links now show the product's own strata map instead of a blank card.
- **Offline awareness**: a quiet on-brand banner says what still works when the network
  drops, instead of letting the app look broken.
- **Tool-level error boundary** (`app/tool/error.tsx`): retry, start a fresh map, or
  check saved data — no dead white page.
- **Keyboard + assistive tech**: `j`/`k` move between beliefs, focus moves to the result
  when a map finishes, results are announced through a live region, and the question
  field offers the example questions as presets.
- **Result insight**: a risk-mix bar shows the class distribution (high / medium / low /
  not sure) at a glance.
- **10 new tests** (`tests/privacy-backup.test.ts`, `tests/compare.test.ts`) → 76 total.


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
