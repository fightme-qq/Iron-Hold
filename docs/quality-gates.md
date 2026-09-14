# Quality Gates

Use these gates before calling the project ready for a user, test build, or release.

## First Playable Gate

- Core action works.
- One goal exists.
- One pressure/failure condition exists.
- Feedback is visible and readable.
- Restart or continue path exists.
- Sandbox has been replaced only by real gameplay, not a static page.

## Architecture Gate

- Game code stays under `src/game/`.
- Scene lifecycle code stays in scenes.
- Reusable rules move to `systems/`, `entities/`, `input/`, `state/`, `save/`, or `ui/`.
- No "everything in one Scene" implementation.
- New architecture decisions are recorded in `docs/decisions/`.

## Mobile/Desktop Gate

- Pointer/touch path works.
- Keyboard/mouse path works when relevant.
- Text and HUD fit phone and desktop viewports.
- No accidental page scroll, text selection, or context menu on the game canvas.
- Touch controls do not cover critical gameplay.

## Asset Gate

- Assets are loaded through manifest/helper patterns.
- No copyrighted assets are added without explicit permission.
- Third-party assets are recorded in `public/assets/credits.md`.
- Runtime assets are self-hosted, not loaded from CDN.

## Visual Taste Gate

- HUD, menu, pause, win, fail, and restart states are readable on phone and desktop.
- One visual language is used across gameplay, HUD, menus, and overlays.
- Critical information is not hidden by particles, glows, backgrounds, or decorative panels.
- Buttons and interactive UI have hover/active/focus/disabled or touch-equivalent states where relevant.
- Text does not clip, wrap awkwardly, or sit below readable contrast.
- Motion supports feedback, reward, danger, navigation, or state change; it is not constant noise.
- Reduced-motion settings are respected for heavy shake, flash, particles, and looping effects.
- The UI avoids generic AI tells: random purple/blue glow, equal-card filler rows, meaningless pills, and cards inside cards.

## Runtime Gate

- `npm run build` passes.
- No console errors during startup.
- Restart does not duplicate listeners, timers, enemies, audio, or UI.
- Debug overlays are disabled or clearly development-only.

