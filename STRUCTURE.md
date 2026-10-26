# Project Structure

```
faultlines/
├── .github/workflows/       # CI and GitHub Pages deploy
├── app/                      # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── tool/page.tsx        # Main tool (paste → map → reteach → export)
│   ├── settings/page.tsx    # Theme/font settings
│   ├── error.tsx            # Error boundary
│   ├── not-found.tsx        # 404 page
│   ├── layout.tsx           # Root layout, theme provider, PWA
│   ├── globals.css          # Tailwind + theme variables
│   └── api/analyze/route.ts # Serverless analysis endpoint
├── components/               # UI components
│   ├── StrataMap.tsx        # Strata visualization
│   ├── BandDetail.tsx       # Quotes + reteach card
│   ├── ExportBar.tsx        # Copy/print/Md/CSV/JSON/share
│   ├── SiteHeader.tsx       # Shared nav
│   ├── Logo.tsx             # Animated logo
│   ├── InstallPrompt.tsx    # PWA install prompt
│   └── ThemeProvider.tsx    # Light/dark/system theme
├── lib/                      # Core logic
│   ├── schema.ts            # Zod schemas + shared limits
│   ├── validate.ts          # Normalisation, verbatim enforcement
│   ├── export.ts / share.ts / parse-input.ts / history.ts / i18n.ts
│   └── llm/                 # Provider interface, heuristic mock, OpenAI-compatible real
├── data/                     # 3 cached example classrooms + examples.ts
├── tests/                    # Vitest unit + API tests
├── docs/recovery/            # PRSIC recovery pack (state→handoff)
├── public/                   # Static assets, manifest, sw
├── devpost/                  # Planning docs (scope, prd, spec, checklist)
├── presentation/             # Pitch assets + AI prompt
├── ARCHITECTURE.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

Each file's role is described in its own docstring or the planning docs under `devpost/`.
