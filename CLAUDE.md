# CLAUDE.md

Guidance for AI agents (and humans) working in this repo.

## What this is

A **static front-end prototype** of the DAVV IET Student Lifecycle (SLC) portal — Next.js (App Router, `output: "export"`) + TypeScript + Tailwind v4 + Zustand. No backend; all data is mock. See [`README.md`](README.md).

## Golden rules

- **DAVV terminology is law.** Use the real terms in all UI copy: Enrollment Number, CBCS, MST, SGPA/CGPA, Supplementary (ATKT), Bonafide, Zero Semester, etc. Reference: [`docs/GLOSSARY.md`](docs/GLOSSARY.md).
- **Academic rules live in one place** — [`src/lib/domain/`](src/lib/domain) (grades, credits, eligibility, constants). Never re-implement a grade/credit/eligibility rule in a component; import it.
- **Data goes through accessors** in [`src/data/`](src/data) (e.g. `getStudent`, `studentsForCourse`). Screens never touch raw arrays.
- **Design tokens** are defined once in [`src/app/globals.css`](src/app/globals.css) `@theme` (colours like `bg-navy`, `text-gold`; fonts). Don't hardcode hex values in components.
- **Keep it static-export-safe** — no server actions/route handlers; give any dynamic route a `generateStaticParams`. Prefer modals over `[id]` routes.
- **Copy through i18n** — user-facing chrome uses `useTranslation()` keys in [`src/lib/i18n/en.ts`](src/lib/i18n/en.ts).

## Commands

```bash
npm run dev | build | typecheck | lint | format
```

Always run `npm run typecheck` after changes.

## Adding a screen

See [`DEVELOPER_RULES.md`](DEVELOPER_RULES.md) (the rulebook) and [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md). In short: add a route under the right group in `src/app/(role)/…`, add a nav entry in [`src/config/nav.ts`](src/config/nav.ts) + label in `en.ts`, build from `@/components/ui` + `@/components/shared`, read data via `@/data`, compute via `@/lib/domain`. Admin screens must be gated by a `Permission` (`useHasPermission`).
