---
name: phaser-refactor-guardian
description: Use before editing or refactoring Phaser code, especially GameScene, systems, entities, input, physics, UI, save, or generated project structure; identify target files, boundaries, where new logic belongs, risks of monolithic scene changes, magic numbers, mixed responsibilities, and validation before changing code.
---

# Phaser Refactor Guardian

## Workflow

1. Read `references/boundary-checklist.md` before editing.
2. Identify target files and existing ownership boundaries.
3. Decide where new logic belongs: scene, system, entity, input, UI, state, save, data, or platform adapter.
4. Keep changes close to the requested behavior.
5. Avoid turning `GameScene` into the place for every rule.
6. Run the smallest relevant validation after the edit.

## Rules

- Do not mix UI logic into entities.
- Do not mix raw input polling with physics consequences across many files.
- Do not scatter direct `localStorage` calls outside save modules.
- Do not add repeated magic numbers when a named config/data field is clearer.
- Do not move unrelated code while fixing a local issue.

