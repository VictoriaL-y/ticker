const formatter = new Intl.NumberFormat("en-US");

/**
 * Format a count for display with locale grouping separators (e.g. 1,234,567).
 * The count is bounded by clicks, so it never approaches MAX_SAFE_INTEGER —
 * we format rather than guard.
 */
export function formatCount(value: number): string {
  return formatter.format(value);
}
