# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`cat-toto` is a single-page "cat-powered random picker" web app. It is deployed as a static site to GitHub Pages.

There is no build step, no bundler, and no runtime dependencies. The entire app is one HTML file (`index.html`) containing inline CSS and inline vanilla JavaScript.

## Commands

- **Run tests**: `npm test` (equivalent to `node --test tests/spec.js`)
- **Run a single test file**: `node --test tests/spec.js`
- **Filter tests by name**: `node --test --test-name-pattern="getRange" tests/spec.js`
- **Local preview**: open `index.html` directly in a browser, or run `python3 -m http.server` and visit `http://localhost:8000/`. There is no dev server script.

`npm install` is unnecessary — there are no dependencies. Tests rely on Node's built-in `node:test` runner and `node:assert/strict`.

## Architecture

### Single-file app (`index.html`)

All UI, styling, and behavior live in `index.html`. The `<script>` block at the bottom drives everything:

- **Two picker modes**, toggled by the `mode` variable (`"range"` | `"options"`):
  - Range mode reads `minNum`/`maxNum` inputs and picks a random integer in `[min, max]`.
  - Options mode parses a comma-separated string from `optionsInput` into a list and picks one.
- **Lick mode** (`lickMode` boolean) adds two extra ways to trigger `pickNumber()`: swipe-up touch gestures (listeners on `document`, fire when the upward delta exceeds 50px) and wheel-up scroll events scoped to `.picker-card` (with an 800ms cooldown). The two listeners are intentionally scoped differently — keep them in sync if you change one.
- **Display sizing** (`fitDisplayText`) shrinks the font size based on picked-text length so long option strings still fit in the panel.
- **Session counter** (`trackSession` IIFE near the bottom): increments a `localStorage` counter once per `sessionStorage` session, displayed as "unique cats served". For cross-device analytics the file is wired up to GoatCounter at the very bottom (`<script data-goatcounter=...>`).

### Tests (`tests/spec.js`) — important convention

`tests/spec.js` does **not** import from `index.html`. Instead it re-declares plain-function mirrors of the core picker helpers (`getParsedOptions`, `getRange`, `pickFromOptions`, `pickFromRange`) and tests those.

**This means**: when you change picker logic in `index.html`, you must also update the corresponding mirror function in `tests/spec.js` for tests to remain meaningful. Likewise, fixing a test-only mirror does not fix the real app.

The mirror functions intentionally split `pickNumber` into pure `pickFromOptions` / `pickFromRange` halves so randomness can be exercised by loops without DOM/`Math.random` mocking.

### Deployment (`.github/workflows/jekyll-gh-pages.yml`)

Pushes to `main` trigger a Jekyll build of the repo root and deploy to GitHub Pages. There is no Jekyll config — the workflow just publishes `index.html` as-is. Concurrency is set so in-progress production deploys are not cancelled.

## Conventions

- Keep the app dependency-free and single-file. Don't introduce a bundler, framework, or `npm install`-required tooling unless explicitly asked.
- When editing picker logic, update both `index.html` and the mirror in `tests/spec.js`.
- Default range is `1..49`; default fallbacks in `getRange` (`1` for min, `49` for max) are part of the tested contract.
- History is capped at the last 24 picks (`history.slice(history.length - 24)` in `pickNumber`).
