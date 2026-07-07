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
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils/cn";

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
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
              "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0",
                active ? "text-gold" : "text-white/60 group-hover:text-white",
              )}
            />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

function ShellHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
      <Logo onDark />
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden">
          <X className="size-5" />
        </button>
      )}
    </div>
  );
}

export function Sidebar({ role }: { role: Role }) {
  const open = useUi((s) => s.sidebarOpen);
  const setSidebar = useUi((s) => s.setSidebar);

  return (
    <>
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy lg:flex">
        <ShellHeader />
        <NavLinks role={role} />
        <p className="border-t border-white/10 p-3 text-[10px] text-white/40">
          Prototype · illustrative mock data
        </p>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setSidebar(false)} />
          <aside className="animate-fade-up absolute inset-y-0 left-0 flex w-64 flex-col bg-navy">
            <ShellHeader onClose={() => setSidebar(false)} />
            <NavLinks role={role} onNavigate={() => setSidebar(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
