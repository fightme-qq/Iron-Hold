---
name: phaser-first-playable-builder
description: Use before implementing a Phaser game loop or when turning an approved concept into the smallest playable version; define player action, challenge, feedback, score/progress, win/fail states, restart, required scenes/systems/entities, and validation before adding menus, polish, or broad content.
---

# Phaser First Playable Builder

## Workflow

1. Read `references/playable-loop-contract.md`.
2. Start from `docs/first-playable-contract.md` if present.
3. Convert the concept into one playable loop: player action -> challenge -> feedback -> progress -> fail/win -> restart.
4. Identify the minimum files to edit before touching code.
5. Build gameplay before decorative menus, shops, long progression, or production art.
6. Validate the loop with build and smoke checks.

## Rules

- The first playable must include input, one challenge, feedback, one progress signal, win/fail, and restart.
- A pretty static screen is not a first playable.
- Use placeholders when assets are missing.
- Keep scope small enough that the game can be played and restarted in under one minute.

