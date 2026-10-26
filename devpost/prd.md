---
doc: prd
status: approved
---

# Fault Lines — Product Requirements

One line: for teachers marking written answers, a misconception map that groups a class by underlying belief, ranks beliefs by exam risk, and gives a reteach plan — source: `scope.md > The Core Loop`, `scope.md > The Unique Kernel`.

## The Core Journey
1. Teacher opens Fault Lines; first screen states what it does and who it's for.
2. They either paste up to ~60 answers (one per line), with names removed, or click "Load example classroom."
3. They click "Map my class"; input is validated; loading state shows real progress ("Reading 28 answers…").
4. Results screen renders the strata map: each band a belief, sized by share of class, ordered by risk, with counts ticking up in a single ~900ms reveal.
5. They click a band to see two representative quotes and a "what they need to hear" reteach card (title, minutes, steps, check question).
6. They export a one-page reteach plan (copy / print).
7. Empty answers or vague answers land in "Not sure — needs your eyes" instead of being invented.

## Screens and Layout
Single surface, two states:
- **Input state:** header (name + purpose sentence + minimal nav) → primary paste workspace with format instructions and privacy cue → "Map my class" button → "Load example classroom" link → trust/privacy note.
- **Results state:** header with counts ("28 answers · 1 question · 4 beliefs") → strata map (bands + cracks) → selected band detail (quotes + reteach card) → "Export plan" → "Start over / new question."

## Look and Feel
Geological survey, refined to competition quality: warm off-white paper `#F4F1EA`, ink `#14110E`, rust `#B5471F` warning accent, slate `#3E5C63` "solid" accent — four colors only. One characterful serif display face (Fraunces/Instrument Serif) for headings + clean grotesque for UI. Big type, generous space. Horizontal strata bands sized by share; hairline hand-drawn cracks between bands. One orchestrated top-to-bottom reveal with counts ticking up (~900ms); nothing else animates. Copy like a person ("Map my class", not "Submit"; "Not sure — needs your eyes"). Accessible, responsive, readable.

## Features and Behavior

- **Input and validation**
  - Paste box accepts up to ~60 answers, one per line; empty lines ignored; input capped with a calm notice if exceeded.
  - "Remove student names before pasting" shown above the box.
  - Validation: requires at least 1 non-empty answer; shows inline error otherwise.
  - "Load example classroom" fills the box with synthetic data and runs analysis with zero network (cached result).
- **Analysis**
  - Single batched model call with a fixed JSON schema (clusters + unsure).
  - Every field validated before render; malformed response falls back to cached example with a calm notice — never a stack trace.
  - Unclassifiable answers go to "unsure" bucket, labeled "Not sure — needs your eyes."
- **Results map**
  - Bands sized by share of class, ordered by risk (high → low), then unsure.
  - Click/tap a band to reveal quotes and reteach card; keyboard accessible.
  - Counts animate up during the single reveal.
- **Reteach and export**
  - Each cluster: label, plain name, count, risk, why it matters, 2 quotes, reteach (title, minutes, steps, check question).
  - Follow-up diagnostic question included in MVP for each significant gap, used to check subsequent understanding (no claim of improved learning without evidence).
  - "Export plan" copies/prints a one-page reteach summary.

## Acceptance Criteria
- Evidence-linked findings: every cluster cites count and denominator (e.g., "18 of 28").
- Faithful source quotations: quotes are verbatim student sentences from input.
- Uncertainty/insufficient evidence: vague answers go to "Not sure — needs your eyes," never invented.
- Accurate counts and denominators: counts sum to total answers; unsure counted separately.
- Actionable reteaching: each cluster has a 5-minute reteach plan with steps and a check question.
- Follow-up diagnostics: a re-check question per significant gap.
- Privacy: no accounts/storage; names-removal notice; no identifying data sent.
- Accessibility: keyboard operable, readable contrast, responsive.
- Input validation: inline errors, capped input with calm notice.
- Graceful failure: calm notice + cached fallback; no stack traces.

## States and Boundaries
- **First use / empty:** paste prompt + example option + privacy cue.
- **Loading:** "Reading N answers…" with real progress text; no fake spinner-only.
- **Normal results:** map + detail.
- **Error (bad key / junk JSON / too many):** calm notice + fallback to cached example where possible.
- **No persistence:** nothing stored between sessions; "Start over" clears.
- **Privacy:** no accounts, no storage, no identifying data sent; names-removal notice.

## Product Decisions
- Single batched call over per-answer calls — cheaper, faster, simpler (`scope.md > The Core Loop`).
- Cached example classroom in repo as the demo safety net (zero network/key/failure).
- "Not sure" bucket over hallucinating a misconception — trust signal.
- No accounts/persistence — keeps POC shippable in 2–4 hours.

## What We're Building
Paste → validate → analyze (or cached) → strata map with counts/quotes/reteach → export. Plus example mode, unsure bucket, re-check diagnostic question, accessibility + responsive.

## Deferred From the POC
CSV upload; saving a session; print stylesheet (basic copy/print only); multi-question history; LMS integration.

## Non-Goals
Accounts, logins, database, per-student grades, mobile app, real student names, unlicensed assets.

## Open Questions
- LLM provider integration is provider-agnostic with a mock for dev/test; real provider requires learner's key and approval. Not a PRD blocker.
- Review format: HTML (set in 2-scope).