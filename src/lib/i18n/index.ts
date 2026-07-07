"use client";

import { useUi } from "@/store/ui";
import { en, type Dictionary } from "./en";

export type Locale = "en" | "hi";

/** Locale → dictionary. Hindi can be added here without touching components. */
const dictionaries: Record<Locale, Dictionary> = {
  en,
  hi: en, // placeholder — Hindi strings drop in here later
};

function resolve(dict: Dictionary, key: string): string | undefined {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, dict) as string | undefined;
}

/**
 * Translation hook. `t("nav.dashboard")` resolves against the active locale,
 * falling back to English, then to the key itself.
 */
export function useTranslation() {
  const locale = useUi((s) => s.locale);
  const dict = dictionaries[locale] ?? dictionaries.en;
  const t = (key: string): string => resolve(dict, key) ?? resolve(dictionaries.en, key) ?? key;
  return { t, locale };
}
