import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md";

const VARIANTS: Record<ButtonVariant, string> = {
  // The after:* stack is a shimmer sweep (adapted from Watermelon UI's
  // shimmer-button): a translucent sheen crosses the gold fill on hover.
  primary:
    "bg-gold text-navy font-bold shadow-[0_3px_10px_rgba(201,151,75,0.30)] hover:bg-gold-bright " +
    "relative overflow-hidden after:absolute after:inset-0 after:-translate-x-full " +
    "after:bg-linear-to-r after:from-transparent after:via-white/30 after:to-transparent " +
    "after:transition-transform after:duration-700 hover:after:translate-x-full",
  secondary: "border border-gold text-navy bg-transparent hover:bg-gold-100",
  ghost: "text-navy hover:bg-cream-deep",
  danger: "bg-danger text-white hover:opacity-90",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

/** Shared class string so <Link> can look like a button too. */
export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
): string {
  return cn(
    "inline-flex items-center justify-center rounded-btn font-semibold",
    "transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, cn(fullWidth && "w-full", className))}
      {...props}
    >
      {children}
    </button>
  );
}
