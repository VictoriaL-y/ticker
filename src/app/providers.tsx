"use client";

import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import type { ReactNode } from "react";

/**
 * App-wide client providers. Chakra is used only to deliver the toast, so this
 * stays intentionally small: the default system, light mode, no color-mode
 * toggle (a deliberate single-theme decision — see docs/DESIGN.md).
 */
export function Providers({ children }: { children: ReactNode }) {
  return <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>;
}
