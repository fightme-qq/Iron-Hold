---
name: phaser-spritesheet-pipeline
description: Use when adding, slicing, cleaning generated backgrounds, resizing, optimizing, animating, or debugging spritesheets, texture atlases, frame names, animation state machines, player/enemy animation transitions, or sprite-vs-physics body alignment.
---

# Phaser Spritesheet Pipeline

## Workflow

1. Read `references/spritesheet-vs-atlas.md` before choosing an asset format.
2. Read `references/load-and-create-animations.md` before writing loader or animation code.
3. Read `references/spritesheet-optimization.md` before resizing, replacing, or debugging spritesheet PNGs.
4. Read `references/chroma-spritesheet-cutting.md` before removing generated backgrounds or cutting image-generator sprite sheets.
5. Read `references/animation-state-machine.md` before putting animation decisions in `update()`.
6. Read `references/body-vs-visual.md` before changing physics sizes, origins, or hitboxes.
7. Keep animation keys centralized when animations are reused.
8. Prefer placeholder/generated sprites only until real art exists, then record asset sources.

## Rules

- Use spritesheets for fixed-size frame grids.
- Use texture atlases for packed frames, UI pieces, and production sprite sets.
- Do not scatter magic frame numbers across scenes.
- Animation state changes should be driven by intent and physics state, not random per-frame calls.

