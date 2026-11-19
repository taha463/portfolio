# Portfolio Redesign Implementation Plan

> **For agentic workers:** Execute task-by-task with TDD (RED -> GREEN -> verify) and zero comments in shipped code.

**Goal:** Rebuild `portfolio-site/` into a cobalt-on-cream continuous-line portfolio for Muhammad Taha inspired by and elevating `https://gregskril.com/`.

**Architecture:** Pure static HTML/CSS/JS inside `portfolio-site/` with deterministic DOM/state functions in `main.js`, semantic design tokens in `style.css`, and zero build-step overhead so `netlify.toml`, `vercel.json`, and GitHub Actions CI run unchanged.

**Tech Stack:** Vanilla HTML5, CSS3 (custom properties, grid, `prefers-reduced-motion`, light/dark themes), Vanilla ES2022 JS, Node.js test scripts, Headless Chrome/Edge E2E verification.

**Spec:** `docs/superpowers/specs/2026-11-19-gregskril-redesign-design.md`

## Global Constraints

- Zero comments (`//`, `/* */`, `<!-- -->`) in `portfolio-site/index.html`, `portfolio-site/style.css`, and `portfolio-site/main.js`.
- Light tokens: `--color-paper: #fff6ea`, `--color-ink: #0033e6`, `--color-hover: #c8b5ff`.
- Dark tokens: `--color-paper: #181b23`, `--color-ink: #ffeed8`, `--color-line: #a3b6ff`.
- Zero bakery or Greg Skriloff copy anywhere in `portfolio-site/`.
- All existing CI checks (`pnpm run test:assets`, `pnpm run test:portfolio`, `node -c portfolio-site/main.js`) must pass.

## Review Focus

1. Empty or malformed contact form submissions must show clear inline validation errors without throwing or navigating away.
2. Reduced-motion users (`prefers-reduced-motion: reduce`) must see static complete strokes and non-jarring transitions.
3. Mobile viewports (`390x844`) must have zero horizontal overflow (`scrollWidth <= innerWidth`) and readable stacked sections.
4. Dragging a print card vs clicking it must distinguish short clicks (open lightbox) from drags (move card without opening lightbox).
5. Switching theme (Light <-> Dark) must update `data-theme`, persist in `localStorage`, and keep contrast crisp across ink, paper, borders, and SVG strokes.

---

### Task 1: Behavioral and Structural Test Suite (RED first)

**Files:**
- Create: `scripts/test-redesign.mjs`
- Modify: `package.json` (wire `test:redesign` into `test` script)

- [ ] **Step 1:** Write `scripts/test-redesign.mjs` testing:
  - Zero comments in `portfolio-site/index.html`, `portfolio-site/style.css`, `portfolio-site/main.js`.
  - Exact cobalt/cream and dark theme tokens in `portfolio-site/style.css`.
  - Zero bakery/Greg terms (`bread`, `bakery`, `gregskril`, `Greg Skriloff`) in `portfolio-site/index.html`.
  - Presence of required redesign sections (`#hello`, `#systems`, `#work`, `#benchmarks`, `#prints`, `#contact`, `#line`, `#tip`, `#lightbox`, `#hudOverlay`).
  - Independent-oracle unit tests for pure logic exported/exposed on `globalThis.__portfolioCore`:
    - `computeArbitration(1200)` -> `alpha === 0`, `regime === "Winter Baseflow"`
    - `computeArbitration(7800)` -> `alpha` strictly between `0.2` and `0.5`, `regime === "Pre-Monsoon"`
    - `computeArbitration(18400)` -> `alpha === 1`, `regime === "Monsoon Surge"`
    - `validateContact({ name: "", email: "bad", message: "hi" })` -> `{ ok: false, field: "name" }`
    - `validateContact({ name: "Ada", email: "bad", message: "Hello there" })` -> `{ ok: false, field: "email" }`
    - `validateContact({ name: "Ada", email: "ada@example.com", message: "Let us talk about an AI Engineer role." })` -> `{ ok: true }`
- [ ] **Step 2:** Run `node scripts/test-redesign.mjs` and confirm RED (fails against current old portfolio).

### Task 2: Rebuild `portfolio-site/index.html`

**Files:**
- Modify: `portfolio-site/index.html`

- [ ] **Step 1:** Write clean, comment-free semantic HTML5 with all 5 sections, accessible skip link, landmarks, inline cobalt SVG hero illustration and interactive eyes, α-Desk simulator SVG, filterable work rows, benchmark matrix, draggable prints pile, lightbox dialog, contact form, and `Cmd+K` dialog.
- [ ] **Step 2:** Run `pnpm run test:assets` to verify every local asset path resolves.

### Task 3: Rebuild `portfolio-site/style.css`

**Files:**
- Modify: `portfolio-site/style.css`

- [ ] **Step 1:** Write clean, comment-free CSS implementing the cobalt-on-cream risograph palette, dark mode (`prefers-color-scheme: dark` + `[data-theme="dark"]` + `[data-theme="light"]`), responsive grids, `.rows`, `.pile`, `.print`, `.lightbox`, `.hi`, simulator styling, command palette, and `prefers-reduced-motion`.

### Task 4: Rebuild `portfolio-site/main.js`

**Files:**
- Modify: `portfolio-site/main.js`

- [ ] **Step 1:** Implement pure testable core (`computeArbitration`, `validateContact`, `computeLinePath`) plus interactive controllers (continuous scroll ink line + `#tip`, eye tracking & blink, α-Desk simulator, work/benchmark filters + row expansion, draggable prints pile + reset + lightbox, theme toggle, contact form + copy email, `Cmd+K` palette, mobile menu) with zero comments.
- [ ] **Step 2:** Run `pnpm run test` and `node scripts/test-redesign.mjs` and `node -c portfolio-site/main.js` -> verify GREEN.

### Task 5: Mutation Check (BREAK) + Real Headless Browser E2E Verification + Audit

**Files:**
- Create: `scripts/verify-e2e.mjs` (runs real local HTTP server + headless Chromium/Edge via CDP to verify real rendering, computed styles, zero console/page errors, slider interaction, filter clicks, print lightbox open/close, theme toggle, form validation, and mobile overflow, saving screenshots to `artifacts/` or scratch).

- [ ] **Step 1:** Run BREAK mutation test in an isolated temp copy to prove tests catch real defects.
- [ ] **Step 2:** Run `node scripts/verify-e2e.mjs` against real running server and inspect screenshots + DOM/computed-style assertions.
- [ ] **Step 3:** Run full verification gate (`pnpm run test`, `node -c portfolio-site/main.js`, `node scripts/verify-e2e.mjs`).
- [ ] **Step 4:** Audit `decisions.tsv` against transcript and run cross-model review of the trail.
