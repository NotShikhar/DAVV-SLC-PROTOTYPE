import { cn } from "@/lib/utils/cn";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

interface AvatarProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  /** Antique-gold ring (used on the top bar). */
  ring?: boolean;
  className?: string;
}

const SIZES = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
};

/** Initials avatar — no external images (keeps the build fully static). */
export function Avatar({ name, color = "#10233c", size = "md", ring, className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full font-mono font-semibold text-white",
        ring && "ring-[1.5px] ring-gold ring-offset-1 ring-offset-transparent",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
