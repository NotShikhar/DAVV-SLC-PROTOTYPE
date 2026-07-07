# Contributing

Conventions to keep the codebase consistent and maintainable.

## Principles

1. **Reuse before you write.** Check `@/components/ui`, `@/components/shared`, `@/lib/domain`, `@/lib/utils` first.
2. **Rules live in `lib/domain`.** Never re-implement a grade/credit/eligibility calculation in a component.
3. **Data via `@/data` accessors.** Never import raw seed arrays into a screen.
4. **Tokens, not hex.** Style with Tailwind utilities backed by `@theme` tokens (`bg-navy`, `text-gold`, `border-line`, `rounded-card`). No inline hex except data-driven values (e.g. avatar colours).
5. **DAVV terminology** in every string — see [`GLOSSARY.md`](GLOSSARY.md).
6. **Typecheck must pass:** `npm run typecheck`. Format with `npm run format`.

## Code style

- TypeScript, functional components, named exports.
- Client components (hooks/state/browser APIs) start with `"use client"`.
- Prefer composition (`<Section>`, `<Card>`, `<Table>`) over bespoke markup.
- Keep pages thin: read data + compute with domain functions + render primitives.

## Add a student/faculty/admin screen

1. **Route** — create `src/app/(role)/…/page.tsx` (student routes live at the root, e.g. `(student)/results`; faculty/admin under `faculty/…`, `admin/…`). The group `layout.tsx` already wraps it in `RoleShell`.
2. **Nav** — add a `NavItem` in [`src/config/nav.ts`](../src/config/nav.ts) with a lucide icon and a `labelKey`, and add that key under `nav.*` in [`src/lib/i18n/en.ts`](../src/lib/i18n/en.ts).
3. **Build the page** — start with `<PageHeader>`, then `<Section>`/`<Card>`/`<StatCard>`/`<Table>`. Get the signed-in user via `useCurrentStudent()` / `useCurrentFaculty()` / `useCurrentAdmin()`.
4. **Data & rules** — read via `@/data`; compute via `@/lib/domain`. Add new mock data to `src/data/*` behind an accessor.
5. **Interactions** — use `store/demo` for stateful demo actions and `useUi().pushToast` for feedback.
6. **Verify** — `npm run typecheck`, then `npm run dev` and walk the flow.

## Add a domain rule

Put it in the right `lib/domain` module (`grades`, `credits`, `eligibility`) as a pure function, export it from `lib/domain/index.ts`, and reuse it everywhere (including seed data) so there's no drift.

## Add mock data

Extend the arrays in `src/data/*` and expose a typed accessor from `src/data/index.ts`. Keep records realistic and deterministic (the student generator in `students.ts` uses a seeded PRNG — no `Math.random()` in module scope).
