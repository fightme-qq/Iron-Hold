# Idle Game Design

This project includes the optional Idle / Incremental Game Pack.

Use it for idle, incremental, clicker, factory, tycoon, RPG-idle, merge-idle, collection-idle, automation, prestige, and offline-progress games.

## Architecture

- `src/data/idleContent.ts`: data-driven resources, actions, producers, upgrades, achievements.
- `src/game/idle/idleTypes.ts`: stable TypeScript contracts.
- `src/game/idle/IdleEconomy.ts`: deterministic economy runtime.
- `tests/unit/IdleEconomy.test.ts`: baseline math and progression tests.
- `tests/unit/IdleFormulaExamples.test.ts`: executable examples for core idle formulas.
- `skills/phaser-idle-economy-balancer/references/idle-formulas.md`: formula reference.
- `skills/phaser-idle-economy-balancer/references/idle-balancing-workflow.md`: tuning workflow.

## Design Loop

1. Active action gives the first resource.
2. The first producer turns resource into passive income.
3. The first upgrade changes output or unlocks a new decision.
4. Achievements acknowledge progress.
5. Offline progress rewards returning players within a cap.
6. Temporary bonuses create timed high-attention moments.
7. Prestige resets convert long-term progress into permanent power.

## Phaser Integration

Phaser scenes should:

- call `economy.clickAction(id)` from pointer/keyboard input;
- call `economy.tick(delta / 1000)` from `update`;
- render values from `economy.getUiModel()`;
- save `economy.toSaveData()` through the project save system.
- render temporary bonuses from `economy.getUiModel().shinies`.
- preview and execute prestige through `economy.getUiModel().prestige` and `economy.prestigeReset()`.

Do not put idle math inside text labels, tweens, or scene event callbacks.

## Core Formulas

- Next cost: `ceil(baseCost * costScale ** owned)`
- Bulk cost: sum of rounded individual next costs
- Per-second output: `sum(owned * baseOutput * multipliers)`
- Offline simulated seconds: `min(elapsedSeconds, offlineCapSeconds)`
- Prestige pending points: `floor(totalEarned / divisor)`
