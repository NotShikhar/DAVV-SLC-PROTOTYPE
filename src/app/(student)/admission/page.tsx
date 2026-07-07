"use client";

import { BadgeCheck, CheckCircle2, FileCheck, IndianRupee } from "lucide-react";
import { useCurrentStudent } from "@/lib/auth";
import { BRANCHES, EXTERNAL_PORTALS, FEE_STRUCTURE } from "@/lib/domain/constants";
import { formatINR } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Stepper } from "@/components/ui/Stepper";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { KeyValue, KeyValueGrid } from "@/components/shared/KeyValue";
import { PortalLink } from "@/components/shared/PortalLink";
import { buttonClasses } from "@/components/ui/Button";

export default function AdmissionPage() {
  const student = useCurrentStudent();
  if (!student) return null;

  const a = student.admission;
  const branchName = BRANCHES.find((b) => b.code === student.branch)?.name ?? student.branch;
  const verified = a.documents.filter((d) => d.verified).length;
  const allVerified = verified === a.documents.length;

  return (
    <>
      <PageHeader
        title="Admission & Onboarding"
        description="Your journey from DTE Madhya Pradesh counselling to enrolment at IET DAVV."
        actions={<PortalLink href={EXTERNAL_PORTALS.dteCounselling.url}>DTE MP portal</PortalLink>}
      />

      <Section className="mb-6">
        <Stepper steps={["DTE Allotment", "Document Verification", "Fee Payment", "Enrolled"]} current={3} />
      </Section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section
            title="Seat allotment"
            icon={FileCheck}
            description="Allotted through DTE Madhya Pradesh counselling (JEE Main)."
          >
            <KeyValueGrid>
              <KeyValue label="Allotment No.">{a.allotmentNo}</KeyValue>
              <KeyValue label="JEE Main Rank">{a.jeeRank?.toLocaleString("en-IN")}</KeyValue>
              <KeyValue label="Counselling Round">Round {a.counsellingRound}</KeyValue>
              <KeyValue label="Branch Allotted">{branchName}</KeyValue>
              <KeyValue label="Quota">{student.quota}</KeyValue>
              <KeyValue label="Category">{student.category}</KeyValue>
            </KeyValueGrid>
          </Section>

          <Section
            title="Document verification"
            icon={CheckCircle2}
            description={`${verified} of ${a.documents.length} documents verified`}
            action={<Badge tone={allVerified ? "success" : "warning"}>{allVerified ? "Complete" : "Pending"}</Badge>}
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-line">
              {a.documents.map((d) => (
                <li key={d.name} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-slate">{d.name}</span>
                  {d.verified ? (
                    <Badge tone="success" dot>
                      Verified
                    </Badge>
                  ) : (
                    <Badge tone="warning" dot>
                      Pending
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Enrolment" icon={BadgeCheck} accent>
            <p className="text-xs tracking-wide text-muted uppercase">Enrollment Number</p>
            <p className="font-heading text-2xl font-bold text-navy">{student.enrollmentNo}</p>
            <p className="mt-1 text-xs text-muted">
              Use this with your Date of Birth to sign in to DAVV SIS.
            </p>
            <div className="mt-4">
              <Badge tone={a.admissionConfirmed ? "success" : "warning"} dot>
                {a.admissionConfirmed ? "Admission Confirmed" : "Provisional"}
              </Badge>
            </div>
          </Section>

          <Section title="Fee confirmation" icon={IndianRupee}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">First-semester tuition</span>
              <span className="font-semibold text-navy">{formatINR(FEE_STRUCTURE.tuitionPerSemester)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted">Status</span>
              {a.feePaid ? (
                <Badge tone="success" dot>
                  Paid
                </Badge>
              ) : (
                <Badge tone="warning" dot>
                  Due
                </Badge>
              )}
            </div>
            <div className="mt-4">
              <Link href="/fees" className={buttonClasses("secondary", "sm")}>
                View fee ledger
              </Link>
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
