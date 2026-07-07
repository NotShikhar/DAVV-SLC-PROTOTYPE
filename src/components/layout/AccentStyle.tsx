"use client";

import { useEffect } from "react";
import { ACCENTS, useSettings } from "@/store/settings";

/**
 * Applies the admin-configured accent colour by overriding the `--color-gold`
 * design tokens at runtime — so every `*-gold` utility across the app updates
 * live. Renders nothing.
 */
export function AccentStyle() {
  const accent = useSettings((s) => s.accent);
  useEffect(() => {
    const a = ACCENTS[accent] ?? ACCENTS.gold;
    const root = document.documentElement;
    root.style.setProperty("--color-gold", a.hex);
    root.style.setProperty("--color-gold-600", a.hex600);
  }, [accent]);
  return null;
}
