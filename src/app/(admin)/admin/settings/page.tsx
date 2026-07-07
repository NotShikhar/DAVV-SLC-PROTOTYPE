"use client";

import { Building2, IndianRupee, Palette, SlidersHorizontal } from "lucide-react";
import { ACCENTS, useSettings, type AccentKey, type StudentFeature } from "@/store/settings";
import { useHasPermission } from "@/lib/auth";
import { toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Field, Input, Select } from "@/components/ui/Field";
import { NoAccess } from "@/components/shared/NoAccess";
import { cn } from "@/lib/utils/cn";

const FEATURES: { key: StudentFeature; label: string; desc: string }[] = [
  { key: "fees", label: "Fees", desc: "Student fee payment & ledger" },
  { key: "services", label: "Student Services", desc: "Certificate applications" },
  { key: "notifications", label: "Notifications", desc: "In-app notification feed" },
];

export default function SettingsPage() {
  const can = useHasPermission("settings.edit");
  const s = useSettings();

  if (!can) {
    return (
      <>
        <PageHeader title="Settings" />
        <NoAccess />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Settings" description="Customize the portal. Changes save automatically and apply live." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="General" icon={Building2}>
          <div className="space-y-4">
            <Field label="Institute name">
              <Input value={s.instituteName} onChange={(e) => s.update({ instituteName: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Current semester">
                <Select
                  value={String(s.currentSemester)}
                  onChange={(e) => s.update({ currentSemester: Number(e.target.value) })}
                >
                  {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      Semester {toRoman(n)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Session">
                <Input value={s.session} onChange={(e) => s.update({ session: e.target.value })} />
              </Field>
            </div>
            <Field label="Attendance threshold (%)" hint="Minimum attendance to sit examinations.">
              <Input
                type="number"
                min={0}
                max={100}
                value={s.attendanceThreshold}
                onChange={(e) =>
                  s.update({ attendanceThreshold: Math.max(0, Math.min(100, Number(e.target.value) || 0)) })
                }
              />
            </Field>
          </div>
        </Section>

        <Section title="Fee structure" icon={IndianRupee}>
          <div className="space-y-4">
            <Field label="Tuition per semester (₹)">
              <Input type="number" value={s.fee.tuition} onChange={(e) => s.setFee({ tuition: Number(e.target.value) || 0 })} />
            </Field>
            <Field label="Examination per semester (₹)">
              <Input type="number" value={s.fee.exam} onChange={(e) => s.setFee({ exam: Number(e.target.value) || 0 })} />
            </Field>
            <Field label="Hostel per year (₹)">
              <Input type="number" value={s.fee.hostel} onChange={(e) => s.setFee({ hostel: Number(e.target.value) || 0 })} />
            </Field>
          </div>
        </Section>

        <Section title="Appearance" icon={Palette} description="Accent colour updates the whole portal live.">
          <div className="flex flex-wrap gap-3">
            {(Object.keys(ACCENTS) as AccentKey[]).map((key) => {
              const a = ACCENTS[key];
              const selected = s.accent === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => s.update({ accent: key })}
                  className={cn(
                    "flex items-center gap-2 rounded-btn border px-3 py-2 text-sm transition-colors",
                    selected ? "border-navy bg-navy/5 text-navy" : "border-line text-muted hover:bg-cream",
                  )}
                >
                  <span className="size-5 rounded-full" style={{ backgroundColor: a.hex }} />
                  {a.label}
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-muted">
            Preview: <span className="font-heading font-semibold text-gold">accent colour</span> and{" "}
            <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs text-gold-600">badge</span>
          </p>
        </Section>

        <Section title="Student features" icon={SlidersHorizontal} description="Toggle modules on/off in the student portal.">
          <ul className="space-y-3">
            {FEATURES.map((f) => {
              const on = s.features[f.key];
              return (
                <li key={f.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-navy">{f.label}</p>
                    <p className="text-xs text-muted">{f.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    onClick={() => s.toggleFeature(f.key)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      on ? "bg-navy" : "bg-line",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
                        on ? "translate-x-5" : "translate-x-0.5",
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </Section>
      </div>
    </>
  );
}
