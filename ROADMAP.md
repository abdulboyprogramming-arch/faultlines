# Roadmap

MVP (v1.0.0) + polish release (v1.1.0) are complete: faithful belief map, heuristic + optional LLM, 4 examples, extension, offline game, 7 languages, cross-device PWA, 61 tests, CI, full docs/operations packs. Possible post-MVP directions:

- **Tracking over time**: opt-in accounts and a dashboard showing whether a belief shrinks after reteaching (requires re-running the SECURITY.md tenancy audit first).
- **Multi-question sessions**: several questions per class set, cross-question belief view.
- **Richer analysis**: per-answer confidence, "borderline" band between two beliefs, teacher drag-to-regroup corrections that refine the map.
- **Browser extension**: ✅ shipped functional MV3 (v1.1.0) → next: Chrome Web Store listing, Firefox permanent port, one-click VLE page scrapers.
- **Exports**: first-class PDF, department-shared template formats, slide-per-belief deck.
- **More languages**: ✅ 7 locales + RTL (v1.1.0) → next: localise landing long-form copy, community translations, locale-aware number/date formats.
- **Accessibility**: formal WCAG 2.1 AA audit with assistive-tech testing.
- **Providers**: native Anthropic adapter, streaming progress for large classes, response caching for identical inputs.
- **Self-hosted fonts** so production builds don't depend on Google Fonts at build time.
