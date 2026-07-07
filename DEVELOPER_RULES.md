# Developer Rules

**Read this before writing any code in this repo — humans and AI assistants alike.**

This is the authoritative rulebook. It exists so anyone (or any AI) can extend the project without breaking its consistency. If a rule here conflicts with a habit you have, the rule wins. When in doubt, copy an existing screen in the same role and follow its shape.

> Related: [docs/TECHNICAL_OVERVIEW.md](docs/TECHNICAL_OVERVIEW.md) · [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/FUNCTIONAL_WORKFLOW.md](docs/FUNCTIONAL_WORKFLOW.md) · [docs/GLOSSARY.md](docs/GLOSSARY.md) · [CLAUDE.md](CLAUDE.md)

---

## 0. The 10 golden rules (memorize these)

1. **Reuse before you build.** Check `components/ui`, `components/shared`, `lib/domain`, `lib/utils` first. Don't reinvent a Button, Table, Badge, or a grade calculation.
2. **Rules live in `lib/domain`.** Never compute grades/credits/eligibility/permissions inside a component. Import the function.
3. **Data goes through accessors** in `src/data` (`getStudent`, `studentsForCourse`, `listAdmins`…). Never import a raw seed array into a screen.
4. **Style with tokens, never hex.** Use Tailwind classes backed by `@theme` tokens (`bg-navy`, `text-gold`, `border-line`, `rounded-card`). The only inline colours allowed are data-driven (e.g. an avatar's `photoColor`).
5. **Use real DAVV terminology** in all copy — Enrollment Number, CBCS, MST, SGPA/CGPA, Supplementary (ATKT), Bonafide, Zero Semester. See [GLOSSARY](docs/GLOSSARY.md).
6. **Stay static-export-safe.** No server actions, no route handlers, no `/[id]` dynamic routes without `generateStaticParams`. Prefer modals for detail views.
7. **All user-facing chrome copy goes through i18n** (`useTranslation()` + `lib/i18n/en.ts`). No hardcoded strings in nav/labels.
8. **Respect permissions.** New admin capabilities must be gated by a `Permission` (nav + a page-level `useHasPermission` guard).
9. **Client vs server components.** Add `"use client"` only when you use hooks, state, or browser APIs. Keep pure display components server-friendly.
10. **`npm run typecheck` and `npm run lint` must pass** before you're done. Format with `npm run format`.

---

## 1. Where things live (put new code in the right home)

| You're adding… | Put it in… |
|---|---|
| A page / URL | `src/app/(role)/…/page.tsx` |
| A reusable primitive (button, input, table) | `src/components/ui/` |
| A cross-feature widget (logo, stat card, chart) | `src/components/shared/` |
| App shell / nav / layout | `src/components/layout/` |
| A feature-specific composite (payment modal, import modal) | `src/features/<feature>/` |
| A business rule (grade, credit, eligibility, permission) | `src/lib/domain/` |
| A pure helper (formatting, csv, cn) | `src/lib/utils/` |
| Mock data + its accessor | `src/data/` |
| Shared state | `src/store/` |
| A data shape | `src/types/index.ts` |
| Nav menu / site constants | `src/config/` |

---

## 2. Shared components — use these, don't rebuild

**`components/ui`** (primitives):
`Button` / `buttonClasses`, `Card`, `Section` (titled card — the workhorse container), `Badge` (+ `Tone`), `Table` / `Th` / `Td`, `Modal`, `Field` / `Input` / `Select` / `Textarea`, `ProgressBar`, `Stepper`, `Avatar`, `EmptyState`.

**`components/shared`** (widgets):
`Logo` / `Wordmark` / `Crest`, `StatCard`, `GradeBadge` (+ `gradeTone`), `CreditMeter`, `Sparkline`, `Gauge`, `HeroBanner`, `KeyValue` / `KeyValueGrid`, `PortalLink`, `NoAccess`.

**`components/layout`**: `RoleShell`, `Sidebar`, `Topbar`, `Footer`, `PageHeader`, `Toaster`, `AccentStyle`.

Typical page skeleton:

```tsx
"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { useCurrentStudent } from "@/lib/auth";

export default function SomePage() {
  const student = useCurrentStudent();
  if (!student) return null;
  return (
    <>
      <PageHeader title="Title" description="One line." />
      <Section title="Panel">{/* content */}</Section>
    </>
  );
}
```

---

## 3. How to add a screen

1. **Route:** create `src/app/(role)/…/page.tsx`. Student routes sit at the root (`(student)/results`), faculty under `faculty/…`, admin under `admin/…`. The group `layout.tsx` already wraps it in `RoleShell`.
2. **Nav:** add a `NavItem` in [`src/config/nav.ts`](src/config/nav.ts) (icon from lucide, `labelKey`). Admin items **must** set a `permission`; student items may set a `feature` toggle. Add the label under `nav.*` in [`src/lib/i18n/en.ts`](src/lib/i18n/en.ts).
3. **Build it** from `@/components/ui` + `@/components/shared`. Get the user via `useCurrentStudent()` / `useCurrentFaculty()` / `useCurrentAdmin()`.
4. **Read data** via `@/data`; **compute** via `@/lib/domain`.
5. **Admin pages:** guard with `const can = useHasPermission("x"); if (!can) return <><PageHeader title="…"/><NoAccess/></>;`.
6. **Verify:** `npm run typecheck`, then `npm run dev` and click through.

## 4. How to add a business rule

Add a **pure function** to the right `lib/domain` module (`grades`, `credits`, `eligibility`, `permissions`), export it from `lib/domain/index.ts`, and reuse it everywhere — including seed data — so there's never a second copy of the rule.

## 5. How to add mock data

Extend the arrays in `src/data/*` and expose a **typed accessor** from `src/data/index.ts`. Keep data realistic and **deterministic** (the student generator uses a seeded PRNG — never `Math.random()` at module scope).

## 6. How to add live state (a store slice)

Add fields + setters to the relevant store (`session` / `ui` / `settings` / `demo`). Persist only durable prefs (`settings`, `ui.locale`); keep session-only demo actions in `demo` (not persisted). Screens then **merge** seed data with the store overlay (e.g. `isPaid = seedPaid || demo.paidFees[id]`).

## 7. How to add an admin capability (with permission)

1. Add a `Permission` string to `types` and to `PERMISSIONS` + `DEFAULT_MATRIX` in `lib/domain/permissions.ts`.
2. Add the nav item with that `permission` in `config/nav.ts`.
3. Guard the page with `useHasPermission(...)`.
4. It automatically appears in the Roles & Permissions matrix.

---

## 8. Styling rules

- Use tokens: `bg-navy`, `text-navy`, `text-gold`, `text-slate`, `text-muted`, `border-line`, `bg-cream`, `bg-surface`, status `text-success|warning|danger`, `rounded-card`, `rounded-btn`, `shadow-card|pop`, `font-heading|body|serif`.
- **Never hardcode hex** except data-driven values (avatar/photo colours).
- Headings get their colour from a base rule; to put a heading on a dark surface, add `text-white` explicitly (base element styles live in `@layer base` so utilities win).
- Text over photos must use `HeroBanner` (its navy scrim guarantees contrast). Don't put dark text on images.
- Respect spacing rhythm (multiples of 4/8) and `max-w-[1200px]` content width.
- Keep it accessible: real `<button>`/`<label>`, `aria-*` on custom controls, visible focus, ≥4.5:1 contrast.

## 9. TypeScript & naming

- `strict` is on. No `any` — model the shape in `types/`.
- Components and hooks: PascalCase / `useCamelCase`. Files match the export.
- Prefer named exports. Keep pages thin: read data → compute → render.
- Images: use `next/image` for content images (logo, crest); use CSS `background-image` for decorative photos (no `<img>` — the linter forbids raw `<img>`).
- Don't call `Date.now()` / `Math.random()` directly inside a component or hook body (the purity lint rule forbids it). Put such calls in a store action or a `lib/` function (e.g. ids/timestamps come from `lib/payments.ts`).

## 10. Anti-patterns (don't do these)

- ❌ Importing `STUDENTS`/`COURSES` arrays directly into a screen → use accessors.
- ❌ Re-implementing SGPA/eligibility/permission logic in a component → import from `lib/domain`.
- ❌ Hardcoding `#1a3a5c` or hex colours → use tokens.
- ❌ Hardcoding nav labels or leaving admin pages ungated.
- ❌ Adding a dynamic `/[id]` route → breaks static export; use a modal.
- ❌ Adding an external UI/CSS/chart dependency when a small SVG or existing primitive will do.
- ❌ Leaving unused imports/vars (lint fails).

---

## 11. Rules for AI assistants working in this repo

- **Load context first:** read `CLAUDE.md`, this file, and the relevant `docs/` before editing. Grep for an existing example of what you're building.
- **Match the surrounding code** — same imports, same component set, same patterns. Don't introduce a new styling approach, state library, or folder convention.
- **Never invent DAVV facts.** Use the values in `lib/domain/constants.ts` and the [GLOSSARY](docs/GLOSSARY.md). Assumptions are marked `⚠︎` in code — keep them documented.
- **Keep it static-export-safe and dependency-light.** Don't add npm packages without a clear need.
- **Verify before finishing:** run `npm run typecheck` and `npm run lint`; if UI changed, run `npm run dev` and check it.
- **Small, focused diffs.** One concern at a time. Don't reformat unrelated files.

---

## 12. Definition of done (checklist)

- [ ] Reused existing components/domain/data (no duplication).
- [ ] DAVV terminology + i18n keys used; no hardcoded chrome strings.
- [ ] Tokens only (no stray hex); accessible and responsive.
- [ ] Admin features gated by a `Permission`; static-export-safe.
- [ ] `npm run typecheck` clean, `npm run lint` clean, `npm run build` succeeds.
- [ ] Clicked through the affected flow in `npm run dev`.
