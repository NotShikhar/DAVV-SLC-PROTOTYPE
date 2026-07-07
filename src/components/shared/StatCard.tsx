import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/Card";
import type { Tone } from "@/components/ui/Badge";

const ICON_TONE: Record<Tone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
  neutral: "bg-cream text-slate",
  gold: "bg-gold-100 text-gold-600",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  hint?: ReactNode;
  href?: string;
  accent?: boolean;
}

export function StatCard({ label, value, icon: Icon, tone = "info", hint, href, accent }: StatCardProps) {
  const body = (
    <Card accent={accent} className={cn("h-full p-4 transition-shadow", href && "hover:shadow-pop")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-navy">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        {Icon && (
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", ICON_TONE[tone])}>
            <Icon className="size-5" />
          </span>
        )}
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="block rounded-card focus-visible:outline-navy">
      {body}
    </Link>
  ) : (
    body
  );
}
