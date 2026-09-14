---
name: phaser-idle-economy-balancer
description: Use when tuning idle/incremental resource rates, cost curves, producer scaling, upgrade multipliers, bulk buy, requirements, milestones, or content pacing.
---

# Phaser Idle Economy Balancer

## Workflow

1. Read `references/idle-formulas.md`.
2. Read `references/idle-balancing-workflow.md`.
3. List target time bands: 10 seconds, 1 minute, 5 minutes, 30 minutes, 2 hours, next day.
4. For each band, define expected unlocks and purchases.
5. Tune producer costs and output in `src/data/idleContent.ts`.
6. Add simulation-style unit tests for cost, production, upgrades, and offline caps.
7. Check that every visible purchase is reachable and useful.

## Rules

- The first active reward should happen immediately.
- The first producer should be reachable quickly.
- Exponential costs need compounding production, upgrades, or unlocks.
- Hidden counters are fine; hidden blockers are not.
- Bulk buy must use deterministic math and tests.
- Do not change economy numbers without naming the expected time-band impact.

