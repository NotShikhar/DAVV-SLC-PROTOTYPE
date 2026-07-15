"use client";

import { Paperclip, Plus, Trash2 } from "lucide-react";
import type { PaymentRow } from "@/types";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/Field";
import { Button, buttonClasses } from "@/components/ui/Button";
import { fileToUploadMeta, makeEmptyPaymentRow } from "./upload";

interface Props {
  rows: PaymentRow[];
  onChange: (rows: PaymentRow[]) => void;
}

/** Editable fee-payment transactions (one row per UTR; supports installments). */
export function PaymentRows({ rows, onChange }: Props) {
  const patch = (id: string, p: Partial<PaymentRow>) =>
    onChange(rows.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));
  const add = () => onChange([...rows, makeEmptyPaymentRow()]);
  const onProof = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) patch(id, { proof: await fileToUploadMeta(file) });
  };

  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r.id} className="border-line rounded-lg border p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted text-xs font-semibold">Transaction {i + 1}</span>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => remove(r.id)}
                aria-label="Remove transaction"
                className="text-muted hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="UTR / Transaction No"
              value={r.txnNo}
              onChange={(e) => patch(r.id, { txnNo: e.target.value })}
            />
            <Input
              placeholder="Amount (₹)"
              type="number"
              min={0}
              value={r.amount || ""}
              onChange={(e) => patch(r.id, { amount: Number(e.target.value) })}
            />
            <Input
              type="date"
              value={r.payDate}
              onChange={(e) => patch(r.id, { payDate: e.target.value })}
            />
            <Input
              placeholder="Bank / Mode (e.g. UPI · SBI)"
              value={r.bankMode}
              onChange={(e) => patch(r.id, { bankMode: e.target.value })}
            />
            <Input
              placeholder="Remarks (optional)"
              className="sm:col-span-2"
              value={r.remarks ?? ""}
              onChange={(e) => patch(r.id, { remarks: e.target.value })}
            />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <label className={cn(buttonClasses("ghost", "sm"), "cursor-pointer")}>
              <Paperclip className="size-4" /> {r.proof ? "Replace proof" : "Attach proof"}
              <input
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                className="hidden"
                onChange={(e) => onProof(r.id, e)}
              />
            </label>
            {r.proof && <span className="text-muted text-xs">{r.proof.name}</span>}
          </div>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={add}>
        <Plus className="size-4" /> Add transaction
      </Button>
    </div>
  );
}
