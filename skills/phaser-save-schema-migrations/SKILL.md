---
name: phaser-save-schema-migrations
description: Use before changing Phaser save data or settings persistence: localStorage schema versions, default save objects, migration from old versions, safe parse, corrupted save fallback, settings vs progress separation, reset flow, and avoiding direct localStorage outside save modules.
---

# Phaser Save Schema Migrations

## Workflow

1. Read `references/save-versioning.md`.
2. Check `src/game/save/SaveManager.ts` before adding persisted fields.
3. Add or update a versioned save type when structure changes.
4. Provide defaults for missing data.
5. Migrate old saves forward or reset safely with a clear fallback.
6. Validate fresh install, existing save, malformed save, and reset behavior.

## Rules

- Do not write direct `localStorage` calls throughout scenes or systems.
- Keep settings and player progress conceptually separate.
- Never persist Phaser objects, sprites, scenes, inputs, timers, or cameras.
- Save after meaningful player actions, not every frame.
- Keep temporary per-run upgrades out of persistent progress unless intended.

