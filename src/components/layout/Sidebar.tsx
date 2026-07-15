"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { LayoutGrid, X } from "lucide-react";
import type { Role } from "@/types";
import { navForRole, type NavItem } from "@/config/nav";
import { useTranslation } from "@/lib/i18n";
import { useAdminPermissions } from "@/lib/auth";
import { useUi } from "@/store/ui";
import { useSettings } from "@/store/settings";
import { INSTITUTE } from "@/lib/domain/constants";
import { Crest } from "@/components/shared/Logo";
import { Launchpad } from "./Launchpad";
import { cn } from "@/lib/utils/cn";

const PORTAL_NAME: Record<Role, string> = {
  student: "Student Portal",
  faculty: "Faculty Portal",
  admin: "Administration",
};

/** Nav entries visible to the signed-in role (permission/feature filtered). */
function useNavItems(role: Role): NavItem[] {
  const perms = useAdminPermissions();
  const features = useSettings((s) => s.features);
  return navForRole(role).filter((item) => {
    if (role === "admin" && item.permission) return perms.includes(item.permission);
    if (role === "student" && item.feature) return features[item.feature];
    return true;
  });
}

interface Tip {
  label: string;
  y: number;
}

/**
 * Desktop navigation — a slim floating rail of icon tiles. The active tile
 * carries a sliding gold pill (spring layout animation); hovering a tile
 * shows its label in a flyout beside the rail. The bottom tile opens the
 * Launchpad overlay with every screen laid out as labelled tiles.
 */
function IconRail({ items, onLaunchpad }: { items: NavItem[]; onLaunchpad: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const pillId = useId();
  const [tip, setTip] = useState<Tip | null>(null);

  const showTip = (label: string) => (e: React.MouseEvent | React.FocusEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTip({ label, y: rect.top + rect.height / 2 });
  };
  const hideTip = () => setTip(null);

  return (
    <>
      <aside className="bg-navy bg-navy-gradient shadow-pop fixed top-4 bottom-4 left-4 z-40 hidden w-[76px] flex-col rounded-2xl border border-[rgba(226,184,119,0.22)] lg:flex">
        <div className="grid h-16 w-full shrink-0 place-items-center border-b border-[rgba(226,184,119,0.14)]">
          <Crest className="size-10" />
        </div>

        <nav className="w-full flex-1 overflow-y-auto px-4 py-3" aria-label="Primary">
          <ul className="flex flex-col items-center gap-1.5">
            {items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    aria-label={t(item.labelKey)}
                    onMouseEnter={showTip(t(item.labelKey))}
                    onMouseLeave={hideTip}
                    onFocus={showTip(t(item.labelKey))}
                    onBlur={hideTip}
                    className={cn(
                      "relative grid size-11 place-items-center rounded-xl transition-colors",
                      active
                        ? "text-gold"
                        : "text-[rgba(243,231,211,0.55)] hover:bg-white/[0.06] hover:text-[#f3e7d3]",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={reduceMotion ? undefined : pillId}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="absolute inset-0 rounded-xl bg-[rgba(226,184,119,0.12)] ring-1 ring-[rgba(226,184,119,0.30)]"
                        aria-hidden
                      />
                    )}
                    <Icon className="relative z-10 size-5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="grid w-full shrink-0 place-items-center border-t border-[rgba(226,184,119,0.14)] py-3">
          <button
            type="button"
            onClick={onLaunchpad}
            aria-label={t("common.launchpad")}
            onMouseEnter={showTip(t("common.launchpad"))}
            onMouseLeave={hideTip}
            onFocus={showTip(t("common.launchpad"))}
            onBlur={hideTip}
            className="hover:text-gold-bright grid size-11 place-items-center rounded-xl text-[rgba(243,231,211,0.7)] transition-colors hover:bg-white/[0.06]"
          >
            <LayoutGrid className="size-5" />
          </button>
        </div>
      </aside>

      {/* Flyout label — fixed beside the rail so the scrolling nav can't clip it */}
      {tip && (
        <div
          className="bg-navy-800 shadow-pop pointer-events-none fixed left-[104px] z-50 hidden -translate-y-1/2 rounded-lg border border-[rgba(226,184,119,0.25)] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-[#f3e7d3] lg:block"
          style={{ top: tip.y }}
          aria-hidden
        >
          {tip.label}
        </div>
      )}
    </>
  );
}

/** Mobile drawer — full labelled list, unchanged from the wide-rail days. */
function DrawerNav({ items, onNavigate }: { items: NavItem[]; onNavigate: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-[rgba(226,184,119,0.10)] text-[#f3e7d3]"
                : "text-[rgba(243,231,211,0.62)] hover:bg-white/[0.05] hover:text-[#f3e7d3]",
            )}
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0",
                active ? "text-gold" : "text-[rgba(243,231,211,0.5)] group-hover:text-[#f3e7d3]",
              )}
            />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

function DrawerHeader({ role, onClose }: { role: Role; onClose: () => void }) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-[rgba(226,184,119,0.14)] px-5">
      <span className="flex items-center gap-3">
        <Crest className="size-11" />
        <span className="leading-tight">
          <span className="font-heading block text-[19px] font-semibold text-[#f3e7d3]">
            IET DAVV
          </span>
          <span className="text-gold block text-[10px] font-semibold tracking-[0.16em] uppercase">
            {PORTAL_NAME[role]}
          </span>
        </span>
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="rounded-lg p-1.5 text-[rgba(243,231,211,0.7)] hover:bg-white/10 lg:hidden"
      >
        <X className="size-5" />
      </button>
    </div>
  );
}

function DrawerFooter() {
  return (
    <div className="border-t border-[rgba(226,184,119,0.14)] px-5 py-4">
      <p className="font-serif-accent text-gold-bright text-sm">{INSTITUTE.motto}</p>
      <p className="mt-1 text-[10px] text-[rgba(243,231,211,0.4)]">
        Prototype · illustrative mock data
      </p>
    </div>
  );
}

export function Sidebar({ role }: { role: Role }) {
  const open = useUi((s) => s.sidebarOpen);
  const setSidebar = useUi((s) => s.setSidebar);
  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const items = useNavItems(role);

  return (
    <>
      <IconRail items={items} onLaunchpad={() => setLaunchpadOpen(true)} />

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="bg-navy-900/60 absolute inset-0" onClick={() => setSidebar(false)} />
          <aside className="bg-navy bg-navy-gradient animate-fade-up absolute inset-y-0 left-0 flex w-[264px] flex-col rounded-r-2xl border-r border-[rgba(226,184,119,0.22)]">
            <DrawerHeader role={role} onClose={() => setSidebar(false)} />
            <DrawerNav items={items} onNavigate={() => setSidebar(false)} />
            <DrawerFooter />
          </aside>
        </div>
      )}

      <Launchpad items={items} open={launchpadOpen} onClose={() => setLaunchpadOpen(false)} />
    </>
  );
}
