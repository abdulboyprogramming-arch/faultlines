# Release Engineering

## Versioning
Semantic-ish: `MAJOR` = breaking product/contract change, `MINOR` = features, `PATCH` = fixes. Current: **1.1.0**. Bump in `package.json`, note in `CHANGELOG.md` (Keep-a-Changelog style), tag `vX.Y.Z`.

## Release checklist
1. `npm ci` from clean tree; `npm run check` (lint 0 · tsc 0 · all tests) — CI must agree on the PR.
2. `npm run build && npm start` → smoke: `/`, `/tool` (4 examples + one pasted set), `/settings`, `/play`, `/offline`, a 404, `GET /api/health`.
3. PWA: bump `VERSION` in `public/sw.js` if precached assets changed (forces clean cache rollover; users get the update toast).
4. Extension (if touched): bump `version` in `extension/manifest.json`, `node --check` each JS file, load unpacked and test popup + context menu against the release URL.
5. Docs: CHANGELOG entry, README/ROADMAP deltas, STRUCTURE.md if files moved.
6. Merge PR → tag: `git tag vX.Y.Z && git push origin vX.Y.Z` → GitHub Release from the tag with CHANGELOG section pasted.
7. Deploy: Vercel auto-deploys `main`; GitHub Pages via workflow. Verify live URL + `/api/health` provider mode.
8. Rollback: Vercel → Deployments → previous → Promote; or `git revert` the release merge and redeploy. No DB/migrations exist, so rollback is always safe.

## Environments
Dev (localhost, mock) → PR preview (Vercel) → Production (`main`). Secrets only as host env vars (`LLM_*`); see SECURITY.md. Never commit `.env.local` (gitignored).
