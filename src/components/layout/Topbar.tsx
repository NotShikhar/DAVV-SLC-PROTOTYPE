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
      className="hidden items-center rounded-btn border border-field p-0.5 sm:flex"
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
    <header className="sticky top-0 z-30 border-b border-[#e5d9c3] bg-cream/[0.92] backdrop-blur-[8px]">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open menu"
            className="rounded-lg p-2 text-slate hover:bg-cream-deep hover:text-navy lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-heading text-sm font-semibold text-navy sm:hidden">IET DAVV · SLC</span>
          <p className="font-serif-accent hidden text-sm text-soft md:block">
            {semesterParity(sem)} Semester · {session} · Sem {toRoman(sem)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />

          {role === "student" && (
            <Link
              href="/notifications"
              aria-label={`${t("nav.notifications")}${unread ? `, ${unread} unread` : ""}`}
              className="relative rounded-lg p-2 text-slate hover:bg-cream-deep hover:text-navy"
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </Link>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-cream-deep"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <Avatar name={name} color={color} size="sm" ring />
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-semibold text-navy">{name}</span>
                <span className="block text-xs text-muted">{meta}</span>
              </span>
              <ChevronDown className="size-4 text-muted" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-52 rounded-card border border-line bg-surface p-1 shadow-pop">
                  <div className="px-3 py-2 text-xs text-muted">
                    Signed in as
                    <span className="mt-0.5 block font-medium text-navy">{name}</span>
                    <span className="block">{t(`roles.${role}`)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-danger-bg"
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
