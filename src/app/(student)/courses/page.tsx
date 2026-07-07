"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import type { Course, CourseCategory } from "@/types";
import { COURSES } from "@/data";
import { BRANCHES } from "@/lib/domain/constants";
import { useCurrentStudent } from "@/lib/auth";
import { toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Table, Td, Th } from "@/components/ui/Table";
import { Field, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PortalLink } from "@/components/shared/PortalLink";
import { EXTERNAL_PORTALS } from "@/lib/domain/constants";

const CATEGORY_TONE: Record<CourseCategory, Tone> = {
  Core: "info",
  "Program Elective": "gold",
  "Open Elective": "neutral",
  "Skill Enhancement": "success",
  "Ability Enhancement": "success",
  Laboratory: "success",
  Project: "gold",
};

export default function CoursesPage() {
  const student = useCurrentStudent();
  const [branch, setBranch] = useState(student?.branch ?? "CSE");
  const [semester, setSemester] = useState(String(student?.currentSemester ?? 5));
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Course | null>(null);

  const filtered = useMemo(() => {
    const sem = Number(semester);
    const q = query.trim().toLowerCase();
    return COURSES.filter(
      (c) =>
        (c.branch === branch || c.branch === "ALL") &&
        c.semester === sem &&
        (!q || c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)),
    );
  }, [branch, semester, query]);

  return (
    <>
      <PageHeader
        title="Course Catalogue"
        description="Browse the CBCS scheme by branch and semester. Select a course for details."
      />

      <Section bodyClassName="p-0">
        <div className="grid gap-4 border-b border-line p-5 sm:grid-cols-3">
          <Field label="Branch">
            <Select value={branch} onChange={(e) => setBranch(e.target.value as typeof branch)}>
              {BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} — {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Semester">
            <Select value={semester} onChange={(e) => setSemester(e.target.value)}>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Semester {toRoman(n)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Search">
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Course code or title"
                className="pl-8"
              />
            </div>
          </Field>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses" description="No courses match these filters." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Course</Th>
                <Th className="text-center">Credits</Th>
                <Th>Category</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.code}
                  onClick={() => setActive(c)}
                  className="cursor-pointer transition-colors hover:bg-cream"
                >
                  <Td className="font-mono text-xs text-muted">{c.code}</Td>
                  <Td className="font-medium text-navy">{c.title}</Td>
                  <Td className="text-center tabular-nums">{c.credits}</Td>
                  <Td>
                    <Badge tone={CATEGORY_TONE[c.category]}>{c.category}</Badge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      <Modal
        open={active !== null}
        onClose={() => setActive(null)}
        title={active?.title ?? ""}
        description={active ? `${active.code} · ${active.credits} credits · ${active.category}` : ""}
        footer={
          <PortalLink href={EXTERNAL_PORTALS.library.url}>Syllabus & e-resources</PortalLink>
        }
      >
        {active && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge tone="info">Semester {toRoman(active.semester)}</Badge>
              <Badge tone={CATEGORY_TONE[active.category]}>{active.category}</Badge>
              <Badge tone="neutral">{active.branch === "ALL" ? "Open to all branches" : active.branch}</Badge>
            </div>
            <div>
              <p className="text-xs tracking-wide text-muted uppercase">Course Outcomes</p>
              {active.courseOutcomes && active.courseOutcomes.length > 0 ? (
                <ul className="mt-2 space-y-1.5">
                  {active.courseOutcomes.map((co, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate">
                      <span className="font-mono text-xs text-gold-600">CO{i + 1}</span>
                      {co}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted">Course outcomes to be published with the syllabus.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
