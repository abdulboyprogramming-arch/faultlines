# Gamma deck — the prompt pack

_Everything needed to generate the Fault Lines pitch deck in [Gamma](https://gamma.app). Two routes: **Route A** (generate from a prompt — fastest) and **Route B** (paste a deck outline — full control, recommended)._

---

## 0. Settings to set before anything else

| Gamma setting | Value |
|---|---|
| Format | **Presentation** |
| Card size | **16:9** (widescreen) |
| Number of cards | **12** |
| Language | English |
| Text amount per card | **Brief** |
| Tone / audience | Professional, teacher-facing, no buzzwords |
| Image source | **AI images** for slides 1–3, **theme/icon** elsewhere (screenshots go in yourself) |
| Theme | Start from **"Editorial"** or **"Paper"**, then apply the palette below |
| Export at the end | **PDF** for the repo · **PPTX** if you need to edit text |

### Custom theme (apply after generation: Theme → Customise)

| Role | Hex |
|---|---|
| Background / paper | `#F4F1EA` |
| Deep paper | `#EBE6DA` |
| Card / surface | `#FBFAF5` |
| Ink (text) | `#14110E` |
| Muted ink | `#3A342C` |
| Rust (warning accent) | `#B5471F` |
| Ochre | `#C98A2E` |
| Slate (solid accent) | `#3E5C63` |
| Moss (good) | `#4D6B45` |

**Fonts:** headings = a serif with personality (Gamma's *Fraunces*-like serif, or "Serif Display"); body = a clean grotesque (Inter / Helvetica-ish). Never two serifs, never all-caps body text. Headings sentence case.

**Rules for every card:** one idea · headline under 9 words · at most 3 bullets · no bullet that is a full paragraph · a number or a quote on every card where possible · leave the right third or bottom third empty on image cards.

---

## Route A — Generate from a prompt (paste this into Gamma's prompt box)

```
Design a 12-card presentation deck for Fault Lines, a misconception-mapping tool for teachers. Audience: hackathon judges and educators; they see hundreds of "AI for education" decks, so this one must feel like a printed geological field report, not a SaaS pitch.

Visual direction: warm off-white paper background (#F4F1EA), near-black ink text (#14110E), one warning accent in rust (#B5471F), a secondary slate-teal accent (#3E5C63), ochre (#C98A2E) used sparingly. Horizontal geological strata bands as the recurring motif; hairline "fault crack" dividers between cards. Serif display headings, clean grotesque body text. Big type, generous white space, minimal bullets, no gradients, no neon, no glassmorphism, no stock-photo people. Think survey report, engineering drawing, field notebook.

Tone: plain, warm, specific. No hype words ("revolutionary", "seamless", "unlock"). Numbers over adjectives. Every card has one idea.

Narrative arc:
1. Title — Fault Lines, tagline "Every class has fault lines. See them before the exam does."
2. The problem — a teacher marks 120 scripts and still cannot see the one belief half the class shares.
3. The insight — an answer is not a mark, it is evidence of a belief.
4. What it does — paste answers, get a strata map of the beliefs underneath.
5. The output — bands sized by share of class, ranked by exam risk, with a "start here" call-out.
6. The evidence — every belief proven with verbatim student quotes, plus a 5-minute reteach card.
7. The trust moment — vague answers are shown as "Not sure — needs your eyes", never invented.
8. How it works — the model returns only which answers belong together; counts and quotes are derived from the paste, so totals are exact by construction.
9. How it was built — plan-first with the Devpost Learn Skill Pack: scope, PRD, spec and a slice checklist before code.
10. Craft — seven languages including RTL Arabic, installable offline PWA, programmatic logo and game, 84 automated tests.
11. Who it is for and why it matters — secondary and university teachers who mark written answers by hand.
12. Close — "Every class has fault lines." plus the live demo URL as the only call to action.

Each card: a headline of 9 words or fewer, at most three short supporting lines, and where possible a concrete number. Put speaker notes in the notes field, written as something a human would actually say out loud, 25 to 40 words per card.
```

After it generates, **immediately** do the theme step (§0) — Gamma's defaults will fight you otherwise.

---

## Route B — Paste a deck outline (recommended: exact wording, exact structure)

Gamma → **Create → Paste in text**. Each `---` starts a new card; each `#` line becomes the card title. Paste the whole block below in one go.

````markdown
# Fault Lines
## Misconception mapping for teachers
Every class has fault lines. See them before the exam does.
Abdulrahman Adeeyo · Build with AI: Basics · faultlines-kappa.vercel.app

notes: Open warm, not salesy. "I want to show you something a mark book cannot show you."

---

# A mark tells you who lost points
## It never tells you what the class believes
Mark 120 scripts. Write "see me" on thirty. Walk into Monday still unable to name the one idea half the class shares.

notes: This is the feeling every teacher in the room has had. Pause after "still unable to name it."

---

# An answer is not a mark
## It is evidence of a belief
Two students can write the same sentence for opposite reasons. Group by belief and the class stops looking like a bell curve and starts looking like a landscape.

notes: This is the whole product in one sentence. The rest of the deck is consequences.

---

# Paste. See the beliefs.
## 28 messy answers become five named beliefs
One question, one paste, about a minute. Answers are grouped by the idea underneath — not by score, not by wording.

notes: Demo beat. Switch to the live tool here if you are presenting live.

---

# Sized by share of class, ranked by exam risk
## 18 of 28 · 64% · high risk
A single "start here" call-out names the belief to reteach first — the one costing the most marks right now.

notes: Point at the risk ordering. Frequency is not priority; damage is.

---

# Every belief is proven
## Verbatim quotes, exact counts, a 5-minute reteach
Quotes are the student's own words, unedited. Each belief ships with a reteach card and a follow-up diagnostic question to test whether it landed.

notes: Teachers trust evidence they can take to a head of department. That is the design goal here.

---

# What it refuses to do
## "Not sure — needs your eyes"
Too vague to interpret? It goes in a separate bucket with the raw answer shown. No invented misconception, ever.

notes: This is the trust feature. Say plainly: a guess would cost a lesson.

---

# Faithfulness by construction, not by hope
## The model only answers: which answers belong together
Quotes are sliced from your paste. Counts are computed from the grouping. So the totals always add up — every answer lands in a band or in the not-sure list.

notes: This is the technical heart. The LLM returns member indexes; we derive everything a teacher reads.

---

# Plan first, then build
## Scope, PRD, spec and a slice checklist — before any code
Built with the Devpost Learn Skill Pack: six skills, flipped interaction, every slice verified mechanically before the next one started.

notes: The process was the product decision. When the plan said what working meant, a silent bug became visible.

---

# Deliberately complete, key-free
## 7 languages · offline PWA · 84 tests · no accounts
Works with no API key on a built-in engine. Installs like an app. Speaks English, French, Spanish, German, Portuguese, Yorùbá and Arabic. Every asset is programmatic — no stock art anywhere.

notes: Judges reward craft. Mention the 404 game only if there is time — it is the smile line.

---

# Built for the teacher with 120 scripts
## Marking is already done. The reteach is not.
Secondary and university teachers who mark written answers by hand — science, maths, history, languages.

notes: Restate the user, not the feature list. One sentence, then stop.

---

# Every class has fault lines.
## See them before the exam does.
faultlines-kappa.vercel.app · no account, no stored student data
Try it in thirty seconds: Map my class → Load an example classroom.

notes: End still. Do not add "thank you" — invite the click instead.
````

**After pasting:** Gamma may add a stray extra card or merge two — delete/fix in the card list. Set **Text amount → Brief**, then apply the custom theme.

---

## Screenshots to drop in (Gamma cannot generate these)

Replace the relevant AI image with a real capture, full-bleed or inside a rounded card with a 2 px ink border:

| Card | Image | How |
|---|---|---|
| 4 | Result map | `/tool` → load "Why do we have seasons?" → capture the bands + Start-here banner, 3:2 or 16:10 |
| 5 | Risk mix + top band | Same view, tighter crop on the banner and the first two bands |
| 6 | Evidence + reteach | Click a band; capture the quotes and the reteach card |
| 7 | Not-sure panel | Expand the not-sure row |
| 10 | Phone / installed PWA | iPhone-width viewport, or the installed icon on a home screen |

**Crop rule:** capture at 1440 px wide, crop to the card's aspect, never put text at the outer 5 %.

---

## Image prompts (if you want to regenerate art inside Gamma or elsewhere)

**Cards 1–3 (strata / concept):**
> Minimal editorial vector illustration, four flat geological strata bands in rust #B5471F, ochre #C98A2E, slate #3E5C63 and ink #14110E on warm paper #F4F1EA, one clean diagonal fault crack offsetting the layers, generous negative space, no text, no people, flat colour, subtle paper grain.

**Cards 8–10 (abstract system):**
> Flat vector diagram on warm paper #F4F1EA: a grid of small ink tick marks regrouping into four solid coloured bands joined by thin hairline bracket lines, one hairline crack between the halves, minimal, no text, no numbers.

**Negative prompt for all:** `text, letters, watermark, gradients, neon, 3D render, stock-photo people, lens flare, busy texture`

---

## Presentation-day checklist

- [ ] 12 cards, no card with more than 3 bullets
- [ ] Palette applied — no default Gamma blue anywhere
- [ ] Every number on a slide is one you can defend out loud
- [ ] Screenshots current (v1.3.0, seven languages visible in Settings if shown)
- [ ] Speaker notes present on every card, 25–40 words
- [ ] Exported: **PDF** into `presentation/`, **PPTX** if editing later
- [ ] Live link on the last card works in an incognito window
- [ ] Deck reads at arm's length — if you cannot read a card from 2 m, cut words
