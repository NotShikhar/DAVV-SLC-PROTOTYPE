# Architecture

A feature-oriented Next.js App Router app. Path alias `@/*` → `src/*`.

## Layers (dependency direction ↓)

```
app/            Route groups & pages (thin; compose components + hooks)
  (auth)/login  Standalone login (no shell)
  (student)/    RoleShell(role="student") + 12 student routes
  (faculty)/    RoleShell(role="faculty") + faculty routes
  (admin)/      RoleShell(role="admin") + admin routes
components/
  ui/           Design-system primitives (Button, Card, Section, Table, Modal, …)
  shared/       Cross-feature widgets (Logo, StatCard, GradeBadge, CreditMeter, …)
  layout/       Shell: RoleShell, Sidebar, Topbar, Footer, Toaster, PageHeader
lib/
  domain/       PURE academic rules — grades, credits, eligibility, constants
  auth/         Session-aware hooks: useCurrentStudent/Faculty/Admin, useRequireRole
  i18n/         Dictionary (en.ts) + useTranslation()
  utils/        cn(), formatters
  pdf.ts        jsPDF hall-ticket / certificate generators
data/           Mock data + typed accessors (the "API" seam)
store/          Zustand: session (persisted), ui (locale/toasts), demo (live actions)
types/          Domain models (single source of shapes)
config/         nav (per role) + site (ROLE_HOME, INSTITUTE)
```

**Rule of thumb:** `app` → `components`/`features` → `lib`/`data`/`store` → `types`. Lower layers never import upward.

## Key patterns

- **Design tokens** — DAVV palette, fonts, radii and shadows are declared once in `src/app/globals.css` `@theme`; Tailwind v4 generates the utilities (`bg-navy`, `text-gold`, `rounded-card`, `font-heading`). Fonts are injected by `next/font` in `app/layout.tsx`.
- **Pure domain logic** — everything academic (grade points, SGPA/CGPA, credit totals, academic standing, exam eligibility) is a pure function in `lib/domain`, unit-test friendly and reused by both seed data and screens. This is the single source of truth for DAVV rules.
- **Data accessor seam** — screens import from `@/data` (`getStudent`, `studentsForCourse`, `upcomingEvents`, …). Swapping the mock arrays for a real API means changing only `src/data/*`.
- **State** —
  - `store/session` (persisted): current role + user id → drives `RoleShell` and route guards.
  - `store/ui` (persisted locale/sidebar; ephemeral toasts).
  - `store/demo` (in-memory): the "live" overlay — notification read-state, certificate requests, exam-form submissions, and faculty internal-marks overrides that flow back into the student's Internal Assessment view.
- **Auth / RBAC** — `RoleShell` calls `useRequireRole(role)`, which redirects to `/login` unless the persisted session matches. This is UX-level only (a prototype), not real security. Persisted-store reads are gated by `useMounted()` to avoid hydration mismatches with static export.
- **Static-export-safe** — `output: "export"`; no server actions/route handlers; detail views use modals rather than dynamic `[id]` routes.
- **i18n-ready** — chrome copy resolves through `useTranslation()` against `lib/i18n/en.ts`; a `hi.ts` dictionary can be dropped in without touching components.

## Faculty → student data flow (example)

Faculty enters MST-2 + Quiz in **Marks Entry** → `store/demo.saveInternalMarks(course, enrollmentNo, …)` → the student's **Internal Assessment** screen merges the override via `lib/domain/grades.internalTotal(...)` and shows the finalised internal mark. Same computation on both sides = no drift.
