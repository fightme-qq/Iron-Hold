---
name: phaser-progression-economy
description: Use when designing or implementing Phaser progression and economy systems: XP, levels, upgrades, coins, shops, unlockables, wave scaling, difficulty curves, reward pacing, temporary per-run upgrades, persistent meta progression, and save boundaries.
---

# Phaser Progression Economy

## Workflow

1. Read `references/progression-models.md` before adding XP, coins, upgrades, shops, or unlocks.
2. Decide what is temporary per run and what is persistent across sessions.
3. Keep progression state in `state/` and persistence in `save/`.
4. Start with one reward source and one reward sink.
5. Add UI only after the progression event works.
6. Validate restart, reload, and balance edge cases.

## Rules

- Do not add a full economy before the first playable loop works.
- Do not persist temporary run upgrades unless the design explicitly needs it.
- Keep reward numbers in data/config, not scattered in scenes.
- Make progression readable: the player should know why a reward happened.

