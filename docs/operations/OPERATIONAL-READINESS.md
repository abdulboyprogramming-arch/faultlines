# Operational Readiness

| Concern | Status |
|---|---|
| Health check | `GET /api/health` → `{ok, provider}`; safe for uptime monitors, leaks nothing |
| Failure behaviour | LLM down/misconfigured → heuristic with visible `meta.degraded`; API down on static hosts → in-browser heuristic with a notice; offline → SW serves shell + `/offline` |
| Error quality | Calm user messages; server `console.error` with context (no answer text logged); no stack traces to clients |
| Observability | Host logs (Vercel) suffice at MVP scale; add an external uptime ping on `/api/health` post-launch |
| Rate limiting | 30 req/min/IP in-memory (per instance); body caps 300KB; answer caps enforced both sides |
| Security posture | Headers + CSP (next.config.ts), Zod everywhere, CSV-injection safe exports, server-only keys, security.txt — see SECURITY.md |
| Accessibility | Labels, focus rings, aria-live/pressed, keyboard bands + game, reduced-motion, print stylesheet |
| Backups | Stateless app: nothing to back up server-side. Source of truth = git. User data lives in their browser by design |
| Runbook (site down) | 1) `/api/health` 2) host status 3) promote previous deployment 4) `git revert` last release if needed |
| Runbook (bad analysis quality) | Check `/api/health` provider; confirm `LLM_API_KEY`/quota; heuristic keeps service useful meanwhile |

**Launch gate:** `npm run check` green + live smoke test (RELEASE.md step 2) + README demo link verified.
