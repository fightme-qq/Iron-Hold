# Recipe: Add Camera Follow

Use skills:

- `phaser-responsive-layout`
- `phaser-scene-workflow`
- `phaser-debug-performance`

Steps:

1. Confirm the world is larger than the viewport.
2. Set world and camera bounds.
3. Follow the player or target with sensible lerp/deadzone.
4. Keep HUD in a UI scene or screen-space layer.
5. Test resize and mobile viewport.
6. Add camera shake/fade only after follow feels stable.
