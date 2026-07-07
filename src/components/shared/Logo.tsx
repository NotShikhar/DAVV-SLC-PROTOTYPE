import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/** The real DAVV crest (colored, works on any background). */
export function Crest({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/davv-crest.png"
      alt=""
      aria-hidden
      width={200}
      height={200}
      className={cn("object-contain", className)}
    />
  );
}

/**
 * The full official IET lockup (crest + name + accreditations, white lettering).
 * It's a very wide image — only use it where there's horizontal room (the login
 * hero, wide footers). Size it with a height class, e.g. `className="h-14 w-auto"`.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/iet-logo.png"
      alt="IET DAVV — Institute of Engineering & Technology, Devi Ahilya Vishwavidyalaya, Indore"
      width={1911}
      height={268}
      className={cn("w-auto", className)}
    />
  );
}

type LogoSize = "sm" | "md" | "lg";

const CREST_SIZE: Record<LogoSize, string> = { sm: "size-8", md: "size-10", lg: "size-12" };
const TITLE_SIZE: Record<LogoSize, string> = { sm: "text-sm", md: "text-lg", lg: "text-xl" };

interface LogoProps {
  showText?: boolean;
  onDark?: boolean;
  size?: LogoSize;
  className?: string;
}

/** Stacked brand lockup (crest + wordmark) — the default, fits narrow rails. */
export function Logo({ showText = true, onDark = false, size = "md", className }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className={cn("grid shrink-0 place-items-center rounded-xl p-1.5", onDark ? "bg-white/10" : "bg-navy/5")}>
        <Crest className={CREST_SIZE[size]} />
      </span>
      {showText && (
        <span className="leading-tight">
          <span className={cn("block font-heading font-bold", TITLE_SIZE[size], onDark ? "text-white" : "text-navy")}>
            IET DAVV
          </span>
          <span className={cn("block text-[11px]", onDark ? "text-white/70" : "text-muted")}>
            Student Lifecycle Portal
          </span>
        </span>
      )}
    </span>
  );
}
