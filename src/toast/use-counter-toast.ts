"use client";

import { useEffect, useRef } from "react";
import { toaster } from "./Toaster";

const TOAST_ID = "counter";

/**
 * Shows a single, self-updating toast whenever `count` changes.
 *
 * A stable id makes the store upsert in place — one toast that always reflects
 * the latest count, never a pile-up (verified against @zag-js/toast: a same-id
 * `create` merges and re-publishes rather than appending).
 *
 * We compare against the previously-seen value rather than a "have I mounted?"
 * boolean, so the initial count never toasts. The subtle reason is StrictMode:
 * it double-invokes the mount effect in development, and a boolean flag flips
 * on the first invoke and then fires a spurious count-0 toast on the second.
 * Comparing values is immune — the ref only advances on a real change.
 */
export function useCounterToast(count: number): void {
  const previousCount = useRef(count);

  useEffect(() => {
    if (count === previousCount.current) return;
    previousCount.current = count;

    toaster.create({
      id: TOAST_ID,
      type: "success",
      duration: 3500,
      meta: { count },
    });
  }, [count]);
}
