"use client";

import { useState } from "react";
import { CalendarDays, GraduationCap, Layers, Plus } from "lucide-react";
import type { BranchCode, CalendarEvent } from "@/types";
import { BRANCHES, GRADE_SCALE } from "@/lib/domain";
import { CALENDAR } from "@/data";
import { useHasPermission } from "@/lib/auth";
import { useDemo } from "@/store/demo";
import { useUi } from "@/store/ui";
import { formatDate } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Table, Td, Th } from "@/components/ui/Table";
import { GradeBadge } from "@/components/shared/GradeBadge";
import { NoAccess } from "@/components/shared/NoAccess";

export default function MastersPage() {
  const can = useHasPermission("masters.edit");
  const extraBranches = useDemo((s) => s.extraBranches);
  const addBranch = useDemo((s) => s.addBranch);
  const extraEvents = useDemo((s) => s.extraEvents);
  const addEvent = useDemo((s) => s.addEvent);
  const pushToast = useUi((s) => s.pushToast);

  const [bCode, setBCode] = useState("");
  const [bName, setBName] = useState("");
  const [bIntake, setBIntake] = useState("60");
  const [eTitle, setETitle] = useState("");
  const [eDate, setEDate] = useState("");
  const [eType, setEType] = useState<CalendarEvent["type"]>("exam");

  if (!can) {
    return (
      <>
        <PageHeader title="Master Data" />
        <NoAccess />
      </>
    );
  }

  const branches = [...BRANCHES, ...extraBranches];
  const events = [...extraEvents, ...CALENDAR];

  const submitBranch = () => {
    if (!bCode.trim() || !bName.trim()) {
      pushToast({ tone: "warning", title: "Missing details", description: "Enter a code and name." });
      return;
    }
    addBranch({ code: bCode.trim().toUpperCase() as BranchCode, name: bName.trim(), intake: Number(bIntake) || 0 });
    pushToast({ tone: "success", title: "Branch added", description: bName.trim() });
    setBCode("");
    setBName("");
  };

  const submitEvent = () => {
    if (!eTitle.trim() || !eDate) {
      pushToast({ tone: "warning", title: "Missing details", description: "Enter a title and date." });
      return;
    }
    addEvent({ id: `ev-${Date.now()}`, title: eTitle.trim(), date: eDate, type: eType });
    pushToast({ tone: "success", title: "Event added", description: eTitle.trim() });
    setETitle("");
    setEDate("");
  };

  return (
    <>
      <PageHeader title="Master Data" description="Manage branches and the academic calendar; grade scale for reference." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Branches" icon={Layers} description={`${branches.length} branches`} bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Branch</Th>
                <Th className="text-center">Intake</Th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b, i) => (
                <tr key={`${b.code}-${i}`}>
                  <Td className="font-mono text-xs text-muted">{b.code}</Td>
                  <Td className="font-medium text-navy">{b.name}</Td>
                  <Td className="text-center tabular-nums">{b.intake}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="flex flex-wrap items-end gap-2 border-t border-line p-4">
            <Input value={bCode} onChange={(e) => setBCode(e.target.value)} placeholder="Code" className="w-24" />
            <Input value={bName} onChange={(e) => setBName(e.target.value)} placeholder="Branch name" className="min-w-40 flex-1" />
            <Input value={bIntake} onChange={(e) => setBIntake(e.target.value)} type="number" placeholder="Intake" className="w-24" />
            <Button size="sm" onClick={submitBranch}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </Section>

        <Section title="Academic calendar" icon={CalendarDays} description={`${events.length} events`} bodyClassName="p-0">
          <ul className="max-h-72 divide-y divide-line overflow-y-auto">
            {events.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-navy">{e.title}</p>
                  <p className="text-xs text-muted">{e.detail ?? formatDate(e.date)}</p>
                </div>
                <Badge tone="neutral">{e.type}</Badge>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end gap-2 border-t border-line p-4">
            <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="Event title" className="min-w-40 flex-1" />
            <Input value={eDate} onChange={(e) => setEDate(e.target.value)} type="date" className="w-40" />
            <Select value={eType} onChange={(e) => setEType(e.target.value as CalendarEvent["type"])} className="w-32">
              {["exam", "registration", "result", "fee", "holiday", "class", "form"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Button size="sm" onClick={submitEvent}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </Section>

        <Section title="Grade scale (CBCS · 10-point)" icon={GraduationCap} bodyClassName="p-0">
          <Table>
            <thead>
              <tr>
                <Th>Grade</Th>
                <Th className="text-center">Marks</Th>
                <Th className="text-center">Point</Th>
                <Th>Description</Th>
              </tr>
            </thead>
            <tbody>
              {GRADE_SCALE.map((g) => (
                <tr key={g.letter}>
                  <Td>
                    <GradeBadge grade={g.letter} />
                  </Td>
                  <Td className="text-center tabular-nums">
                    {g.min}–{g.max}
                  </Td>
                  <Td className="text-center tabular-nums">{g.point}</Td>
                  <Td className="text-muted">{g.label}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </div>
    </>
  );
}
