---
name: phaser-idle-ui-feedback
description: Use when building Phaser idle HUDs, resource panels, producer cards, upgrade grids, achievement shelves, logs, toasts, number popups, temporary bonus visuals, or dense mobile/desktop economy UI.
---

# Phaser Idle UI Feedback

## Workflow

1. Read the UI model from `IdleEconomy.getUiModel()` or a dedicated `IdleUiModel` helper.
2. Show resource current amounts and per-second rates.
3. Show producer owned count, next cost, affordability, and output.
4. Show upgrade cost, owned state, and a short effect summary.
5. Add clear feedback for gain, spend, unlock, achievement, shiny, save/load, and offline return.

## Rules

- Do not hide critical economy numbers only in tooltips.
- Keep dense idle UI readable on phone and desktop.
- Respect reduced motion for heavy particles, flashes, and pulsing bonuses.
- Use Phaser objects or a deliberate DOM overlay; do not mix both casually.

