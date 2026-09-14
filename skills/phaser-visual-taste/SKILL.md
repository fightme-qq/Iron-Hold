---
name: phaser-visual-taste
description: Use when shaping or polishing the visual direction of a Phaser game: title screens, HUD, menus, cards, shops, upgrade choices, game-over screens, palettes, typography, motion density, art direction, and anti-generic UI checks before calling a screen finished.
---

# Phaser Visual Taste

## Workflow

1. Read `references/visual-direction-dials.md`.
2. State the design read in one line: game genre, audience, platform, mood, and screen type.
3. Set three dials: visual variance, motion intensity, and information density.
4. Choose one visual language and keep it consistent across gameplay, HUD, menus, and overlays.
5. Improve hierarchy before decoration: goal, current state, danger, reward, and next action must read first.
6. Run the visual pre-flight before finishing.

## Rules

- Do not polish a static screen before the first playable loop works.
- Do not use generic purple/blue glow, random particles, or equal card rows as the default visual answer.
- Do not hide game-critical information behind tiny labels, low contrast, or decorative frames.
- Keep one accent color family unless the gameplay meaning requires multiple semantic colors.
- Use motion for state change, feedback, reward, danger, or navigation, not constant noise.
- Respect reduced motion for heavy shake, flashes, particles, and looping effects.
- Make phone readability and touch-safe spacing part of the visual design, not an afterthought.

