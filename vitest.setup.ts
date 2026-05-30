import "@testing-library/jest-dom/vitest";
import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import * as axeMatchers from "vitest-axe/matchers";

// Accessibility matchers (toHaveNoViolations) — exercised from PR5 onward.
expect.extend(axeMatchers);

// RTL doesn't auto-clean without globals; unmount between tests.
afterEach(() => {
  cleanup();
});
