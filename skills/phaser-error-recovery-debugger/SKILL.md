---
name: phaser-error-recovery-debugger
description: Use when a generated Phaser project does not build, launch, render the canvas, load assets, start a scene, respond to input, or passes TypeScript but fails at runtime; follow a diagnostic loop: build first, fix the first root error, inspect console/runtime, check blank canvas causes, rerun, and avoid speculative rewrites.
---

# Phaser Error Recovery Debugger

## Workflow

1. Read `references/debug-loop.md`.
2. Run `npm run build` first for TypeScript/Vite errors.
3. Fix the first root cause, not every downstream error.
4. Rerun the same check.
5. If build passes but runtime fails, inspect browser console and scene lifecycle.
6. If canvas is blank, check scene registration, preload, asset paths, and game config.
7. Report the root cause and the verification command.

## Rules

- Do not guess from symptoms when logs are available.
- Do not rewrite architecture to fix a typo or asset path.
- Prefer one small fix per diagnostic cycle.
- Keep runtime debug helpers easy to remove or disable.

