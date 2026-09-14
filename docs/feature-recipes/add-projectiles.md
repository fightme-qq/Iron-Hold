# Recipe: Add Projectiles

Use skills:

- `phaser-game-systems`
- `phaser-debug-performance`
- `phaser-gamefeel`

Steps:

1. Define projectile owner, speed, lifetime, damage, and collision targets.
2. Use `templates/modules/PhaserSpritePool.ts` or a Phaser group with `maxSize` for repeated shots.
3. Reset velocity, active state, visibility, tint, and timers on reuse.
4. Disable projectiles when offscreen or after collision.
5. Add readable firing/hit feedback.
6. Validate no unbounded projectile growth occurs.
