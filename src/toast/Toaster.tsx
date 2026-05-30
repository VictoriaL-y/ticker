"use client";

import { useSyncExternalStore } from "react";
import {
  Toaster as ChakraToaster,
  Portal,
  Toast,
  createToaster,
} from "@chakra-ui/react";
import { ToastContent } from "./ToastContent";
import styles from "./Toaster.module.css";

/**
 * The toast store — a module singleton so the count-driven hook
 * (`useCounterToast`) and the rendered `<Toaster />` share one queue.
 * `bottom-end` matches the screenshot's placement; `pauseOnPageIdle` keeps
 * the timer from burning down while the tab is in the background.
 *
 * `removeDelay` is how long a dismissing toast stays mounted (as
 * `data-state="closed"`) before removal — the window the exit animation plays
 * in. Bumped past the 200ms default for a slightly more graceful exit; the
 * exit keyframe derives its duration from this same value (via the machine's
 * `--remove-delay` var) so the two can't drift apart (see Toaster.module.css).
 */
export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
  removeDelay: 220,
});

/**
 * The count rides along in the toast's `meta` (Chakra types it as
 * `Record<string, any>`), so read it back through a guard — nothing untyped
 * leaks into our render, and a malformed toast degrades to 0 rather than NaN.
 */
function readCount(meta: Record<string, unknown> | undefined): number {
  const value = meta?.count;
  return typeof value === "number" ? value : 0;
}

// Reads `false` on the server and during the first client (hydration) render,
// then `true` — the SSR-safe way to detect hydration without a set-state-in-
// effect (the same primitive Chakra's own Portal uses internally).
const noopSubscribe = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

/**
 * Renders the live toast region, delegating each toast's appearance to the pure
 * <ToastContent> card so delivery and design stay separate concerns.
 */
export function Toaster() {
  // A toast only ever exists after a client interaction, so the toaster has
  // nothing to contribute to the server HTML — rendering it there would just
  // emit an empty live-region to hydrate and leave idle. Gate it to the client.
  // (As a bonus this is robust to any SSR quirk in Chakra's <Portal>, which
  // renders inline on the server but portals to <body> on the client.)
  if (!useHydrated()) return null;

  return (
    <Portal>
      <ChakraToaster toaster={toaster}>
        {/* `unstyled` strips Chakra's default toast skin so ToastContent is the
            only card; Toast.Root stays the positioned, data-state-driven wrapper
            the machine needs. The motion class animates enter/exit off that
            data-state (see Toaster.module.css). */}
        {(toast) => (
          <Toast.Root unstyled className={styles.root}>
            <ToastContent count={readCount(toast.meta)} />
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
}
