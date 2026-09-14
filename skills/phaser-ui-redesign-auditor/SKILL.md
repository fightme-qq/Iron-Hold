---
name: phaser-ui-redesign-auditor
description: Use when improving an existing Phaser UI without changing gameplay logic; audit HUD, menus, overlays, cards, buttons, typography, spacing, colors, states, responsiveness, and interaction feedback before applying focused visual upgrades.
---

# Phaser UI Redesign Auditor

## Workflow

1. Read `references/ui-audit-checklist.md`.
2. Inspect the current game screen, UI scene, HUD helpers, CSS, and Phaser text/button code.
3. List the visual problems before changing code.
4. Preserve working gameplay, routes, scene keys, save data, analytics hooks, and input behavior.
5. Apply upgrades in priority order: readability, hierarchy, states, spacing, palette, motion, final polish.
6. Validate on the selected target and its fallback viewport.

## Rules

- Do not rewrite gameplay systems to make a UI improvement.
- Do not silently rename scene keys, event names, save fields, or DOM IDs.
- Keep changes targeted and reviewable.
- Prefer project-local UI helpers and Phaser containers before inventing a new UI framework.
- If a screen is still missing gameplay state, design the empty/loading/locked state instead of faking success.

