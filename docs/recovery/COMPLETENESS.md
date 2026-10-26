# REC-P03 — Completeness Audit (at preserved HEAD)

| Area | State | Evidence |
|---|---|---|
| `/api/analyze` | **BROKEN (never ran)** | `BodySchema` undefined → TS2304; no limits, no try/catch around provider, unbounded rate-limit Map |
| Lockfile / CI | **BROKEN** | `npm ci` fails (lock out of sync); deploy workflow triggers on `master` (default branch is `main`) + wrong `basePath: /devpost-hackathon` |
| Mock provider | Stub-grade | Hard-coded to ONE topic (seasons/sun/tilt); useless for any real class; duplicated quote when bucket has 1 item |
| Real LLM provider | Absent | `getProvider()` silently falls back to mock for every value — misconfiguration is invisible |
| Question context | Absent | UI/API never collect the question the answers answer (PRD core) |
| Validation/normalization | Absent | Spec's `lib/validate.ts` missing; counts may not sum; quotes not checked verbatim; clusters not risk-sorted; schema demands exactly 2 quotes |
| Tool UI | Partial | Error state set but **never rendered**; exports contain literal `\n` (`\\n` bug); share-link reader exists but no writer; unsure answers never displayed; stale-closure history; sample pollutes history; no answer counter/cap notice; CSV accepted but not parsed as CSV |
| Landing | Works | Static, honest copy; no how-it-works/privacy/FAQ depth |
| Settings/i18n | Half-wired | `lib/i18n.ts` exists (en/fr) but tool page hard-codes English; locale select sits outside the settings container |
| PWA/extension | Scaffold | sw.js no caching; extension manifest only (documented as future) |
| Tests | **None** | No test script, no test files |
| Accessibility | Partial | Unlabelled textarea/file input; bands lack `aria-pressed`; no `aria-live` loading; no print stylesheet |
| Security | Mostly good | No secrets anywhere (see SECURITY.md audit); good headers in next.config; share-hash parsed without validation (crash risk, React escaping prevents XSS) |

**Client-side secrets audit:** no API keys, tokens, or `NEXT_PUBLIC_*` secrets in the repo or client bundle paths; `.env.example` correctly server-side. The one real risk is *data*, not secrets: share links/history embed student quotes in URL hash/localStorage — must be labelled, validated, and clearable.
**Tenancy audit:** there is no tenancy. No auth, no DB, no per-user server data; every visitor is an anonymous single-tenant session in their own browser. Multi-tenancy findings reduce to: shared-device localStorage exposure + share-link bearer-data exposure. Both mitigated in this recovery (clear-data control, privacy labelling, hash validation). No tenant-isolation code is needed for MVP; adding accounts later must re-run this audit.
