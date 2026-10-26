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

**AI prompt (thumbnail/cover — locked in):**
> "A minimal editorial vector illustration for a teacher's tool called Fault Lines, landscape 16:9. Four flat geological strata bands stacked across a warm off-white paper background (#F4F1EA): rust orange (#B5471F), ochre (#C98A2E), slate teal (#3E5C63) and deep ink (#14110E), confident slightly hand-drawn edges. A single clean diagonal fault crack slices through the bands from top-left to bottom-right, offsetting the layers on each side so the strata visibly slip out of alignment. One thin ochre survey line and three small circular sample markers suggest a map being read. Large empty paper space in the upper-left third for a title. Flat vector, subtle paper grain, no gradients, no shadows, no text, no letters, no logos, no people."
>
> **Negative:** no text, no letters, no gibberish words, no gradients, no photorealism, no 3D render, no stock-photo people, no lens flare, no watermark, no busy texture.

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

**Project name (60-char limit):** `Fault Lines` (11) — recommended. Alt: `Fault Lines — Misconception Map for Teachers` (44).
**Elevator pitch (200-char limit):** `Paste your class's answers and see the beliefs underneath — sized by how many share each one, ranked by exam risk, proven in their own words.` (141)
Alt pitch: `Paste your class's answers. Fault Lines maps the beliefs underneath — sized by share of class, ranked by exam risk, proven in their own words, with a 5-minute reteach each.` (172)
**Thumbnail prompt:** see Stage 1 — final copy-paste prompt (16:9, no text; add the title in Canva/Figma if needed). Export 1600×900 PNG, under 5 MB, with the artwork's focal fault line inside the middle 80 % so the card crop never cuts it.
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

## Stage 3b — Public project page (story, tags, links, gallery)

### Project Story → About the project (paste as Markdown; Devpost renders LaTeX)

## Inspiration

Mark 120 scripts on a Sunday, write “see me” on thirty of them, and you still walk into Monday not knowing the one thing you actually need to know: **what does this class believe?**

Every answer on those scripts is evidence. A mark book throws that evidence away and keeps only the verdict. Two students can write the same sentence for opposite reasons — one guessing, one half-right — and both get the same tick. Meanwhile the belief that half the class shares, the one that will cost them in the exam and take five minutes to fix, is invisible because it is spread across forty different scripts.

Fault Lines started from a reframing: an answer is not a mark, it is **evidence of a belief**. If you group answers by the belief underneath instead of by score, the class stops looking like a bell curve and starts looking like a landscape — with fault lines running through it. The job of the tool is to draw that map before the exam finds the cracks.

## What it does

Paste your class’s written answers to one question — one per line, or drop a `.txt`/`.csv` from a markbook. In seconds, Fault Lines returns a **strata map**:

- Each band is a distinct belief, **named in plain language** and sized by share of class — *18 of 28 students · 64%*.
- Bands are **ordered by exam risk**, not by frequency, and a single “start here” call-out tells you which one to reteach first.
- Every band is **proven with verbatim quotes** from the actual scripts, unedited.
- Each belief ships with a **≈5-minute reteach card** (title, minutes, steps, check question) and a **follow-up diagnostic** question to test whether the reteach landed.
- Anything too vague to interpret is set aside honestly as **“Not sure — needs your eyes”**, with the raw answer shown. It is never assigned an invented misconception.

Then take it with you: copy the one-page plan, print it for the staffroom, download Markdown/CSV/JSON for department records, or share it as a link (the report travels inside the URL, not on a server). Re-map the same question a week later and it shows you **which beliefs shrank** — the actual signal that a reteach worked.

No accounts. No database. No stored student data. It runs key-free out of the box on a built-in deterministic engine, works offline as an installable PWA, and the entire interface is available in **seven languages** (English, French, Spanish, German, Portuguese, Yorùbá and Arabic with full RTL).

## The design decision everything else follows from

Most “AI for teachers” tools ask you to trust the model. We removed the need to.

When an LLM is configured, it is only allowed to answer one question: **which answers belong together**. It returns *member indexes* — never counts, never quotes, never rewritten text. Everything the teacher actually reads is then derived from the paste itself:

- quotes are sliced verbatim out of the original answer, so they cannot be paraphrased;
- every count is computed from the grouping, so the totals are exact **by construction**:

$$\sum_{i=1}^{k} c_i \;+\; |U| \;=\; N$$

where $c_i$ is the size of belief $i$, $U$ is the set of answers too vague to classify, and $N$ is the number of answers you pasted. That identity is enforced in code and covered by tests — a map can be wrong about *which* belief an answer belongs to, but it can never quietly lose an answer, double-count one, or invent a quote.

If no API key is configured, a deterministic heuristic (tokenise → unassign vague answers → cluster around leaders) produces the same faithful structure with zero network. Every report and the Settings page say which engine produced the map, so a teacher always knows what they are reading.

## How we built it

Plan-first, not vibes-first: scope → PRD → spec live in `devpost/` and were written before the first component.

- **Next.js App Router + React 19 + TypeScript + Tailwind 4** (via PostCSS, no build-time font fetches — fonts are self-hosted).
- **One serverless endpoint** (`/api/analyze`) and a hard boundary at every edge: Zod schemas, size caps, rate limiting, `415`/`413`/`400` handled explicitly.
- A provider interface with two implementations: a deterministic heuristic and any OpenAI-compatible model, plus **visible degradation** — if the provider fails, the map is still produced and the teacher is told why.
- A real design system (paper / ink / rust / ochre / slate, Fraunces + Inter, dark mode, text-size scaling, reduced-motion-safe animation) rather than a component library, so the product feels like a field notebook, not a dashboard.
- Every asset is **programmatic** — the logo, icons, loading object, social card and the built-in game are SVG/canvas, no stock art anywhere.
- The interface itself went through a full localisation pass: seven complete, separately typed dictionaries, so a missing translation is a compile error instead of an English sentence on a Yorùbá page.
- **84 automated tests across 11 files** cover the parts that must not break: quote fidelity, count sums, CSV injection, share-link codecs, privacy scanning, backup validation, translation parity.

## Challenges we ran into

**The demo that never worked.** The API route referenced a schema that did not exist, and the only reason the demo looked alive was a silent fallback to a mock that understood exactly one topic. Finding that out was unpleasant; fixing it honestly produced the indexing architecture above.

**Honest grouping without judgement.** A heuristic can tell that “because it’s closer to the sun” and “the earth is nearer in June” are the same idea. It cannot tell you the idea is wrong. Making that limitation legible instead of papering over it is why the “Not sure” bucket exists — and why the engine is labelled on every report.

**Real markbook files.** CSV from schools is a war zone: quoted cells, merged headers, name columns, trailing commas, formulas that execute on open. All of it is handled and tested, including spreadsheet-formula injection on export.

**Seven languages, properly.** The first localisation attempt spread English over translated dictionaries, so switching language left most of the page in English. The fix was structural: one complete, typed dictionary per locale, plus a parity test that fails the build if a key, a `{placeholder}` or an entire screen is left untranslated.

## What we learned

- “It compiles in the demo” is not “it works”. Verify the path end-to-end, then write the test that proves it.
- Faithfulness is an architecture property, not a prompt. If you want verbatim evidence, take the model’s ability to write prose away from it.
- Removing a feature can be the trust feature. The “Not sure” bucket is the part teachers mention first.
- Plan-first work with AI is fast, but only when the plan is owned by a human and the acceptance criteria are written before the code.

## What's next

Live classroom trials with anonymised class sets through the real-LLM path; misconception tracking over time (did the reteach actually shrink the band?); the browser extension in the Chrome Web Store; a formal WCAG 2.1 AA audit; and community review of the Yorùbá and Arabic copy.

## Try it in thirty seconds

Open the live app → **Map my class** → **Load an example classroom**. No login, no API key, no data leaves your browser. Then hit a wrong URL: the 404 page hides *Strata Drop*, the little geological drilling game we built instead of an apology.

> Every class has fault lines. See them before the exam does.

### Built with (25/25 tags — paste one at a time)

`nextjs` `react` `typescript` `tailwindcss` `zod` `vitest` `vercel` `github-actions` `pwa` `service-worker` `openai-api` `llm` `education` `edtech` `teachers` `accessibility` `i18n` `rtl` `canvas` `svg` `localstorage` `markdown` `csv` `browser-extension` `web-app`

_Drop these first if you want fewer: `github-actions`, `service-worker`, `markdown`, `csv`, `localstorage`._

### "Try it out" links

| Label | URL |
|---|---|
| Live demo (no login) | `https://faultlines-kappa.vercel.app` |
| Source code | `https://github.com/abdulboyprogramming-arch/faultlines` |
| Privacy notes | `https://faultlines-kappa.vercel.app/privacy` |

### Image gallery (3:2 ratio, 5 MB max, up to 15 — ship 8, in this order)

Devpost shows the first image as the card, so image 1 is the cover. Export every shot at **2400×1600** (3:2), browser zoom 100 % at 1440 px wide, and keep the crop rectangle 3:2 while capturing so nothing important sits at the edges.

| # | Shot | How to capture | Caption |
|---|---|---|---|
| 1 | **Cover** | AI-generated (prompt below) — or the landing hero re-composed to 3:2 | "Fault Lines — every class has fault lines." |
| 2 | **The map** | `/tool` → load “Why do we have seasons?” → capture the strata bands + “Start here” banner | "28 answers become 5 beliefs, ordered by exam risk." |
| 3 | **Evidence + reteach** | Same view, scrolled to the open band (quotes + reteach card + diagnostic visible) | "Every belief is proven with verbatim student quotes." |
| 4 | **Honesty shot** | Expand “Not sure — needs your eyes” | "Too vague to classify is set aside — never invented." |
| 5 | **Second subject** | Load the fractions example (17 answers) | "Any subject: maths, science, humanities." |
| 6 | **Export** | Open the export bar, copy the plan, show the toast | "One-page plan: copy, print, Markdown, CSV, JSON, link." |
| 7 | **Mobile / PWA** | iPhone-width viewport on the report, then the installed app icon | "Installs like an app; works offline." |
| 8 | **Delight** | A wrong URL, mid-game of Strata Drop | "Even the 404 page has a game." |

**Cover prompt (16:9 crop-safe 3:2, no text):**
> "A minimal editorial vector illustration for a teacher's tool called Fault Lines, landscape 3:2. Four flat geological strata bands stacked horizontally across warm off-white paper (#F4F1EA): rust orange (#B5471F), ochre (#C98A2E), slate teal (#3E5C63) and deep ink (#14110E), confident slightly hand-drawn edges. A single clean diagonal fault crack slices through the bands from upper-left to lower-right, offsetting the layers on each side so the strata visibly slip out of alignment. One thin ochre survey line and three small circular sample markers suggest a map being read. Calm empty paper in the upper-left third. Flat vector, subtle paper grain, no gradients, no shadows. No text, no letters, no logos, no people."

**Second image option (concept, if you would rather show the idea than the product):**
> "Editorial flat-vector diagram, 3:2, on warm paper #F4F1EA. Left: twelve short horizontal ink tick marks stacked like a list, unremarkable. Right: the same twelve marks regrouped into four solid coloured bands — rust, ochre, slate, ink — with thin bracket lines joining them. A single hairline fault crack runs between the two halves. Minimal, lots of white space, no text, no numbers."

**Negative prompt:** `no text, no letters, no gibberish words, no watermark, no gradients, no photorealism, no 3D render, no lens flare, no busy texture`

**Gallery rules that matter:** first image must survive a 200 px-wide card crop (test it); keep all eight the same 3:2 and palette; no browser chrome or personal tabs in screenshots; captions should describe the product, not the screenshot ("28 answers become 5 beliefs", not "screenshot of the map").


## Stage 4 — Final click-through as a judge (10 min)

Incognito window, live URL, no guidance: Can you reach a belief map in ≤3 clicks? Does every button work? Does the phone layout hold? Is there any lorem/dead link? Check `/api/health` shows your intended provider. Then hit **Submit** — and screenshot the confirmation for your records.

## Stage 5 — After submission

- Pin the repo on your GitHub profile; add the Devpost link to the README's first line.
- Post-mortem issue list from judge feedback → label `post-hackathon` in GitHub Issues.
- If extending: run `npm run check` before every push; follow `docs/operations/RELEASE.md`.

## Stage 3c — Additional info (judges & organizers)

Every free-text answer below is **≤ 255 characters** (Devpost's limit on these fields).

### Individual / team
**Individual** (solo build).

### Country of residence
**Nigeria**

### Organization name
Leave blank — not applicable for an individual submission.

### Which of these did you actually use?
Tick **only what is true**. If you did not attend a live build session, a Cup of Joe call, or the Discord, select **None**. The Skill Pack use is what's scored.

### Did the cost of AI affect what you did?
**"It made me cut scope or switch to a cheaper model"** — the deterministic in-browser engine ships as the default so the product runs on zero API spend; the LLM path is an optional server-side upgrade.

### Confidence: plan and build a small, maintainable project with a coding agent
**5 (Easily)** — six approved planning docs, a slice-by-slice checklist, 84 tests, green CI, live deploy.

### If we could fix one thing before the next person tries this (245 chars)
> Add a "prove it end-to-end" gate to 5-build: hit /api/analyze once with a real payload and paste the response, and assert a translated page renders translated text. My route never ran; my 7 locales still showed English. Both checks take seconds.

Alt (248): Add a "prove it end-to-end" gate to 5-build: hit /api/analyze once with a real payload and paste the response, and assert a translated page renders translated text. My route never ran and my 7 locales still showed English; both checks take seconds.

### Open-source license URL
`https://github.com/abdulboyprogramming-arch/faultlines/blob/main/LICENSE` — MIT at repo root, already detected in the About panel.

### What kind of value did your project create for you?
**"Let me do something I couldn't do before"** + **"Created delight / was just fun"**.

### Tell us more about the value your project provides for you (241 chars)
> An agent is only as good as the docs you give it. Writing scope, PRD and spec first turned a vague idea into verifiable slices I could stop and redirect, gave me a mechanical definition of done, and left room to add craft no judge asked for.

Alt (249): Learning that an agent is only as good as the docs you give it: scope, PRD and spec turned a vague idea into verifiable slices I could stop and redirect. I also gained a mechanical definition of done, and the freedom to add craft no judge asked for.

### Explain how your project meets the main technology requirement (245 chars)
> Devpost Learn Skill Pack, all six skills pinned in skills-lock.json, used with flipped interaction: I owned scope, PRD, spec and checklist (devpost/), the agent built to them, each slice verified mechanically, then 6-ship gave CI, tests, deploy.

Alt (250): Devpost Learn Skill Pack, six skills pinned in skills-lock.json, flipped interaction: I owned scope, PRD, spec and checklist in devpost/, the agent built to them and every slice was verified mechanically; 6-ship gave CI, tests and the live deploy.

_If Devpost relaxes the limit, the longer judge-facing versions (full route story, traceability detail) are in this file's git history. The short forms above keep every load-bearing fact: skill names, flipped interaction, the four planning docs, mechanical verification, ship._

### Eligibility checkboxes
Both true: age of majority; eligibility + newly created during the Submission Period using the Learn Skill Pack (`skills-lock.json` pins all six hashes).

### Final gate before you press Save
- [ ] Preview link opens and the cover renders at card size
- [ ] Live URL loads on mobile data
- [ ] Repo About shows MIT + working homepage link
- [ ] Video uploaded (public/unlisted) and pasted in
- [ ] Every "Try it out" link opens with no login
- [ ] Fix the `taiwlindcss` repo topic typo → `tailwindcss`
