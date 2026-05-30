"use client";

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CounterValue {
  count: number;
  increment: () => void;
}

/**
 * Default is `undefined` (not a zero-value object) so `useCounter` can detect
 * a missing provider and fail loudly instead of silently returning a no-op.
 */
export const CounterContext = createContext<CounterValue | undefined>(
  undefined,
);

export function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount((current) => current + 1), []);
  const value = useMemo<CounterValue>(
    () => ({ count, increment }),
    [count, increment],
  );

  return (
    <CounterContext.Provider value={value}>{children}</CounterContext.Provider>
  );
}
