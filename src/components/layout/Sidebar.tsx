"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { Role } from "@/types";
import { navForRole } from "@/config/nav";
import { useTranslation } from "@/lib/i18n";
import { useAdminPermissions } from "@/lib/auth";
import { useUi } from "@/store/ui";
import { useSettings } from "@/store/settings";
import { INSTITUTE } from "@/lib/domain/constants";
import { Crest } from "@/components/shared/Logo";
import { cn } from "@/lib/utils/cn";

const PORTAL_NAME: Record<Role, string> = {
  student: "Student Portal",
  faculty: "Faculty Portal",
  admin: "Administration",
};

function NavLinks({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const perms = useAdminPermissions();
  const features = useSettings((s) => s.features);
  const items = navForRole(role).filter((item) => {
    if (role === "admin" && item.permission) return perms.includes(item.permission);
    if (role === "student" && item.feature) return features[item.feature];
    return true;
  });

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
              "group flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-gold bg-[rgba(226,184,119,0.10)] text-[#f3e7d3]"
                : "border-transparent text-[rgba(243,231,211,0.62)] hover:bg-white/[0.05] hover:text-[#f3e7d3]",
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

function ShellHeader({ role, onClose }: { role: Role; onClose?: () => void }) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-[rgba(226,184,119,0.14)] px-5">
      <span className="flex items-center gap-3">
        <Crest className="size-11" />
        <span className="leading-tight">
          <span className="block font-heading text-[19px] font-semibold text-[#f3e7d3]">IET DAVV</span>
          <span className="block text-[10px] font-semibold tracking-[0.16em] text-gold uppercase">
            {PORTAL_NAME[role]}
          </span>
        </span>
      </span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="rounded-lg p-1.5 text-[rgba(243,231,211,0.7)] hover:bg-white/10 lg:hidden"
        >
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-[rgba(226,184,119,0.14)] px-5 py-4">
      <p className="font-serif-accent text-sm text-gold-bright">{INSTITUTE.motto}</p>
      <p className="mt-1 text-[10px] text-[rgba(243,231,211,0.4)]">Prototype · illustrative mock data</p>
    </div>
  );
}

export function Sidebar({ role }: { role: Role }) {
  const open = useUi((s) => s.sidebarOpen);
  const setSidebar = useUi((s) => s.setSidebar);

  return (
    <>
      {/* Desktop rail */}
      <aside className="bg-navy bg-navy-gradient fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-[rgba(226,184,119,0.22)] lg:flex">
        <ShellHeader role={role} />
        <NavLinks role={role} />
        <SidebarFooter />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/60" onClick={() => setSidebar(false)} />
          <aside className="bg-navy bg-navy-gradient animate-fade-up absolute inset-y-0 left-0 flex w-[264px] flex-col">
            <ShellHeader role={role} onClose={() => setSidebar(false)} />
            <NavLinks role={role} onNavigate={() => setSidebar(false)} />
            <SidebarFooter />
          </aside>
        </div>
      )}
    </>
  );
}
