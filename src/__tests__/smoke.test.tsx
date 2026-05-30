import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// Proves the harness is wired end-to-end: Vitest + jsdom + RTL + jest-dom matchers.
describe("test harness", () => {
  it("renders a component and asserts with jest-dom", () => {
    render(<h1>ticker</h1>);
    expect(screen.getByRole("heading", { name: "ticker" })).toBeInTheDocument();
  });
});
