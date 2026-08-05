# Portfolio Overhaul — Implementation Plan

Repo: `github.com/n4beel/portfolio-website` (Astro 5 + Tailwind, React islands)

**Goal:** reposition the site so it shows backend depth **and** applied-AI/agentic work, fix
stale and non-defensible content, and surface work that is currently invisible.

**Ground rule for all content work:** every claim must be defensible in an interview. No invented
metrics, no implied production use for prototypes, no "we" where it was "I" or vice versa. Where
a number cannot be backed, make the statement qualitative instead of rounding to something
plausible.

Phases are ordered so the site is never in a broken intermediate state. Stop after any phase.

---

## Phase 0 — Corrections (do first, no design work)

### 0.1 Remove every 40% claim
None are defensible. Rewrite qualitatively, do not substitute another number.

- `src/components/Experience.astro:9` — remove "reduced deployment latency by 40% across 8
  distinct architectures". Keep the CI/CD standardization claim without the figure.
- `src/components/Experience.astro:10` — `metrics` array: replace `"40% Faster CI/CD"` with
  something non-numeric, e.g. `"CI/CD Standardization"`.
- `src/components/Experience.astro:19` — remove "achieving a 40% reduction in API query latency".
  Keep the query-optimization work (execution plans, materialized views) as the claim.
- `src/components/Experience.astro:20` — `metrics` array: replace `"40% Latency Reduction"` with
  e.g. `"Query Optimization"`.
- `src/components/About.astro` — the "Database Optimization" card contains "(by up to 40%)". This
  card is being replaced entirely in Phase 5; if Phase 5 is not being done in the same pass,
  strip the parenthetical now.

**Leave Bulwark's "40%+ false positive rate" in `projects.json` alone.** That one is specific,
sits inside a regex-versus-AST narrative, and is defensible.

### 0.2 Fix the stale BlockApex date
`src/components/Experience.astro:6` — `"Mar 2023 -- Present"` becomes `"Mar 2023 -- Feb 2026"`.

### 0.3 Replace the served resume
`public/Nabeel_Khan_Resume.pdf` is the old "Senior Backend Architect" version with the
pre-rewrite summary. Replace with the current resume file.

### 0.4 Title consistency
The site says "Senior Backend Architect", the current resume says "Senior Backend Engineer".
Standardise on **Senior Backend Engineer**:
- `src/pages/index.astro:14` — `<Layout title=...>`
- `src/layouts/Layout.astro:16` — the hardcoded meta description
- `src/components/Header.astro` — check for the same string

### 0.5 Per-page meta descriptions
`src/layouts/Layout.astro:16` hardcodes one description for every page, so all 15 case studies
share it. Add an optional `description` prop to `Layout`, default it to the current string, and
pass a real description from `src/pages/projects/[slug].astro` (use `project_tagline`) and from
`src/pages/projects/index.astro`.

---

## Phase 1 — Multi-category data model

Required so Bulwark and Nxellent can appear under both Security and AI, and so an AI category
exists at all.

### 1.1 Schema change
In `src/data/projects.json`, replace the single `"category": "<string>"` on all 15 entries with
`"categories": ["<string>", ...]`.

### 1.2 Consumers
`CATEGORIES` label maps and `CATEGORY_ORDER` arrays are duplicated in two files. Consider
extracting to a shared module (e.g. `src/data/categories.js`) rather than duplicating a third time.

- `src/components/ProjectArchive.jsx` — `CATEGORIES` (line ~5), `CATEGORY_ORDER` (line ~11),
  and the equality filter at line ~54 becomes `project.categories.includes(selectedCategory)`.
- `src/components/FeaturedProjects.jsx` — `CATEGORIES` (line ~4), `CATEGORY_ORDER` (line ~22),
  `DEFAULT_CATEGORY` (line ~23), and the filter at line ~50 becomes `.includes(activeCategory)`.
- `scripts/validate-projects.js` — validate `categories` is a non-empty array of known values.

### 1.3 New category
Add `ai` with label **"AI & Automation"**. Put it **first** in `CATEGORY_ORDER` in both files and
set it as `DEFAULT_CATEGORY` in `FeaturedProjects.jsx`. Write a context line for it in the
`CATEGORIES` map matching the style of the existing ones (the current AI-adjacent context line
lives under `consumer`, so that one needs rewording once ZenApply moves out).

### 1.4 Re-tag existing projects
- `bulwark-audit-platform` → `["security", "ai"]`
- `nxellent-security-platform` → `["security", "ai"]`
- `one-portal-ai-autofill` → `["ai", "consumer"]` (slug changes in Phase 2)
- All others keep their single existing value as a one-element array.

### 1.5 Wire up `is_featured`
It is currently dead: set on four projects but read only by the validator.
`FeaturedProjects.jsx:47-52` shows the first four of the active category **by array order**.
Change the filter to prefer `is_featured` within the active category, falling back to array
order to fill up to four. Without this, the new AI work cannot be pinned to the homepage.

---

## Phase 2 — ZenApply rename and case study update

"One Portal" was a placeholder. The product is **ZenApply**, live at zenapply.app.

### 2.1 Rename
In `src/data/projects.json`:
- `slug`: `one-portal-ai-autofill` → `zenapply-ai-autofill`
- `project_name`: `One Portal` → `ZenApply`
- Update `project_description` / `project_tagline` references to the old name.

The site is statically generated, so the old URL will 404. Add a redirect in `astro.config.mjs`
(`redirects: { '/projects/one-portal-ai-autofill': '/projects/zenapply-ai-autofill' }`).

### 2.2 Add outbound links (schema addition)
No project currently links to anything runnable. Add optional `live_url` and `repo_url` fields,
render them in `src/pages/projects/[slug].astro` and on the archive cards, and treat them as
optional in the validator.

Populate: ZenApply → `https://zenapply.app`. Tokenomics Content System →
`https://github.com/n4beel/tokenomics-content-system`. Bulwark →
`https://github.com/n4beel/bulwark-monorepo`.

### 2.3 Update the case study content
The generation layer has moved past the two-stage prompt pipeline described in the current
`key_challenges`. Users now choose a writing style: supply writing samples that get analysed to
extract voice and formatting, write direct prompt instructions, or fall back to a default style.

Add a `key_challenges` entry covering it. The genuinely hard part, and the thing worth writing
up: **separating voice from format**. Voice applies to both cover letters and short free-text
answers; format rules (greeting, sign-off, word count) apply only to cover letters, and letting
them leak into free-text answers produces answers that open with "Hi team,". Generation runs at
temperature 0 so the same job plus the same style is reproducible, which makes the two style
modes comparable against each other.

### 2.4 Attribution note
Existing case studies use "we" throughout. On ZenApply that clashes with "only engineer on a
three-person founding team". Add a short role line to the ZenApply entry making it explicit that
the entire technical stack was built solo. On Bulwark, Nxellent and the BlockApex projects "we"
is accurate and should stay.

---

## Phase 3 — Add the Tokenomics Content System

Entry is written and schema-validated: `adk-project-entry.json`.

- Paste into `src/data/projects.json`, converting `"category": "ai"` to
  `"categories": ["ai"]` per Phase 1.
- It is marked `is_featured: true` and should sit first in the AI category.
- Repo is public and confirmed safe to link.

**Do not let the copy imply production use.** The entry describes it as an internal R&D
prototype that never shipped. Keep that framing intact.

---

## Phase 4 — Deepen Bulwark and Nxellent

Match the depth and structure of the existing ZenApply case study: architecture overview, then
`key_challenges` as `{ focus, challenge, solution, evidence }`. Use the `evidence` field to cite
real files where they exist, as the Bulwark entry already does with `analyzer/src/visitor.rs`.

Rules: real architecture, real tradeoffs, and at least one thing that did not work or would be
done differently. Engineers trust that far more than a clean success narrative.

### Bulwark (`github.com/n4beel/bulwark-monorepo`, public)
Existing entry is decent but thin relative to the work. Expand on: the division of labour between
deterministic AST analysis and the AI vulnerability pass, how false positives are handled, how the
complexity-scoring model feeds audit cost estimation, and the Arcium MPC commitment design.
Read the repo for accurate detail rather than paraphrasing the existing summary.

### Nxellent (no code access)
Write from architecture and memory. Emphasise the Docker ephemeral sandboxing design for
executing untrusted Solana code, the BullMQ/Redis orchestration, and the model that correlates
smart-contract risk with frontend vulnerabilities. Be explicit about isolation guarantees and
their limits.

---

## Phase 5 — Surface the Tezeract AI work

Tezeract was an AI company and these projects were **architected and developed by Nabeel
personally** (confirmed), but the site reduces the whole period to "AI-driven SaaS products" with
tags Python / Computer Vision / AWS. Four of the six are published on tezeract.ai, which makes
them independently verifiable.

Add as `projects.json` entries under `categories: ["ai"]`:

| Project | What it is | Reference |
|---|---|---|
| Formole | AI-based virtual sports coaching app | tezeract.ai/ai-case-studies/formole-ai-based-virtual-sports-coaching-app/ |
| Spintip | Sports highlight video maker | tezeract.ai/ai-case-studies/spintip-sports-highlight-video-maker/ |
| Navex | AI-powered student attendance system | tezeract.ai/ai-case-studies/navex-ai-powered-student-attendance-system/ |
| MapApp | AI wildfire risk assessment app | tezeract.ai/ai-case-studies/mapapp-ai-wildfire-risk-assessment-app/ |
| GetGeek | AI product | getgeek.ai |
| Duckends | Gesture-detection feedback collection: real-time computer vision and custom object detection capture like/dislike gestures, replacing forms and buttons | No published case study |

Use the published pages as source material for accuracy, but **write original case studies** in
the site's own problem/solution format rather than copying marketing copy. Set `live_url` to the
published case study or product page.

Also update `src/components/Experience.astro` (Tezeract entry, line ~29) to name these products
instead of the current generic description, and refresh its `tech_stack` tags accordingly.

---

## Phase 6 — Landing page repositioning

### 6.1 Hero (`src/components/Hero.astro`)
Current headline: "Building High-Performance Backend Infrastructure for Scale." No AI signal.

Replace with something spanning both, e.g. **"Backend systems and AI automation, built end to
end."** Update the supporting paragraph to mention agent orchestration and LLM-powered systems
alongside Node.js/TypeScript/Rust. Keep "6+ years", keep the "Available for work" indicator in
`Header.astro`.

### 6.2 About (`src/components/About.astro`)
- **Replace the "Database Optimization" card** (it carries the 40% claim) with **"AI &
  Automation"**: multi-agent orchestration, LLM integration, and validation guardrails around
  non-deterministic output. Keep "Distributed Systems" and "Infrastructure".
- Add a sentence to the second paragraph naming the AI work explicitly so the About text does not
  read as backend-only.

### 6.3 Section order (`src/pages/index.astro`)
Achievements currently sit second from last (line 23). They are external, verifiable third-party
validation (Superteam Colosseum Breakout runner-up, LayerZero Solana honorable mention, a DePIN
writing contest win) and outweigh any self-description. Move `<Achievements />` above
`<Education />`, and consider moving it above `<Experience />`.

### 6.4 Homepage project tabs
With Phase 1 done, "AI & Automation" becomes the default tab, so a first-time visitor lands on
the Tokenomics Content System, ZenApply and Bulwark rather than on financial infrastructure.
Verify `FeaturedProjects.jsx` honours `is_featured` so the ordering is intentional.

---

## Verification

- `node scripts/validate-projects.js` passes.
- `npm run build` succeeds; all project routes generate, including the renamed ZenApply slug.
- Grep the built output for `40%`: only the Bulwark false-positive narrative should remain.
- Grep for `Present` in Experience: no longer present for BlockApex.
- Grep for `One Portal`: zero hits outside the redirect rule.
- Old ZenApply URL redirects rather than 404s.
- Every category filter returns a non-empty set, and Bulwark/Nxellent appear under both Security
  and AI.
- `Get Resume` downloads the current resume, not the old one.

## Minor open item

The site's experience starts at Edgeon Solutions (Jun 2019); the current resume starts May 2020.
Not dishonest, but recruiters cross-check. Either add Edgeon to the resume or drop it from the
site. Either is fine; pick one.
