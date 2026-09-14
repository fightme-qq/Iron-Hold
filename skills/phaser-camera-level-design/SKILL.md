---
name: phaser-camera-level-design
description: Use when designing or changing Phaser camera and level structure: camera follow, deadzone, lerp, bounds, zoom, screen shake, world size, spawn points, restart positions, tilemap object layers, arenas, platformers, room-based levels, safe areas, or HUD separation.
---

# Phaser Camera Level Design

## Workflow

1. Read `references/camera-level-checklist.md`.
2. Identify the level shape: arena, side-view platformer, scrolling runner, room-based, or fixed puzzle board.
3. Set world bounds before camera follow.
4. Set camera bounds before adding deadzones or shake.
5. Keep HUD in a screen-space UI scene when the world camera moves or shakes.
6. Validate spawn, restart, and resize behavior.

## Rules

- Do not add camera follow to a world smaller than the viewport unless there is a reason.
- Do not let the camera show outside intended level bounds.
- Keep restart position and spawn points explicit.
- Add screen shake only after baseline camera motion feels stable.
- Test phone and desktop framing when zoom changes.

