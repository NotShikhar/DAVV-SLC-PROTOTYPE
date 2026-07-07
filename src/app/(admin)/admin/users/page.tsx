"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, UserCheck, UserX } from "lucide-react";
import type { Role } from "@/types";
import { ADMINS, FACULTY, STUDENTS } from "@/data";
import { adminRoleLabel } from "@/lib/domain/permissions";
import { useHasPermission } from "@/lib/auth";
import { useDemo } from "@/store/demo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Select } from "@/components/ui/Field";
import { Table, Td, Th } from "@/components/ui/Table";
import { NoAccess } from "@/components/shared/NoAccess";

interface Row {
  id: string;
  name: string;
  role: Role;
  sub?: string;
  email: string;
  color: string;
}

const ROLE_TONE: Record<Role, Tone> = { student: "info", faculty: "gold", admin: "danger" };

const USERS: Row[] = [
  ...STUDENTS.map((s) => ({ id: s.enrollmentNo, name: s.name, role: "student" as const, email: s.email, color: s.photoColor })),
  ...FACULTY.map((f) => ({ id: f.id, name: f.name, role: "faculty" as const, sub: f.designation, email: f.email, color: f.photoColor })),
  ...ADMINS.map((a) => ({ id: a.id, name: a.name, role: "admin" as const, sub: adminRoleLabel(a.adminRole), email: a.email, color: a.photoColor })),
];

export default function AdminUsersPage() {
  const can = useHasPermission("students.manage");
  const deactivated = useDemo((s) => s.deactivatedUserIds);
  const toggleActive = useDemo((s) => s.toggleUserActive);
  const [role, setRole] = useState<Role | "all">("all");

  if (!can) {
    return (
      <>
        <PageHeader title="User Management" />
        <NoAccess />
      </>
    );
  }

  const filtered = role === "all" ? USERS : USERS.filter((u) => u.role === role);

  return (
    <>
      <PageHeader
        title="User Management"
        description="All portal accounts and their status. Configure what each role can do under Roles & Permissions."
        actions={
          <Link href="/admin/roles" className={buttonClasses("secondary", "sm")}>
            <ShieldCheck className="size-4" /> Roles & Permissions
          </Link>
        }
      />

      <Section
        title="Accounts"
        description={`${filtered.length} of ${USERS.length} users`}
        action={
          <div className="w-44">
            <Select value={role} onChange={(e) => setRole(e.target.value as Role | "all")} aria-label="Filter by role">
              <option value="all">All roles</option>
              <option value="student">Students</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Administration</option>
            </Select>
          </div>
        }
        bodyClassName="p-0"
      >
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>ID</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const active = !deactivated.includes(u.id);
              return (
                <tr key={u.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} color={u.color} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-navy">{u.name}</p>
                        {u.sub && <p className="text-xs text-muted">{u.sub}</p>}
                      </div>
                    </div>
                  </Td>
                  <Td className="font-mono text-xs text-muted">{u.id}</Td>
                  <Td>
                    <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={active ? "success" : "neutral"} dot>
                      {active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(u.id)}>
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
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Section>
    </>
  );
}
