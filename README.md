# Fault Lines

**See what your class actually misunderstands.** For teachers marking written answers.

Paste your class's answers to one question (one per line, names removed) and Fault Lines groups them by the *belief* underneath — not by mark — names each belief, ranks it by exam risk, proves it with verbatim student quotes, and gives you a ~5-minute reteach plan plus a follow-up diagnostic question. Anything too vague to classify is shown honestly as **“Not sure — needs your eyes”** instead of being invented.

> Every class has fault lines. See them before the exam does.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 → **Map my class**. It works with **no API key**: a built-in deterministic heuristic groups similar answers, and three cached example classrooms (seasons, fractions, photosynthesis) run with zero network.

## What you get

- **Strata map** — beliefs sized by share of class (`18 of 28 · 64%`), ordered by exam risk, keyboard accessible.
- **Evidence** — verbatim quotes only; counts always sum to your class size. Guaranteed by construction, not by trust (see `ARCHITECTURE.md`).
- **Reteach cards** — title, minutes, steps, check question + follow-up diagnostic per belief; copy a single card or the whole plan.
- **Exports** — copy/print one-page plan, Markdown, CSV, JSON, and shareable links (the report travels inside the link; no server storage).
- **Inputs** — paste, drag-and-drop, or upload `.txt`/`.csv` (answer column auto-detected). Optional question field improves grouping. Live counter, duplicate detection, calm 120-answer cap.
- **Local history** — your last 8 maps in *this browser only*, labelled, individually deletable (Settings can wipe everything — use it on shared computers).
- **Languages** — UI in English/Français/Español (Settings); analysis works on answers in any language.
- **PWA** — installable; example classrooms and the heuristic work offline.

## Using a real AI provider (optional)

The built-in heuristic groups by *wording similarity* — it cannot judge correctness. For true misconception analysis, configure any **OpenAI-compatible** endpoint on the server (OpenAI, OpenRouter, Groq, Together, a local model…):

```bash
cp .env.example .env.local
# LLM_PROVIDER=openai
# LLM_API_KEY=sk-...        # server-side only — never NEXT_PUBLIC_
# LLM_MODEL=gpt-4o-mini
# LLM_BASE_URL=https://api.openai.com/v1
```

The model returns *member indexes* per belief; counts and quotes are then derived server-side from your actual paste — so quotes stay verbatim and counts stay exact even in AI mode. If the provider fails (bad key, timeout, malformed output) the app falls back to the heuristic and **tells the teacher** (`meta.degraded`). Check which engine a deployment uses at `GET /api/health` or in Settings.

## Privacy

No accounts, no database, no server-side storage of answers or results. Remove student names before pasting (the UI reminds you). Share links embed the anonymised report in the URL hash — anyone with the link can view it, and the UI says so. See `SECURITY.md` for the full client-secrets/tenancy audit.

## Develop

```bash
npm run dev        # develop
npm run build      # production build
npm run lint       # eslint (zero problems expected)
npm run typecheck  # tsc --noEmit
npm test           # vitest (unit + API tests)
npm run check      # all three
```

Stack: Next.js App Router + TypeScript + Tailwind 4 + Zod. One API route (`app/api/analyze`). Provider interface in `lib/llm/` (`mock` heuristic + `real` OpenAI-compatible). Structure: see `STRUCTURE.md`; design decisions: `ARCHITECTURE.md`; product docs: `devpost/`.

## Deployment

- **Vercel / any Node host** — full app including `/api/analyze`. Set env vars there if using a real provider.
- **GitHub Pages** (`GITHUB_PAGES=true`, see workflow) — static export; the tool automatically runs the heuristic in-browser when no API is available, and says so.

## Project status

MVP complete (v1.0.0). This codebase went through a full recovery & completion pass — state, audits, plan, log, acceptance evidence and handoff live in `docs/recovery/`. Future ideas: `ROADMAP.md`.

## Acknowledgements

Built by Abdulrahman Adeeyo (Abdulboy) for the Devpost "Build with AI: Basics" hackathon — a proof of concept exploring flipped interaction and plan-first development with AI. MIT licensed.
