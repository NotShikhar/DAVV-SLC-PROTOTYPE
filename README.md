# DAVV IET — Student Lifecycle (SLC) Portal

A front-end **prototype** of the complete Student Lifecycle for the **Institute of Engineering & Technology (IET)**, **Devi Ahilya Vishwavidyalaya (DAVV)**, Indore — from admission through registration, academics, examinations, results and degree, across **Student, Faculty and Admin** portals.

It is a fully **static** app (no backend) with realistic mock data, grounded in DAVV's real academic structure and terminology.

> ⚠️ Prototype for demonstration only. Not an official DAVV system.

---

## Highlights

- **Authentic to DAVV/IET** — B.E. (8 semesters), 9 branches, DTE-MP admission, Enrollment Number + DoB login, **CBCS** credits, **10-point grades** (O–F), **20/80** internal/external split, **75%** attendance eligibility, Supplementary (ATKT), and the real certificate set. See [`docs/GLOSSARY.md`](docs/GLOSSARY.md).
- **Three roles** — a deep Student portal (12 screens), a Faculty portal (marks/attendance/roster) and a light Admin portal, all role-guarded.
- **Live demo interactions** — faculty marks entry reflects on a student's record; exam-form submission generates a downloadable hall ticket (PDF); certificate requests advance through a status timeline.
- **Design system** — DAVV navy + gold palette, Poppins/Open Sans/Merriweather type, sun/diya emblem, WCAG-minded, responsive.
- **Maintainable** — TypeScript, feature-oriented structure, pure domain logic in one place, i18n-ready copy.

## Tech stack

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS v4 · Zustand · lucide-react · jsPDF.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Sign in from `/login`. Pick a **demo student** to explore a specific journey:

| Demo account | Enrollment | Shows |
|---|---|---|
| Aarav Sharma | `DE24CS0042` | Happy path — Good Standing, exam-eligible |
| Priya Verma | `DE24CS0043` | At-risk — attendance < 75% blocks the exam form |
| Rohit Yadav | `DE24CS0044` | Backlog (ATKT) carried from Semester III |

Faculty (e.g. `IET-CS-014`, Dr. Neha Agarwal) and Admin accounts are selectable from the same screen. There are **five admin roles** — `IET-ADM-001` (Super Admin) through `IET-ADM-005` (Dept Admin) — sign in as different ones to see the navigation change with their permissions. Student login uses **Enrollment Number + Date of Birth** (auto-filled for demo accounts).

## Scripts

```bash
npm run dev          # dev server
npm run build        # static export → out/
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write .
```

`npm run build` emits a self-contained static site to `out/`, hostable on any static host (GitHub Pages, Netlify, S3, …).

## Demo journeys

1. **Student happy path** — login (Aarav) → Dashboard → Registration → Examinations (submit form → download hall ticket) → Results → Services (apply for a Bonafide).
2. **At-risk student** — login (Priya) → Examinations shows *Detained*; the exam form is blocked with per-course reasons.
3. **Faculty → student** — login (Dr. Neha) → Marks Entry for CS-501, enter MST-2 + Quiz, Save → the marks appear on the student's Internal Assessment screen.

## Documentation

- [`DEVELOPER_RULES.md`](DEVELOPER_RULES.md) — the rulebook for anyone (human or AI) coding in this repo.
- [`docs/TECHNICAL_OVERVIEW.md`](docs/TECHNICAL_OVERVIEW.md) — plain-language explanation of how everything works.
- [`docs/FUNCTIONAL_WORKFLOW.md`](docs/FUNCTIONAL_WORKFLOW.md) — flowcharts of the functional workflows.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — folder structure, patterns, data flow.
- [`docs/GLOSSARY.md`](docs/GLOSSARY.md) — DAVV terminology used throughout the UI.
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — conventions and how to add a screen.

## Scope & roadmap

This build covers the **core lifecycle** deeply. Deferred to a later phase: attendance analytics, full timetable, scholarships workflow, hostel, library, placement, grievances, parent portal, reports/analytics. A real backend (replacing `src/data/*`) is the natural next step.

## Data accuracy note

DAVV does not publish its exact SGPA/CGPA formula or marks→grade cut-offs; this prototype uses the **standard UGC credit-weighted CBCS formula** and documented assumptions (marked `⚠︎` in [`src/lib/domain/constants.ts`](src/lib/domain/constants.ts)). Enrollment-number format and some figures are illustrative.

**Imagery:** the campus photo is CC BY-SA 4.0 (Lifeisshubh, via Wikimedia Commons); the DAVV/IET logos are institute trademarks used only to make this labelled demo recognisable. See [CREDITS.md](CREDITS.md) — replace or re-license these before any public release.
