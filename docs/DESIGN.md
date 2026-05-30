# ticker — Design

> A counter that earns its toast.
>
> The feature is deliberately small; the bar is not. This document records the
> design decisions and *why* they were made. The step-by-step execution sequence
> lives in [PLAN.md](./PLAN.md).

## 1. Problem & framing

The brief asks for three things: a `Counter` (+1) component, a global
`CounterContext` / `CounterProvider` with a `useCounter()` hook, and a Chakra UI
toast on every click that matches a provided screenshot "as closely as possible —
details matter."

A competent engineer prompts this in twenty minutes. The actual assignment is
everything around the feature: animation, focus states, types, edge cases, the
README, and the commit history. So that is what this design optimizes for. Depth
on a tiny core, not breadth.

## 2. Goals & non-goals

**Goals**
- A toast that is *pixel-faithful* to the screenshot, including the rounded
  gradient border most implementations get wrong.
- Interaction that feels considered: motion that respects `prefers-reduced-motion`,
  keyboard parity, and a screen-reader announcement of the new count.
- Types that make misuse hard: `strict` everywhere, zero `any`, a hook that fails
  loudly outside its provider.
- A commit/PR history a senior engineer would be happy to sign.
- `npm install && npm run dev` works on a clean checkout, first try.

**Non-goals (chosen restraint — restraint is part of the grade)**
- No decrement / reset / multi-counter. The brief asks for `+1`; extra buttons add
  surface, not delight.
- No state-management library for a single integer. React context is the right size.
- No theme toggle. One considered theme beats a switch nobody asked for.
- No premature abstraction. Every indirection has to earn itself.

## 3. Stack & why

`Next.js (App Router)` · `TypeScript (strict)` · `React` · `Chakra UI v3` ·
`Emotion` · `Vitest + React Testing Library + jest-axe` · `Storybook` ·
`ESLint / Prettier` · `husky / lint-staged` · `GitHub Actions` · `Vercel`.

Yendou's stack is TypeScript · React · **Next.js** · PostgreSQL. Building in exactly
that — App Router, server/client boundaries, first-party Vercel deploy — is the
strongest signal available, and the Chakra-in-Next provider wiring is itself a small
piece of craft worth showing. Vite would be marginally simpler for a pure client
counter, but it trades away the stack-match for little.

The toast uses **Chakra's** `createToaster` as the delivery mechanism (queue,
placement, timing, dismissal) per the brief's hint, with **fully custom content**
rendered inside it so the visual is ours to the pixel. Best of both: their library,
our design.

## 4. Architecture

Six small units, each with one job and a clear interface. The boundary that matters
most is between *what the toast looks like* and *how it is delivered* — they are
different concerns with different failure modes, so they are different modules.

| Unit | Responsibility | Depends on |
|---|---|---|
| `CounterProvider` / `CounterContext` | Own `{ count, increment }`. Context default is `undefined`. | React |
| `useCounter()` | Read the context; **throw a typed, helpful error** if used outside the provider. | `CounterContext` |
| `Counter` | Render the formatted count and the `+1` button. The only interactive element. | `useCounter`, `useCounterToast` |
| `ToastContent` | **Pure presentational.** Given `{ count }`, render the pixel-perfect card. No Chakra, no toaster — so it is trivially Storybook-able and unit-testable. | CSS module, icon |
| `Toaster` | Wire `createToaster` and render `ToastContent` per toast. | Chakra, `ToastContent` |
| `useCounterToast()` | The single-updating-toast logic: stable id, create-or-update, timer reset, `aria-live`. | `Toaster` |

**Data flow.** Incrementing is *count-driven*: the toast reflects the latest count
rather than being fired imperatively from one specific handler. This keeps it
declarative and correct regardless of how the increment was triggered (mouse,
`Enter`, or `Space`).

Module map:

```
src/
  app/
    layout.tsx          # Inter via next/font; <Providers>, <Toaster>
    page.tsx            # centered Counter
    providers.tsx       # 'use client' — ChakraProvider + custom system (one theme)
  counter/
    counter-context.tsx # CounterContext + CounterProvider  ('use client')
    use-counter.ts      # guarded hook
    Counter.tsx
  toast/
    ToastContent.tsx        # pure presentational
    ToastContent.module.css # gradient-border mask, wash, shadow
    CheckRing.tsx           # hand-tuned SVG icon
    Toaster.tsx             # createToaster + custom render  ('use client')
    use-counter-toast.ts    # single-updating-toast logic
  lib/
    format.ts                    # Intl.NumberFormat helper
    use-prefers-reduced-motion.ts
```

## 5. The toast — pixel-match plan

The screenshot is the source of truth; the Figma CSS is a starting point that
"will not exactly match," so values are tuned by eye against the image.

- **Rounded gradient border — the trap.** `border-image` does *not* respect
  `border-radius`, so the naïve Figma export gives square corners on a rounded card.
  The fix is a `::before` pseudo-element at `inset: 0` with `padding: 1px`,
  `border-radius: inherit`, the linear+radial gradient as its background, and
  `mask` + `mask-composite: exclude` (with the `-webkit-` prefix for Safari) to
  punch out the interior — leaving a 1px rounded gradient hairline. This lives in a
  **CSS module**: pseudo-elements and mask compositing are far clearer there than in
  JS style props, and it keeps the gnarly bit reviewable in one place.
- **Surface.** Green radial wash (`rgba(116,200,152,…)`) over `#46474F`, the exact
  five-layer `box-shadow`, `8px` radius, and the asymmetric `12/20/12/16` padding so
  the icon hugs the left edge.
- **Type.** **Inter via `next/font`** — self-hosted by Next, so it renders correctly
  without relying on the font being installed and with no layout-shift flash.
  `tabular-nums` on the count so digits don't jitter as the number changes.
- **Hierarchy.** The Figma export gives one text style; the screenshot clearly shows
  two. We build the two-line hierarchy the screenshot shows: a bold white
  **"Incremented"** title over a lighter **"Counter is now N"** subtitle.
- **Icon.** A hand-tuned inline SVG — a thin green ring with a check, matched to the
  screenshot's stroke weight — not an icon-font glyph.

## 6. Interaction & motion

All motion is gated behind `prefers-reduced-motion`; the reduced path is an instant,
non-animated equivalent everywhere.

- **Single updating toast.** Rapid clicks update one stable toast to the latest count
  and reset its ~3.5s dismiss timer. It enter-animates *once*; subsequent clicks only
  update content. This is both more correct (the latest value supersedes the rest)
  and free of pile-up. The chosen behavior over a stack, justified.
- **Enter / exit.** Slide-up + fade + a slight scale (~220ms), driven off Chakra's
  `data-state` so exit animates too.
- **Count change.** A crisp, restrained number transition — not a slot-machine roll.
- **Button.** `active:scale(.97)` press feel, a subtle hover, and a 2px green
  `:focus-visible` ring that appears for keyboard users only.
- **Milestone flourish.** A barely-there green pulse on every tenth count. Tasteful
  by design; reduced-motion removes it entirely.

## 7. Accessibility

- The toast is announced via `role="status"` / `aria-live="polite"`, so screen-reader
  users hear "Counter is now N" without the toast stealing focus.
- Full keyboard operability, a logical focus order, a visible focus-visible ring, and
  sufficient contrast on the dark surface.
- **jest-axe** assertions on `ToastContent` and the page turn accessibility into a
  test, not a claim.

## 8. Types & edge cases

- `strict` + `noUncheckedIndexedAccess`, zero `any`, a fully typed context value, and
  a `useCounter()` that throws a helpful typed error when used outside its provider.
- **Large numbers** are formatted with `Intl.NumberFormat` (grouping separators).
  `Number.MAX_SAFE_INTEGER` is unreachable by clicking, so we format rather than cap,
  and say so rather than over-engineer a guard.
- **SSR safety:** correct `'use client'` boundaries, no `window` access during render,
  and an SSR-guarded reduced-motion hook.
- **Auto-dismiss** with pause-on-hover.

## 9. Testing strategy

Behavior over snapshots. Vitest + RTL + jsdom:

- `useCounter()` throws outside the provider (asserts the message).
- The provider starts at `0`; `increment` increments.
- `Counter` renders "Current count 0" and accumulates across clicks.
- A click shows a toast with the correct new value and a polite live region.
- **Spam:** five rapid clicks leave exactly **one** toast, showing the latest value.
- Large values are formatted with separators.
- `ToastContent` renders the title, subtitle, and icon with the right roles.
- jest-axe reports no violations.

## 10. Tooling, CI & Storybook

- ESLint (Next + TS-strict) and Prettier, enforced pre-commit by husky + lint-staged
  so unformatted or failing code can't be committed.
- **GitHub Actions CI:** typecheck → lint → format-check → test → `next build`. Set up
  in the bootstrap so *every* feature PR runs green; a status badge sits in the README.
- A small **Storybook** story for `ToastContent` (count = 3, and a large number). It
  also enforces the presentational boundary — if the toast needs Chakra to render, the
  boundary is wrong.

## 11. Workflow

The history is part of the deliverable, so the process is deliberate:

1. A small, atomic **bootstrap** lands on `main`: scaffold, tooling, CI, the Chakra
   provider, Inter, and these docs.
2. `main` is then **protected** — pull requests required, CI must pass.
3. Each piece of the work ships as its own **small PR** (~10 total), reviewed on
   GitHub before merge.

That trail — AI-authored PRs, green checks, and a human review on every one — is the
literal embodiment of Yendou's "AI writes code, humans write great code." The human
contribution is the orchestration, the architecture, the taste, the curation of
scope, and the review gate.

## 12. Deploy

Vercel, with the live URL at the very top of the README so the work can be evaluated
without cloning. Connecting the repo to Vercel is a one-time interactive step.

## 13. Risks & open verifications

Verified during execution, not assumed:

- Whether Chakra v3's `toaster.update` resets the dismiss timer, or whether a
  dismiss-and-recreate is needed to restart the clock.
- Pause-on-hover support in v3 (vs. only `pauseOnPageIdle`).
- The mask-composite border across browsers, Safari especially (`-webkit-` prefix).
- GIF capture on macOS for the README (a crisp screenshot is the fallback).

## 14. Definition of done

- [ ] Counter, `CounterContext` / `CounterProvider`, and `useCounter()` per spec.
- [ ] Toast fires with the correct value and is pixel-matched: rounded gradient
      border, green wash, exact shadow, Inter, two-line hierarchy, check-ring icon.
- [ ] Animation (enter/exit + count change) with `prefers-reduced-motion` support.
- [ ] `:focus-visible` + full keyboard + `aria-live` announcement.
- [ ] Strict TypeScript, zero `any`, provider-missing guard.
- [ ] Edge cases: spam clicks, large numbers, auto-dismiss.
- [ ] Tests pass; ESLint/Prettier clean; CI green.
- [ ] Public repo with an atomic, conventional, story-telling history.
- [ ] README: live link, run steps, GIF, decisions, trade-offs, "beyond AI."
- [ ] Live deploy linked at the top of the README.
- [ ] Every line is understood and defensible.
