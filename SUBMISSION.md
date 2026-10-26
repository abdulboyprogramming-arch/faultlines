# Devpost Submission Pack — Fault Lines

_Everything needed to submit, in order, with copy-paste text, a demo script, and the exact AI prompts for each asset. Estimated total time: 60–90 minutes._

---

## Stage 0 — Freeze & verify (10 min)

**Do:**
```bash
git checkout main && git pull          # after the PR is merged
npm ci && npm run check                # lint + typecheck + 61 tests must be green
npm run build && npm start             # click through: /, /tool (all 4 examples), /settings, /play, a 404
```
**Deploy (pick one):**
- **Vercel (recommended)**: vercel.com → New Project → import `abdulboyprogramming-arch/faultlines` → Deploy. No env vars needed (heuristic mode). Optional: add `LLM_PROVIDER=openai`, `LLM_API_KEY=…`, `LLM_MODEL=gpt-4o-mini` in Project Settings → Environment Variables for AI-grade maps.
- **GitHub Pages**: repo Settings → Pages → Source: GitHub Actions; push to `main` (workflow already configured). Static mode auto-runs the heuristic in-browser.
**Verify the live URL** on a phone + laptop: load an example, export the plan, toggle dark mode, try the install prompt, play one round of Strata Drop on a 404.

**AI prompt for a final self-review (paste repo URL + this prompt into your AI assistant):**
> "You are a hackathon judge for 'Build with AI: Basics'. Review this repo and live demo. Score: innovation, execution, design, impact, presentation (1–10 each) with one brutal improvement per category that can be done in under 30 minutes."

## Stage 1 — Screenshots (10 min)

Capture at 1440×900 (browser zoom 100%), in this order — Devpost gallery order matters:
1. **Hero**: landing page top ("Every class has fault lines…") with the animated logo.
2. **The map**: /tool → Load "Why do we have seasons?" → screenshot the strata bands + "Start here" banner.
3. **Evidence + reteach**: same view scrolled to the selected band (quotes + reteach card visible).
4. **Honesty shot**: expand "Not sure — needs your eyes".
5. **Fractions example** (shows it's not a one-topic toy).
6. **Mobile shot**: DevTools device toolbar (iPhone width) on the results, or the installed PWA home-screen icon + app open.
7. **Delight shot**: the 404 page mid-game of Strata Drop.

**AI prompt (thumbnail/cover, optional):**
> "Minimal editorial illustration, geological strata layers in rust orange, ochre, slate teal and ink black on warm off-white paper (#F4F1EA), a white zigzag fault crack displacing the layers, flat vector style, generous negative space, no text."

## Stage 2 — Demo video (20 min, 90 seconds max)

**Tools:** OBS / Loom / Screenity. Record the LIVE deployment, 1080p.
**Script (read verbatim or adapt):**
- 0:00 "I'm Abdulrahman Adeeyo. This is Fault Lines. Every class has fault lines — see them before the exam does."
- 0:08 (landing) "Teachers mark 120 scripts and still miss the one belief the whole class shares. Fault Lines makes it visible."
- 0:18 (click Map my class → Load seasons example) "28 messy answers to one question… become this: 18 of 28 students think summer happens because Earth is closer to the Sun. High risk. Start here."
- 0:38 (open band) "Every belief is proven with the students' own words — verbatim, always — and comes with a five-minute reteach and a follow-up diagnostic."
- 0:55 (expand Not sure) "And when an answer is too vague, it says so. It never invents a misconception. Trust over hallucination."
- 1:05 (fractions example + export menu) "Any subject. Export the one-page plan, or share it with a link. No accounts, nothing stored."
- 1:18 (404 game, 3 seconds of play + phone/PWA quick shot) "It works offline, installs like an app, speaks seven languages — and yes, the 404 page has a game. Fault Lines: misconception cartography for teachers."

**AI prompt (polish narration):**
> "Rewrite this 90-second hackathon demo narration for a teacher-focused edtech tool. Keep it warm, zero buzzwords, every sentence under 15 words, end with one memorable line."

## Stage 3 — Devpost form (copy-paste blocks) (15 min)

**Project name:** Fault Lines
**Tagline:** See what your class actually misunderstands — grouped by belief, ranked by exam risk, proven in their own words.
**Built with:** `nextjs` `typescript` `react` `tailwindcss` `zod` `vitest` `pwa` `openai-api` `vercel`

**Inspiration**
> Marking 120 scripts, writing "see me" on thirty, and still missing the one belief the whole class shares. Teachers don't lack data — every answer is data. They lack a map. We asked: what if an answer isn't a mark, but evidence of a belief? Fault Lines is misconception cartography: it draws the fault lines running through a class before the exam finds them.

**What it does**
> Paste your class's written answers to one question (or upload a CSV). In seconds you get a strata map: each band is a distinct underlying belief, sized by share of class ("18 of 28"), ordered by exam risk, proven with verbatim student quotes, with a ~5-minute reteach card and a follow-up diagnostic question per belief. Answers too vague to classify are shown honestly as "Not sure — needs your eyes" instead of being assigned an invented misconception. Export a one-page plan (copy/print/Markdown/CSV/JSON) or a shareable link. Works with no API key (built-in deterministic engine + 4 cached example classrooms across science, maths and history), offline as an installable PWA, in 7 languages — and the 404 page hides an original game, Strata Drop.

**How we built it**
> Plan-first: scope → PRD → spec (in `devpost/`) before code. Next.js App Router + TypeScript + Tailwind, one serverless endpoint, Zod on every boundary. The key design decision: when an LLM is configured it returns *member indexes*, never counts or quotes — so quotes are verbatim and counts sum exactly by construction, not by trusting the model. A deterministic heuristic engine (tuned against the example classrooms) makes the whole product work key-free and offline. The project then went through a documented 7-stage recovery/completion process (`docs/recovery/`) — including the discovery that our API route had never once executed — ending with 61 automated tests covering every core system, a browser extension that sends selected answers from any web page into the tool, and full operational-readiness docs.

**Challenges we ran into**
> Our API route referenced a schema that didn't exist — the demo only "worked" via a silent fallback to a mock that understood exactly one topic. Fixing that honestly (instead of papering over it) produced the faithfulness architecture. Making a heuristic that's useful without pretending to judge correctness, keeping quotes verbatim across languages/unicode, and making CSV uploads from real markbooks behave were the other hard parts.

**Accomplishments we're proud of**
> Faithfulness as a structural guarantee, not a prompt hope. A genuinely key-free, offline-capable product. The "Not sure" bucket as a trust feature. 61 tests, green CI, zero lint. A logo, loader, icons and a whole game generated programmatically — no stock assets anywhere.

**What we learned**
> Plan-first + flipped interaction with AI works — but only if you verify. "It compiles in the demo" is not "it works". The recovery discipline (preserve → reconstruct → audit → prove end-to-end) is now documented in the repo for anyone to reuse.

**What's next**
> Live-test the LLM path with real teachers' anonymised classes; misconception tracking over time (did the reteach shrink the band?); the extension into the Chrome Web Store; more languages and a formal WCAG audit. See ROADMAP.md.

**Links to fill:** Live demo URL (Stage 0) · GitHub repo · Video (Stage 2) · Try-it note: *"No login. Click 'Map my class' → 'Load example classroom'. Try the 404 page for a surprise."*

## Stage 4 — Final click-through as a judge (10 min)

Incognito window, live URL, no guidance: Can you reach a belief map in ≤3 clicks? Does every button work? Does the phone layout hold? Is there any lorem/dead link? Check `/api/health` shows your intended provider. Then hit **Submit** — and screenshot the confirmation for your records.

## Stage 5 — After submission

- Pin the repo on your GitHub profile; add the Devpost link to the README's first line.
- Post-mortem issue list from judge feedback → label `post-hackathon` in GitHub Issues.
- If extending: run `npm run check` before every push; follow `docs/operations/RELEASE.md`.
