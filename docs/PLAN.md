# ticker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline, with a human PR-review checkpoint at every PR boundary) to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A pixel-faithful, accessible, animated `+1` counter with a Chakra-delivered custom toast — built to a "great, not pretty good" bar for Yendou's SWE take-home.

**Architecture:** Next.js App Router (TS-strict). Counter state lives in a React context behind a guarded `useCounter()` hook. The toast separates *delivery* (Chakra v3 `createToaster`) from *appearance* (a pure `ToastContent` component + CSS module), so the pixel work is isolated, Storybook-able, and unit-testable. One stable, updating toast reflects the latest count.

**Tech Stack:** Next.js (App Router) · TypeScript strict · React · Chakra UI v3 · Emotion · Vitest + React Testing Library + jest-axe · Storybook · ESLint/Prettier · husky/lint-staged · GitHub Actions · Vercel.

---

## How to read this plan

**TDD loop (every code task):** write the failing test → run it, watch it fail → write the minimal code → run it, watch it pass → commit. Refactor under green when useful.

**Conventions:**
- **Commits:** Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`, `ci:`, `docs:`). Small and atomic. Every commit message ends with the `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` trailer (per Victoria's call) and the history reads as a deliberate story.
- **Branches:** `feat/<slug>`, one per PR, branched from latest `main`.
- **PR gate:** every feature PR is pushed, gets a crisp description + a self-review (superpowers code-review), runs green CI, and is then **handed to Victoria to review on GitHub before merge.** Execution PAUSES at each PR boundary.

**Phasing:**
- **Phase 0 — Bootstrap:** ~6 atomic commits **directly on `main`** (the only non-PR work, by design — it's boilerplate scaffold/config), then push + protect `main`.
- **Phase 1 — Feature PRs:** PR1–PR9, each reviewed before merge.

---

## File structure (target)

```
ticker/
├── .github/workflows/ci.yml        # typecheck · lint · format · test · build
├── .husky/pre-commit               # runs lint-staged
├── .storybook/                     # Storybook config (main.ts, preview.ts)
├── docs/
│   ├── DESIGN.md                   # ✅ committed
│   └── PLAN.md                     # this file
├── public/                         # favicon, og image
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Inter via next/font; <Providers>, <Toaster>
│   │   ├── page.tsx                # centered <Counter />
│   │   ├── providers.tsx           # 'use client' — ChakraProvider + system
│   │   └── globals.css             # reset + page surface
│   ├── counter/
│   │   ├── counter-context.tsx     # CounterContext + CounterProvider ('use client')
│   │   ├── use-counter.ts          # guarded hook (throws outside provider)
│   │   ├── Counter.tsx             # 'use client' — count + +1 button
│   │   └── __tests__/…             # context, hook, component tests
│   ├── toast/
│   │   ├── ToastContent.tsx        # pure presentational
│   │   ├── ToastContent.module.css # gradient-border mask, wash, shadow
│   │   ├── ToastContent.stories.tsx
│   │   ├── CheckRing.tsx           # hand-tuned SVG icon
│   │   ├── Toaster.tsx             # 'use client' — createToaster + custom render
│   │   ├── use-counter-toast.ts    # single-updating-toast logic
│   │   └── __tests__/…             # content, delivery, spam tests
│   └── lib/
│       ├── format.ts               # Intl.NumberFormat helper
│       └── use-prefers-reduced-motion.ts
├── vitest.config.ts
├── vitest.setup.ts                 # jest-dom + jest-axe matchers
├── tsconfig.json                   # strict + noUncheckedIndexedAccess
├── eslint.config.mjs / .prettierrc
├── next.config.ts
├── package.json
└── README.md                       # written in PR8, live link added in PR9
```

---

## Phase 0 — Bootstrap (direct on `main`)

> Already done: **B1** `docs: add design spec` (commit `1462b62`).

### B2 — `docs: add implementation plan`
- [ ] Commit this file.
```bash
git add docs/PLAN.md && git commit -m "docs: add implementation plan" \
  -m "Bootstrap arc, the ~9 reviewed feature PRs, TDD task breakdowns, the toast pixel-match sub-plan, the consolidated test list, and the verification section." \
  -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

### B3 — `chore: scaffold Next.js App Router with TypeScript`
- [ ] Scaffold into a temp dir (the repo already holds `docs/` + `.git`, which `create-next-app` won't merge into), then sync in:
```bash
npx create-next-app@latest /tmp/ticker-scaffold \
  --typescript --app --src-dir --eslint --no-tailwind \
  --import-alias "@/*" --use-npm --skip-install --yes
rsync -a --exclude='.git' /tmp/ticker-scaffold/ /Users/vikalaptev/Claude/ticker/
cd /Users/vikalaptev/Claude/ticker && npm install
```
*(Adapt flags to the current create-next-app prompts; the intent is App Router + `src/` + TS, no Tailwind.)*
- [ ] Strengthen `tsconfig.json` compiler options:
```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  }
}
```
- [ ] Trim boilerplate: replace `src/app/page.tsx` with a minimal placeholder, clean `globals.css` to a small reset + neutral page surface, drop the Next demo SVGs.
- [ ] Verify: `npm run build` and `npx tsc --noEmit` pass.
- [ ] Commit (`chore: scaffold Next.js App Router with TypeScript`).

### B4 — `feat: add Chakra UI provider and Inter font`
- [ ] Install + generate snippets:
```bash
npm i @chakra-ui/react @emotion/react
npx @chakra-ui/cli snippet add provider toaster
```
- [ ] `src/app/providers.tsx` (`'use client'`) wraps `ChakraProvider` with a `defaultSystem` (single considered theme; no color-mode toggle).
- [ ] Load **Inter** via `next/font/google` in `layout.tsx` and expose it as a CSS variable; set it as the base font; add `suppressHydrationWarning` to `<html>`.
- [ ] Render `<Providers>` and `<Toaster />` in `layout.tsx`.
- [ ] `next.config.ts`: `experimental.optimizePackageImports: ["@chakra-ui/react"]`.
- [ ] Verify build + a trivial Chakra `<Box>` renders. Commit.

### B5 — `chore: add ESLint, Prettier, and pre-commit hooks`
- [ ] Add Prettier (`.prettierrc`, `.prettierignore`) and ensure ESLint extends `next/core-web-vitals` + TS rules; add `format`, `format:check`, `lint` scripts.
- [ ] husky + lint-staged:
```bash
npm i -D husky lint-staged prettier
npx husky init
```
`.husky/pre-commit` → `npx lint-staged`. `package.json`:
```jsonc
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,md,json}": ["prettier --write"]
}
```
- [ ] `npm run format` once so the tree is clean. Verify a dummy commit triggers the hook. Commit.

### B6 — `test: set up Vitest, React Testing Library, and jest-axe`
- [ ] Install:
```bash
npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event jest-axe vitest-axe
```
- [ ] `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"], globals: true, css: true },
  resolve: { alias: { "@": resolve(__dirname, "src") } },
});
```
- [ ] `vitest.setup.ts`:
```ts
import "@testing-library/jest-dom/vitest";
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";
expect.extend(matchers);
```
- [ ] Add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`.
- [ ] Add one smoke test (`src/lib/__tests__/smoke.test.ts`, `expect(true).toBe(true)`) to prove the runner is green. Verify `npm test`. Commit.

### B7 — `ci: add GitHub Actions pipeline`
- [ ] `.github/workflows/ci.yml`:
```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run format:check
      - run: npm test
      - run: npm run build
```
- [ ] Commit. (CI first runs after the push in Phase 0.5.)

### Phase 0.5 — Publish & protect
- [ ] Create the public repo and push `main`:
```bash
gh repo create VictoriaL-y/ticker --public --source=. --remote=origin --push \
  --description "A counter that earns its toast — a craft take-home."
```
- [ ] Confirm CI goes green on `main` (`gh run watch`).
- [ ] Protect `main` (require PRs + the CI check):
```bash
gh api -X PUT repos/VictoriaL-y/ticker/branches/main/protection \
  -F required_status_checks.strict=true -F 'required_status_checks.contexts[]=verify' \
  -F enforce_admins=false -F required_pull_request_reviews.required_approving_review_count=0 \
  -F restrictions=
```
*(Solo repo: require PRs + green CI before merge; Victoria's review is the human gate even if GitHub can't require a second approver. Exact flags verified at execution.)*

---

## Phase 1 — Feature PRs

Each PR: branch from `main` → TDD commits → `npm run typecheck && npm run lint && npm test && npm run build` green → push → self-review → open PR with description → **PAUSE for Victoria** → merge → delete branch → `git checkout main && git pull`.

### PR1 — `feat: counter state via context and a guarded hook`
**Branch:** `feat/counter`
**Files:** `src/counter/counter-context.tsx`, `src/counter/use-counter.ts`, `src/counter/Counter.tsx`, `src/lib/format.ts`, `src/app/page.tsx`, tests under `src/counter/__tests__/`.

- [ ] **Test (hook guard):** `use-counter.test.tsx`
```tsx
import { renderHook } from "@testing-library/react";
import { useCounter } from "@/counter/use-counter";

it("throws a helpful error when used outside CounterProvider", () => {
  expect(() => renderHook(() => useCounter())).toThrow(
    /useCounter must be used within a CounterProvider/i,
  );
});
```
- [ ] Run → fails (module missing). Implement:
```tsx
// counter-context.tsx  ('use client')
"use client";
import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";

export interface CounterValue { count: number; increment: () => void; }
export const CounterContext = createContext<CounterValue | undefined>(undefined);

export function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  const increment = useCallback(() => setCount((c) => c + 1), []);
  const value = useMemo<CounterValue>(() => ({ count, increment }), [count, increment]);
  return <CounterContext.Provider value={value}>{children}</CounterContext.Provider>;
}
```
```ts
// use-counter.ts
"use client";
import { useContext } from "react";
import { CounterContext, type CounterValue } from "./counter-context";

export function useCounter(): CounterValue {
  const ctx = useContext(CounterContext);
  if (ctx === undefined) {
    throw new Error("useCounter must be used within a CounterProvider");
  }
  return ctx;
}
```
- [ ] Run → passes. Commit (`feat: add CounterContext and guarded useCounter hook`).
- [ ] **Test (provider behavior):** wrap `useCounter` in `CounterProvider`; assert initial `count === 0`; `act(increment)` → `count === 1`. Run → fails until provider wired (already implemented) → passes. (Same commit or `test:` follow-up.)
- [ ] **Test (Counter component):** renders `Current count 0`; clicking the `+1` button (by role/name) → `Current count 1`; two clicks → `2`. Implement:
```tsx
// format.ts
const fmt = new Intl.NumberFormat("en-US");
export const formatCount = (n: number): string => fmt.format(n);
```
```tsx
// Counter.tsx  ('use client')
"use client";
import { useCounter } from "./use-counter";
import { formatCount } from "@/lib/format";

export function Counter() {
  const { count, increment } = useCounter();
  return (
    <section aria-labelledby="counter-heading">
      <p>Current count <output aria-live="off">{formatCount(count)}</output></p>
      <button type="button" onClick={increment}>+1</button>
    </section>
  );
}
```
*(Chakra styling layered in PR3/PR4; PR1 keeps it semantic + minimal. Final visual props applied later.)*
- [ ] Wire `page.tsx` to render `<CounterProvider><Counter /></CounterProvider>` centered. Run all tests → green. `npm run build`. Commit (`feat: add Counter component wired to the hook`).
- [ ] Push, self-review, open **PR1**, PAUSE.

### PR2 — `feat: show a single updating toast on increment`
**Branch:** `feat/toast-delivery`
**Files:** `src/toast/Toaster.tsx` (customize the generated snippet), `src/toast/use-counter-toast.ts`, wire into `Counter.tsx`, tests.

- [ ] **Test:** clicking `+1` shows a toast containing `Counter is now 1` with a polite live region.
```tsx
// renders <CounterProvider><Toaster/><Counter/></CounterProvider>, clicks +1
expect(await screen.findByText(/counter is now 1/i)).toBeInTheDocument();
```
- [ ] Implement the single-updating-toast hook (stable id → create-or-update; resets timer):
```ts
// use-counter-toast.ts
"use client";
import { useEffect, useRef } from "react";
import { toaster } from "./Toaster";

const TOAST_ID = "counter";
export function useCounterToast(count: number) {
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; } // skip initial 0
    toaster.create({ id: TOAST_ID, type: "success", meta: { count }, duration: 3500 });
    // NOTE: verify whether create-with-same-id upserts + resets the timer in v3;
    // if not, dismiss(TOAST_ID) then create. Covered by the spam test in PR6.
  }, [count]);
}
```
- [ ] Customize `Toaster.tsx` so its render uses `ToastContent` (placeholder until PR3) reading `toast.meta.count`; keep Chakra's `createToaster({ placement: "bottom-end", pauseOnPageIdle: true })`.
- [ ] Call `useCounterToast(count)` from `Counter`. Run → green. Build. Commit + push + **PR2** + PAUSE.

### PR3 — `feat: pixel-match the toast design`
**Branch:** `feat/toast-pixel-match`
**Files:** `src/toast/ToastContent.tsx`, `ToastContent.module.css`, `CheckRing.tsx`, `ToastContent.stories.tsx`, `.storybook/*`, tests.

- [ ] **Test:** `ToastContent` with `count={3}` renders title `Incremented`, subtitle `Counter is now 3`, an icon (`img`/`svg` role), and `role="status"`.
- [ ] **The gradient-border mask solve** — `ToastContent.module.css`:
```css
.toast {
  position: relative;
  display: flex; align-items: center;
  gap: 12px; padding: 12px 20px 12px 16px;
  border-radius: 12px;
  background:
    radial-gradient(53.57% 282.15% at 2.14% 50%,
      rgba(116, 200, 152, 0.15) 0%, rgba(116, 200, 152, 0.03) 100%),
    #46474f;
  box-shadow:
    0 0 0 1px rgba(40, 41, 50, 0.04),
    0 2px 2px -1px rgba(40, 41, 50, 0.04),
    0 4px 4px -2px rgba(40, 41, 50, 0.04),
    0 8px 8px -4px rgba(40, 41, 50, 0.06),
    0 16px 32px rgba(40, 41, 50, 0.06);
}
.toast::before {              /* rounded gradient hairline */
  content: ""; position: absolute; inset: 0;
  padding: 1px; border-radius: inherit; pointer-events: none;
  background:
    linear-gradient(0deg, #6f7076, #6f7076),
    radial-gradient(53.57% 282.15% at 2.14% 50%,
      rgba(116, 200, 152, 0.65) 0%, rgba(116, 200, 152, 0.1) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
}
.title { font-weight: 600; font-size: 16px; line-height: 20px; color: #fff; }
.subtitle { font-weight: 450; font-size: 14px; line-height: 18px; color: rgba(255,255,255,0.72); font-variant-numeric: tabular-nums; }
```
*(`border-radius` tuned to the screenshot — the image reads larger than the Figma 8px; verify by eye. Title/subtitle sizes are the screenshot's two-line hierarchy, not the single Figma style.)*
- [ ] `CheckRing.tsx` — hand-tuned SVG: a `#74C898` thin ring + check, `width/height = 24`, `role="img"`, `aria-hidden` (text carries the meaning).
- [ ] `ToastContent.tsx`:
```tsx
import styles from "./ToastContent.module.css";
import { CheckRing } from "./CheckRing";
import { formatCount } from "@/lib/format";

export function ToastContent({ count }: { count: number }) {
  return (
    <div className={styles.toast} role="status">
      <CheckRing className={styles.icon} />
      <div>
        <div className={styles.title}>Incremented</div>
        <div className={styles.subtitle}>Counter is now {formatCount(count)}</div>
      </div>
    </div>
  );
}
```
- [ ] Wire `ToastContent` into `Toaster.tsx`'s render. Run tests → green.
- [ ] **Storybook:** `npx storybook@latest init --builder vite --yes`; trim defaults; add `ToastContent.stories.tsx` (stories: `Default` count 3, `LargeNumber` count 1_234_567). Verify `npm run storybook` renders the card. Add `build-storybook` script (not in CI).
- [ ] Commits: `feat: add pixel-matched ToastContent with gradient-border` · `chore: set up Storybook` · `docs(storybook): add ToastContent stories`. Push + **PR3** + PAUSE. **Verification here is visual — compare against the screenshot before requesting review.**

### PR4 — `feat: animate the toast and count, respecting reduced-motion`
**Branch:** `feat/motion`
**Files:** `src/lib/use-prefers-reduced-motion.ts`, additions to `ToastContent.module.css` + `Counter`, tests.

- [ ] **Test:** `usePrefersReducedMotion` returns `true` when `matchMedia('(prefers-reduced-motion: reduce)')` matches (mock `window.matchMedia`); `false` otherwise.
- [ ] Implement the SSR-safe hook (`useSyncExternalStore` over the media query).
- [ ] Toast enter/exit via CSS keyframes keyed off Chakra's `[data-state="open"|"closed"]` on the toast root (slide-up + fade + scale `.98→1`, ~220ms). Count-change: a brief, restrained transition on the subtitle number. Button: `:active` scale `.97`, hover.
- [ ] Gate every animation behind `@media (prefers-reduced-motion: reduce) { … none }` **and** the hook where JS-driven.
- [ ] **Test:** when reduced-motion is on, the animated class/inline transition is not applied (assert via the hook-driven branch).
- [ ] Run green, build. Commit(s). Push + **PR4** + PAUSE. (Motion *feel* verified by eye.)

### PR5 — `feat: accessibility — announcement, focus, and axe coverage`
**Branch:** `feat/a11y`
**Files:** `Counter.tsx`, `ToastContent.tsx`, focus styles, tests.

- [ ] Confirm the toast announces: `role="status"` + an `aria-live="polite"` region carrying "Counter is now N" (so SR users hear it without focus theft).
- [ ] `:focus-visible` ring on the `+1` button (2px green, offset), keyboard-only. Verify `Tab` reaches it and `Enter`/`Space` increment.
- [ ] **Test (axe):**
```tsx
const { container } = render(<CounterProvider><Counter/></CounterProvider>);
expect(await axe(container)).toHaveNoViolations();
```
plus an axe pass on `ToastContent`.
- [ ] **Test (keyboard):** `userEvent.tab()` focuses the button; `userEvent.keyboard("{Enter}")` increments.
- [ ] Run green, build. Commit(s). Push + **PR5** + PAUSE.

### PR6 — `feat: spam-safety, large numbers, and dismissal`
**Branch:** `feat/edge-cases`
**Files:** `use-counter-toast.ts` (harden), `format.ts` (already), tests; toast `duration` + pause-on-hover.

- [ ] **Test (spam — the headline edge case):**
```tsx
const user = userEvent.setup();
const btn = screen.getByRole("button", { name: "+1" });
for (let i = 0; i < 5; i++) await user.click(btn);
const toasts = screen.getAllByText(/counter is now/i);
expect(toasts).toHaveLength(1);
expect(screen.getByText(/counter is now 5/i)).toBeInTheDocument();
```
- [ ] Make the hook robust: if same-id `create` doesn't upsert/reset-timer in v3, switch to `toaster.update(id, …)` when present else `create`, and explicitly reset the dismiss timer. Confirm exactly one toast node.
- [ ] **Test (large number):** count `1_234_567` → subtitle shows `1,234,567` (asserts `formatCount`). Add a Counter-display test for grouping too.
- [ ] Auto-dismiss `~3.5s`; verify pause-on-hover (config or custom timer). Document `MAX_SAFE_INTEGER` rationale in a code comment (format, don't cap).
- [ ] Run green, build. Commit(s). Push + **PR6** + PAUSE.

### PR7 — `feat: subtle milestone flourish`
**Branch:** `feat/milestone`
**Files:** small flourish logic in the toast/Counter, CSS, tests.

- [ ] **Test:** at counts that are multiples of 10, a `data-milestone` flag / flourish class is set; not at other counts; **absent** under reduced-motion.
- [ ] Implement a barely-there green pulse (CSS animation on the check ring or toast accent), reduced-motion → none. Keep it tasteful — easy to miss, never gaudy.
- [ ] Run green, build. Commit. Push + **PR7** + PAUSE.

### PR8 — `docs: write the README`
**Branch:** `docs/readme`
**Files:** `README.md`, screenshots/GIF under `docs/` or `public/`.

- [ ] Write the output-driven README: one-line hook · **live link placeholder** · hero GIF/screenshot · `npm install && npm run dev` · **design decisions** (the mask solve + *why* `border-image` fails, single-updating-toast rationale, a11y, reduced-motion, strict types) · trade-offs · **"What I added beyond the AI baseline"** (orchestration, architecture, taste, restraint, the review gate) · "what I'd do next" · CI badge.
- [ ] Capture a short GIF of the toast (macOS screen capture / ffmpeg; fallback to a crisp PNG). Embed it.
- [ ] Commit. Push + **PR8** + PAUSE.

### PR9 — `chore: deploy to Vercel and add the live link`
**Branch:** `chore/deploy`
**Files:** `README.md` (live URL + badges), any Vercel config.

- [ ] **Victoria's one-time action:** import `VictoriaL-y/ticker` in the Vercel dashboard (or `! vercel link`), so pushes auto-deploy.
- [ ] Put the production URL at the very top of the README; add the deploy + CI badges.
- [ ] Verify the deployed app: toast renders, animates, dismisses; reduced-motion honored.
- [ ] Commit. Push + **PR9** + PAUSE.

---

## Consolidated test list

| # | Test | File |
|---|---|---|
| 1 | `useCounter` throws outside provider | `counter/__tests__/use-counter.test.tsx` |
| 2 | provider: initial 0; increment → 1 | `counter/__tests__/counter-context.test.tsx` |
| 3 | Counter renders count; clicks accumulate | `counter/__tests__/Counter.test.tsx` |
| 4 | click → toast "Counter is now 1" + polite live region | `toast/__tests__/delivery.test.tsx` |
| 5 | **spam: 5 clicks → exactly 1 toast, value 5** | `toast/__tests__/spam.test.tsx` |
| 6 | large number formatted with separators | `toast/__tests__/format.test.tsx` |
| 7 | `ToastContent` renders title/subtitle/icon/role | `toast/__tests__/content.test.tsx` |
| 8 | `usePrefersReducedMotion` reflects matchMedia | `lib/__tests__/reduced-motion.test.ts` |
| 9 | reduced-motion → animation not applied | `toast/__tests__/motion.test.tsx` |
| 10 | jest-axe: no violations (page + ToastContent) | `**/__tests__/a11y.test.tsx` |
| 11 | keyboard: Tab focuses button, Enter increments | `counter/__tests__/keyboard.test.tsx` |
| 12 | milestone flag at multiples of 10, off otherwise + reduced-motion | `toast/__tests__/milestone.test.tsx` |

---

## Verification (before claiming done — superpowers:verification-before-completion)

Evidence, not assertions. Run and observe:

- [ ] `npm run typecheck` → 0 errors.
- [ ] `npm run lint` && `npm run format:check` → clean.
- [ ] `npm test` → all green (list pass counts).
- [ ] `npm run build` → succeeds.
- [ ] CI green on the final merge commit (`gh run list`).
- [ ] **Run the app** (`npm run dev`) and watch the real toast against the screenshot: gradient border is *rounded*, green wash from the left, the 5-layer shadow, Inter, two-line hierarchy, check ring. Side-by-side compare.
- [ ] Rapid-click → exactly one toast, number animating, timer resetting.
- [ ] **Reduced-motion:** toggle OS setting → animations replaced by instant states.
- [ ] **Keyboard:** Tab to button, focus-visible ring shows, Enter/Space increments.
- [ ] **Screen reader:** VoiceOver announces "Counter is now N" on increment.
- [ ] Clean checkout test: `git clone` to a temp dir → `npm install && npm run dev` works first try.
- [ ] Live Vercel URL works and matches local.

Then: **superpowers:finishing-a-development-branch** — confirm the public history reads as the intended atomic, conventional, story-telling arc.

---

## Self-review (spec coverage)

Checked against DESIGN.md: Counter/Context/hook (PR1) · Chakra custom toast (PR2–3) · gradient-border mask (PR3) · animation + reduced-motion (PR4) · a11y + axe (PR5) · spam/large-number/dismiss (PR6) · milestone (PR7) · types strict throughout · tests (list above) · tooling/CI (B5–B7) · Storybook (PR3) · README + beyond-AI (PR8) · Vercel (PR9). No spec section is unmapped. The single risky assumption (Chakra v3 same-id upsert/timer behavior) is explicitly verified in PR2/PR6.
