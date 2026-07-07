"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after the component has mounted on the client. Used to gate
 * persisted-store reads so the static (prerendered) markup matches the first
 * client render and avoids hydration mismatches. Implemented with
 * useSyncExternalStore (server snapshot = false, client snapshot = true) to
 * avoid a setState-in-effect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
