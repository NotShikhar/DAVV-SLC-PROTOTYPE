"use client";

import { useState } from "react";
import { Ban, Check, X } from "lucide-react";
import type { AdmissionApplication, EligibleCandidate } from "@/types";
import { useTranslation } from "@/lib/i18n";
import { admissionStatusTone, ADMISSION_STATUS_LABEL } from "@/lib/domain";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Field, Textarea } from "@/components/ui/Field";
import { AdmissionFormView } from "./AdmissionFormView";

interface Props {
  open: boolean;
  onClose: () => void;
  application: AdmissionApplication;
  candidate: EligibleCandidate;
  onApprove: (applicationNo: string) => void;
  onReject: (applicationNo: string, reason: string) => void;
  onCancel?: (applicationNo: string, reason: string) => void;
  /** Optional extra footer actions (e.g. Print / Download) shown for any status. */
  extraActions?: React.ReactNode;
}

type Mode = "view" | "reject" | "cancel";

/** Incharge review of a single application — the one combined verify + decision. */
export function AdmissionReviewModal({
  open,
  onClose,
  application: app,
  candidate,
  onApprove,
  onReject,
  onCancel,
  extraActions,
}: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("view");
  const [reason, setReason] = useState("");

  const close = () => {
    setMode("view");
    setReason("");
    onClose();
  };

  const confirmReason = () => {
    if (!reason.trim()) return;
    if (mode === "reject") onReject(app.applicationNo, reason.trim());
    if (mode === "cancel") onCancel?.(app.applicationNo, reason.trim());
    close();
  };

  const footer =
    mode !== "view" ? (
      <div className="flex w-full flex-col gap-3">
        <Field
          label={mode === "reject" ? t("admissions.console.rejectReason") : "Reason for cancellation"}
          required
        >
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain what the applicant must correct…"
            autoFocus
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setMode("view")}>
            {t("common.back")}
          </Button>
          <Button variant="danger" onClick={confirmReason} disabled={!reason.trim()}>
            {mode === "reject" ? t("admissions.console.reject") : t("admissions.console.cancel")}
          </Button>
        </div>
      </div>
    ) : app.status === "pending" ? (
      <>
        {extraActions}
        <Button variant="danger" onClick={() => setMode("reject")}>
          <X className="size-4" /> {t("admissions.console.reject")}
        </Button>
        <Button
          onClick={() => {
            onApprove(app.applicationNo);
            close();
          }}
        >
          <Check className="size-4" /> {t("admissions.console.approveForm")}
        </Button>
      </>
    ) : (
      <>
        {extraActions}
        {app.status === "approved" && onCancel && (
          <Button variant="danger" onClick={() => setMode("cancel")}>
            <Ban className="size-4" /> {t("admissions.console.cancel")}
          </Button>
        )}
        <Button variant="ghost" onClick={close}>
          {t("common.cancel")}
        </Button>
      </>
    );

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      title={
        <span className="flex items-center gap-2">
          Application {app.applicationNo}
          <Badge tone={admissionStatusTone(app.status)}>{ADMISSION_STATUS_LABEL[app.status]}</Badge>
        </span>
      }
      description={`${candidate.name} · ${candidate.rollno}`}
      footer={footer}
    >
      {app.status === "rejected" && app.rejectionReason && (
        <div className="rounded-btn bg-danger-bg text-danger mb-4 px-3 py-2 text-sm">
          <span className="font-semibold">Rejected:</span> {app.rejectionReason}
        </div>
      )}
      {app.status === "cancelled" && app.cancellationReason && (
        <div className="rounded-btn bg-danger-bg text-danger mb-4 px-3 py-2 text-sm">
          <span className="font-semibold">Cancelled:</span> {app.cancellationReason}
        </div>
      )}
      <AdmissionFormView application={app} candidate={candidate} />
    </Modal>
  );
}
