# Functional Workflow — DAVV IET Student Lifecycle Portal

This document describes **what the system does** and **how a user moves through it**, with flowcharts. The diagrams use [Mermaid](https://mermaid.js.org/) and render automatically on GitHub.

> Companion docs: [TECHNICAL_OVERVIEW.md](TECHNICAL_OVERVIEW.md) (how it's built), [ARCHITECTURE.md](ARCHITECTURE.md) (folder map), [GLOSSARY.md](GLOSSARY.md) (DAVV terms), [../DEVELOPER_RULES.md](../DEVELOPER_RULES.md) (coding rules).

---

## 1. Actors & portals

Three roles, each with its own portal behind a single login. Admins additionally have **sub-roles** whose access is controlled by an editable permission matrix.

```mermaid
flowchart LR
  U([User]) --> L[Login]
  L -->|Enrollment No + DoB| S[Student Portal]
  L -->|Employee ID| F[Faculty Portal]
  L -->|Admin ID| A[Admin Portal]

  S --> S1[Dashboard, Admission, Registration]
  S --> S2[Courses, Assessment, Exams, Results]
  S --> S3[Degree Audit, Services, Fees, Profile]

  F --> F1[Dashboard]
  F --> F2[Marks Entry, Attendance, Class List]

  A --> A1[Dashboard, Students, Fee Collection]
  A --> A2[Announcements, Users, Masters]
  A --> A3[Reports, Roles & Permissions, Settings]
```

---

## 2. Login & role routing

Login is a mock identity check against seeded users. The session (role + user id) is stored in the browser and drives which portal shell loads.

```mermaid
sequenceDiagram
  participant U as User
  participant LP as Login Page
  participant SS as Session Store
  participant RS as RoleShell (guard)
  U->>LP: Pick role + demo account, submit
  LP->>LP: Validate against seeded users
  LP->>SS: login(role, userId)
  LP->>RS: Redirect to role home
  RS->>SS: Read session
  alt role matches route group
    RS-->>U: Render portal (sidebar + topbar + page)
  else mismatch / not signed in
    RS-->>U: Redirect to /login
  end
```

---

## 3. The complete student lifecycle

The spine of the product: from admission all the way to the degree, with the recurring per-semester loop in the middle.

```mermaid
flowchart TD
  DTE["DTE-MP counselling (JEE Main)"] --> ALLOT[Seat allotment letter]
  ALLOT --> VERIFY[Document verification]
  VERIFY --> FEE1[First-semester fee paid]
  FEE1 --> ENROL["Enrolment - Enrollment Number issued"]

  ENROL --> REG[Semester Registration]
  REG --> CBCS{"Credits >= 12?"}
  CBCS -->|No| ZERO["Zero Semester - repeat"]
  CBCS -->|Yes| CLASS[Attend classes]

  CLASS --> IA[Internal Assessment - MST, assignments, quiz]
  CLASS --> ATT[Attendance tracked]
  IA --> ELIG{"Attendance >= 75% AND internal passed?"}
  ATT --> ELIG
  ELIG -->|No| DETAIN["Detained - cannot sit exam"]
  ELIG -->|Yes| FORM[Submit exam form]
  FORM --> HALL[Hall ticket generated]
  HALL --> EXAM[End-semester examination]
  EXAM --> RESULT["Results - internal 20 + external 80"]
  RESULT --> GRADE[Letter grade + SGPA]
  GRADE --> BACK{Any backlog?}
  BACK -->|Yes| SUPP["Supplementary (ATKT) exam"]
  SUPP --> GRADE
  BACK -->|No| NEXT{Semester 8 done?}
  NEXT -->|No| REG
  NEXT -->|Yes| AUDIT[Degree Audit]
  AUDIT --> DEGREE["Graduation eligibility - degree"]
```

---

## 4. Registration & CBCS credits

```mermaid
flowchart TD
  R[Open Registration] --> CORE[Core courses auto-registered]
  R --> PE["Choose 2 Program Electives"]
  R --> OE["Choose 1 Open Elective"]
  CORE --> SUM[Live credit meter]
  PE --> SUM
  OE --> SUM
  SUM --> CHK{"Total credits >= 12?"}
  CHK -->|Yes| CONFIRM[Confirm registration]
  CHK -->|No| WARN["Warning - Zero Semester would apply"]
  R --> BL{Has backlogs?}
  BL -->|Yes| ATKT[Register Supplementary/ATKT]
  BL -->|No| CONFIRM
```

---

## 5. Exam eligibility → hall ticket

The eligibility gate is the rule that makes the "at-risk student" journey meaningful.

```mermaid
flowchart TD
  START[Open Examinations] --> AGG{"Aggregate attendance >= 75%?"}
  AGG -->|No| DET["Status: Detained - form blocked"]
  AGG -->|Yes| PC{Every course clears attendance + internal?}
  PC -->|No| RISK["Status: At Risk - form blocked"]
  PC -->|Yes| OK["Status: Eligible"]
  OK --> SUB[Submit exam form]
  SUB --> HT[Hall ticket number + PDF]
  HT --> DL[Download hall ticket]
```

---

## 6. Results, SGPA/CGPA & degree audit

```mermaid
flowchart LR
  M["Marks (internal 20 + external 80)"] --> LG[Letter grade O..F]
  LG --> GP[Grade point 10..0]
  GP --> SGPA["SGPA = sum(gradePoint x credits) / sum(credits)"]
  SGPA --> CGPA[CGPA across all semesters]
  CGPA --> CLASSN[Division / classification]
  GP --> DA[Degree Audit]
  DA --> C1[Credits earned vs required]
  DA --> C2[Pending backlogs]
  DA --> C3[Academic standing]
  C1 --> GRAD{All graduation checks pass?}
  C2 --> GRAD
  C3 --> GRAD
  GRAD -->|Yes| ELIGIBLE[Graduation eligible]
  GRAD -->|No| INPROG[In progress]
```

---

## 7. In-app fee payment (in-house)

Payment is handled inside the portal — no external redirect. All charging goes through one swappable service (`lib/payments.ts`) so a real gateway can replace the mock without touching screens.

```mermaid
sequenceDiagram
  participant St as Student
  participant FP as Fees Page
  participant PM as Payment Modal
  participant PS as Payment Service
  participant DS as Demo Store
  participant PDF as Receipt PDF
  St->>FP: Pay now / Pay all dues
  FP->>PM: Open with selected fee items
  St->>PM: Choose method (UPI / Card / Net Banking), confirm
  PM->>PS: initiatePayment(amount, feeIds, method)
  PS-->>PM: transactionId + receiptNo (success)
  PM->>DS: recordPayments(...)
  PM->>PDF: generateFeeReceipt(...) downloads
  DS-->>FP: Ledger flips to Paid + receipt available
```

Admins can also record counter payments from **Fee Collection → Mark paid**, which uses the same service and store.

---

## 8. Student services (certificates)

```mermaid
flowchart TD
  APPLY[Apply for certificate] --> PICK["Pick type (Bonafide, Migration, ...)"]
  PICK --> FORMc[Fill purpose, copies, delivery]
  FORMc --> SUBMITc[Submit]
  SUBMITc --> T1[Submitted]
  T1 --> T2[Under Review]
  T2 --> T3[Ready for Collection]
  T3 --> DLc[Download certificate PDF]
```

---

## 9. Faculty marks → student reflection

The one cross-role data flow: a faculty entry appears on the student's record, computed identically on both sides.

```mermaid
sequenceDiagram
  participant Fa as Faculty
  participant ME as Marks Entry
  participant DS as Demo Store
  participant IT as domain.internalTotal
  participant SA as Student Assessment
  Fa->>ME: Enter MST-2 + Quiz, Save
  ME->>DS: saveInternalMarks(course, enrollmentNo, {mst2, quiz})
  SA->>DS: read internalOverrides
  SA->>IT: recompute internal /20 (best MST + assignment + quiz)
  IT-->>SA: finalised internal shown to student
```

---

## 10. Admin — permissions & navigation gating

```mermaid
flowchart TD
  AL[Admin signs in] --> AR["adminRole (super / registrar / exam / accounts / dept)"]
  AR --> MX[Permission matrix in Settings store]
  MX --> PERMS[Effective permissions]
  PERMS --> NAV[Sidebar hides items without permission]
  PERMS --> PG{Open a page directly}
  PG -->|has permission| SHOW[Render screen]
  PG -->|lacks permission| NA[Show No Access]
  SUPER[Super Admin] -->|edits matrix| MX
```

---

## 11. Admin — bulk student import

```mermaid
flowchart TD
  TPL[Download CSV template] --> FILL[Fill rows]
  FILL --> UP[Upload or paste CSV]
  UP --> PARSE[Parse CSV]
  PARSE --> VAL{Validate each row}
  VAL -->|missing/invalid/duplicate| ERR[Row marked with errors]
  VAL -->|ok| OKR[Row marked OK]
  ERR --> PREVIEW[Preview table]
  OKR --> PREVIEW
  PREVIEW --> IMPORT["Import N valid rows"]
  IMPORT --> STORE[Demo store: importedStudents]
  STORE --> LIST["Appear in Students list (New admission)"]
```

---

## 12. Admin — announcements broadcast

```mermaid
sequenceDiagram
  participant Ad as Admin
  participant AN as Announcements
  participant DS as Demo Store
  participant NF as Student Notifications
  Ad->>AN: Compose title, message, category, target
  AN->>DS: broadcast(...)
  DS-->>NF: Prepended to the notification feed
  NF-->>Ad: Visible under "Sent this session"
```

---

## 13. Data & state flow

How static seed data and runtime state combine to render a screen. Seed data is the source of truth; stores layer live changes on top.

```mermaid
flowchart LR
  SEED["Seed data (src/data)"] --> ACC[Typed accessors]
  ACC --> SCREEN[Screen]
  DOM["Domain logic (src/lib/domain)"] --> SCREEN
  SESSION[Session store] --> SCREEN
  SETTINGS[Settings store] --> SCREEN
  DEMO["Demo store (live overlays)"] --> SCREEN
  SCREEN --> UI[Rendered UI]
  SETTINGS -->|accent, features, matrix| UI
```

---

## 14. Feature ↔ permission map

| Admin section | Permission | Roles (default) |
|---|---|---|
| Students (view) | `students.view` | all |
| Students (deactivate) | `students.manage` | Super, Registrar |
| Bulk import | `students.import` | Super, Registrar |
| Faculty management | `faculty.manage` | Super, Registrar |
| Fee Collection (view) | `fees.view` | Super, Accounts |
| Mark paid / verify | `fees.manage` | Super, Accounts |
| Masters editor | `masters.edit` | Super, Registrar, Exam |
| Announcements | `announcements.send` | Super, Registrar, Exam, Dept |
| Settings | `settings.edit` | Super |
| Roles & Permissions | `roles.edit` | Super |
| Reports | `reports.view` | all |

Student modules **Fees**, **Student Services** and **Notifications** can additionally be toggled on/off portal-wide from **Admin → Settings**, which shows/hides them in the student navigation.
