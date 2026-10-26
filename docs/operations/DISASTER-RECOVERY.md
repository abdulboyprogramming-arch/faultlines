# Disaster Recovery

Stateless by design — recovery is mostly "redeploy". RTO target: <15 minutes. RPO: 0 (no server data).

| Disaster | Recovery |
|---|---|
| Bad deploy | Promote previous Vercel deployment (1 click) or revert the merge; CI gates make this rare |
| Host outage (Vercel down) | GitHub Pages static build is the hot spare: same repo, workflow already configured — heuristic runs in-browser, examples + game + offline all work; only LLM mode is degraded |
| LLM provider outage / key revoked | Automatic visible fallback to heuristic; rotate key in host env; no code change |
| Repo loss | Any clone is complete (code + docs + data + tests). Re-create remote, push, re-link host |
| Compromised API key | Revoke at provider, set new `LLM_API_KEY` in host env, redeploy. Key was never client-exposed (SECURITY.md) so blast radius is billing-only |
| Malicious share link / weird local data | Nothing server-side to purge. Users: Settings → Clear all local data |
| Domain/DNS loss | App is host-agnostic; point DNS at the Pages/Vercel spare; SW continues serving installed users offline in the gap |

**Drill (5 min, do once per release):** deploy the Pages build, open it, run an example offline (DevTools → Network → Offline → reload → `/offline` + game + tool heuristic). If that works, the spare is real.
