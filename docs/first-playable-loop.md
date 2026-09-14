# First Playable Loop: Iron Hold

## Loop

The player protects a repair base from short enemy tank waves.

1. **Prepare:** inspect current parts, base HP, and next wave. Decide whether to start now or buy an upgrade.
2. **Defend:** drive the tank with two-track controls, aim with pointer/touch, and shoot incoming enemies before they reach the base.
3. **Collect:** destroyed enemies drop parts. The player drives over drops before they despawn.
4. **Upgrade:** between waves, spend parts in the bottom navbar windows: `Tank`, `Base`, or `Map`.
5. **Escalate:** each wave adds pressure. Win by surviving wave 5. Lose when base HP reaches 0. Restart and try a different spending path.

## Balance

**Key resource:** parts.

- Source: enemy drops and end-wave base HP bonus.
- Sink: tank damage, tank reload, tank speed, base max HP, base repair, and base turret.
- Anti-farm: each wave has a fixed enemy count, drops expire, and weak defense converts profit into repair costs.

Example first session:

- Wave 1 has 6 scouts.
- Scout reward is 2 parts.
- Perfect-ish base HP bonus is up to 5 parts.
- First upgrade costs 10-12 parts.
- Turret costs 18 parts.

These numbers let wave 1 buy one useful upgrade but prevent the player from solving tank and base progression at the same time.

## Retention

The player returns because the upgrade path creates an unfinished tactical question: can this build survive the next enemy mix?

After a week, the loop should support recognizable builds:

- fast interceptor tank;
- fortified base with turret and repairs;
- high-damage risky tank;
- stable hybrid defense.

No daily reward or push is required. The return reason lives inside the wave and upgrade loop.

## Implemented MVP

- Top-down tank arena.
- Player tank movement using differential-drive style controls, plus aiming and shooting.
- Enemy waves that path toward the base.
- Larger scrolling battlefield with camera follow.
- Waves split into short stages with reposition breaks.
- Corner minimap showing world bounds, viewport, base, player, and enemies.
- Base HP damage and fail state.
- Parts drops with despawn.
- Bottom navbar with `Battle`, `Tank`, `Base`, and `Map`.
- Generated icon spritesheet for HUD stats, tabs, upgrade cards, start, and restart.
- Tank and base upgrade panels.
- Base turret unlock.
- Victory after wave 5.
- Restart from win/loss.
