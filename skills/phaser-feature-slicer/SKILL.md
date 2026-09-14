---
name: phaser-feature-slicer
description: Use before implementing a broad Phaser feature request such as progression, upgrades, inventory, enemies, waves, shops, saves, bosses, new modes, or large UI; slice the request into small safe steps, target files, validation checks, and a first incremental implementation instead of coding the whole system at once.
---

# Phaser Feature Slicer

## Workflow

1. Read `references/slice-template.md`.
2. Identify the smallest user-visible behavior that proves the feature.
3. Split the feature into ordered steps with one responsibility each.
4. Name target files and ownership boundaries for each step.
5. Choose the first step to implement now.
6. Add a smoke check or manual validation after each step.

## Rules

- Do not implement a full large system in one pass.
- Prefer data/state first, then event, then UI, then persistence.
- Keep each step revertible and testable.
- Delay save/load, balancing, animation polish, and content expansion until the core behavior works.

