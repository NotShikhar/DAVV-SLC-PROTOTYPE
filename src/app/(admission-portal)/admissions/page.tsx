"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, IndianRupee, QrCode, ShieldCheck, UserCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { ADMISSION_FEE_PARTICULARS, ADMISSION_FEE_TOTAL, ADMISSION_ROUND } from "@/lib/domain";
import { formatDate, formatINR } from "@/lib/utils/format";
import { ADMISSION_ROUTES } from "@/config/admissions";
import { HeroBanner } from "@/components/shared/HeroBanner";
import { Section } from "@/components/ui/Section";
import { Table, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { KeyValue, KeyValueGrid } from "@/components/shared/KeyValue";
import { buttonClasses } from "@/components/ui/Button";

const STEPS = [
  { icon: UserCheck, key: "step1" },
  { icon: FileText, key: "step2" },
  { icon: ShieldCheck, key: "step3" },
  { icon: CheckCircle2, key: "step4" },
] as const;

export default function AdmissionLandingPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <HeroBanner scrim="left" className="p-8 sm:p-10">
        <Badge tone="gold" dot className="mb-4">
          {t("admissions.session")}
        </Badge>
        <h1 className="font-heading max-w-2xl text-3xl leading-tight font-bold text-white sm:text-4xl">
          {t("admissions.landing.title")}
        </h1>
        <p className="mt-3 max-w-xl text-white/75">{t("admissions.landing.subtitle")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
          <span className="font-serif-accent text-gold-bright">{ADMISSION_ROUND.label}</span>
          <span className="text-white/50">·</span>
          <span>
            {t("admissions.landing.deadline")}: {formatDate(ADMISSION_ROUND.deadlineISO)}
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={ADMISSION_ROUTES.login} className={buttonClasses("primary", "md")}>
            {t("admissions.landing.applicantCta")}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href={ADMISSION_ROUTES.login}
            className={buttonClasses("secondary", "md", "border-white/40 text-white hover:bg-white/10")}
          >
            <ShieldCheck className="size-4" />
            {t("admissions.landing.inchargeCta")}
          </Link>
        </div>
      </HeroBanner>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title={t("admissions.landing.activeRound")} icon={ShieldCheck}>
            <KeyValueGrid>
              <KeyValue label="Round">{ADMISSION_ROUND.label}</KeyValue>
              <KeyValue label="Program">B.Tech · First Year</KeyValue>
              <KeyValue label="Opens">{formatDate(ADMISSION_ROUND.opensISO)}</KeyValue>
              <KeyValue label={t("admissions.landing.deadline")}>
                {formatDate(ADMISSION_ROUND.deadlineISO)}
              </KeyValue>
              <KeyValue label="Counselling">DTE Madhya Pradesh (JEE Main)</KeyValue>
              <KeyValue label="Status">
                <Badge tone="success" dot>
                  Open
                </Badge>
              </KeyValue>
            </KeyValueGrid>
          </Section>

          <Section title={t("admissions.landing.howItWorks")} icon={FileText}>
            <ol className="grid gap-4 sm:grid-cols-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li key={s.key} className="flex flex-col gap-2">
                    <span className="bg-cream-deep text-gold-600 grid size-10 place-items-center rounded-xl">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-muted text-[11px] font-semibold">STEP {i + 1}</span>
                    <span className="text-navy text-sm font-medium">
                      {t(`admissions.landing.${s.key}`)}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Section>
        </div>

        <Section title={t("admissions.landing.publishedFee")} icon={IndianRupee} accent>
          <p className="text-muted mb-4 text-sm">{t("admissions.landing.feeNote")}</p>
          <Table>
            <tbody>
              {ADMISSION_FEE_PARTICULARS.map((f) => (
                <tr key={f.label}>
                  <Td className="text-slate">
                    {f.label}
                    {f.refundable && <span className="text-muted"> (refundable)</span>}
                  </Td>
                  <Td className="text-navy text-right font-medium tabular-nums">{formatINR(f.amount)}</Td>
                </tr>
              ))}
              <tr>
                <Td className="text-navy font-semibold">{t("admissions.landing.total")}</Td>
                <Td className="text-navy text-right font-bold tabular-nums">
                  {formatINR(ADMISSION_FEE_TOTAL)}
                </Td>
              </tr>
            </tbody>
          </Table>
          <div className="border-line bg-cream mt-4 flex flex-col items-center gap-2 rounded-card border border-dashed p-5 text-center">
            <QrCode className="text-navy size-12" />
            <p className="text-muted text-xs">Scan the official institutional QR to pay via UPI</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
