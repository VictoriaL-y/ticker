"use client";

import { useCounter } from "./use-counter";
import { useCounterToast } from "@/toast/use-counter-toast";
import { formatCount } from "@/lib/format";
import styles from "./Counter.module.css";

export function Counter() {
  const { count, increment } = useCounter();
  useCounterToast(count);

  // The toast is the single, intentional screen-reader announcement for count
  // changes, so the on-page value is a plain <span> (not an aria-live region),
  // which avoids announcing the same number twice.
  return (
    <section className={styles.counter}>
      <p className={styles.status}>
        Current count <span className={styles.value}>{formatCount(count)}</span>
      </p>
      <button type="button" className={styles.button} onClick={increment}>
        +1
      </button>
    </section>
  );
}
