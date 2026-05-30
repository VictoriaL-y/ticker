import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCounter } from "@/counter/use-counter";

describe("useCounter", () => {
  it("throws a helpful error when used outside a CounterProvider", () => {
    expect(() => renderHook(() => useCounter())).toThrow(
      /useCounter must be used within a CounterProvider/i,
    );
  });
});
