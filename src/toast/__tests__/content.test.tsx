import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ToastContent } from "@/toast/ToastContent";

describe("ToastContent", () => {
  it("renders the title and the count subtitle inside a status region", () => {
    render(<ToastContent count={3} />);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Incremented");
    expect(status).toHaveTextContent("Counter is now 3");
  });

  it("renders a decorative icon that is hidden from assistive tech", () => {
    // The text carries the meaning, so the check-ring is purely decorative.
    const { container } = render(<ToastContent count={3} />);

    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });
});
