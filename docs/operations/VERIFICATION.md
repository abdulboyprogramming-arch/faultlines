# Independent Verification

How a third party (judge, auditor, future maintainer) can re-derive every claim in this repo from scratch:

```bash
git clone https://github.com/abdulboyprogramming-arch/faultlines && cd faultlines
npm ci            # lockfile-exact install (proves CI reproducibility)
npm run check     # eslint (0) + tsc (0) + 61 Vitest tests
npm run build && npm start
```

Then, with the server on :3000:
1. `curl localhost:3000/api/health` → `{"ok":true,"provider":"mock"}` (no key configured).
2. POST the fractions example to `/api/analyze` (see `docs/recovery/ACCEPTANCE.md`) → counts sum to 17, every quote appears verbatim in `data/example-fractions-answers.json`.
3. In a browser: `/tool` → each example → counts on bands equal cluster `count`s in the JSON; "N of T" denominators equal the answers file length.
4. DevTools → Network → Offline → reload `/tool` (shell + heuristic work), visit a random URL (404 game), open `/offline`.
5. Claims about faithfulness are enforced by `lib/validate.ts` + `lib/llm/real.ts` (`resultFromIndexes`) and pinned by `tests/validate.test.ts`, `tests/providers.test.ts`, `tests/real-and-api.test.ts`.
6. Security claims: `grep -rn NEXT_PUBLIC . --include='*.ts' --include='*.tsx'` (no secrets surface), headers via `curl -sI localhost:3000/`, audit narrative in `SECURITY.md`.
7. Extension: `chrome://extensions` → Developer mode → Load unpacked → `extension/` → set app address → select text on any page → right-click "Send selection to Fault Lines".

Known unverifiable-here items (stated honestly): live LLM quality (needs a key), real-device PWA install prompts (Chromium/iOS heuristics), screen-reader pass (code-level ARIA only).
