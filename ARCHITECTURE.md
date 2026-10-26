# Architecture

Next.js App Router + TypeScript + Tailwind 4. One serverless route, `POST /api/analyze`, plus `GET /api/health`. No DB, no auth, no server-side persistence. State lives in the browser; optional local history in `localStorage`; shareable reports via validated URL hash.

## Analysis pipeline

```
paste / .txt / .csv ─→ client prepare (cap 120, dup count)
  ─→ POST /api/analyze ─→ Zod request validation (lib/schema.ts)
  ─→ provider (lib/llm/) ─→ normalise (lib/validate.ts) ─→ Zod result validation ─→ strata map
```

Two providers behind one interface (`lib/llm/provider.ts`):

- **Heuristic (`mock.ts`, default)** — deterministic, topic-agnostic: tokenises (EN/FR stopwords, light stemming), routes claim-free answers ("idk", <2 content tokens) to *unsure*, leader-clusters the rest by Jaccard similarity (≥ 0.15, tuned against the three example classrooms — see `docs/recovery/RECOVERY_LOG.md`). Singletons in a normal-sized class become *unsure* rather than one-person "beliefs". Risk is a prevalence proxy and is labelled "Heuristic preview" in the UI — it groups wording, it does not judge correctness.
- **LLM (`real.ts`, env-gated)** — any OpenAI-compatible Chat Completions endpoint. The prompt demands **member indexes**, never counts or quotes. This is the faithfulness trick: quotes and counts are *derived* from membership on the server, so they are verbatim and sum exactly **by construction**; anything the model skips becomes unsure. Failures fall back to the heuristic with `meta.degraded = true` — visible to the teacher, never silent.

`lib/validate.ts` then dedupes quotes, drops any quote that isn't verbatim against the submitted answers, risk-sorts (high → low), and the route re-validates the final shape with Zod before returning it.

## Why these choices

- **Index-based LLM output** over "trust the JSON": the PRD's acceptance criteria (verbatim quotes, exact denominators, no invented beliefs) become structural guarantees instead of prompt hopes.
- **Heuristic first-class, not a stub:** the demo and key-less deployments must be genuinely useful; the previous seasons-only keyword stub made the product a one-topic toy.
- **No persistence:** keeps the privacy story trivially auditable (SECURITY.md) and matches the POC boundary in `devpost/scope.md`.
- **Static-export fallback:** on GitHub Pages there is no API route, so the client runs the same heuristic in-browser and says so.

## Key files

| Path | Role |
|---|---|
| `app/tool/page.tsx` | Core loop UI (input → map → detail → export) |
| `app/api/analyze/route.ts` | The single analysis endpoint |
| `lib/schema.ts` | Shared client/server contract + limits |
| `lib/validate.ts` | Normalisation & verbatim-quote enforcement |
| `lib/llm/{provider,mock,real,index}.ts` | Provider interface, heuristic, LLM, resilient selection |
| `lib/{export,share,parse-input,history,i18n}.ts` | Exports, share codec, CSV/lines, local history, en/fr/es |
| `data/examples.ts` + `example-*.json` | Three cached example classrooms (zero-network demo) |
| `tests/` | Vitest: heuristic invariants, normalisation, exports, share codec, API contract |
