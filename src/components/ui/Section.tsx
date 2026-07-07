import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card } from "./Card";

interface SectionProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  accent?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/** A titled Card panel — the workhorse container for screen content. */
export function Section({
  title,
  description,
  action,
  icon: Icon,
  accent,
  className,
  bodyClassName,
  children,
}: SectionProps) {
  return (
    <Card accent={accent} className={className}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-navy/5 text-navy">
                <Icon className="size-4" />
              </span>
            )}
            <div>
              {title && <h2 className="text-base font-semibold text-navy">{title}</h2>}
              {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </Card>
  );
}
