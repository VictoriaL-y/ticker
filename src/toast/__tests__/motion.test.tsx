import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToastContent } from "@/toast/ToastContent";
import styles from "@/toast/ToastContent.module.css";

// CSS-module class names type as `string | undefined` under
// noUncheckedIndexedAccess; this one provably exists, so narrow it once.
const flourishClass = styles.flourish;
if (!flourishClass) {
  throw new Error("ToastContent.module.css is missing the .flourish class");
}

// ToastContent reads prefers-reduced-motion to decide whether the number gets a
// flourish on change, so each test installs a matchMedia and restores it after.
function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ToastContent count-change flourish", () => {
  it("flourishes the count when motion is allowed", () => {
    stubMatchMedia(false);

    render(<ToastContent count={3} />);

    expect(screen.getByText("3")).toHaveClass(flourishClass);
  });

  it("does not flourish the count under prefers-reduced-motion", () => {
    stubMatchMedia(true);

    render(<ToastContent count={3} />);

    expect(screen.getByText("3")).not.toHaveClass(flourishClass);
  });
});
