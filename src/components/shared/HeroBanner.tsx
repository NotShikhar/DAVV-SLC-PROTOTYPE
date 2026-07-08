import type { ReactNode } from "react";
import { Crest } from "@/components/shared/Logo";
import { cn } from "@/lib/utils/cn";

type Scrim = "left" | "bottom" | "full";

const GRADIENTS: Record<Scrim, string> = {
  left: "linear-gradient(88deg, rgba(10,23,40,0.96) 0%, rgba(13,29,50,0.86) 46%, rgba(16,35,60,0.35) 100%)",
  bottom: "linear-gradient(180deg, rgba(10,23,40,0.55) 0%, rgba(10,23,40,0.84) 52%, rgba(10,23,40,0.97) 100%)",
  full: "linear-gradient(180deg, rgba(10,23,40,0.90) 0%, rgba(10,23,40,0.90) 100%)",
};

interface HeroBannerProps {
  /** Background photo (decorative — set via CSS so text carries all meaning). */
  image?: string;
  scrim?: Scrim;
  rounded?: boolean;
  /** Oversized crest watermark, bottom-right. */
  watermark?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * A campus-photo banner with a navy gradient scrim so overlaid text always
 * meets contrast, a gold inner hairline, and an optional crest watermark —
 * the "Heritage Regal" hero treatment.
 */
export function HeroBanner({
  image = "/campus/block.jpg",
  scrim = "left",
  rounded = true,
  watermark = true,
  className,
  children,
}: HeroBannerProps) {
  return (
    <section
      className={cn(
        "bg-navy relative overflow-hidden bg-cover bg-center text-white",
        "shadow-[inset_0_0_0_1px_rgba(226,184,119,0.35)]",
        rounded && "rounded-card",
        className,
      )}
      style={{ backgroundImage: `${GRADIENTS[scrim]}, url(${image})` }}
    >
      {watermark && (
        <Crest className="pointer-events-none absolute -right-6 -bottom-10 size-56 opacity-[0.10] [filter:grayscale(1)_brightness(2)] select-none" />
      )}
      <div className="relative">{children}</div>
    </section>
  );
}
