import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Scrim = "left" | "bottom" | "full";

const GRADIENTS: Record<Scrim, string> = {
  left: "linear-gradient(90deg, rgba(13,31,52,0.95) 0%, rgba(13,31,52,0.82) 42%, rgba(13,31,52,0.40) 100%)",
  bottom: "linear-gradient(180deg, rgba(13,31,52,0.60) 0%, rgba(13,31,52,0.82) 50%, rgba(13,31,52,0.97) 100%)",
  full: "linear-gradient(180deg, rgba(13,31,52,0.88) 0%, rgba(13,31,52,0.88) 100%)",
};

interface HeroBannerProps {
  /** Background photo (decorative — set via CSS so text carries all meaning). */
  image?: string;
  scrim?: Scrim;
  rounded?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * A campus-photo banner with a navy gradient scrim so overlaid text always
 * meets contrast. The image is a CSS background (decorative), so no <img> alt
 * is needed and the layout can't shift.
 */
export function HeroBanner({
  image = "/campus/block.jpg",
  scrim = "left",
  rounded = true,
  className,
  children,
}: HeroBannerProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-navy bg-cover bg-center text-white",
        rounded && "rounded-card",
        className,
      )}
      style={{ backgroundImage: `${GRADIENTS[scrim]}, url(${image})` }}
    >
      {children}
    </section>
  );
}
