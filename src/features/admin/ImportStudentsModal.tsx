"use client";

import { useMemo, useState } from "react";
import { Download, Upload } from "lucide-react";
import type { ImportedStudentRow } from "@/types";
import { STUDENTS } from "@/data";
import { BRANCHES } from "@/lib/domain/constants";
import { useDemo } from "@/store/demo";
import { useUi } from "@/store/ui";
import { downloadCsv, parseCsv } from "@/lib/utils/csv";
import { Modal } from "@/components/ui/Modal";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Field";
import { Table, Td, Th } from "@/components/ui/Table";
import { cn } from "@/lib/utils/cn";

const HEADERS = ["enrollmentNo", "name", "dob", "branch", "section", "category", "email", "phone"];
const BRANCH_CODES = new Set<string>(BRANCHES.map((b) => b.code));

interface ParsedRow {
  data: ImportedStudentRow;
  errors: string[];
}

export function ImportStudentsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const importStudents = useDemo((s) => s.importStudents);
  const imported = useDemo((s) => s.importedStudents);
  const pushToast = useUi((s) => s.pushToast);
  const [raw, setRaw] = useState("");

  const existing = useMemo(
    () => new Set([...STUDENTS.map((s) => s.enrollmentNo), ...imported.map((i) => i.enrollmentNo)]),
    [imported],
  );

  const parsed: ParsedRow[] = useMemo(() => {
    const seen = new Set<string>();
    return parseCsv(raw).map((r) => {
      const data: ImportedStudentRow = {
        enrollmentNo: r.enrollmentNo ?? "",
        name: r.name ?? "",
        dob: r.dob ?? "",
        branch: (r.branch ?? "").toUpperCase(),
        section: r.section || "A",
        category: r.category || "General",
        email: r.email || "",
        phone: r.phone || "",
      };
      const errors: string[] = [];
      if (!data.enrollmentNo) errors.push("Missing enrollment no.");
      if (!data.name) errors.push("Missing name");
      if (!data.dob) errors.push("Missing DOB");
      if (!BRANCH_CODES.has(data.branch)) errors.push("Invalid branch");
      if (data.enrollmentNo && (existing.has(data.enrollmentNo) || seen.has(data.enrollmentNo)))
        errors.push("Duplicate");
      if (data.enrollmentNo) seen.add(data.enrollmentNo);
      return { data, errors };
    });
  }, [raw, existing]);

  const valid = parsed.filter((p) => p.errors.length === 0);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result ?? ""));
    reader.readAsText(file);
  };

  const doImport = () => {
    importStudents(valid.map((v) => v.data));
    pushToast({ tone: "success", title: "Import complete", description: `${valid.length} student(s) added.` });
    setRaw("");
    onClose();
  };

  const template = () =>
    downloadCsv("student-import-template.csv", HEADERS, [
      {
        enrollmentNo: "DE25CS0101",
        name: "New Student",
        dob: "2007-05-14",
        branch: "CSE",
        section: "A",
        category: "General",
        email: "new.student@ietdavv.edu.in",
        phone: "+91 9000000000",
      },
    ]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Bulk import students"
      description="Upload a CSV of new admissions. Rows are validated before import."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={doImport} disabled={valid.length === 0}>
            Import {valid.length} student(s)
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={template}>
            <Download className="size-4" /> Download template
          </Button>
          <label className={cn(buttonClasses("secondary", "sm"), "cursor-pointer")}>
            <Upload className="size-4" /> Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={onFile} />
          </label>
        </div>

        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={`${HEADERS.join(",")}\nDE25CS0101,New Student,2007-05-14,CSE,A,General,new.student@ietdavv.edu.in,+91 9000000000`}
          className="min-h-28 font-mono text-xs"
        />

        {parsed.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge tone="success">{valid.length} valid</Badge>
              {parsed.length - valid.length > 0 && (
                <Badge tone="danger">{parsed.length - valid.length} with errors</Badge>
              )}
            </div>
            <Table>
              <thead>
                <tr>
                  <Th>#</Th>
                  <Th>Enrollment</Th>
                  <Th>Name</Th>
                  <Th>Branch</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((p, i) => (
                  <tr key={i}>
                    <Td className="text-muted tabular-nums">{i + 1}</Td>
                    <Td className="font-mono text-xs">{p.data.enrollmentNo || "—"}</Td>
                    <Td className="text-navy">{p.data.name || "—"}</Td>
                    <Td>{p.data.branch || "—"}</Td>
                    <Td>
                      {p.errors.length === 0 ? (
                        <Badge tone="success" dot>
                          OK
                        </Badge>
                      ) : (
                        <Badge tone="danger">{p.errors.join(", ")}</Badge>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </Modal>
  );
}
