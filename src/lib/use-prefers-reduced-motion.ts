"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// matchMedia is absent on the server and in older browsers; treat its absence as
// "no preference" (motion allowed) — the safe default that never blocks content.
function getMediaQuery(): MediaQueryList | null {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return null;
  }
  return window.matchMedia(QUERY);
}

// Defined at module scope so their identities are stable across renders —
// useSyncExternalStore re-subscribes whenever `subscribe` changes.
function subscribe(onStoreChange: () => void): () => void {
  const query = getMediaQuery();
  if (!query) return () => {};
  query.addEventListener("change", onStoreChange);
  return () => query.removeEventListener("change", onStoreChange);
}

const getSnapshot = (): boolean => getMediaQuery()?.matches ?? false;

// The server can't know the user's preference, so it renders the motion-allowed
// branch; the client re-reads on hydration. This keeps the markup deterministic.
const getServerSnapshot = (): boolean => false;

/**
 * Tracks the user's `prefers-reduced-motion` setting and re-renders when it
 * changes mid-session. SSR-safe (no `window` access during render, no
 * set-state-in-effect — the same `useSyncExternalStore` discipline the toaster's
 * hydration gate uses), so it degrades to "motion allowed" wherever matchMedia
 * is unavailable.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
