# Roadmap

MVP (v1.0.0) + polish release (v1.1.0) are complete: faithful belief map, heuristic + optional LLM, 4 examples, extension, offline game, 7 languages, cross-device PWA, 61 tests, CI, full docs/operations packs. Possible post-MVP directions:

- **Tracking over time**: opt-in accounts and a dashboard showing whether a belief shrinks after reteaching (requires re-running the SECURITY.md tenancy audit first).
- **Multi-question sessions**: several questions per class set, cross-question belief view.
- **Richer analysis**: per-answer confidence, "borderline" band between two beliefs, teacher drag-to-regroup corrections that refine the map.
- **Deeper AI coaching** (post-MVP, scoped not built): the report today gives a *structural* plan — belief, evidence quotes, why it matters, a timed reteach sequence, a check question and a diagnostic follow-up. The next layer is *tailored advice on top of that*: a differentiated version of the reteach steps for the students who hold the belief, a "what to say if a student answers X" branch per misconception, a prediction of the next misconception the class will hit, and a suggested marking/feedback line per band. Guardrails stay the same as the current engine — quotes are never generated or rewritten, every claim links to the answers behind it, and the teacher can accept or discard the coaching. Needs the same evaluation harness as the current provider (`tests/report-language.test.ts` style golden cases) before it can be trusted at the front of a class.
- **AI provider depth**: native Anthropic adapter next to the OpenAI-compatible one, streaming progress for large classes, response caching for identical inputs, and a per-school key pool.
- **Browser extension**: ✅ shipped functional MV3 (v1.1.0) → next: Chrome Web Store listing, Firefox permanent port, one-click VLE page scrapers.
- **Exports**: first-class PDF, department-shared template formats, slide-per-belief deck.
- **More languages**: ✅ 7 locales + RTL (v1.1.0) → ✅ **fully localised** in v1.3.0: every screen, error, aria label, toast and exported plan, plus locale-aware number/date formatting (`docs/i18n.md`). Next: community review of the Yorùbá and Arabic copy, localised sample-classroom data, and a translated social-preview image.
- **Accessibility**: formal WCAG 2.1 AA audit with assistive-tech testing.
- ✅ **Self-hosted fonts** so production builds don't depend on Google Fonts at build time (v1.2.0).
- ✅ **Local-only backup/restore** for saved maps (v1.2.0) — a lighter answer to "tracking over time" that needs no accounts.
- ✅ **Reteach effect on one device**: "since your last run" comparison of the same question (v1.2.0).
- ✅ **Assistance layer** (v1.4.0): autocomplete for pastes and questions, searchable history with suggestions, optional completion notifications, and a replayable guided tour — all switchable in Settings.
- ✅ **Localised report prose** (v1.4.0): belief names, reteach plans and diagnostics are written in the reader's language, not just the interface.
- Next: a printable *student-facing* version of the diagnostic question list; dept-level aggregation without accounts (export-based); richer tour for the export/print flow.
- **Honest boundary:** the app does not invent pedagogy. It surfaces what students wrote, sizes it, ranks it by exam risk and proposes a reteach structure. Anything further — coaching, prediction, differentiated variants — is on this roadmap, not in the shipped build.
