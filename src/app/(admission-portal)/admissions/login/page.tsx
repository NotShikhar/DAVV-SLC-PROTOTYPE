"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";
import {
  ADMISSION_INCHARGES,
  ELIGIBLE_CANDIDATES,
  PRIMARY_ELIGIBLE_ROLL,
  PRIMARY_INCHARGE_ID,
  getEligibleCandidate,
  matchEligible,
} from "@/data";
import { useTranslation } from "@/lib/i18n";
import { useAdmissionSession, type AdmissionActor } from "@/store/admissionSession";
import { useUi } from "@/store/ui";
import { ADMISSION_ROUTES } from "@/config/admissions";
import { Crest } from "@/components/shared/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { FluidTabs } from "@/components/ui/FluidTabs";

/** Demo-journey tags shown next to each eligible candidate (like the SLC login). */
const JOURNEY_TAGS: Record<string, string> = {
  "260311030265": "Happy path",
  "260311030512": "Pending review",
  "260311030634": "Rejected — resubmit",
  "260311030770": "Approved",
};

export default function AdmissionLoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const loginApplicant = useAdmissionSession((s) => s.loginApplicant);
  const loginIncharge = useAdmissionSession((s) => s.loginIncharge);
  const pushToast = useUi((s) => s.pushToast);

  const [tab, setTab] = useState<AdmissionActor>("applicant");

  const primary = getEligibleCandidate(PRIMARY_ELIGIBLE_ROLL);
  const [rollno, setRollno] = useState(primary?.rollno ?? "");
  const [rank, setRank] = useState(primary ? String(primary.rank) : "");
  const [mobile, setMobile] = useState(primary?.contNo ?? "");
  const [inchargeId, setInchargeId] = useState(PRIMARY_INCHARGE_ID);
  const [error, setError] = useState<string | null>(null);

  const onPickCandidate = (roll: string) => {
    const c = getEligibleCandidate(roll);
    if (!c) return;
    setRollno(c.rollno);
    setRank(String(c.rank));
    setMobile(c.contNo);
    setError(null);
  };

  const selectedRoll = useMemo(
    () => (ELIGIBLE_CANDIDATES.some((c) => c.rollno === rollno) ? rollno : ""),
    [rollno],
  );

  const verifyApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const match = matchEligible(rollno, rank, mobile);
    if (!match) return setError(t("admissions.login.mismatch"));
    loginApplicant(match.rollno);
    pushToast({ tone: "success", title: "Identity verified", description: match.name });
    router.push(ADMISSION_ROUTES.apply);
  };

  const signInIncharge = (e: React.FormEvent) => {
    e.preventDefault();
    loginIncharge(inchargeId);
    pushToast({ tone: "success", title: "Signed in", description: t("admissions.incharge") });
    router.push(ADMISSION_ROUTES.console);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-6">
      <div className="rounded-card border-line bg-surface shadow-card w-full border p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="bg-navy/5 grid size-12 place-items-center rounded-xl">
            <Crest className="size-9" />
          </span>
          <div>
            <h1 className="font-heading text-navy text-xl font-bold">{t("admissions.login.title")}</h1>
            <p className="text-muted text-sm">{t("admissions.login.subtitle")}</p>
          </div>
        </div>

        <FluidTabs
          className="mb-5"
          orientation="stacked"
          tabs={[
            { id: "applicant", label: t("admissions.applicant"), icon: GraduationCap },
            { id: "incharge", label: t("admissions.incharge"), icon: ShieldCheck },
          ]}
          active={tab}
          onChange={(next) => {
            setTab(next);
            setError(null);
          }}
        />

        {tab === "applicant" ? (
          <form onSubmit={verifyApplicant} className="space-y-4">
            <Field label={t("admissions.login.demoCandidate")} hint={t("admissions.login.demoHint")}>
              <Select value={selectedRoll} onChange={(e) => onPickCandidate(e.target.value)}>
                <option value="" disabled>
                  Select a candidate…
                </option>
                {ELIGIBLE_CANDIDATES.map((c) => (
                  <option key={c.rollno} value={c.rollno}>
                    {c.name} — {c.rollno}
                    {JOURNEY_TAGS[c.rollno] ? ` · ${JOURNEY_TAGS[c.rollno]}` : ""}
                  </option>
                ))}
              </Select>
            </Field>

            <p className="text-muted text-xs">{t("admissions.login.identityNote")}</p>

            <Field label={t("admissions.login.rollNo")} required>
              <Input value={rollno} onChange={(e) => setRollno(e.target.value)} spellCheck={false} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("admissions.login.rank")} required>
                <Input value={rank} onChange={(e) => setRank(e.target.value)} inputMode="numeric" />
              </Field>
              <Field label={t("admissions.login.mobile")} required>
                <Input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  inputMode="numeric"
                  maxLength={10}
                />
              </Field>
            </div>

            {error && (
              <p className="rounded-btn bg-danger-bg text-danger px-3 py-2 text-sm" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth>
              {t("admissions.login.verify")}
              <ArrowRight className="size-4" />
            </Button>
          </form>
        ) : (
          <form onSubmit={signInIncharge} className="space-y-4">
            <Field label={t("admissions.login.inchargeAccount")} required>
              <Select value={inchargeId} onChange={(e) => setInchargeId(e.target.value)}>
                {ADMISSION_INCHARGES.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} — {i.id}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" fullWidth>
              Sign in
              <ArrowRight className="size-4" />
            </Button>
          </form>
        )}

        <p className="text-muted mt-4 text-center text-xs">
          Prototype with mock data · any listed demo account signs you in.
        </p>
      </div>
    </div>
  );
}
