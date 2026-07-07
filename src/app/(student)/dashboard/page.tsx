"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  CalendarClock,
  ClipboardList,
  GraduationCap,
  Stamp,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCurrentStudent } from "@/lib/auth";
import { useDemo } from "@/store/demo";
import { TODAY_ISO, upcomingEvents } from "@/data";
import {
  academicStanding,
  computeCGPA,
  degreeProgress,
  examEligibility,
  REQUIRED_CREDITS,
} from "@/lib/domain";
import { formatDate, formatINR, semesterParity, toRoman } from "@/lib/utils/format";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Sparkline } from "@/components/shared/Sparkline";
import { Gauge } from "@/components/shared/Gauge";
import { StatCard } from "@/components/shared/StatCard";
import { CreditMeter } from "@/components/shared/CreditMeter";
import { GradeBadge } from "@/components/shared/GradeBadge";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Td, Th } from "@/components/ui/Table";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

export default function DashboardPage() {
  const student = useCurrentStudent();
  const notifications = useDemo((s) => s.notifications);
  if (!student) return null;

  const firstName = student.name.split(" ")[0];
  const cgpa = computeCGPA(student.semesters);
  const progress = degreeProgress(student.semesters);
  const standing = academicStanding(student);
  const eligibility = examEligibility(student);
  const feeDue = student.fees
    .filter((f) => f.status !== "Paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const completed = student.semesters.filter((s) => s.courses.every((c) => c.status !== "Pending"));
  const sgpaTrend = completed.map((s) => s.sgpa).filter((v): v is number => v != null);
  const lastSgpa = sgpaTrend.at(-1) ?? null;
  const latest = completed.at(-1);
  const upcoming = upcomingEvents(TODAY_ISO, 4);
  const recentNotifications = notifications.slice(0, 3);

  return (
    <>
      <HeroBanner scrim="left" className="mb-6">
        <div className="flex flex-col gap-4 px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="font-serif-accent text-sm text-gold">
              Semester {toRoman(student.currentSemester)} · {semesterParity(student.currentSemester)} Semester
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-white sm:text-3xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-1 text-sm text-white/75">
              {student.branch} · Section {student.section} · Enroll. {student.enrollmentNo}
            </p>
          </div>
          <Badge tone={standing.tone} dot>
            {standing.label}
          </Badge>
        </div>
      </HeroBanner>

      {/* Eligibility banner when not clear */}
      {eligibility.status !== "Eligible" && (
        <Card accent className="mb-6 border-l-warning bg-warning-bg/40 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
            <div className="flex-1">
              <p className="font-heading font-semibold text-navy">
                Exam eligibility {eligibility.status === "Detained" ? "at serious risk" : "needs attention"}
              </p>
              <p className="mt-0.5 text-sm text-slate">
                Aggregate attendance is {eligibility.aggregate}% (minimum 75% required). Review the
                affected courses before the exam-form window.
              </p>
            </div>
            <Link href="/examinations" className={buttonClasses("secondary", "sm")}>
              Review
            </Link>
          </div>
        </Card>
      )}

      {/* Key stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="CGPA"
          value={cgpa?.toFixed(2) ?? "—"}
          icon={TrendingUp}
          tone="success"
          hint={`${completed.length} semesters completed`}
          href="/results"
        />
        <StatCard
          label="Credits earned"
          value={progress.earned}
          icon={GraduationCap}
          tone="info"
          hint={`of ${REQUIRED_CREDITS} required`}
          href="/degree-audit"
        />
        <StatCard
          label="Attendance"
          value={`${eligibility.aggregate}%`}
          icon={CalendarClock}
          tone={eligibility.aggregate >= 75 ? "success" : "danger"}
          hint="current semester"
          href="/examinations"
        />
        <StatCard
          label="Fee due"
          value={feeDue ? formatINR(feeDue) : "Nil"}
          icon={Wallet}
          tone={feeDue ? "warning" : "success"}
          hint={feeDue ? "examination fee pending" : "all cleared"}
          href="/fees"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left: performance, standing + latest results */}
        <div className="space-y-6 lg:col-span-2">
          <Section title="Performance snapshot" icon={TrendingUp} bodyClassName="p-5">
            <div className="grid items-center gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs tracking-wide text-muted uppercase">SGPA trend</p>
                <div className="mt-1 flex items-end gap-3">
                  <span className="font-heading text-2xl font-bold text-navy">
                    {lastSgpa != null ? lastSgpa.toFixed(2) : "—"}
                  </span>
                  <Sparkline values={sgpaTrend} className="text-gold-600" />
                </div>
                <p className="mt-1 text-xs text-muted">across {sgpaTrend.length} semesters</p>
              </div>
              <div className="flex justify-center">
                <Gauge
                  value={eligibility.aggregate}
                  tone={eligibility.aggregate >= 75 ? "success" : "danger"}
                  label={`${eligibility.aggregate}%`}
                  sublabel="Attendance"
                />
              </div>
              <div className="flex justify-center">
                <Gauge value={progress.percent} tone="info" label={`${progress.percent}%`} sublabel="Degree" />
              </div>
            </div>
          </Section>

          <Section title="Academic standing" icon={BadgeCheck}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Badge tone={standing.tone} dot>
                  {standing.label}
                </Badge>
                <p className="text-sm text-slate">{standing.reason}</p>
              </div>
              <span className="font-heading text-sm text-muted">
                CGPA <span className="font-semibold text-navy">{cgpa?.toFixed(2) ?? "—"}</span>
              </span>
            </div>
            <div className="mt-5">
              <CreditMeter earned={progress.earned} required={progress.required} label="Degree progress" />
            </div>
          </Section>

          <Section
            title={latest ? `Latest results — Semester ${toRoman(latest.semester)}` : "Results"}
            description={latest?.session}
            icon={GraduationCap}
            action={
              <Link href="/results" className="text-sm font-medium text-navy hover:text-gold">
                View all
              </Link>
            }
            bodyClassName="p-0"
          >
            {latest ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Course</Th>
                    <Th className="text-right">Total</Th>
                    <Th className="text-center">Grade</Th>
                  </tr>
                </thead>
                <tbody>
                  {latest.courses.map((c) => (
                    <tr key={c.courseCode}>
                      <Td>
                        <span className="font-medium text-navy">{c.title}</span>
                        <span className="ml-2 text-xs text-muted">{c.courseCode}</span>
                      </Td>
                      <Td className="text-right tabular-nums">
                        {c.internal !== null && c.external !== null ? c.internal + c.external : "—"}
                      </Td>
                      <Td className="text-center">
                        <GradeBadge grade={c.grade} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="p-5 text-sm text-muted">No results declared yet.</p>
            )}
            {latest?.sgpa != null && (
              <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3 text-sm">
                <span className="text-muted">SGPA</span>
                <span className="font-heading text-base font-semibold text-navy">{latest.sgpa.toFixed(2)}</span>
              </div>
            )}
          </Section>
        </div>

        {/* Right: deadlines, notifications, quick actions */}
        <div className="space-y-6">
          <Section title="Upcoming deadlines" icon={CalendarClock} bodyClassName="p-0">
            <ul className="divide-y divide-line">
              {upcoming.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-cream text-center leading-none">
                    <span className="font-heading text-sm font-bold text-navy">
                      {new Date(e.date).getDate()}
                    </span>
                    <span className="text-[10px] text-muted uppercase">
                      {new Date(e.date).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy">{e.title}</p>
                    <p className="text-xs text-muted">{e.detail ?? formatDate(e.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="Notifications"
            icon={Bell}
            action={
              <Link href="/notifications" className="text-sm font-medium text-navy hover:text-gold">
                All
              </Link>
            }
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-line">
              {recentNotifications.map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="size-1.5 rounded-full bg-gold" aria-hidden />}
                    <p className={cn("text-sm", n.read ? "text-slate" : "font-medium text-navy")}>{n.title}</p>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">{n.message}</p>
                </li>
              ))}
            </ul>
          </Section>

          <div className="grid grid-cols-1 gap-2">
            <Link href="/registration" className={buttonClasses("primary", "md")}>
              <ClipboardList className="size-4" /> Register subjects <ArrowRight className="ml-auto size-4" />
            </Link>
            <Link href="/examinations" className={buttonClasses("secondary", "md")}>
              <GraduationCap className="size-4" /> Exam form & hall ticket
            </Link>
            <Link href="/services" className={buttonClasses("ghost", "md")}>
              <Stamp className="size-4" /> Apply for a certificate
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
