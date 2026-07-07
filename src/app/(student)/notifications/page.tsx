"use client";

import Link from "next/link";
import { AlertTriangle, Award, CheckCheck, Clock, GraduationCap, Info, Wallet, type LucideIcon } from "lucide-react";
import type { NotificationKind } from "@/types";
import { useDemo } from "@/store/demo";
import { useUi } from "@/store/ui";
import { formatDateTime } from "@/lib/utils/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import type { Tone } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

const KIND: Record<NotificationKind, { icon: LucideIcon; tone: Tone }> = {
  deadline: { icon: Clock, tone: "warning" },
  result: { icon: Award, tone: "success" },
  warning: { icon: AlertTriangle, tone: "danger" },
  fee: { icon: Wallet, tone: "warning" },
  exam: { icon: GraduationCap, tone: "info" },
  info: { icon: Info, tone: "neutral" },
};

const ICON_BG: Record<Tone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-cream text-slate",
  gold: "bg-gold-100 text-gold-600",
};

export default function NotificationsPage() {
  const notifications = useDemo((s) => s.notifications);
  const markRead = useDemo((s) => s.markNotificationRead);
  const markAllRead = useDemo((s) => s.markAllNotificationsRead);
  const pushToast = useUi((s) => s.pushToast);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "You're all caught up."}
        actions={
          unread > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                markAllRead();
                pushToast({ tone: "success", title: "All caught up", description: "Marked all as read." });
              }}
            >
              <CheckCheck className="size-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      <Section bodyClassName="p-0">
        <ul className="divide-y divide-line">
          {notifications.map((n) => {
            const { icon: Icon, tone } = KIND[n.kind];
            const Row = (
              <div className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-cream">
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", ICON_BG[tone])}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />}
                    <p className={cn("text-sm", n.read ? "text-slate" : "font-semibold text-navy")}>{n.title}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                  <p className="mt-1 text-xs text-muted">{formatDateTime(n.date)}</p>
                </div>
              </div>
            );

            return (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} onClick={() => markRead(n.id)} className="block">
                    {Row}
                  </Link>
                ) : (
                  <button type="button" onClick={() => markRead(n.id)} className="block w-full text-left">
                    {Row}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </Section>
    </>
  );
}
