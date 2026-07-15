"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import type { NavItem } from "@/config/nav";
import { useTranslation } from "@/lib/i18n";
import { Crest } from "@/components/shared/Logo";
import { cn } from "@/lib/utils/cn";

interface LaunchpadProps {
  items: NavItem[];
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen frosted-glass grid of every screen the signed-in role can
 * reach — a macOS-Launchpad-style overview that complements the icon rail.
 * Tiles stagger in gently; Escape, the backdrop and any tile close it.
 */
export function Launchpad({ items, open, onClose }: LaunchpadProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="bg-navy-900/70 fixed inset-0 z-50 overflow-y-auto backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={t("common.launchpad")}
      onMouseDown={onClose}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 rounded-lg p-2 text-[rgba(243,231,211,0.7)] hover:bg-white/10 hover:text-white"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <X className="size-6" />
      </button>

      <div
        className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center px-6 py-16"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-8 text-center">
          <Crest className="mx-auto size-12" />
          <p className="eyebrow text-gold-bright mt-3">IET DAVV</p>
          <h2 className="font-heading mt-1 text-2xl font-semibold text-[#f3e7d3]">
            {t("common.launchpad")}
          </h2>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            const tile = (
              <Link
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-colors",
                  active
                    ? "border-[rgba(226,184,119,0.55)] bg-[rgba(226,184,119,0.12)]"
                    : "border-white/10 bg-white/[0.05] hover:border-[rgba(226,184,119,0.35)] hover:bg-white/[0.10]",
                )}
              >
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-xl",
                    active ? "bg-gold text-navy" : "text-gold-bright bg-white/[0.08]",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-medium text-[#f3e7d3]">{t(item.labelKey)}</span>
              </Link>
            );
            return (
              <li key={item.key}>
                {reduceMotion ? (
                  tile
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.04 + i * 0.03,
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {tile}
                  </motion.div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
