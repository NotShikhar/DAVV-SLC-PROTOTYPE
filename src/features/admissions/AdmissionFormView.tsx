"use client";

import type { ReactNode } from "react";
import type { AdmissionAddress, AdmissionApplication, EligibleCandidate } from "@/types";
import {
  ADMISSION_FEE_PARTICULARS,
  ADMISSION_FEE_TOTAL,
  feeEntered,
} from "@/lib/domain";
import { formatDate, formatINR } from "@/lib/utils/format";
import { KeyValue, KeyValueGrid } from "@/components/shared/KeyValue";
import { Badge } from "@/components/ui/Badge";
import { Table, Td, Th } from "@/components/ui/Table";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <p className="eyebrow text-gold-600 mb-3">{title}</p>
      {children}
    </section>
  );
}

function fmtAddr(a: AdmissionAddress): string {
  return `${a.houseNo}, ${a.street}, ${a.city}, ${a.district}, ${a.state} — ${a.pin}`;
}

const yn = (v: "Y" | "N") => (v === "Y" ? "Yes" : "No");

/**
 * Read-only render of a complete admission application (Sections A–F + the fee
 * payment). Shared by the applicant status view, the incharge review modal and
 * the printable/PDF layouts.
 */
export function AdmissionFormView({
  application: app,
  candidate: c,
}: {
  application: AdmissionApplication;
  candidate: EligibleCandidate;
}) {
  const entered = feeEntered(app.payments);
  const board = (b: string, other?: string) => (b === "Other" ? (other ?? b) : b);

  return (
    <div className="space-y-6">
      <Group title="A · Allotment Details">
        <KeyValueGrid>
          <KeyValue label="Application No">{app.applicationNo}</KeyValue>
          <KeyValue label="Roll No">{c.rollno}</KeyValue>
          <KeyValue label="Name">{c.name}</KeyValue>
          <KeyValue label="Program">{c.program}</KeyValue>
          <KeyValue label="Branch">{c.branch}</KeyValue>
          <KeyValue label="Rank">{c.rank.toLocaleString("en-IN")}</KeyValue>
          <KeyValue label="Marks / Percentile">{c.marks}</KeyValue>
          <KeyValue label="Father's Name">{c.father}</KeyValue>
          <KeyValue label="Mother's Name">{c.mother}</KeyValue>
          <KeyValue label="Eligible Category">{c.eligCat}</KeyValue>
          <KeyValue label="Allotment Category">{c.allotCat}</KeyValue>
          <KeyValue label="Domicile (MP)">{yn(c.domicile)}</KeyValue>
          <KeyValue label="Gender">{c.gender === "F" ? "Female" : "Male"}</KeyValue>
          <KeyValue label="EWS">{yn(c.ews)}</KeyValue>
          <KeyValue label="Allotment Round">{c.allotRound}</KeyValue>
        </KeyValueGrid>
      </Group>

      <Group title="B · Identity & Contact">
        <KeyValueGrid>
          <KeyValue label="Aadhaar No">{app.aadharNo}</KeyValue>
          <KeyValue label="APAAR / ABC ID">{app.apaarId}</KeyValue>
          <KeyValue label="Email">{app.email}</KeyValue>
          <KeyValue label="Blood Group">{app.bloodGroup}</KeyValue>
          <KeyValue label="Passport Photo">{app.photo?.name}</KeyValue>
        </KeyValueGrid>
      </Group>

      <Group title="C · Category & Religion">
        <KeyValueGrid>
          <KeyValue label="Category">{app.category}</KeyValue>
          <KeyValue label="Sub Category">{app.subCategory}</KeyValue>
          <KeyValue label="Religion">{app.religion}</KeyValue>
          <KeyValue label="Minority">{app.minority}</KeyValue>
        </KeyValueGrid>
      </Group>

      <Group title="D · Academic Details">
        <KeyValueGrid>
          <KeyValue label="10th %">{app.hscPercent}</KeyValue>
          <KeyValue label="10th Passing Year">{app.hscPassingYear}</KeyValue>
          <KeyValue label="10th Board">{board(app.hscUniversity, app.hscUniversityOther)}</KeyValue>
          <KeyValue label="Last Exam">{board(app.lastExam, app.lastExamOther)}</KeyValue>
          <KeyValue label="12th Passing Year">{app.passingYear}</KeyValue>
          <KeyValue label="12th Board">{board(app.university, app.universityOther)}</KeyValue>
          <KeyValue label="Date of Birth">{formatDate(app.dob)}</KeyValue>
        </KeyValueGrid>
      </Group>

      <Group title="E · Family & Guardian">
        <KeyValueGrid>
          <KeyValue label="Father's Occupation">{app.fatherOcc}</KeyValue>
          <KeyValue label="Mother's Occupation">{app.motherOcc}</KeyValue>
          <KeyValue label="Place of Work">{app.placeOfWork}</KeyValue>
          <KeyValue label="Parent / Guardian Mobile">{app.parentMobile}</KeyValue>
        </KeyValueGrid>
      </Group>

      <Group title="F · Address Details">
        <KeyValueGrid className="sm:grid-cols-1">
          <KeyValue label="Permanent Address">{fmtAddr(app.perm)}</KeyValue>
          <KeyValue label="Local Address (Correspondence)">{fmtAddr(app.local)}</KeyValue>
        </KeyValueGrid>
        <KeyValueGrid className="mt-4">
          <KeyValue label="Local Guardian Mobile">{app.guardianMobile}</KeyValue>
          <KeyValue label="Local Guardian Address">{app.guardianAddress}</KeyValue>
        </KeyValueGrid>
      </Group>

      <Group title="Fee & Payment">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-muted mb-2 text-xs font-semibold">Published fee</p>
            <Table>
              <tbody>
                {ADMISSION_FEE_PARTICULARS.map((f) => (
                  <tr key={f.label}>
                    <Td className="text-slate">{f.label}</Td>
                    <Td className="text-navy text-right font-medium tabular-nums">
                      {formatINR(f.amount)}
                    </Td>
                  </tr>
                ))}
                <tr>
                  <Td className="text-navy font-semibold">Total</Td>
                  <Td className="text-navy text-right font-bold tabular-nums">
                    {formatINR(ADMISSION_FEE_TOTAL)}
                  </Td>
                </tr>
              </tbody>
            </Table>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted text-xs font-semibold">Transactions recorded</p>
              <Badge tone={entered >= ADMISSION_FEE_TOTAL ? "success" : "warning"}>
                Entered {formatINR(entered)}
              </Badge>
            </div>
            <Table>
              <thead>
                <tr>
                  <Th>UTR / Txn</Th>
                  <Th>Amount</Th>
                  <Th>Date</Th>
                  <Th>Mode</Th>
                  <Th>Proof</Th>
                </tr>
              </thead>
              <tbody>
                {app.payments.map((p) => (
                  <tr key={p.id}>
                    <Td className="font-mono text-xs">{p.txnNo}</Td>
                    <Td className="tabular-nums">{formatINR(p.amount)}</Td>
                    <Td className="text-xs">{p.payDate ? formatDate(p.payDate) : "—"}</Td>
                    <Td className="text-xs">{p.bankMode}</Td>
                    <Td className="text-muted text-xs">{p.proof?.name ?? "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Group>
    </div>
  );
}
