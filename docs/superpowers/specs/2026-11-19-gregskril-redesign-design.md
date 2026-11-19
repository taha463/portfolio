# Portfolio Redesign Design Spec (Greg Skriloff Cobalt-on-Cream Aesthetic)

## Intent and Why

Redesign Muhammad Taha's portfolio in `portfolio-site/` from first principles around the visual vibe of `https://gregskril.com/`: warm cream paper, vivid cobalt gel-pen ink, soft lavender hover fills, a continuous single-line SVG drawing that threads down the page as the reader scrolls, expressive interactive eyes, crisp ruled editorial rows, draggable prints with a lightbox, and a human centered contact finale.

Zero bakery or Greg-specific content is copied. Every headline, illustration, interactive tool, project row, benchmark number, image print, and contact detail belongs to Muhammad Taha (AI Systems Engineer, HITEC University B.Sc. Software Engineering, CGPA 3.23/4.00).

## Goals, Non-Goals, Anti-Goals

- **Goals:**
  - Match and elevate the cobalt-on-cream risograph visual identity of `gregskril.com` in both light and dark modes (with a manual theme toggle in addition to `prefers-color-scheme`).
  - Keep Muhammad Taha's real projects (Mizan, Aegis V13, FEHM.AI), accepted paper (ACDSA 2027), credentials (MIT 15.773, HITEC SE CGPA 3.23, Google UX), internships (Nexium, Elevvo Pathways), and empirical benchmarks.
  - Elevate the design with an inline interactive Dynamic Judge Desk (alpha-Desk) hydrograph simulator styled in pure cobalt ink, expandable project telemetry rows, filterable benchmark matrix, draggable engineering prints desk with animated lightbox and reset control, and a working validated contact form + `Cmd+K` jump palette.
  - Keep zero code comments (`//`, `/* */`, `<!-- -->`) in shipped `portfolio-site/index.html`, `portfolio-site/style.css`, and `portfolio-site/main.js`.
  - Pass all existing CI gates (`pnpm run test:assets`, `pnpm run test:portfolio`, `node -c portfolio-site/main.js`) plus new behavioral, no-comment, and live browser E2E checks.
- **Non-Goals:**
  - Migrating `portfolio-site/` to React, Astro, or a bundler (both `netlify.toml` and `vercel.json` publish `portfolio-site/` directly as static files).
  - Adding a backend server for the contact form (client-side validation with `mailto:` dispatch and one-click email copy keeps the static deploy contract intact).
- **Anti-Goals:**
  - Generic dark-mode SaaS gradients, glassmorphism, neon glow clutter, or heavy fixed navbars that crowd the hero.
  - Any leftover bakery copy, bread icons, or placeholder links.

## Approaches Considered

1. **Patch existing `style.css` and `index.html` in place:** Rejected. The current site uses a dark/tangerine cartographic survey layout with heavy GSAP staging and 1,000+ lines of nested classes; bolting a cobalt-on-cream continuous-line aesthetic onto it creates dead CSS and mismatched structure.
2. **Convert `portfolio-site/` to a Vite/React build:** Rejected. Breaks the zero-build static publish configuration in `netlify.toml`, `vercel.json`, and `.github/workflows/ci-cd.yml` with no user-facing benefit.
3. **First-principles vanilla HTML/CSS/JS rebuild inside `portfolio-site/` (Selected):** Keeps the exact static deployment target and CI contract, removes GSAP CDN dependency for instant first paint, and lets us author clean, comment-free, modular code tuned to every visual detail.

## Visual System and Tokens

- **Light Mode (default):**
  - `--color-paper`: `#fff6ea`
  - `--color-paper-2`: `#ffeed8`
  - `--color-ink`: `#0033e6`
  - `--color-line`: `#0033e6`
  - `--color-hover`: `#c8b5ff`
  - `--color-hover-ink`: `#0033e6`
  - `--color-rule`: `#0033e633`
  - `--color-scrim`: `#fff6eae6`
- **Dark Mode (`prefers-color-scheme: dark` or `data-theme="dark"`):**
  - `--color-paper`: `#181b23`
  - `--color-paper-2`: `#21252f`
  - `--color-ink`: `#ffeed8`
  - `--color-line`: `#a3b6ff`
  - `--color-hover`: `#c8b5ff`
  - `--color-hover-ink`: `#181b23`
  - `--color-rule`: `#ffeed829`
  - `--color-scrim`: `#181b23eb`
- **Typography:**
  - Display: `Plus Jakarta Sans` (700, 800) with geometric rounded sans fallback.
  - Body: `DM Sans` (400, 500, 700) with system sans fallback.
  - Metrics: `JetBrains Mono` (400, 500) with monospace fallback.

## Page Architecture

1. **Minimal Utility Header:** Unobtrusive translucent-paper bar with MT aperture monogram, 4 anchor links (`#systems`, `#work`, `#prints`, `#contact`), theme toggle button, and `Cmd+K` palette trigger.
2. **Continuous Ink Line (`#line`) and Moving Tip (`#tip`):** Full-page SVG overlay computed from live anchor element rects on load and resize, animated smoothly with scroll position, with a cobalt Arbitration Aperture icon tracking the active pen point.
3. **Hero (`#hello`):** 5fr/6fr asymmetric grid. Left: original continuous-line cobalt SVG illustration (monolithic profile + neural arbitration graph). Right: interactive cobalt eyes (pointer tracking, periodic blink, surprise on click), `Hi, I'm Taha.` display heading, concise 2-paragraph bio, pill CTAs (`Explore Systems`, `Say Hi`).
4. **Featured Craft & Live Simulator (`#systems`):** 6fr/5fr split. Left: interactive Dynamic Judge Desk (`alpha`-Desk) simulator in cobalt ink with range slider (`1200` to `22000` m3/s), 3 preset pills (`Winter Baseflow`, `Pre-Monsoon`, `Monsoon Surge >16k`), live SVG hydrograph (Observed, Aegis V13, ED-LSTM Baseline), and live `alpha` badge. Right: story of Mizan, Aegis V13, and FEHM.AI.
5. **Things I've Built & Empirical Matrix (`#work`, `#benchmarks`):** Category-filtered ruled rows (`All`, `Flagship AI`, `Research`, `Experience`) with expandable technical details, followed by a filterable Empirical Benchmark Matrix (`All`, `Mizan RAT`, `Aegis V13`, `Surge Gate`).
6. **From the Engineering Desk (`#prints`):** Scattered draggable print cards (`images/mizan.jpg`, `images/aegis.jpg`, `images/fehmai.jpg`, `images/basin_survey.jpg`, `images/portrait.jpg`, `images/logo.svg`) with pointer drag, bring-to-front z-order, `Reset desk` button, and keyboard-accessible Lightbox (`Escape`, `ArrowLeft`, `ArrowRight`).
7. **Say Hi (`#contact`):** Circular portrait (`images/portrait.jpg`), availability status, pill links (`Email`, `GitHub`, `LinkedIn`, `Copy Email`), validated contact form with live status region, and clean footer.
