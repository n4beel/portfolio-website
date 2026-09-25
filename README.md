# nabeelkhan.dev

Personal site and engineering case-study archive for Nabeel Ahmed Khan, Senior
Full-Stack Engineer. Built with Astro 5, React islands, and Tailwind CSS.

## Structure

```text
public/                      static assets (resume PDF, favicon, /lab articles)
scripts/validate-projects.js project data validation
src/components/              landing page sections and React islands
src/data/categories.js       project category taxonomy (single source of truth)
src/data/projects.json       every case study; feeds the landing page,
                             /projects, and /projects/[slug]
src/layouts/Layout.astro     document head, meta/OG tags, Person JSON-LD
src/pages/                   routes
```

Case-study content lives entirely in `src/data/projects.json`. Adding an entry
there creates its `/projects/<slug>` page, its archive card, and its landing
page card. Run the validator after editing it.

## Commands

| Command                            | Action                                |
| :--------------------------------- | :------------------------------------ |
| `npm install`                      | Install dependencies                  |
| `npm run dev`                      | Dev server at `localhost:4321`        |
| `npm run build`                    | Production build to `./dist/`         |
| `npm run preview`                  | Preview the production build          |
| `node scripts/validate-projects.js`| Validate `src/data/projects.json`     |
