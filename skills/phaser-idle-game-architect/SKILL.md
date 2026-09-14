---
name: phaser-idle-game-architect
description: Use when the game is idle, incremental, clicker, factory, tycoon, automation, merge-idle, RPG-idle, collection-idle, offline-progress, resource-growth, prestige, or long-term economy driven.
---

# Phaser Idle Game Architect

## Workflow

1. Read `references/igm-handbook-derived-model.md`.
2. Define the loop as resources -> production -> spending -> upgrades -> unlocks -> long-term growth.
3. Put idle rules in `src/game/idle/` and content in `src/data/idleContent.ts`.
4. Keep Phaser scenes thin. Scenes should render, route input, and call the idle systems.
5. Add or update unit tests before tuning numbers.
6. Use stable content IDs because saves depend on them.

## Rules

- Do not implement an idle game as a scene-local click counter.
- Do not tie production to frame rate; convert Phaser delta to seconds.
- Do not scatter resource changes through tweens, UI callbacks, and scene code.
- Every purchaseable thing should show cost, affordability, owned count, and next effect.
- Use typed effects/selectors/configs instead of an unreviewed string DSL.

