# Security & Privacy

## Client-side secrets audit (2026-10-26)

**Verdict: clean.** No API keys, tokens or credentials exist anywhere in this repo, and none can reach the browser by accident:

- The only secret the system can hold is `LLM_API_KEY`, read **server-side only** in `lib/llm/index.ts` / `lib/llm/real.ts`. It is never prefixed `NEXT_PUBLIC_`, never imported by a client component, and never returned by an API route.
- `GET /api/health` exposes only `{ ok, provider: "mock" | "llm" }` — enough for the Settings page, useless to an attacker.
- `.env.example` documents the server-side variables and explicitly warns against `NEXT_PUBLIC_`.
- Security headers on every response (`next.config.ts`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

## Data (the real risk is student text, not secrets)

- **No server storage.** Answers exist server-side only for the duration of one `POST /api/analyze`. Nothing is logged except error messages (which exclude answer text), persisted, or sent anywhere except — in LLM mode — to the teacher-configured provider endpoint.
- **Remove names first.** The UI instructs this above the paste box and after file upload.
- **Local history** lives in `localStorage` (this browser only), is labelled as such, per-item deletable, and wipeable in one click (Settings → Clear all local data). On shared school computers, treat it like a notebook left on a desk.
- **Share links** encode the full report (including anonymised quotes) into the URL hash. The hash is never sent to a server, but the link is bearer data: anyone with it can view the report. The UI states this next to the share button. Shared payloads are Zod-validated on open; malformed links fail calmly.
- **API hardening:** input capped (120 answers × 2000 chars, 300 KB body), rate-limited (30/min/IP, self-cleaning map), all provider output Zod-validated and normalised (quotes verified verbatim against the submitted answers) before it is returned; errors are calm messages, never stack traces.

## Tenancy audit

**There is no multi-tenancy to breach.** No auth, no accounts, no database, no per-user server state: every visitor is an anonymous single-tenant session confined to their own browser. Consequently there is no cross-tenant data path. The two tenancy-adjacent risks are the shared-device localStorage and bearer share links above — both labelled and user-controllable. **If accounts/persistence are ever added (see ROADMAP), this audit must be re-run before release**: tenant isolation, per-user authorisation on every query, and data-retention rules would all become live requirements.

## Reporting

Open a private security advisory on GitHub, or an issue for non-sensitive hardening suggestions.
