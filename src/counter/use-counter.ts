"use client";

import { useContext } from "react";
import { CounterContext, type CounterValue } from "./counter-context";

/**
 * Access the counter state. Throws a helpful error when called outside a
 * `CounterProvider`, turning a subtle runtime bug into an obvious one.
 */
export function useCounter(): CounterValue {
  const value = useContext(CounterContext);
  if (value === undefined) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return value;
}
