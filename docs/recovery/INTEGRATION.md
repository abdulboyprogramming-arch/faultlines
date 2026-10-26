# REC-P04 — Environment & Integration Truth (at preserved HEAD)

- Node v22.22.3 / npm 10.9.8 in sandbox; repo targets Node 20 (CI). Deps: next 16.4.3, react 19.3, zod 4.6, tailwind 4.
- `npm ci` → ❌ lockfile out of sync (`@emnapi/*` entries) — **CI/deploy cannot install**.
- `npm install` → ✅ (regenerates lockfile).
- `npx tsc --noEmit` → ❌ 2 errors, both in `app/api/analyze/route.ts` (undefined `BodySchema`).
- `npm run lint` → ❌ 16 errors / 3 warnings (`any`, set-state-in-effect, unused).
- `npm run build` → ❌ in sandbox only: `next/font/google` fetches Fraunces/Inter at build; fonts.googleapis.com is outside the sandbox allowlist. Not a repo defect (Vercel/CI can fetch) but noted: build depends on network. Local verification here uses a temporary font stub, reverted before commit, plus tsc/lint/tests and a dev-server smoke test.
- Runtime truth: with the API route unable to compile, `POST /api/analyze` 500s and the tool silently catch-falls-back to the in-browser seasons-only mock. The demo "worked"; the product didn't.
- No external services required for MVP (mock default). Real LLM = optional env-gated HTTPS call, added in P06.
