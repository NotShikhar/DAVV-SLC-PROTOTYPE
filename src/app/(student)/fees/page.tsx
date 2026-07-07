"use client";

import { useState } from "react";
import { CheckCircle2, Download, Wallet } from "lucide-react";
import type { FeeRecord } from "@/types";
import { useCurrentStudent } from "@/lib/auth";
import { useDemo } from "@/store/demo";
import { generateFeeReceipt } from "@/lib/pdf";
import { formatDate, formatINR, toRoman } from "@/lib/utils/format";
import { FEE_STRUCTURE } from "@/lib/domain/constants";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge, type Tone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, Td, Th } from "@/components/ui/Table";
import { StatCard } from "@/components/shared/StatCard";
import { PaymentModal } from "@/features/fees/PaymentModal";

const STATUS_TONE: Record<string, Tone> = { Paid: "success", Due: "warning", Partial: "info" };

export default function FeesPage() {
  const student = useCurrentStudent();
  const paidFees = useDemo((s) => s.paidFees);
  const [payFees, setPayFees] = useState<FeeRecord[] | null>(null);
  if (!student) return null;

  const isPaid = (f: FeeRecord) => f.status === "Paid" || Boolean(paidFees[f.id]);
  const fees = [...student.fees].sort((a, b) => b.semester - a.semester);
  const dues = fees.filter((f) => !isPaid(f));
  const totalDue = dues.reduce((s, f) => s + f.amount, 0);
  const totalPaid = fees.filter(isPaid).reduce((s, f) => s + f.amount, 0);

  const downloadReceipt = (f: FeeRecord) => {
    const p = paidFees[f.id];
    generateFeeReceipt(student, {
      receiptNo: p?.receiptNo ?? f.receiptNo ?? "—",
      transactionId: p?.transactionId ?? "—",
      method: p?.method ?? "Online",
      paidOn: p?.paidOn ?? f.paidOn ?? new Date().toISOString(),
      items: [{ head: f.head, semester: f.semester, amount: f.amount }],
      total: f.amount,
    });
  };

  return (
    <>
      <PageHeader
        title="Fees"
        description="Pay tuition and examination fees securely in the portal and download receipts instantly."
        actions={
          dues.length > 0 ? (
            <Button onClick={() => setPayFees(dues)}>
              <Wallet className="size-4" /> Pay all dues · {formatINR(totalDue)}
            </Button>
          ) : (
            <Badge tone="success" dot>
              All cleared
            </Badge>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Amount due" value={totalDue ? formatINR(totalDue) : "Nil"} tone={totalDue ? "warning" : "success"} icon={Wallet} />
        <StatCard label="Total paid" value={formatINR(totalPaid)} tone="success" icon={CheckCircle2} />
        <StatCard label="Tuition / semester" value={formatINR(FEE_STRUCTURE.tuitionPerSemester)} tone="neutral" />
      </div>

      <Section title="Fee ledger" bodyClassName="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Semester</Th>
              <Th>Particulars</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => {
              const paid = isPaid(f);
              return (
                <tr key={f.id}>
                  <Td className="font-medium text-navy">Sem {toRoman(f.semester)}</Td>
                  <Td>
                    {f.head}
                    {paid && (f.receiptNo || paidFees[f.id]) && (
                      <span className="ml-2 text-xs text-muted">
                        {paidFees[f.id]?.receiptNo ?? f.receiptNo}
                        {(paidFees[f.id]?.paidOn ?? f.paidOn) ? ` · ${formatDate(paidFees[f.id]?.paidOn ?? f.paidOn!)}` : ""}
                      </span>
                    )}
                  </Td>
                  <Td className="text-right font-medium tabular-nums text-navy">{formatINR(f.amount)}</Td>
                  <Td>
                    <Badge tone={paid ? "success" : STATUS_TONE[f.status]} dot>
                      {paid ? "Paid" : f.status}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    {paid ? (
                      <Button variant="ghost" size="sm" onClick={() => downloadReceipt(f)}>
                        <Download className="size-4" /> Receipt
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setPayFees([f])}>
                        Pay now
                      </Button>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Section>

      <PaymentModal
        open={payFees !== null}
        onClose={() => setPayFees(null)}
        student={student}
        fees={payFees ?? []}
      />
    </>
  );
}
