import { CheckRing } from "./CheckRing";
import { formatCount } from "@/lib/format";
import styles from "./ToastContent.module.css";

/**
 * The toast's appearance, isolated from its delivery. Pure and presentational —
 * no Chakra, no toaster — so it renders identically in Storybook and in tests,
 * and the pixel work lives in one reviewable place (`ToastContent.module.css`).
 */
export function ToastContent({ count }: { count: number }) {
  return (
    <div className={styles.toast} role="status">
      <CheckRing className={styles.icon} />
      <div className={styles.text}>
        <div className={styles.title}>Incremented</div>
        <div className={styles.subtitle}>
          Counter is now {formatCount(count)}
        </div>
      </div>
    </div>
  );
}
