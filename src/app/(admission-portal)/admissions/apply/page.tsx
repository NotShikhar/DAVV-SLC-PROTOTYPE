"use client";

import { useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  Contact,
  Download,
  FileText,
  GraduationCap,
  Home,
  IndianRupee,
  Users,
} from "lucide-react";
import type {
  AdmissionAddress,
  AdmissionApplication,
  AdmissionFormData,
  EligibleCandidate,
} from "@/types";
import { useTranslation } from "@/lib/i18n";
import { useRequireActor, useCurrentApplicant } from "@/lib/admissions";
import { useAdmissions } from "@/store/admissions";
import { useUi } from "@/store/ui";
import {
  ADMISSION_CATEGORIES,
  ADMISSION_FEE_PARTICULARS,
  ADMISSION_FEE_TOTAL,
  ADMISSION_SUB_CATEGORIES,
  BLOOD_GROUPS,
  DOB_MAX,
  DOB_MIN,
  EXAM_BOARDS,
  HSC_PASSING_YEARS,
  LAST_EXAM_YEARS,
  LAST_EXAMS,
  RELIGIONS,
  captchaOk,
  feeEntered,
  randomCaptcha,
  validateAdmissionForm,
} from "@/lib/domain";
import { formatINR } from "@/lib/utils/format";
import { Crest } from "@/components/shared/Logo";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Stepper } from "@/components/ui/Stepper";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Table, Td } from "@/components/ui/Table";
import { KeyValue, KeyValueGrid } from "@/components/shared/KeyValue";
import { PhotoUpload } from "@/features/admissions/PhotoUpload";
import { PaymentRows } from "@/features/admissions/PaymentRows";
import { Captcha } from "@/features/admissions/Captcha";
import { AdmissionFormView } from "@/features/admissions/AdmissionFormView";
import { EmailOutbox } from "@/features/admissions/EmailOutbox";
import { generateAdmissionForm, generateAdmissionReceipt } from "@/lib/pdf";

const STEPS = ["Identity", "Application", "Under review", "Confirmed"];

function emptyDraft(): AdmissionFormData {
  const addr: AdmissionAddress = { houseNo: "", street: "", state: "Madhya Pradesh", district: "", city: "", pin: "" };
  return {
    aadharNo: "",
    apaarId: "",
    email: "",
    bloodGroup: "Not Known",
    photo: undefined,
    category: "General",
    subCategory: "None",
    religion: "Hindu",
    minority: "No",
    hscPercent: 0,
    hscPassingYear: 2024,
    hscUniversity: "CBSE",
    hscUniversityOther: "",
    lastExam: "HSSC (12th)",
    lastExamOther: "",
    passingYear: 2026,
    university: "CBSE",
    universityOther: "",
    dob: "",
    fatherOcc: "",
    motherOcc: "",
    placeOfWork: "",
    parentMobile: "",
    perm: { ...addr },
    local: { ...addr },
    guardianMobile: "",
    guardianAddress: "",
    payments: [{ id: "pay-0", txnNo: "", amount: 0, payDate: "", bankMode: "", remarks: "" }],
  };
}

/** Copy an existing application's editable fields into a fresh form draft. */
function draftFromApp(a: AdmissionApplication): AdmissionFormData {
  return {
    aadharNo: a.aadharNo,
    apaarId: a.apaarId,
    email: a.email,
    bloodGroup: a.bloodGroup,
    photo: a.photo,
    category: a.category,
    subCategory: a.subCategory,
    religion: a.religion,
    minority: a.minority,
    hscPercent: a.hscPercent,
    hscPassingYear: a.hscPassingYear,
    hscUniversity: a.hscUniversity,
    hscUniversityOther: a.hscUniversityOther,
    lastExam: a.lastExam,
    lastExamOther: a.lastExamOther,
    passingYear: a.passingYear,
    university: a.university,
    universityOther: a.universityOther,
    dob: a.dob,
    fatherOcc: a.fatherOcc,
    motherOcc: a.motherOcc,
    placeOfWork: a.placeOfWork,
    parentMobile: a.parentMobile,
    perm: a.perm,
    local: a.local,
    guardianMobile: a.guardianMobile,
    guardianAddress: a.guardianAddress,
    payments: a.payments,
  };
}

function Loader() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <Crest className="size-12 animate-pulse" />
    </div>
  );
}

export default function ApplyPage() {
  const { t } = useTranslation();
  const { ready } = useRequireActor("applicant");
  const candidate = useCurrentApplicant();
  const applications = useAdmissions((s) => s.applications);
  const sentEmails = useAdmissions((s) => s.sentEmails);
  const submitApplication = useAdmissions((s) => s.submitApplication);
  const pushToast = useUi((s) => s.pushToast);

  if (!ready || !candidate) return <Loader />;

  const app = applications.find((a) => a.rollno === candidate.rollno);
  const editable = !app || app.status === "rejected";

  /* --------------------------------------------------- Non-editable states */
  if (!editable && app) {
    const myEmails = sentEmails.filter((e) => e.to === app.email);
    const stepCurrent = app.status === "approved" ? 3 : 2;
    return (
      <div className="space-y-6">
        <PageHeader title={t("admissions.form.title")} description={candidate.name} />
        <Section>
          <Stepper steps={STEPS} current={stepCurrent} />
        </Section>

        {app.status === "approved" ? (
          <Section accent icon={BadgeCheck} title={t("admissions.status.approvedTitle")}>
            <p className="text-slate text-sm">{t("admissions.status.approvedBody")}</p>
            <div className="mt-4 flex flex-wrap items-center gap-6">
              <div>
                <p className="text-muted text-xs tracking-wide uppercase">Application No</p>
                <p className="font-heading text-navy text-2xl font-bold">{app.applicationNo}</p>
              </div>
              {app.seatNo && (
                <div>
                  <p className="text-muted text-xs tracking-wide uppercase">Seat No</p>
                  <p className="font-heading text-navy text-2xl font-bold">{app.seatNo}</p>
                </div>
              )}
              <Badge tone="success" dot>
                Confirmed
              </Badge>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => generateAdmissionForm(app, candidate)}>
                <Download className="size-4" /> Admission form
              </Button>
              <Button variant="secondary" size="sm" onClick={() => generateAdmissionReceipt(app, candidate)}>
                <Download className="size-4" /> Fee receipt
              </Button>
            </div>
          </Section>
        ) : app.status === "cancelled" ? (
          <Section accent icon={CircleAlert} title="Admission cancelled">
            <p className="text-slate text-sm">
              {app.cancellationReason ?? "This application has been cancelled."}
            </p>
          </Section>
        ) : (
          <Section icon={CheckCircle2} title={t("admissions.status.pendingTitle")}>
            <p className="text-slate text-sm">{t("admissions.status.pendingBody")}</p>
            <div className="mt-4">
              <p className="text-muted text-xs tracking-wide uppercase">Application No</p>
              <p className="font-heading text-navy text-2xl font-bold">{app.applicationNo}</p>
            </div>
          </Section>
        )}

        <Section title={t("admissions.form.title")}>
          <AdmissionFormView application={app} candidate={candidate} />
        </Section>

        <EmailOutbox emails={myEmails} />
      </div>
    );
  }

  /* -------------------------------------------------------- Editable form */
  const isResubmit = app?.status === "rejected";
  return (
    <EditableAdmissionForm
      key={app?.updatedAt ?? "new"}
      candidate={candidate}
      initial={app && isResubmit ? draftFromApp(app) : emptyDraft()}
      isResubmit={Boolean(isResubmit)}
      appNo={app?.applicationNo}
      rejectionReason={isResubmit ? app?.rejectionReason : undefined}
      onSubmit={(draft) => {
        const no = submitApplication(candidate.rollno, draft);
        pushToast({
          tone: "success",
          title: "Admission form submitted",
          description: `Application No ${no} · confirmation email sent`,
        });
      }}
    />
  );
}

interface EditableProps {
  candidate: EligibleCandidate;
  initial: AdmissionFormData;
  isResubmit: boolean;
  appNo?: string;
  rejectionReason?: string;
  onSubmit: (draft: AdmissionFormData) => void;
}

/** The long editable admission form. Keyed by the parent so it re-initialises
 *  cleanly for a fresh application vs. a rejected-form correction. */
function EditableAdmissionForm({
  candidate,
  initial,
  isResubmit,
  appNo,
  rejectionReason,
  onSubmit,
}: EditableProps) {
  const { t } = useTranslation();
  const pushToast = useUi((s) => s.pushToast);
  const [draft, setDraft] = useState<AdmissionFormData>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaCode, setCaptchaCode] = useState(() => randomCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const set = <K extends keyof AdmissionFormData>(k: K, v: AdmissionFormData[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));
  const setAddr = (which: "perm" | "local", patch: Partial<AdmissionAddress>) =>
    setDraft((d) => ({ ...d, [which]: { ...d[which], ...patch } }));

  const submit = () => {
    const found = validateAdmissionForm(draft);
    const map: Record<string, string> = Object.fromEntries(found.map((e) => [e.field, e.message]));
    if (!captchaOk(captchaInput, captchaCode)) map.captcha = "Captcha does not match";
    setErrors(map);
    if (Object.keys(map).length > 0) {
      pushToast({ tone: "warning", title: "Please fix the highlighted fields" });
      return;
    }
    onSubmit(draft);
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("admissions.form.title")} description={candidate.name} />
      <Section>
        <Stepper steps={STEPS} current={1} />
      </Section>

      {isResubmit && rejectionReason && (
        <Section accent icon={CircleAlert} title={t("admissions.status.rejectedTitle")}>
          <p className="text-danger text-sm">{rejectionReason}</p>
          <p className="text-muted mt-1 text-xs">
            Correct the details below and resubmit — your Application No {appNo} stays the same.
          </p>
        </Section>
      )}

      {/* Section A — read-only */}
      <Section
        title={t("admissions.sections.allotment")}
        icon={GraduationCap}
        description={t("admissions.form.readonly")}
      >
        <KeyValueGrid>
          <KeyValue label="Roll No">{candidate.rollno}</KeyValue>
          <KeyValue label="Name">{candidate.name}</KeyValue>
          <KeyValue label="Program / Branch">
            {candidate.program} · {candidate.branch}
          </KeyValue>
          <KeyValue label="Rank">{candidate.rank.toLocaleString("en-IN")}</KeyValue>
          <KeyValue label="Marks">{candidate.marks}</KeyValue>
          <KeyValue label="Eligible Category">{candidate.eligCat}</KeyValue>
          <KeyValue label="Father's Name">{candidate.father}</KeyValue>
          <KeyValue label="Mother's Name">{candidate.mother}</KeyValue>
          <KeyValue label="Allotment Round">{candidate.allotRound}</KeyValue>
        </KeyValueGrid>
      </Section>

      {/* Section B — Identity & Contact */}
      <Section title={t("admissions.sections.identity")} icon={Contact}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Aadhaar No" required error={errors.aadharNo}>
            <Input
              value={draft.aadharNo}
              inputMode="numeric"
              maxLength={12}
              onChange={(e) => set("aadharNo", e.target.value)}
            />
          </Field>
          <Field label="APAAR / ABC ID" hint="12 digits (optional)" error={errors.apaarId}>
            <Input
              value={draft.apaarId ?? ""}
              inputMode="numeric"
              maxLength={12}
              onChange={(e) => set("apaarId", e.target.value)}
            />
          </Field>
          <Field label="Email" required error={errors.email}>
            <Input type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Blood Group" required>
            <Select
              value={draft.bloodGroup}
              onChange={(e) => set("bloodGroup", e.target.value as AdmissionFormData["bloodGroup"])}
            >
              {BLOOD_GROUPS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-4">
          <p className="text-navy mb-1.5 block text-sm font-medium">
            {t("admissions.form.uploadPhoto")} <span className="text-danger">*</span>
          </p>
          <PhotoUpload value={draft.photo} onChange={(m) => set("photo", m)} error={errors.photo} />
        </div>
      </Section>

      {/* Section C — Category & Religion */}
      <Section title={t("admissions.sections.category")} icon={Users}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Category" required>
            <Select
              value={draft.category}
              onChange={(e) => set("category", e.target.value as AdmissionFormData["category"])}
            >
              {ADMISSION_CATEGORIES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <Field label="Sub Category" required>
            <Select
              value={draft.subCategory}
              onChange={(e) => set("subCategory", e.target.value as AdmissionFormData["subCategory"])}
            >
              {ADMISSION_SUB_CATEGORIES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <Field label="Religion" required>
            <Select
              value={draft.religion}
              onChange={(e) => set("religion", e.target.value as AdmissionFormData["religion"])}
            >
              {RELIGIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          <Field label="Minority" required>
            <Select
              value={draft.minority}
              onChange={(e) => set("minority", e.target.value as AdmissionFormData["minority"])}
            >
              <option>No</option>
              <option>Yes</option>
            </Select>
          </Field>
        </div>
      </Section>

      {/* Section D — Academic */}
      <Section title={t("admissions.sections.academic")} icon={FileText}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="10th %" required error={errors.hscPercent}>
            <Input
              type="number"
              min={0}
              max={100}
              value={draft.hscPercent || ""}
              onChange={(e) => set("hscPercent", Number(e.target.value))}
            />
          </Field>
          <Field label="10th Passing Year" required>
            <Select
              value={draft.hscPassingYear}
              onChange={(e) => set("hscPassingYear", Number(e.target.value))}
            >
              {HSC_PASSING_YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </Select>
          </Field>
          <Field label="10th Board" required>
            <Select
              value={draft.hscUniversity}
              onChange={(e) => set("hscUniversity", e.target.value as AdmissionFormData["hscUniversity"])}
            >
              {EXAM_BOARDS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          {draft.hscUniversity === "Other" && (
            <Field label="Specify 10th Board" required error={errors.hscUniversityOther}>
              <Input
                value={draft.hscUniversityOther ?? ""}
                onChange={(e) => set("hscUniversityOther", e.target.value)}
              />
            </Field>
          )}
          <Field label="Last Exam Passed" required>
            <Select
              value={draft.lastExam}
              onChange={(e) => set("lastExam", e.target.value as AdmissionFormData["lastExam"])}
            >
              {LAST_EXAMS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          {draft.lastExam === "Other" && (
            <Field label="Specify Last Exam" required error={errors.lastExamOther}>
              <Input
                value={draft.lastExamOther ?? ""}
                onChange={(e) => set("lastExamOther", e.target.value)}
              />
            </Field>
          )}
          <Field label="12th Passing Year" required>
            <Select value={draft.passingYear} onChange={(e) => set("passingYear", Number(e.target.value))}>
              {LAST_EXAM_YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </Select>
          </Field>
          <Field label="12th Board / University" required>
            <Select
              value={draft.university}
              onChange={(e) => set("university", e.target.value as AdmissionFormData["university"])}
            >
              {EXAM_BOARDS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </Field>
          {draft.university === "Other" && (
            <Field label="Specify 12th Board" required error={errors.universityOther}>
              <Input
                value={draft.universityOther ?? ""}
                onChange={(e) => set("universityOther", e.target.value)}
              />
            </Field>
          )}
          <Field label="Date of Birth" required error={errors.dob}>
            <Input
              type="date"
              min={DOB_MIN}
              max={DOB_MAX}
              value={draft.dob}
              onChange={(e) => set("dob", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* Section E — Family & Guardian */}
      <Section title={t("admissions.sections.family")} icon={Users}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Father's Occupation">
            <Input value={draft.fatherOcc ?? ""} onChange={(e) => set("fatherOcc", e.target.value)} />
          </Field>
          <Field label="Mother's Occupation">
            <Input value={draft.motherOcc ?? ""} onChange={(e) => set("motherOcc", e.target.value)} />
          </Field>
          <Field label="Place of Work">
            <Input value={draft.placeOfWork ?? ""} onChange={(e) => set("placeOfWork", e.target.value)} />
          </Field>
          <Field label="Parent / Guardian Mobile" required error={errors.parentMobile}>
            <Input
              value={draft.parentMobile}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => set("parentMobile", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* Section F — Address */}
      <Section title={t("admissions.sections.address")} icon={Home}>
        <p className="text-muted mb-2 text-xs font-semibold">{t("admissions.form.permanentAddress")}</p>
        <AddressBlock prefix="perm" value={draft.perm} onChange={(p) => setAddr("perm", p)} errors={errors} />

        <div className="my-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDraft((d) => ({ ...d, local: { ...d.perm } }))}
          >
            {t("admissions.form.copyPermanent")}
          </Button>
        </div>

        <p className="text-muted mb-2 text-xs font-semibold">{t("admissions.form.localAddress")}</p>
        <AddressBlock prefix="local" value={draft.local} onChange={(p) => setAddr("local", p)} errors={errors} />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Local Guardian Mobile" required error={errors.guardianMobile}>
            <Input
              value={draft.guardianMobile}
              inputMode="numeric"
              maxLength={10}
              onChange={(e) => set("guardianMobile", e.target.value)}
            />
          </Field>
          <Field label="Local Guardian Address" required error={errors.guardianAddress}>
            <Textarea
              value={draft.guardianAddress}
              onChange={(e) => set("guardianAddress", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* Payment */}
      <Section title={t("admissions.sections.payment")} icon={IndianRupee}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-muted mb-2 text-xs font-semibold">Published fee (pay in advance)</p>
            <Table>
              <tbody>
                {ADMISSION_FEE_PARTICULARS.map((f) => (
                  <tr key={f.label}>
                    <Td className="text-slate">{f.label}</Td>
                    <Td className="text-navy text-right font-medium tabular-nums">{formatINR(f.amount)}</Td>
                  </tr>
                ))}
                <tr>
                  <Td className="text-navy font-semibold">Total payable</Td>
                  <Td className="text-navy text-right font-bold tabular-nums">
                    {formatINR(ADMISSION_FEE_TOTAL)}
                  </Td>
                </tr>
              </tbody>
            </Table>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted text-xs font-semibold">Your transactions</p>
              <Badge tone={feeEntered(draft.payments) >= ADMISSION_FEE_TOTAL ? "success" : "warning"}>
                {t("admissions.form.feeEntered")} {formatINR(feeEntered(draft.payments))}
              </Badge>
            </div>
            <PaymentRows rows={draft.payments} onChange={(rows) => set("payments", rows)} />
            {errors.payments && <p className="text-danger mt-2 text-xs">{errors.payments}</p>}
          </div>
        </div>
      </Section>

      {/* Captcha + submit */}
      <Section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm">
            <p className="text-navy mb-1.5 text-sm font-medium">{t("admissions.form.captcha")}</p>
            <Captcha
              code={captchaCode}
              value={captchaInput}
              onChange={setCaptchaInput}
              onRegenerate={() => {
                setCaptchaCode(randomCaptcha());
                setCaptchaInput("");
              }}
              error={errors.captcha}
            />
          </div>
          <Button onClick={submit} size="md">
            {isResubmit ? t("admissions.form.resubmit") : t("admissions.form.submit")}
          </Button>
        </div>
      </Section>
    </div>
  );
}

function AddressBlock({
  prefix,
  value,
  onChange,
  errors,
}: {
  prefix: "perm" | "local";
  value: AdmissionAddress;
  onChange: (patch: Partial<AdmissionAddress>) => void;
  errors: Record<string, string>;
}) {
  const e = (k: keyof AdmissionAddress) => errors[`${prefix}.${k}`];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Field label="House / Flat No" required error={e("houseNo")}>
        <Input value={value.houseNo} onChange={(ev) => onChange({ houseNo: ev.target.value })} />
      </Field>
      <Field label="Village / Street / Tahsil / Post" required error={e("street")}>
        <Input value={value.street} onChange={(ev) => onChange({ street: ev.target.value })} />
      </Field>
      <Field label="State" required error={e("state")}>
        <Input value={value.state} onChange={(ev) => onChange({ state: ev.target.value })} />
      </Field>
      <Field label="District" required error={e("district")}>
        <Input value={value.district} onChange={(ev) => onChange({ district: ev.target.value })} />
      </Field>
      <Field label="City" required error={e("city")}>
        <Input value={value.city} onChange={(ev) => onChange({ city: ev.target.value })} />
      </Field>
      <Field label="PIN Code" required error={e("pin")}>
        <Input
          value={value.pin}
          inputMode="numeric"
          maxLength={6}
          onChange={(ev) => onChange({ pin: ev.target.value })}
        />
      </Field>
    </div>
  );
}
