import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Providers } from "@/app/providers";
import { Toaster } from "@/toast/Toaster";

describe("Toaster SSR", () => {
  it("is not server-rendered — it's client-only, so no empty live-region ships in the HTML", () => {
    // A toast only exists after a client interaction, so the toaster has nothing
    // to contribute to the server HTML. Rendering it client-side only keeps an
    // empty live-region out of the SSR payload.
    const html = renderToString(
      <Providers>
        <Toaster />
      </Providers>,
    );

    expect(html).not.toContain("toast-group");
  });
});
