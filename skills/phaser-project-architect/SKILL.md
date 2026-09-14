---
name: phaser-project-architect
description: Use when planning or changing the architecture of a Phaser mobile/desktop game project: folders, scene boundaries, systems, entities, state, assets, save, UI, testing, optional modules, or Phaser version strategy.
---

# Phaser Project Architect

## Workflow

1. Confirm the game remains Phaser-first and mobile/desktop browser-targeted.
2. Read `references/folder-architecture.md` before adding new top-level folders.
3. Read `references/scene-system-boundaries.md` before moving behavior between scenes, systems, entities, state, or save.
4. Read `references/phaser-version-strategy.md` before changing Phaser version or using Phaser 4-only APIs.
5. Read `references/module-selection.md` before adding ECS, rexUI, editor compatibility, publishing packs, wrappers, or plugins.
6. Keep scenes thin when possible; put reusable behavior in systems, entities, input, state, save, or UI helpers.
7. Update `AGENTS.md`, `.ai/skill-manifest.json`, or `skills/_meta/task-map.md` if architecture routing changes.

## Default Boundaries

- `scenes/`: Phaser lifecycle, scene transitions, orchestration.
- `systems/`: gameplay rules that are not tied to one display object.
- `entities/`: factories/classes for player, enemies, items, projectiles.
- `input/`: touch, pointer, keyboard, mouse, gamepad abstraction.
- `ui/`: HUD, menus, dialogs, reusable display helpers.
- `state/`: runtime data and cross-scene state.
- `save/`: local persistence and migrations.
- `assets/`: manifests, asset keys, loader helpers.

