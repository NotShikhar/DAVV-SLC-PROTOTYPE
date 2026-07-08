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
  neutral: "bg-cream-deep text-soft",
  gold: "bg-gold-100 text-gold-600",
};

const TOP_ACCENT: Record<Tone, string> = {
  success: "border-t-success",
  warning: "border-t-warning",
  danger: "border-t-danger",
  info: "border-t-navy",
  neutral: "border-t-line",
  gold: "border-t-gold",
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
    <Card
      accent={accent}
      className={cn(
        "h-full border-t-[3px] p-4 transition-all duration-200",
        TOP_ACCENT[tone],
        href && "hover:-translate-y-0.5 hover:shadow-pop",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-semibold tracking-[0.12em] text-muted uppercase">{label}</p>
          <p className="mt-1.5 font-heading text-3xl leading-none font-semibold text-navy">{value}</p>
          {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
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
    <Link href={href} className="block rounded-card focus-visible:outline-gold-600">
      {body}
    </Link>
  ) : (
    body
  );
}
