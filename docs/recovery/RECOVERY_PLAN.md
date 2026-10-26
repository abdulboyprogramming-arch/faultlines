# REC-P05 — Recovery Plan (critical path to MVP)

1. **Fix the spine:** define request schema (answers + optional question, caps), harden `/api/analyze` (limits, errors, rate-limit hygiene), regenerate lockfile, fix CI + deploy branch/basePath.
2. **Make analysis real for any topic:** generic deterministic heuristic mock (topic-agnostic grouping, verbatim quotes, counts that sum, honest unsure), plus an env-gated OpenAI-compatible real provider whose output is index-based so counts/quotes are derived server-side (verbatim by construction); calm mock fallback with a visible "degraded" flag, never silent.
3. **Normalization layer** (`lib/validate.ts` per spec): dedupe quotes, risk-sort, cap strings, guarantee schema.
4. **Complete the tool loop:** question field, counters/caps, CSV parsing, rendered errors, loading text, results summary, unsure detail, working exports (copy/Markdown/JSON/CSV/print), working share links (validated), honest history (labelled, deletable), 3 example classrooms, i18n wired (en/fr/es), a11y.
5. **Finish the surfaces:** landing (how-it-works, privacy, FAQ, live example preview), settings (fixed layout, clear-data, analysis-mode via `/api/health`), print stylesheet, reduced-motion.
6. **Prove it:** Vitest unit/API tests, tsc, lint, build (font-stubbed in sandbox), dev-server end-to-end smoke (P07).
7. **Document:** README/ARCHITECTURE/SECURITY/CHANGELOG/ROADMAP + this recovery pack; PR to `main`.

Out of scope for MVP (kept on ROADMAP): accounts/DB, LMS, per-student tracking, extension functionality, PDF generation beyond print.
