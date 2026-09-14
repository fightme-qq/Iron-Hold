---
name: phaser-physics-collision-designer
description: Use before adding or changing Phaser physics and collisions: Arcade Physics, Matter.js, manual hitboxes, grid movement, overlap-only pickups, tilemap collision, projectile collision, platformer controllers, or dense collision scenes; choose the simplest collision model and separate visual sprites from physics bodies.
---

# Phaser Physics Collision Designer

## Workflow

1. Read `references/collision-model-selection.md`.
2. Choose the collision model before adding bodies to objects.
3. Use overlap for pickups, triggers, and soft detection.
4. Use collider for walls, floors, solid obstacles, and blocking bodies.
5. Separate visual sprite concerns from physics body tuning.
6. Add debug visualization before tuning complex collisions.

## Rules

- Do not enable physics on everything by default.
- Do not use full sprite bounds when a smaller body feels better.
- Do not build complex platformer physics without a dedicated controller.
- Consider Matter.js only when Arcade Physics limitations become a real blocker.
- Keep collision consequences in systems or scene wiring, not scattered callbacks.

