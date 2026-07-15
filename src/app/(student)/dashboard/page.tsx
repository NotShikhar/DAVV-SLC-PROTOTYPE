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
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { TextAnimate } from "@/components/ui/TextAnimate";
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
            <p className="font-serif-accent text-gold text-sm">
              Semester {toRoman(student.currentSemester)} ·{" "}
              {semesterParity(student.currentSemester)} Semester
            </p>
            <h1 className="font-heading mt-1 text-2xl font-bold text-white sm:text-3xl">
              <TextAnimate text={`Welcome back, ${firstName}`} />
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
        <Card accent className="border-l-warning bg-warning-bg/40 mb-6 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-warning mt-0.5 size-5 shrink-0" />
            <div className="flex-1">
              <p className="font-heading text-navy font-semibold">
                Exam eligibility{" "}
                {eligibility.status === "Detained" ? "at serious risk" : "needs attention"}
              </p>
              <p className="text-slate mt-0.5 text-sm">
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
          value={cgpa != null ? <AnimatedNumber value={cgpa} format={(n) => n.toFixed(2)} /> : "—"}
          icon={TrendingUp}
          tone="success"
          hint={`${completed.length} semesters completed`}
          href="/results"
        />
        <StatCard
          label="Credits earned"
          value={<AnimatedNumber value={progress.earned} />}
          icon={GraduationCap}
          tone="info"
          hint={`of ${REQUIRED_CREDITS} required`}
          href="/degree-audit"
        />
        <StatCard
          label="Attendance"
          value={
            <AnimatedNumber value={eligibility.aggregate} format={(n) => `${Math.round(n)}%`} />
          }
          icon={CalendarClock}
          tone={eligibility.aggregate >= 75 ? "success" : "danger"}
          hint="current semester"
          href="/examinations"
        />
        <StatCard
          label="Fee due"
          value={
            feeDue ? (
              <AnimatedNumber value={feeDue} format={(n) => formatINR(Math.round(n))} />
            ) : (
              "Nil"
            )
          }
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
                <p className="text-muted text-xs tracking-wide uppercase">SGPA trend</p>
                <div className="mt-1 flex items-end gap-3">
                  <span className="font-heading text-navy text-2xl font-bold">
                    {lastSgpa != null ? lastSgpa.toFixed(2) : "—"}
                  </span>
                  <Sparkline values={sgpaTrend} className="text-gold-600" />
                </div>
                <p className="text-muted mt-1 text-xs">across {sgpaTrend.length} semesters</p>
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
                <Gauge
                  value={progress.percent}
                  tone="info"
                  label={`${progress.percent}%`}
                  sublabel="Degree"
                />
              </div>
            </div>
          </Section>

          <Section title="Academic standing" icon={BadgeCheck}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Badge tone={standing.tone} dot>
                  {standing.label}
                </Badge>
                <p className="text-slate text-sm">{standing.reason}</p>
              </div>
              <span className="font-heading text-muted text-sm">
                CGPA <span className="text-navy font-semibold">{cgpa?.toFixed(2) ?? "—"}</span>
              </span>
            </div>
            <div className="mt-5">
              <CreditMeter
                earned={progress.earned}
                required={progress.required}
                label="Degree progress"
              />
            </div>
          </Section>

          <Section
            title={latest ? `Latest results — Semester ${toRoman(latest.semester)}` : "Results"}
            description={latest?.session}
            icon={GraduationCap}
            action={
              <Link href="/results" className="text-navy hover:text-gold text-sm font-medium">
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
                        <span className="text-navy font-medium">{c.title}</span>
                        <span className="text-muted ml-2 text-xs">{c.courseCode}</span>
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
              <p className="text-muted p-5 text-sm">No results declared yet.</p>
            )}
            {latest?.sgpa != null && (
              <div className="border-line flex items-center justify-end gap-2 border-t px-5 py-3 text-sm">
                <span className="text-muted">SGPA</span>
                <span className="font-heading text-navy text-base font-semibold">
                  {latest.sgpa.toFixed(2)}
                </span>
              </div>
            )}
          </Section>
        </div>

        {/* Right: deadlines, notifications, quick actions */}
        <div className="space-y-6">
          <Section title="Upcoming deadlines" icon={CalendarClock} bodyClassName="p-0">
            <ul className="divide-line divide-y">
              {upcoming.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="bg-cream grid size-10 shrink-0 place-items-center rounded-lg text-center leading-none">
                    <span className="font-heading text-navy text-sm font-bold">
                      {new Date(e.date).getDate()}
                    </span>
                    <span className="text-muted text-[10px] uppercase">
                      {new Date(e.date).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-navy truncate text-sm font-medium">{e.title}</p>
                    <p className="text-muted text-xs">{e.detail ?? formatDate(e.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section
            title="Notifications"
            icon={Bell}
            action={
              <Link href="/notifications" className="text-navy hover:text-gold text-sm font-medium">
                All
              </Link>
            }
            bodyClassName="p-0"
          >
            <ul className="divide-line divide-y">
              {recentNotifications.map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {!n.read && <StatusIndicator tone="gold" size="sm" aria-hidden />}
                    <p className={cn("text-sm", n.read ? "text-slate" : "text-navy font-medium")}>
                      {n.title}
                    </p>
                  </div>
                  <p className="text-muted mt-0.5 line-clamp-1 text-xs">{n.message}</p>
                </li>
              ))}
            </ul>
          </Section>

          <div className="grid grid-cols-1 gap-2">
            <Link href="/registration" className={buttonClasses("primary", "md")}>
              <ClipboardList className="size-4" /> Register subjects{" "}
              <ArrowRight className="ml-auto size-4" />
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
