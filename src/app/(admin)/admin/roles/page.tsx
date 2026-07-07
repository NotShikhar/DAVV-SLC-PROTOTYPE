"use client";

import { Fragment } from "react";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { ADMIN_ROLES, PERMISSIONS } from "@/lib/domain/permissions";
import { useHasPermission } from "@/lib/auth";
import { useSettings } from "@/store/settings";
import { useUi } from "@/store/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, Td, Th } from "@/components/ui/Table";
import { NoAccess } from "@/components/shared/NoAccess";

export default function RolesPage() {
  const can = useHasPermission("roles.edit");
  const matrix = useSettings((s) => s.matrix);
  const togglePermission = useSettings((s) => s.togglePermission);
  const resetMatrix = useSettings((s) => s.resetMatrix);
  const pushToast = useUi((s) => s.pushToast);

  if (!can) {
    return (
      <>
        <PageHeader title="Roles & Permissions" />
        <NoAccess />
      </>
    );
  }

  const groups = [...new Set(PERMISSIONS.map((p) => p.group))];

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        description="Control what each admin role can do. Changes apply instantly across the portal."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              resetMatrix();
              pushToast({ tone: "info", title: "Reset", description: "Permissions restored to defaults." });
            }}
          >
            <RotateCcw className="size-4" /> Reset to defaults
          </Button>
        }
      />

      <Section title="Permission matrix" icon={ShieldCheck} bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Capability</Th>
              {ADMIN_ROLES.map((r) => (
                <Th key={r.key} className="text-center">
                  {r.label}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group}>
                <tr>
                  <Td
                    colSpan={ADMIN_ROLES.length + 1}
                    className="bg-cream/60 text-xs font-semibold tracking-wide text-muted uppercase"
                  >
                    {group}
                  </Td>
                </tr>
                {PERMISSIONS.filter((p) => p.group === group).map((p) => (
                  <tr key={p.key}>
                    <Td className="text-slate">{p.label}</Td>
                    {ADMIN_ROLES.map((r) => {
                      const checked = matrix[r.key]?.includes(p.key) ?? false;
                      const locked = r.key === "super";
                      return (
                        <Td key={r.key} className="text-center">
                          <input
                            type="checkbox"
                            className="size-4 accent-navy"
                            checked={checked}
                            disabled={locked}
                            onChange={() => togglePermission(r.key, p.key)}
                            aria-label={`${r.label}: ${p.label}`}
                          />
                        </Td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </Table>
      </Section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {ADMIN_ROLES.map((r) => (
          <Card key={r.key} className="p-4">
            <p className="font-heading font-semibold text-navy">{r.label}</p>
            <p className="mt-1 text-xs text-muted">{r.description}</p>
            <Badge tone="neutral" className="mt-2">
              {matrix[r.key]?.length ?? 0} permissions
            </Badge>
          </Card>
        ))}
      </div>
    </>
  );
}
