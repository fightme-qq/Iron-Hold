# Phaser UI Audit Checklist

Audit in this order:

1. Readability
   - Text size holds up on phone and desktop.
   - Scores, timers, health, objectives, and prompts are not hidden by effects.
   - Contrast remains readable over the actual gameplay background.

2. Hierarchy
   - One primary action per menu or overlay.
   - Secondary actions are visually secondary.
   - HUD groups related values and avoids noisy labels.

3. States
   - Hover, active, focus, disabled, selected, locked, empty, loading, win, fail, and pause states exist when relevant.
   - Restart and continue affordances are obvious.

4. Layout
   - Safe areas are respected.
   - Touch targets are large enough.
   - Panels do not overlap the critical play area.
   - Text wraps intentionally and never clips.

5. Palette and surfaces
   - One accent family is used consistently.
   - Danger, success, reward, and disabled states are semantic.
   - Panels/cards exist only where they clarify grouping.
   - Shadows, glows, outlines, and particles do not fight gameplay.

6. Motion and feedback
   - Button presses feel tactile.
   - Reward and damage feedback are distinct.
   - Heavy flashes/shakes have reduced-motion fallbacks.
   - Looping animations do not distract from gameplay.

Common fixes:

- Replace tiny all-caps labels with clear sentence-case text.
- Use tabular numbers for timers, score, currency, and cooldowns.
- Add a scrim behind modal text when gameplay continues underneath.
- Pin repeated CTA positions so muscle memory works.
- Use spacing and dividers before adding more bordered boxes.
