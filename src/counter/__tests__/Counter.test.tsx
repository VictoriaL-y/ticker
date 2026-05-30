import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CounterProvider } from "@/counter/counter-context";
import { Counter } from "@/counter/Counter";

function renderCounter() {
  return render(
    <CounterProvider>
      <Counter />
    </CounterProvider>,
  );
}

describe("Counter", () => {
  it("shows the current count, starting at 0", () => {
    renderCounter();
    expect(screen.getByText(/current count/i)).toHaveTextContent(
      "Current count 0",
    );
  });

  it("increments when the +1 button is pressed", async () => {
    const user = userEvent.setup();
    renderCounter();

    await user.click(screen.getByRole("button", { name: "+1" }));

    expect(screen.getByText(/current count/i)).toHaveTextContent(
      "Current count 1",
    );
  });

  it("accumulates across multiple presses", async () => {
    const user = userEvent.setup();
    renderCounter();
    const button = screen.getByRole("button", { name: "+1" });

    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(screen.getByText(/current count/i)).toHaveTextContent(
      "Current count 3",
    );
  });
});
