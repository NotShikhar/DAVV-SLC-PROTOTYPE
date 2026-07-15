"use client";

import { useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";

/**
 * Spring-driven count-up for stat values. Adapted from Cult UI's
 * `animated-number` (cult-ui.com); inherits font and colour from its parent
 * so it can sit inside StatCard's Playfair value slot.
 */
interface AnimatedNumberProps {
  value: number;
  /** Formats every animation frame, so it must accept fractional values. */
  format?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  format = (n) => Math.round(n).toLocaleString("en-IN"),
  className,
}: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => format(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  if (reduceMotion) return <span className={className}>{format(value)}</span>;
  return (
    <motion.span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}
    </motion.span>
  );
}
