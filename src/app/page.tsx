"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useMounted } from "@/lib/hooks/useMounted";
import { ROLE_HOME } from "@/config/site";
import { Crest } from "@/components/shared/Logo";

/** Entry point — routes to the role home if signed in, otherwise to /login. */
export default function RootPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { role, isAuthed } = useAuth();

  useEffect(() => {
    if (!mounted) return;
    router.replace(isAuthed && role ? ROLE_HOME[role] : "/login");
  }, [mounted, isAuthed, role, router]);

  return (
    <div className="grid min-h-screen place-items-center bg-cream">
      <Crest className="size-12 animate-pulse" />
    </div>
  );
}
