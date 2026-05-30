import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { CounterProvider } from "@/counter/counter-context";
import { useCounter } from "@/counter/use-counter";

describe("CounterProvider", () => {
  it("starts at 0 and increments by one", () => {
    const { result } = renderHook(() => useCounter(), {
      wrapper: CounterProvider,
    });

    expect(result.current.count).toBe(0);

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("accumulates across multiple increments", () => {
    const { result } = renderHook(() => useCounter(), {
      wrapper: CounterProvider,
    });

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(3);
  });
});
