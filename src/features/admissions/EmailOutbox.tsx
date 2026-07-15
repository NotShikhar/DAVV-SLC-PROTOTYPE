"use client";

import { Mail } from "lucide-react";
import type { SimulatedEmail } from "@/store/admissions";
import { useTranslation } from "@/lib/i18n";
import { formatDateTime } from "@/lib/utils/format";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * In-portal "sent emails" panel — the confirmation emails are simulated (the
 * real portal wires SMTP; here nothing leaves the browser).
 */
export function EmailOutbox({ emails }: { emails: SimulatedEmail[] }) {
  const { t } = useTranslation();
  return (
    <Section title={t("admissions.email.outbox")} icon={Mail} bodyClassName={emails.length ? "p-0" : undefined}>
      {emails.length === 0 ? (
        <EmptyState icon={Mail} title="No emails yet" />
      ) : (
        <ul className="divide-line divide-y">
          {emails.map((e) => (
            <li key={e.id} className="px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-navy text-sm font-semibold">{e.subject}</p>
                <span className="text-faint shrink-0 text-xs">{formatDateTime(e.at)}</span>
              </div>
              <p className="text-muted mt-0.5 text-xs">
                {t("admissions.email.sentTo")} {e.to}
              </p>
              <p className="text-slate mt-1 text-sm">{e.body}</p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
