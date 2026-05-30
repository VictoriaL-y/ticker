import { StrictMode } from "react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Providers } from "@/app/providers";
import { CounterProvider } from "@/counter/counter-context";
import { Counter } from "@/counter/Counter";
import { Toaster, toaster } from "@/toast/Toaster";

// The toaster store is a module-level singleton, so a toast created in one test
// would otherwise linger into the next. Clear it after each.
afterEach(() => {
  toaster.remove();
});

function renderApp() {
  return render(
    <Providers>
      <CounterProvider>
        <Counter />
        <Toaster />
      </CounterProvider>
    </Providers>,
  );
}

describe("toast delivery on increment", () => {
  it("shows a toast with the new count when +1 is pressed", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "+1" }));

    expect(await screen.findByText(/counter is now 1/i)).toBeInTheDocument();
  });

  it("does not toast on the initial render, even under StrictMode", () => {
    const createSpy = vi.spyOn(toaster, "create");

    // StrictMode double-invokes the mount effect in development. A naive
    // "have I mounted?" boolean flips on the first invoke and then fires a
    // spurious count-0 toast on the second; this asserts we don't.
    render(
      <StrictMode>
        <Providers>
          <CounterProvider>
            <Counter />
            <Toaster />
          </CounterProvider>
        </Providers>
      </StrictMode>,
    );

    expect(createSpy).not.toHaveBeenCalled();
  });
});
