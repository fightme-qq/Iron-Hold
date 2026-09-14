---
name: phaser-content-pipeline
description: Use when adding or scaling Phaser gameplay content as data instead of hardcoding it in scenes: enemies, items, waves, levels, cards, dialogues, upgrades, spawn tables, balance values, or content definitions under src/game/data; keep content editable without breaking scene code.
---

# Phaser Content Pipeline

## Workflow

1. Read `references/content-as-data.md` before adding repeatable content.
2. Move repeated definitions into `src/game/data/`.
3. Keep scenes and systems reading definitions by stable ids.
4. Validate data at creation boundaries when missing ids would crash gameplay.
5. Add only the data needed for the current playable slice.
6. Keep balance numbers near content definitions, not scattered through scenes.

## Rules

- Do not hardcode many enemies, waves, items, or levels directly in `GameScene`.
- Keep content data serializable when practical.
- Keep asset keys and content ids stable.
- Avoid premature external editors; TypeScript data files are enough for most prototypes.

