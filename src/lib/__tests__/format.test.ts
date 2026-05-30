import { describe, it, expect } from "vitest";
import { formatCount } from "@/lib/format";

describe("formatCount", () => {
  it("groups large numbers with locale separators", () => {
    expect(formatCount(1234567)).toBe("1,234,567");
  });

  it("leaves small numbers unchanged", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(42)).toBe("42");
  });
});
