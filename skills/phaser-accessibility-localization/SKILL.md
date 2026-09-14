---
name: phaser-accessibility-localization
description: Use when improving Phaser browser game accessibility or localization: keyboard-only support, remappable controls, touch-friendly buttons, color contrast, font size, reduced motion, readable HUD text, language string tables, locale fallback, and avoiding hardcoded UI text.
---

# Phaser Accessibility Localization

## Workflow

1. Read `references/accessibility-localization-checklist.md`.
2. Keep controls usable with keyboard/mouse and touch when the target requires both.
3. Put player-facing UI strings behind a small text table once screens grow beyond prototypes.
4. Respect reduced motion for heavy shake, flash, particles, and transitions.
5. Check contrast and text size on phone and desktop.
6. Validate that important actions are not touch-only or keyboard-only unless platform scope says so.

## Rules

- Do not bury essential actions behind tiny buttons.
- Do not rely on color alone for critical state.
- Do not hardcode large amounts of UI text in scene logic.
- Keep localization simple: stable keys, default locale, fallback locale.

