import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the DAVV gold left-border used to flag priority cards. */
  accent?: boolean;
  children: ReactNode;
}

export function Card({ accent, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-card",
        accent && "border-l-4 border-l-gold",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
