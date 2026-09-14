---
name: phaser-idle-offline-prestige
description: Use when adding idle offline progress, return summaries, save migrations, reset/prestige loops, meta currency, daily rewards, or long-term retention systems.
---

# Phaser Idle Offline Prestige

## Workflow

1. Confirm which resources can be earned offline.
2. Define an offline cap and document it in `docs/IDLE_GAME_DESIGN.md`.
3. Run migrations before offline simulation.
4. Simulate capped elapsed time deterministically.
5. Show a return summary to the player.
6. Add prestige only after the base economy loop has meaningful reset value.

## Rules

- Offline gains must be capped.
- Prestige must preserve settings and only reset intended economy state.
- Do not wipe save data without a migration or explicit player action.
- Test save/load/offline edge cases.

