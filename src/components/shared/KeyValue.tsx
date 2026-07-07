import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** A labelled value in a description list. Group inside a <dl> grid. */
export function KeyValue({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs tracking-wide text-muted uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-navy">{children || "—"}</dd>
    </div>
  );
}

export function KeyValueGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3", className)}>{children}</dl>;
}
