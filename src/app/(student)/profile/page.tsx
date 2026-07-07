"use client";

import { HandCoins, MapPin, Users } from "lucide-react";
import { useCurrentStudent } from "@/lib/auth";
import { computeCGPA, degreeProgress } from "@/lib/domain";
import { BRANCHES, EXTERNAL_PORTALS } from "@/lib/domain/constants";
import { formatDate, toRoman } from "@/lib/utils/format";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Section } from "@/components/ui/Section";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { KeyValue, KeyValueGrid } from "@/components/shared/KeyValue";
import { PortalLink } from "@/components/shared/PortalLink";

const SCHOLARSHIP_TONE: Record<string, Tone> = {
  "Not Applied": "neutral",
  Applied: "info",
  Sanctioned: "gold",
  Disbursed: "success",
};

export default function ProfilePage() {
  const student = useCurrentStudent();
  if (!student) return null;

  const branchName = BRANCHES.find((b) => b.code === student.branch)?.name ?? student.branch;
  const cgpa = computeCGPA(student.semesters);
  const progress = degreeProgress(student.semesters);

  return (
    <>
      <HeroBanner scrim="left" className="mb-6">
        <div className="flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-4">
            <Avatar name={student.name} color={student.photoColor} size="lg" className="ring-2 ring-white/40" />
            <div>
              <h1 className="font-heading text-2xl font-bold text-white">{student.name}</h1>
              <p className="text-sm text-white/80">
                {branchName} · Semester {toRoman(student.currentSemester)} · Section {student.section}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-white/85">
                <span className="rounded-full bg-white/10 px-2.5 py-1">Enroll. {student.enrollmentNo}</span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">{student.email}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <p className="font-heading text-2xl font-bold text-white">{cgpa?.toFixed(2) ?? "—"}</p>
              <p className="text-xs text-white/60">CGPA</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white">{progress.earned}</p>
              <p className="text-xs text-white/60">Credits</p>
            </div>
          </div>
        </div>
      </HeroBanner>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Personal details">
          <KeyValueGrid className="sm:grid-cols-2">
            <KeyValue label="Date of Birth">{formatDate(student.dob)}</KeyValue>
            <KeyValue label="Gender">{student.gender}</KeyValue>
            <KeyValue label="Roll Number">{student.rollNo}</KeyValue>
            <KeyValue label="Category">{student.category}</KeyValue>
            <KeyValue label="Admission Year">{student.admissionYear}</KeyValue>
            <KeyValue label="Aadhaar (last 4)">•••• {student.aadhaarLast4}</KeyValue>
          </KeyValueGrid>
        </Section>

        <Section title="Address" icon={MapPin}>
          <p className="text-sm text-slate">
            {student.address.line1}
            <br />
            {student.address.city}, {student.address.state} — {student.address.pincode}
          </p>
        </Section>

        <Section title="Parent / Guardian" icon={Users}>
          <div className="space-y-3">
            {student.guardians.map((g) => (
              <div key={g.relation} className="flex items-center justify-between border-b border-line pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-navy">{g.name}</p>
                  <p className="text-xs text-muted">
                    {g.relation}
                    {g.occupation ? ` · ${g.occupation}` : ""}
                  </p>
                </div>
                <span className="text-sm text-slate">{g.phone}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Scholarship"
          icon={HandCoins}
          action={
            student.category !== "General" ? (
              <PortalLink href={EXTERNAL_PORTALS.scholarshipPortal.url}>MP Scholarship Portal</PortalLink>
            ) : undefined
          }
        >
          {student.scholarship.status === "Not Applied" && student.category === "General" ? (
            <p className="text-sm text-muted">
              No scholarship on record. State post-matric scholarships are available for SC/ST/OBC students.
            </p>
          ) : (
            <div className="space-y-2">
              <KeyValue label="Scheme">{student.scholarship.scheme}</KeyValue>
              <div className="flex items-center gap-2">
                <span className="text-xs tracking-wide text-muted uppercase">Status</span>
                <Badge tone={SCHOLARSHIP_TONE[student.scholarship.status]} dot>
                  {student.scholarship.status}
                </Badge>
              </div>
            </div>
          )}
        </Section>
      </div>
    </>
  );
}
