"use client";

import Link from "next/link";
import {
  BarChart3,
  GraduationCap,
  IndianRupee,
  Megaphone,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/types";
import { FACULTY, STUDENTS } from "@/data";
import { BRANCHES, adminRoleLabel, computeCGPA } from "@/lib/domain";
import { useAdminPermissions, useCurrentAdmin } from "@/lib/auth";
import { useDemo } from "@/store/demo";
import { formatINR } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Table, Td, Th } from "@/components/ui/Table";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/shared/StatCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

const QUICK: { href: string; label: string; icon: LucideIcon; permission: Permission }[] = [
  { href: "/admin/students", label: "Students", icon: Users, permission: "students.view" },
  { href: "/admin/fees", label: "Fee Collection", icon: Wallet, permission: "fees.view" },
  {
    href: "/admin/announcements",
    label: "Announcements",
    icon: Megaphone,
    permission: "announcements.send",
  },
  { href: "/admin/reports", label: "Reports", icon: BarChart3, permission: "reports.view" },
  {
    href: "/admin/roles",
    label: "Roles & Permissions",
    icon: ShieldCheck,
    permission: "roles.edit",
  },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.edit" },
];

export default function AdminDashboardPage() {
  const admin = useCurrentAdmin();
  const perms = useAdminPermissions();
  const imported = useDemo((s) => s.importedStudents);
  const paidFees = useDemo((s) => s.paidFees);

  const cgpas = STUDENTS.map((s) => computeCGPA(s.semesters)).filter(
    (x): x is number => x !== null,
  );
  const avgCgpa = cgpas.length ? cgpas.reduce((a, b) => a + b, 0) / cgpas.length : null;

  let collected = 0;
  STUDENTS.forEach((s) =>
    s.fees.forEach((f) => (f.status === "Paid" || paidFees[f.id]) && (collected += f.amount)),
  );

  const strength = BRANCHES.map((b) => ({
    ...b,
    enrolled: STUDENTS.filter((s) => s.branch === b.code).length,
  }));
  const quick = QUICK.filter((q) => perms.includes(q.permission));

  return (
    <>
      <PageHeader
        title="Administration"
        description={
          admin ? `Signed in as ${admin.name} · ${adminRoleLabel(admin.adminRole)}` : undefined
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Students"
          value={<AnimatedNumber value={STUDENTS.length + imported.length} />}
          icon={Users}
          tone="info"
          href="/admin/students"
        />
        <StatCard
          label="Faculty"
          value={<AnimatedNumber value={FACULTY.length} />}
          icon={GraduationCap}
          tone="info"
        />
        <StatCard
          label="Fees collected"
          value={<AnimatedNumber value={collected} format={(n) => formatINR(Math.round(n))} />}
          icon={IndianRupee}
          tone="success"
          href="/admin/fees"
        />
        <StatCard
          label="Average CGPA"
          value={
            avgCgpa != null ? <AnimatedNumber value={avgCgpa} format={(n) => n.toFixed(2)} /> : "—"
          }
          icon={TrendingUp}
          tone="neutral"
        />
      </div>

      {quick.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.href}
                href={q.href}
                className="rounded-card border-line bg-surface shadow-card hover:shadow-pop flex flex-col items-center gap-2 border p-4 text-center transition-shadow"
              >
                <span className="bg-navy/5 text-navy grid size-9 place-items-center rounded-lg">
                  <Icon className="size-5" />
                </span>
                <span className="text-navy text-xs font-medium">{q.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      <Section
        title="Branch-wise sanctioned intake"
        description="B.E. seats across the nine branches (≈690 total)."
        bodyClassName="p-0"
      >
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Branch</Th>
              <Th className="text-center">Intake</Th>
              <Th>Share</Th>
            </tr>
          </thead>
          <tbody>
            {strength.map((b) => (
              <tr key={b.code}>
                <Td className="text-muted font-mono text-xs">{b.code}</Td>
                <Td className="text-navy font-medium">{b.name}</Td>
                <Td className="text-center tabular-nums">{b.intake}</Td>
                <Td>
                  <div className="w-40">
                    <ProgressBar
                      value={(b.intake / 120) * 100}
                      tone="info"
                      aria-label={`${b.name} intake`}
                    />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>
    </>
  );
}
