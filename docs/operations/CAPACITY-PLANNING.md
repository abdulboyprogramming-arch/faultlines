# Capacity Planning

## Cost & load shape (measured characteristics)
- Heuristic mode: pure CPU, ~ms per request; a 120-answer class analyses in <50ms server-side (test asserts <1.5s with huge margin). Effectively unbounded at MVP scale; serverless concurrency is the only ceiling.
- LLM mode: ONE batched call per analysis (not per answer) — tokens ≈ answers×~40 in + ~1–2k out. A 120-answer class ≈ 5–7k tokens ≈ fractions of a cent on mini-class models. Latency dominated by provider (typically 3–15s; 45s timeout then visible heuristic fallback).
- Payload caps (120×2000 chars, 300KB) bound worst cases. Rate limit 30/min/IP bounds abuse; add a shared-store limiter (e.g. Upstash) only if multi-instance abuse appears.

## Scaling triggers
| Signal | Action |
|---|---|
| Sustained >100 analyses/day in LLM mode | Add response caching keyed by hash(inputs+question+model) |
| Provider latency complaints | Stream progress UI; consider smaller/faster model; keep heuristic instant-preview |
| Pages static export growing traffic | Already CDN-friendly (static + SW runtime cache) |
| Rate-limit false positives behind school NAT | Raise per-IP limit; key by IP+UA; or signed school tokens (post-MVP) |

No database, sessions or queues exist to scale. If accounts arrive, this document and SECURITY.md's tenancy audit must be revised first.
