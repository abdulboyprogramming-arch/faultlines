# Roadmap

MVP (v1.0.0) is complete: paste/upload → faithful belief map → reteach → export/share, heuristic + optional LLM, examples, history, i18n, tests, CI. Possible post-MVP directions:

- **Tracking over time**: opt-in accounts and a dashboard showing whether a belief shrinks after reteaching (requires re-running the SECURITY.md tenancy audit first).
- **Multi-question sessions**: several questions per class set, cross-question belief view.
- **Richer analysis**: per-answer confidence, "borderline" band between two beliefs, teacher drag-to-regroup corrections that refine the map.
- **Browser extension**: `extension/` manifest scaffold → select answers in Google Classroom/your VLE and map them in place.
- **Exports**: first-class PDF, department-shared template formats, slide-per-belief deck.
- **More languages**: full UI localisation beyond en/fr/es chrome strings; right-to-left support.
- **Accessibility**: formal WCAG 2.1 AA audit with assistive-tech testing.
- **Providers**: native Anthropic adapter, streaming progress for large classes, response caching for identical inputs.
- **Self-hosted fonts** so production builds don't depend on Google Fonts at build time.
