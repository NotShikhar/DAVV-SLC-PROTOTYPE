"use client";

import { useMemo, useState } from "react";
import { Ban, CheckCircle2, ClipboardList, Download, Eye, Inbox, LayoutGrid, Printer, Search } from "lucide-react";
import { ELIGIBLE_CANDIDATES, getEligibleCandidate } from "@/data";
import { useTranslation } from "@/lib/i18n";
import { useRequireActor, useCurrentIncharge } from "@/lib/admissions";
import { useAdmissions } from "@/store/admissions";
import { useUi } from "@/store/ui";
import {
  BRANCHES,
  admissionStatusTone,
  countByStatus,
  feeEntered,
  seatTallies,
} from "@/lib/domain";
import { formatDate, formatINR } from "@/lib/utils/format";
import { Crest } from "@/components/shared/Logo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Table, Td, Th } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { FluidTabs } from "@/components/ui/FluidTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/shared/StatCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { AdmissionReviewModal } from "@/features/admissions/AdmissionReviewModal";
import { generateAdmissionForm, generateAdmissionReceipt } from "@/lib/pdf";

type Tab = "queue" | "confirmed";

function Loader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Crest className="size-12 animate-pulse" />
    </div>
  );
}

export default function ConsolePage() {
  const { t } = useTranslation();
  const { ready } = useRequireActor("incharge");
  const incharge = useCurrentIncharge();
  const applications = useAdmissions((s) => s.applications);
  const approve = useAdmissions((s) => s.approveApplication);
  const reject = useAdmissions((s) => s.rejectApplication);
  const cancel = useAdmissions((s) => s.cancelApplication);
  const pushToast = useUi((s) => s.pushToast);

  const [tab, setTab] = useState<Tab>("queue");
  const [query, setQuery] = useState("");
  const [selectedNo, setSelectedNo] = useState<string | null>(null);

  const counts = useMemo(() => countByStatus(applications), [applications]);
  const tallies = useMemo(() => seatTallies(applications, ELIGIBLE_CANDIDATES), [applications]);

  const matches = (rollno: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const c = getEligibleCandidate(rollno);
    return (
      rollno.toLowerCase().includes(q) ||
      (c?.name.toLowerCase().includes(q) ?? false) ||
      (c ? String(c.rank).includes(q) : false)
    );
  };

  const pending = applications.filter((a) => a.status === "pending" && matches(a.rollno));
  const confirmed = applications.filter((a) => a.status === "approved" && matches(a.rollno));

  const selected = applications.find((a) => a.applicationNo === selectedNo);
  const selectedCandidate = selected ? getEligibleCandidate(selected.rollno) : undefined;

  if (!ready || !incharge) return <Loader />;

  return (
    <div className="space-y-6">
      <PageHeader title={t("admissions.console.title")} description={incharge.name} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("admissions.console.pending")}
          value={<AnimatedNumber value={counts.pending} />}
          icon={ClipboardList}
          tone="warning"
        />
        <StatCard
          label={t("admissions.console.approved")}
          value={<AnimatedNumber value={counts.approved} />}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label={t("admissions.console.cancelled")}
          value={<AnimatedNumber value={counts.cancelled} />}
          icon={Ban}
          tone="neutral"
        />
      </div>

      <Section title={t("admissions.console.seatAvailability")} icon={LayoutGrid} bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Branch</Th>
              <Th className="text-center">{t("admissions.console.available")}</Th>
              <Th className="text-center">{t("admissions.console.filled")}</Th>
              <Th className="text-center">{t("admissions.console.remaining")}</Th>
              <Th>Fill</Th>
            </tr>
          </thead>
          <tbody>
            {tallies.map((s) => (
              <tr key={s.branch}>
                <Td className="text-muted font-mono text-xs">{s.branch}</Td>
                <Td className="text-navy font-medium">{s.name}</Td>
                <Td className="text-center tabular-nums">{s.intake}</Td>
                <Td className="text-center tabular-nums">{s.filled}</Td>
                <Td className="text-center tabular-nums">{s.remaining}</Td>
                <Td>
                  <div className="w-32">
                    <ProgressBar
                      value={(s.filled / s.intake) * 100}
                      tone="info"
                      aria-label={`${s.name} filled`}
                    />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>

      <div className="relative">
        <Search className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("admissions.console.search")}
          className="pl-9"
        />
      </div>

      <FluidTabs
        tabs={[
          { id: "queue", label: `${t("admissions.console.queue")} (${counts.pending})`, icon: Inbox },
          { id: "confirmed", label: `${t("admissions.console.confirmed")} (${counts.approved})`, icon: CheckCircle2 },
        ]}
        active={tab}
        onChange={setTab}
        className="max-w-md"
      />

      {tab === "queue" ? (
        <Section bodyClassName={pending.length ? "p-0" : undefined}>
          {pending.length === 0 ? (
            <EmptyState icon={Inbox} title={t("admissions.console.empty")} />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>App No</Th>
                  <Th>Roll No</Th>
                  <Th>Name</Th>
                  <Th>Branch</Th>
                  <Th>Rank</Th>
                  <Th>Submitted</Th>
                  <Th>Fee entered</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {pending.map((a) => {
                  const c = getEligibleCandidate(a.rollno);
                  return (
                    <tr key={a.applicationNo}>
                      <Td className="font-mono text-xs">{a.applicationNo}</Td>
                      <Td className="font-mono text-xs">{a.rollno}</Td>
                      <Td className="text-navy font-medium">{c?.name ?? "—"}</Td>
                      <Td>{c?.branch ?? "—"}</Td>
                      <Td className="tabular-nums">{c?.rank.toLocaleString("en-IN") ?? "—"}</Td>
                      <Td className="text-xs">{formatDate(a.submittedAt)}</Td>
                      <Td className="tabular-nums">{formatINR(feeEntered(a.payments))}</Td>
                      <Td className="text-right">
                        <Button size="sm" variant="secondary" onClick={() => setSelectedNo(a.applicationNo)}>
                          <Eye className="size-4" /> {t("admissions.console.review")}
                        </Button>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Section>
      ) : confirmed.length === 0 ? (
        <Section>
          <EmptyState icon={CheckCircle2} title={t("admissions.console.empty")} />
        </Section>
      ) : (
        <div className="space-y-4">
          {BRANCHES.map((b) => {
            const rows = confirmed.filter((a) => getEligibleCandidate(a.rollno)?.branch === b.code);
            if (rows.length === 0) return null;
            return (
              <Section key={b.code} title={`B.Tech · ${b.name}`} bodyClassName="p-0">
                <Table>
                  <thead>
                    <tr>
                      <Th>App No</Th>
                      <Th>Roll No</Th>
                      <Th>Name</Th>
                      <Th>Seat No</Th>
                      <Th>Status</Th>
                      <Th className="text-right">Action</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((a) => {
                      const c = getEligibleCandidate(a.rollno);
                      return (
                        <tr key={a.applicationNo}>
                          <Td className="font-mono text-xs">{a.applicationNo}</Td>
                          <Td className="font-mono text-xs">{a.rollno}</Td>
                          <Td className="text-navy font-medium">{c?.name ?? "—"}</Td>
                          <Td className="font-mono text-xs">{a.seatNo ?? "—"}</Td>
                          <Td>
                            <Badge tone={admissionStatusTone(a.status)} dot>
                              Confirmed
                            </Badge>
                          </Td>
                          <Td>
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" onClick={() => setSelectedNo(a.applicationNo)}>
                                <Eye className="size-4" /> View
                              </Button>
                              {c && (
                                <Button size="sm" variant="ghost" onClick={() => generateAdmissionForm(a, c)}>
                                  <Printer className="size-4" /> Form
                                </Button>
                              )}
                              {c && (
                                <Button size="sm" variant="ghost" onClick={() => generateAdmissionReceipt(a, c)}>
                                  <Download className="size-4" /> Receipt
                                </Button>
                              )}
                            </div>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Section>
            );
          })}
        </div>
      )}

      {selected && selectedCandidate && (
        <AdmissionReviewModal
          open
          onClose={() => setSelectedNo(null)}
          application={selected}
          candidate={selectedCandidate}
          onApprove={(no) => {
            approve(no, incharge.id);
            pushToast({ tone: "success", title: "Admission approved", description: `Application ${no}` });
          }}
          onReject={(no, reason) => {
            reject(no, incharge.id, reason);
            pushToast({ tone: "warning", title: "Form rejected", description: "The applicant has been notified." });
          }}
          onCancel={(no, reason) => {
            cancel(no, incharge.id, reason);
            pushToast({ tone: "danger", title: "Admission cancelled", description: reason });
          }}
          extraActions={
            selected.status === "approved" && selectedCandidate ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => generateAdmissionForm(selected, selectedCandidate)}
                >
                  <Printer className="size-4" /> {t("admissions.console.printForm")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => generateAdmissionReceipt(selected, selectedCandidate)}
                >
                  <Download className="size-4" /> {t("admissions.console.printReceipt")}
                </Button>
              </>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
