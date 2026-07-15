"use client";

import { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils/cn";

export interface FluidTabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
}

interface FluidTabsProps<T extends string> {
  tabs: FluidTabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  /** "stacked" puts the icon above the label (login role switcher). */
  orientation?: "inline" | "stacked";
  className?: string;
}

/**
 * Segmented control whose active pill slides between tabs on a spring.
 * Adapted from Watermelon UI's `fluid-tabs` (ui.watermelon.sh), made
 * controlled/generic and restyled onto the cream/navy token set.
 */
export function FluidTabs<T extends string>({
  tabs,
  active,
  onChange,
  orientation = "inline",
  className,
}: FluidTabsProps<T>) {
  const reduceMotion = useReducedMotion();
  const pillId = useId();

  return (
    <div
      role="tablist"
      className={cn("rounded-btn bg-cream grid gap-1 p-1", className)}
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative rounded-md px-2 py-2 text-xs font-medium",
              orientation === "stacked"
                ? "flex flex-col items-center gap-1"
                : "flex items-center justify-center gap-1.5",
            )}
          >
            {isActive && (
              <motion.span
                layoutId={reduceMotion ? undefined : pillId}
                transition={{ type: "spring", stiffness: 280, damping: 26, mass: 0.8 }}
                className="bg-surface shadow-card absolute inset-0 rounded-md"
                aria-hidden
              />
            )}
            <motion.span
              animate={
                reduceMotion
                  ? undefined
                  : { filter: isActive ? ["blur(0px)", "blur(2px)", "blur(0px)"] : "blur(0px)" }
              }
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "relative z-10 transition-colors duration-200",
                orientation === "stacked"
                  ? "flex flex-col items-center gap-1"
                  : "flex items-center gap-1.5",
                isActive ? "text-navy" : "text-muted hover:text-navy",
              )}
            >
              {Icon && <Icon className="size-4 shrink-0" />}
              {tab.label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
