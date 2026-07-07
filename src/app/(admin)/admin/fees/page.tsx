"use client";

import { AlertTriangle, CheckCircle2, IndianRupee, Users } from "lucide-react";
import type { FeeRecord, Student } from "@/types";
import { STUDENTS } from "@/data";
import { useHasPermission } from "@/lib/auth";
import { initiatePayment } from "@/lib/payments";
import { useDemo } from "@/store/demo";
import { useUi } from "@/store/ui";
import { formatDateTime, formatINR, toRoman } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, Td, Th } from "@/components/ui/Table";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { NoAccess } from "@/components/shared/NoAccess";

export default function AdminFeesPage() {
  const canView = useHasPermission("fees.view");
  const canManage = useHasPermission("fees.manage");
  const paidFees = useDemo((s) => s.paidFees);
  const recordPayments = useDemo((s) => s.recordPayments);
  const pushToast = useUi((s) => s.pushToast);

  if (!canView) {
    return (
      <>
        <PageHeader title="Fee Collection" />
        <NoAccess />
      </>
    );
  }

  let collected = 0;
  let outstanding = 0;
  const dues: { student: Student; fee: FeeRecord }[] = [];
  STUDENTS.forEach((s) => {
    s.fees.forEach((f) => {
      const paid = f.status === "Paid" || Boolean(paidFees[f.id]);
      if (paid) collected += f.amount;
      else {
        outstanding += f.amount;
        dues.push({ student: s, fee: f });
      }
    });
  });
  const studentsWithDues = new Set(dues.map((d) => d.student.enrollmentNo)).size;
  const sessionPayments = Object.values(paidFees).sort(
    (a, b) => new Date(b.paidOn).getTime() - new Date(a.paidOn).getTime(),
  );

  const markPaid = async (student: Student, fee: FeeRecord) => {
    const result = await initiatePayment({
      enrollmentNo: student.enrollmentNo,
      feeIds: [fee.id],
      amount: fee.amount,
      method: "Counter",
    });
    recordPayments([
      {
        feeId: fee.id,
        enrollmentNo: student.enrollmentNo,
        amount: fee.amount,
        method: "Counter",
        transactionId: result.transactionId,
        receiptNo: result.receiptNo,
        paidOn: result.paidOn,
      },
    ]);
    pushToast({ tone: "success", title: "Payment recorded", description: `${student.name} · ${formatINR(fee.amount)}` });
  };

  return (
    <>
      <PageHeader title="Fee Collection" description="Track collections and outstanding dues across the cohort." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total collected" value={formatINR(collected)} tone="success" icon={IndianRupee} />
        <StatCard label="Outstanding" value={formatINR(outstanding)} tone={outstanding ? "warning" : "success"} icon={AlertTriangle} />
        <StatCard label="Students with dues" value={studentsWithDues} tone="info" icon={Users} />
        <StatCard label="Payments this session" value={sessionPayments.length} tone="neutral" icon={CheckCircle2} />
      </div>

      <Section title="Outstanding dues" description={`${dues.length} pending item(s)`} bodyClassName="p-0" className="mb-6">
        {dues.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="No dues" description="All fees are cleared." />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Student</Th>
                <Th>Particulars</Th>
                <Th className="text-right">Amount</Th>
                {canManage && <Th className="text-right">Action</Th>}
              </tr>
            </thead>
            <tbody>
              {dues.map(({ student, fee }) => (
                <tr key={`${student.enrollmentNo}-${fee.id}`}>
                  <Td>
                    <span className="font-medium text-navy">{student.name}</span>
                    <span className="ml-2 font-mono text-xs text-muted">{student.enrollmentNo}</span>
                  </Td>
                  <Td>
                    {fee.head} · Sem {toRoman(fee.semester)}
                  </Td>
                  <Td className="text-right font-medium tabular-nums text-navy">{formatINR(fee.amount)}</Td>
                  {canManage && (
                    <Td className="text-right">
                      <Button variant="secondary" size="sm" onClick={() => markPaid(student, fee)}>
                        Mark paid
                      </Button>
                    </Td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>

      <Section title="Payments recorded this session" bodyClassName="p-0">
        {sessionPayments.length === 0 ? (
          <p className="p-5 text-sm text-muted">No payments recorded yet in this session.</p>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Receipt</Th>
                <Th>Enrollment</Th>
                <Th>Method</Th>
                <Th className="text-right">Amount</Th>
                <Th>Time</Th>
              </tr>
            </thead>
            <tbody>
              {sessionPayments.map((p) => (
                <tr key={p.feeId}>
                  <Td className="font-mono text-xs">{p.receiptNo}</Td>
                  <Td className="font-mono text-xs">{p.enrollmentNo}</Td>
                  <Td>
                    <Badge tone="neutral">{p.method}</Badge>
                  </Td>
                  <Td className="text-right font-medium tabular-nums text-navy">{formatINR(p.amount)}</Td>
                  <Td className="text-xs text-muted">{formatDateTime(p.paidOn)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Section>
    </>
  );
}
