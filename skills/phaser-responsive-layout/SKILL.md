---
name: phaser-responsive-layout
description: Use when changing Phaser scale, canvas sizing, orientation, fullscreen, safe areas, UI placement, FIT vs RESIZE, or mobile/desktop viewport behavior.
---

# Phaser Responsive Layout

## Workflow

1. Read `references/scale-manager.md` before editing Phaser scale config.
2. Read `references/fit-vs-resize.md` before choosing scale mode.
3. Read `references/safe-area-orientation.md` before changing mobile layout.
4. Read `references/mobile-desktop-checklist.md` before finalizing layout.
5. Position UI relative to viewport/logical dimensions, not magic pixels.
6. Test phone, tablet, desktop, narrow laptop, and wide desktop viewports.

## Rules

- Default to `Phaser.Scale.FIT` and centered canvas for simple games.
- Use safe margins for mobile HUD.
- Keep text readable on desktop and mobile.

