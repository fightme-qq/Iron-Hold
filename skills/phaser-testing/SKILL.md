---
name: phaser-testing
description: Use when adding or fixing tests for a Phaser Vite game: build validation, dev server checks, Playwright canvas smoke tests, mobile/desktop viewport checks, Vitest pure logic tests, or generated project validation.
---

# Phaser Testing

## Workflow

1. Read `references/vite-build.md` before changing build config.
2. Read `references/playwright-canvas-smoke.md` before changing browser smoke tests.
3. Read `references/mobile-desktop-viewports.md` before validating layout/input.
4. Run `npm run build` after TypeScript or Vite changes.
5. Use Playwright smoke tests to verify the canvas renders.
6. Report what was verified and what was not.

## Smoke Test Goals

- Dev server starts.
- Canvas exists.
- Canvas is visible.
- Main scene reaches an interactive state.
- Mobile viewport does not break layout.

