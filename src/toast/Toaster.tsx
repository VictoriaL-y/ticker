"use client";

import {
  Toaster as ChakraToaster,
  Portal,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react";

/**
 * The toast store — a module singleton so the count-driven hook
 * (`useCounterToast`) and the rendered `<Toaster />` share one queue.
 * `bottom-end` matches the screenshot's placement; `pauseOnPageIdle` keeps
 * the timer from burning down while the tab is in the background.
 */
export const toaster = createToaster({
  placement: "bottom-end",
  pauseOnPageIdle: true,
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

/**
 * Renders the live toast region. The content here is intentionally plain — the
 * pixel-matched card (gradient border, check-ring icon, exact type) arrives in
 * a later pass; this PR is about correct delivery.
 */
export function Toaster() {
  return (
    <Portal>
      <ChakraToaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Stack gap="1" flex="1">
              <Toast.Title>Incremented</Toast.Title>
              <Toast.Description>
                Counter is now {readCount(toast.meta)}
              </Toast.Description>
            </Stack>
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
}
