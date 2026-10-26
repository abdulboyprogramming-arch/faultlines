---
doc: scope
status: approved
---

# Fault Lines

One line: a misconception map for teachers — paste a class's written answers to one question, see the distinct beliefs underneath and what to reteach.

## The Unique Kernel
An answer is not a mark; it's evidence of a belief. Fault Lines groups answers by belief, names the belief, and ranks beliefs by exam damage — misconception cartography instead of grading.

## Who It's For
A secondary-school or university teacher with 60–200 students who marks written answers by hand. They finish marking, write "see me" on thirty scripts, and still can't see the one belief the whole class shares. Today they re-read scripts trying to spot patterns by hand.

## The Core Loop
They paste up to ~60 answers (one per line) or load the example classroom → click "Map my class" → in ~10 seconds see 4 named beliefs sized by share of class, ordered by risk, with student quotes → click a band for quotes and a 5-minute reteach card → export a one-page reteach plan.

## Inspiration & Identity
Geological survey aesthetic: printed field report / engineering drawing, not a SaaS dashboard. Warm off-white paper, ink, rust/ochre warning accent, slate "solid" accent. Horizontal strata bands sized by share of class, hand-drawn cracks between them. One orchestrated top-to-bottom reveal with counts ticking up. Copy written like a person.

## Why This Matters to the Learner
Building a tool that makes invisible gaps visible, for a hackathon whose own thesis is "the gap you can't see is the one that hurts you." Aim: great software and high win possibility across all aspects.

## What "Working" Looks Like
A judge opens the app, clicks "Load example classroom" with zero network, and watches 28 messy answers collapse into 4 named beliefs with counts in ~10 seconds, reads a real student quote under the biggest cluster, and sees a "Not sure — needs your eyes" band for vague answers. That "oh, that's my class" moment is the demo.

## The POC Boundary
In: paste answers → analysis → map with counts, names, quotes → reteach card → export; "Load example classroom" demo mode with cached results; "Not sure" bucket; re-check diagnostic question. Out of scope for the POC: accounts, logins, database, per-student grades, LMS integration, multi-question history, mobile app, real student names, CSV upload, saving sessions, print stylesheet.

## Later
CSV upload, saving a session, print stylesheet, re-check question polish, mobile-ish resize.

## Explicitly Cut
- Accounts/logins/database: no persistence needed for one screen, one job.
- Per-student grades: the unit of insight is a belief, not a mark.
- LMS integration: out of POC time budget; would turn a demo into a platform.
- Multi-question history: scope is one question at a time.
- Real student names: privacy; "remove names first" notice instead.
