"use client";

import { CheckRing } from "./CheckRing";
import { formatCount } from "@/lib/format";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";
import styles from "./ToastContent.module.css";

/**
 * The toast's appearance, isolated from its delivery — no Chakra, no toaster, so
 * it still renders in Storybook and unit tests. It reads prefers-reduced-motion
 * (via a self-contained, SSR-safe hook) only to decide whether the count
 * flourishes on change; the pixel work lives in `ToastContent.module.css`.
 */
export function ToastContent({ count }: { count: number }) {
  const reducedMotion = usePrefersReducedMotion();

  // Keying the number on `count` re-mounts it on every change, which replays the
  // flourish keyframe; under reduced motion we drop the class so it just swaps.
  // Filtering keeps an unset CSS-module class (typed `string | undefined`) from
  // ever interpolating the literal "undefined" into className.
  const valueClassName = [styles.value, reducedMotion ? null : styles.flourish]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.toast} role="status">
      <CheckRing className={styles.icon} />
      <div className={styles.text}>
        <div className={styles.title}>Incremented</div>
        <div className={styles.subtitle}>
          Counter is now{" "}
          <span key={count} className={valueClassName}>
            {formatCount(count)}
          </span>
        </div>
      </div>
    </div>
  );
}
