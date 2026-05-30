/**
 * A hand-tuned success glyph: a thin green ring with a check, matched to the
 * screenshot's stroke weight. Decorative — the toast text carries the meaning —
 * so it's hidden from assistive tech and removed from the tab/focus order.
 */
export function CheckRing({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="10.5" stroke="#74C898" strokeWidth="1.5" />
      <path
        d="M8 12.25 11 15.25 16.25 9"
        stroke="#74C898"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
