# Recipe: Add Touch Controls

Use skills:

- `phaser-input-mobile-desktop`
- `phaser-responsive-layout`
- `phaser-ui-hud`

Steps:

1. Map touch to actions, not scene-specific flags.
2. Use pointer/tap for simple actions.
3. Use virtual buttons or joystick only for repeated/continuous actions.
4. Keep controls away from safe-area edges.
5. Make desktop keyboard/mouse still work.
6. Validate with mobile viewport and real touch if available.
