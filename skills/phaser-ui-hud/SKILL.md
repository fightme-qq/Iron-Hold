---
name: phaser-ui-hud
description: Use when building or changing in-game UI in Phaser: HUD, menus, dialogs, overlays, buttons, pause screen, responsive UI, text readability, or optional rexUI integration.
---

# Phaser UI HUD

## Workflow

1. Read `references/ui-scene.md` before adding persistent HUD or overlays.
2. Read `references/hud-layout.md` before positioning UI.
3. Read `references/rex-ui-optional.md` before adding rexUI/plugins.
4. Decide whether UI belongs in gameplay scene or a separate overlay scene.
5. Keep buttons and touch targets large enough for mobile.
6. Keep UI state synchronized through explicit data/events.

## Rules

- Do not build DOM UI unless there is a specific reason.
- Prefer a dedicated `UIScene` for persistent HUD.
- Avoid text that overlaps gameplay-critical areas on mobile.

