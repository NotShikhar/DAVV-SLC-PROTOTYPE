"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import type { Role } from "@/types";
import { useSession } from "@/store/session";
import { useUi } from "@/store/ui";
import { useDemo } from "@/store/demo";
import { useSettings } from "@/store/settings";
import { useTranslation, type Locale } from "@/lib/i18n";
import { toRoman, semesterParity } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/Avatar";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { cn } from "@/lib/utils/cn";

interface TopbarProps {
  role: Role;
  name: string;
  meta: string;
  color: string;
}

function LanguageToggle() {
  const locale = useUi((s) => s.locale);
  const setLocale = useUi((s) => s.setLocale);
  const options: Locale[] = ["en", "hi"];
  return (
    <div
      className="rounded-btn border-field hidden items-center border p-0.5 sm:flex"
      role="group"
      aria-label="Language"
    >
      {options.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold transition-colors",
            locale === l ? "bg-navy text-gold-bright" : "text-muted hover:text-navy",
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Topbar({ role, name, meta, color }: TopbarProps) {
  const router = useRouter();
  const toggleSidebar = useUi((s) => s.toggleSidebar);
  const logout = useSession((s) => s.logout);
  const unread = useDemo((s) => s.notifications.filter((n) => !n.read).length);
  const session = useSettings((s) => s.session);
  const sem = useSettings((s) => s.currentSemester);
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const signOut = () => {
    logout();
    router.replace("/login");
  };

  return (
    <header className="bg-cream/[0.92] sticky top-0 z-30 border-b border-[#e5d9c3] backdrop-blur-[8px]">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open menu"
            className="text-slate hover:bg-cream-deep hover:text-navy rounded-lg p-2 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-heading text-navy text-sm font-semibold sm:hidden">
            IET DAVV · SLC
          </span>
          <p className="font-serif-accent text-soft hidden text-sm md:block">
            {semesterParity(sem)} Semester · {session} · Sem {toRoman(sem)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />

          {role === "student" && (
            <Link
              href="/notifications"
              aria-label={`${t("nav.notifications")}${unread ? `, ${unread} unread` : ""}`}
              className="text-slate hover:bg-cream-deep hover:text-navy relative rounded-lg p-2"
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <StatusIndicator tone="danger" count={unread} className="absolute top-1 right-1" />
              )}
            </Link>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="hover:bg-cream-deep flex items-center gap-2 rounded-lg p-1 pr-2"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <Avatar name={name} color={color} size="sm" ring />
              <span className="hidden text-left leading-tight sm:block">
                <span className="text-navy block text-sm font-semibold">{name}</span>
                <span className="text-muted block text-xs">{meta}</span>
              </span>
              <ChevronDown className="text-muted size-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="rounded-card border-line bg-surface shadow-pop absolute right-0 z-20 mt-2 w-52 border p-1">
                  <div className="text-muted px-3 py-2 text-xs">
                    Signed in as
                    <span className="text-navy mt-0.5 block font-medium">{name}</span>
                    <span className="block">{t(`roles.${role}`)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={signOut}
                    className="text-danger hover:bg-danger-bg flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    <LogOut className="size-4" />
                    {t("common.logout")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
