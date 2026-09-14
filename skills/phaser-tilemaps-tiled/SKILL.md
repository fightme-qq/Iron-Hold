---
name: phaser-tilemaps-tiled
description: Use when adding tile-based levels, Tiled JSON maps, tilesets, collision layers, object layers, spawn points, camera/world bounds, or tilemap debug overlays in a Phaser game.
---

# Phaser Tilemaps And Tiled

## Workflow

1. Read `references/tiled-export-workflow.md` before adding map assets.
2. Read `references/load-map-and-layers.md` before changing preload or scene setup.
3. Read `references/collision-and-objects.md` before adding collisions or spawns.
4. Read `references/camera-world-bounds.md` before changing camera behavior.
5. Keep layer and object names stable because game code depends on them.

## Rules

- Use Tiled JSON for authored maps.
- Keep tilesets under `public/assets/tilesets/`.
- Keep maps under `public/assets/tilemaps/`.
- Use object layers for spawns, pickups, doors, checkpoints, triggers.
- Add a debug mode before tuning collision-heavy maps.

