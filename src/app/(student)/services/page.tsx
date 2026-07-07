"use client";

import { useState } from "react";
import { Download, FileText, Stamp } from "lucide-react";
import type { CertificateType } from "@/types";
import { useCurrentStudent } from "@/lib/auth";
import { useDemo } from "@/store/demo";
import { useUi } from "@/store/ui";
import { CERTIFICATE_CATALOG, EXTERNAL_PORTALS } from "@/lib/domain/constants";
import { generateCertificate } from "@/lib/pdf";
import { formatDate, formatINR } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Stepper } from "@/components/ui/Stepper";
import { Field, Input, Select } from "@/components/ui/Field";
import { PortalLink } from "@/components/shared/PortalLink";

const STATUS_STEPS = ["Submitted", "Under Review", "Ready for Collection"];

function statusIndex(status: string): number {
  if (status === "Issued") return 2;
  const i = STATUS_STEPS.indexOf(status);
  return i === -1 ? 0 : i;
}

export default function ServicesPage() {
  const student = useCurrentStudent();
  const certificates = useDemo((s) => s.certificates);
  const addCertificate = useDemo((s) => s.addCertificate);
  const pushToast = useUi((s) => s.pushToast);

  const [activeType, setActiveType] = useState<CertificateType | null>(null);
  const [purpose, setPurpose] = useState("");
  const [copies, setCopies] = useState("1");
  const [delivery, setDelivery] = useState<"Collect at Counter" | "Speed Post">("Collect at Counter");

  if (!student) return null;

  const openApply = (type: CertificateType) => {
    setActiveType(type);
    setPurpose("");
    setCopies("1");
    setDelivery("Collect at Counter");
  };

  const submit = () => {
    if (!activeType) return;
    addCertificate({ type: activeType, copies: Number(copies), purpose: purpose || "Not specified", delivery });
    pushToast({ tone: "success", title: "Application submitted", description: `${activeType} certificate requested.` });
    setActiveType(null);
  };

  return (
    <>
      <PageHeader
        title="Student Services"
        description="Apply for certificates issued through DAVV's Counter-Base Application portal and track their status."
        actions={<PortalLink href={EXTERNAL_PORTALS.cbaCertificates.url}>Official CBA portal</PortalLink>}
      />

      <Section title="Apply for a certificate" icon={Stamp} className="mb-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.entries(CERTIFICATE_CATALOG) as [CertificateType, (typeof CERTIFICATE_CATALOG)[CertificateType]][]).map(
            ([type, meta]) => (
              <Card key={type} className="flex flex-col p-4">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-gold-600" />
                  <h3 className="font-heading text-sm font-semibold text-navy">{type}</h3>
                </div>
                <p className="mt-1.5 flex-1 text-xs text-muted">{meta.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {meta.fee ? formatINR(meta.fee) : "Free"} · {meta.processingDays}d
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => openApply(type)}>
                    Apply
                  </Button>
                </div>
              </Card>
            ),
          )}
        </div>
      </Section>

      <Section title="My requests" description="Track submitted certificate applications." bodyClassName="p-0">
        {certificates.length === 0 ? (
          <p className="p-5 text-sm text-muted">No certificate requests yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {certificates.map((req) => {
              const ready = req.status === "Ready for Collection" || req.status === "Issued";
              return (
                <li key={req.id} className="px-5 py-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-semibold text-navy">{req.type}</span>
                        <Badge tone={ready ? "success" : "info"}>{req.status}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {req.copies} copy(s) · {req.delivery} · {formatDate(req.requestedOn)} · {req.purpose}
                      </p>
                    </div>
                    {ready && (
                      <Button
                        size="sm"
                        onClick={() =>
                          generateCertificate(student, req.type, {
                            id: req.id,
                            purpose: req.purpose,
                            copies: req.copies,
                          })
                        }
                      >
                        <Download className="size-4" /> Download
                      </Button>
                    )}
                  </div>
                  <div className="mt-4 max-w-md">
                    <Stepper steps={STATUS_STEPS} current={statusIndex(req.status)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Modal
        open={activeType !== null}
        onClose={() => setActiveType(null)}
        title={`Apply — ${activeType ?? ""} Certificate`}
        description={activeType ? CERTIFICATE_CATALOG[activeType].description : ""}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActiveType(null)}>
              Cancel
            </Button>
            <Button onClick={submit}>Submit application</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Purpose" required hint="Why do you need this certificate?">
            <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Passport application" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Number of copies">
              <Select value={copies} onChange={(e) => setCopies(e.target.value)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Delivery">
              <Select value={delivery} onChange={(e) => setDelivery(e.target.value as typeof delivery)}>
                <option>Collect at Counter</option>
                <option>Speed Post</option>
              </Select>
            </Field>
          </div>
          {activeType && (
            <p className="rounded-btn bg-cream px-3 py-2 text-xs text-muted">
              Fee: {CERTIFICATE_CATALOG[activeType].fee ? formatINR(CERTIFICATE_CATALOG[activeType].fee) : "Free"} ·
              Processing: ~{CERTIFICATE_CATALOG[activeType].processingDays} working days
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
