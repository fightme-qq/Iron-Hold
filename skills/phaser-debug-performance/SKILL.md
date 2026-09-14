---
name: phaser-debug-performance
description: Use when adding or fixing developer debug overlays, FPS counters, input/state readouts, physics debug views, object pools, no-allocation update loops, low-end mobile performance, or production debug stripping.
---

# Phaser Debug And Performance

## Workflow

1. Read `references/debug-overlay.md` before adding visible diagnostics.
2. Read `references/mobile-performance-budget.md` before optimizing or adding expensive effects.
3. Read `references/object-pooling.md` before spawning many projectiles, enemies, particles, or pickups.
4. Read `references/no-frame-allocations.md` before changing hot update loops.
5. Keep debug tools easy to disable for production.

## Rules

- Debug overlays are for development, not public release UI.
- Measure before making large performance rewrites.
- Mobile performance is usually hurt by excessive canvas size, particles, allocations, and too many active bodies.
- Prefer simple pools for repeated short-lived objects.

