---
name: phaser-input-mobile-desktop
description: Use when implementing or debugging mobile and desktop controls in Phaser: pointer, touch, mouse, keyboard, drag, gestures, virtual buttons, virtual joystick, browser input gotchas, or gamepad support.
---

# Phaser Input Mobile/Desktop

## Workflow

1. Read `references/pointer-keyboard-touch.md` before changing base input.
2. Read `references/mobile-controls.md` before adding touch UI.
3. Read `references/virtual-joystick.md` before adding joystick controls.
4. Read `references/browser-input-gotchas.md` before release or publishing.
5. Keep input reading in `src/game/input/`; scenes should ask input models for intent.
6. Test with mouse, touch viewport, and keyboard.

## Rules

- Do not scatter raw key checks across many scenes.
- Prefer action names like `move`, `jump`, `confirm`, `cancel`.
- Make touch targets large and reachable.

