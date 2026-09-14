---
name: phaser-game-systems
description: Use when adding gameplay systems, entities, state, events, save data, progression, scoring, economy, ECS decisions, or cross-scene data flow in a Phaser game.
---

# Phaser Game Systems

## Workflow

1. Read `references/entities-systems-state.md` before adding gameplay architecture.
2. Read `references/events.md` before adding cross-module events.
3. Read `references/save-system.md` before changing persistence.
4. Read `references/when-to-use-ecs.md` before adding ECS libraries.
5. Keep pure game rules independent from Phaser when practical.
6. Prefer simple events and explicit method calls before global state.

## Defaults

- Runtime-only data: `state/`.
- Persistent data: `save/`.
- Reusable gameplay behavior: `systems/`.
- Display object construction: `entities/`.

