"use client";

import { useMemo, useState } from "react";
import { Search, Upload, UserCheck, UserX } from "lucide-react";
import { STUDENTS } from "@/data";
import { BRANCHES } from "@/lib/domain/constants";
import { useHasPermission } from "@/lib/auth";
import { useDemo } from "@/store/demo";
import { toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Field, Input, Select } from "@/components/ui/Field";
import { Table, Td, Th } from "@/components/ui/Table";
import { NoAccess } from "@/components/shared/NoAccess";
import { ImportStudentsModal } from "@/features/admin/ImportStudentsModal";

interface Row {
  enrollmentNo: string;
  name: string;
  branch: string;
  semester: number;
  category: string;
  color: string;
  imported: boolean;
}

export default function AdminStudentsPage() {
  const canView = useHasPermission("students.view");
  const canManage = useHasPermission("students.manage");
  const canImport = useHasPermission("students.import");
  const imported = useDemo((s) => s.importedStudents);
  const deactivated = useDemo((s) => s.deactivatedUserIds);
  const toggleActive = useDemo((s) => s.toggleUserActive);

  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("all");
  const [showImport, setShowImport] = useState(false);

  const rows: Row[] = useMemo(
    () => [
      ...STUDENTS.map((s) => ({
        enrollmentNo: s.enrollmentNo,
        name: s.name,
        branch: s.branch,
        semester: s.currentSemester,
        category: s.category,
        color: s.photoColor,
        imported: false,
      })),
      ...imported.map((i) => ({
        enrollmentNo: i.enrollmentNo,
        name: i.name,
        branch: i.branch,
        semester: 1,
        category: i.category,
        color: "#64748b",
        imported: true,
      })),
    ],
    [imported],
  );

  if (!canView) {
    return (
      <>
        <PageHeader title="Students" />
        <NoAccess />
      </>
    );
  }

  const filtered = rows.filter(
    (r) =>
      (branch === "all" || r.branch === branch) &&
      (!q ||
        r.name.toLowerCase().includes(q.toLowerCase()) ||
        r.enrollmentNo.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <PageHeader
        title="Students"
        description={`${rows.length} students${imported.length ? ` · ${imported.length} imported this session` : ""}`}
        actions={
          canImport ? (
            <Button onClick={() => setShowImport(true)}>
              <Upload className="size-4" /> Bulk import
            </Button>
          ) : undefined
        }
      />

      <Section bodyClassName="p-0">
        <div className="grid gap-4 border-b border-line p-5 sm:grid-cols-2">
          <Field label="Search">
            <div className="relative">
              <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or enrollment number" className="pl-8" />
            </div>
          </Field>
          <Field label="Branch">
            <Select value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="all">All branches</option>
              {BRANCHES.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.code} — {b.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Student</Th>
              <Th>Branch</Th>
              <Th className="text-center">Semester</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              {canManage && <Th className="text-right">Action</Th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const active = !deactivated.includes(r.enrollmentNo);
              return (
                <tr key={r.enrollmentNo}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.name} color={r.color} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-navy">
                          {r.name}
                          {r.imported && (
                            <Badge tone="gold" className="ml-2">
                              New admission
                            </Badge>
                          )}
                        </p>
                        <p className="font-mono text-xs text-muted">{r.enrollmentNo}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>{r.branch}</Td>
                  <Td className="text-center">{toRoman(r.semester)}</Td>
                  <Td>{r.category}</Td>
                  <Td>
                    <Badge tone={active ? "success" : "neutral"} dot>
                      {active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  {canManage && (
                    <Td className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(r.enrollmentNo)}>
                        {active ? (
                          <>
                            <UserX className="size-4" /> Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="size-4" /> Activate
                          </>
                        )}
                      </Button>
                    </Td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Section>

      {canImport && <ImportStudentsModal open={showImport} onClose={() => setShowImport(false)} />}
    </>
  );
}
