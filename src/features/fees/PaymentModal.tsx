"use client";

import { useState } from "react";
import { CreditCard, Landmark, Loader, Smartphone, type LucideIcon } from "lucide-react";
import type { FeePayment, FeeRecord, PaymentMethod, Student } from "@/types";
import { initiatePayment } from "@/lib/payments";
import { useDemo } from "@/store/demo";
import { useUi } from "@/store/ui";
import { generateFeeReceipt } from "@/lib/pdf";
import { formatINR, toRoman } from "@/lib/utils/format";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const METHODS: { key: PaymentMethod; label: string; icon: LucideIcon }[] = [
  { key: "UPI", label: "UPI", icon: Smartphone },
  { key: "Card", label: "Card", icon: CreditCard },
  { key: "Net Banking", label: "Net Banking", icon: Landmark },
];

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  student: Student;
  fees: FeeRecord[];
}

export function PaymentModal({ open, onClose, student, fees }: PaymentModalProps) {
  const recordPayments = useDemo((s) => s.recordPayments);
  const pushToast = useUi((s) => s.pushToast);
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [processing, setProcessing] = useState(false);

  const total = fees.reduce((sum, f) => sum + f.amount, 0);

  const pay = async () => {
    setProcessing(true);
    const result = await initiatePayment({
      enrollmentNo: student.enrollmentNo,
      feeIds: fees.map((f) => f.id),
      amount: total,
      method,
    });
    setProcessing(false);

    if (!result.success) {
      pushToast({ tone: "danger", title: "Payment failed", description: "Please try again." });
      return;
    }

    const payments: FeePayment[] = fees.map((f) => ({
      feeId: f.id,
      enrollmentNo: student.enrollmentNo,
      amount: f.amount,
      method,
      transactionId: result.transactionId,
      receiptNo: result.receiptNo,
      paidOn: result.paidOn,
    }));
    recordPayments(payments);
    generateFeeReceipt(student, {
      receiptNo: result.receiptNo,
      transactionId: result.transactionId,
      method,
      paidOn: result.paidOn,
      items: fees.map((f) => ({ head: f.head, semester: f.semester, amount: f.amount })),
      total,
    });
    pushToast({
      tone: "success",
      title: "Payment successful",
      description: `${formatINR(total)} paid · receipt downloaded.`,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pay fees"
      description={`${fees.length} item(s) · ${formatINR(total)}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={pay} disabled={processing}>
            {processing ? (
              <>
                <Loader className="size-4 animate-spin" /> Processing…
              </>
            ) : (
              `Pay ${formatINR(total)}`
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="divide-y divide-line rounded-lg border border-line">
          {fees.map((f) => (
            <div key={f.id} className="flex justify-between px-3 py-2 text-sm">
              <span className="text-slate">
                {f.head} · Sem {toRoman(f.semester)}
              </span>
              <span className="font-medium text-navy">{formatINR(f.amount)}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-navy">Payment method</p>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMethod(m.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-xs transition-colors",
                    method === m.key ? "border-navy bg-navy/5 text-navy" : "border-line text-muted hover:bg-cream",
                  )}
                >
                  <Icon className="size-5" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted">
          Mock payment — no real transaction is made. A gateway (e.g. Razorpay) can be wired into{" "}
          <code className="rounded bg-cream px-1">lib/payments.ts</code>.
        </p>
      </div>
    </Modal>
  );
}
