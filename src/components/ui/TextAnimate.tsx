"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils/cn";

interface TextAnimateProps {
  text: string;
  /** Seconds before the line rises. */
  delay?: number;
  className?: string;
}

/**
 * Soft blur-fade entrance for display headings — the whole line rises a few
 * pixels while sharpening into focus. Simplified from Cult UI's `text-animate`
 * family (cult-ui.com): one calm movement instead of a per-word stagger.
 * Renders as a span so it inherits the parent heading's type.
 */
export function TextAnimate({ text, delay = 0.1, className }: TextAnimateProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <span className={className}>{text}</span>;

  return (
    <motion.span
      className={cn("inline-block", className)}
      initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {text}
    </motion.span>
  );
}
