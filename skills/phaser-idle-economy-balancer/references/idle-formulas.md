# Idle Economy Formulas

Use these formulas before changing idle economy numbers.

## Cost Scaling

Next producer cost:

```ts
nextCost = ceil(baseCost * costScale ** owned)
```

Starter rule:

- costScale around 1.07-1.18 is gentle.
- costScale above 1.25 becomes steep quickly.
- If costs grow exponentially, production must compound through more producers, upgrades, prestige, or new layers.

Bulk cost with per-purchase rounding:

```ts
bulkCost(count) = sum(ceil(baseCost * costScale ** (owned + i)) for i in 0..count-1)
```

Use the sum in gameplay code unless you also test a geometric-series shortcut with the same rounding behavior.

## Production

Producer output:

```ts
producerPerSecond = baseProductionPerSecond * upgradeMultiplier * prestigeMultiplier
resourcePerSecond = sum(owned * producerPerSecond for producers that output resource)
```

Active action output:

```ts
actionGain = baseGain * actionUpgradeMultiplier * prestigeMultiplier
```

## Multipliers

Default stacking rule in this template is multiplicative:

```ts
finalMultiplier = multiplierA * multiplierB * prestigeMultiplier
```

Use additive bonuses only when intentionally designing flat upgrades:

```ts
output = baseOutput + flatBonus
```

Do not mix additive and multiplicative stacking without naming the order in tests.

## Affordability

Basic purchase:

```ts
canBuy = requirementsMet && currentResource >= nextCost
```

Max buy:

```ts
while spent + nextCost <= currentResource:
  buy one
```

For very large economies, replace the loop with a tested binary search or geometric formula.

## Offline Progress

Always cap offline simulation:

```ts
elapsedSeconds = floor((now - savedAt) / 1000)
simulatedSeconds = min(elapsedSeconds, offlineCapSeconds)
gain = resourcePerSecond * simulatedSeconds
capReached = elapsedSeconds > simulatedSeconds
```

Run save migrations before offline simulation.

## Prestige

Starter prestige formula:

```ts
pendingPoints = floor(totalEarnedResource / divisor)
prestigeMultiplier = 1 + totalPrestigePoints * multiplierPerPoint
```

Prestige should reset run state and preserve only intentional meta state: settings, meta currency, reset count, and optionally achievements.

## Typed Expressions

Use typed expressions instead of custom if-statements when a formula should remain data-driven.

Examples:

```ts
{ kind: 'resourceEarned', resourceId: 'cookies' }
{ kind: 'producerOwned', producerId: 'oven' }
{ kind: 'multiply', values: [2, { kind: 'prestigePoints' }] }
{ kind: 'gte', left: { kind: 'resourceEarned', resourceId: 'cookies' }, right: 250 }
```

Good expression uses:

- prestige point formulas;
- gates that combine resources, owned counts, and clicks;
- dynamic shiny rewards;
- content rules that should stay in data/config.

Bad expression uses:

- scene-specific rendering logic;
- deeply nested formulas with no tests;
- random balance changes without time-band intent.

## Time Bands

Tune with explicit bands:

- 10 seconds: first reward, readable feedback.
- 1 minute: first producer should be reachable.
- 5 minutes: first upgrade or automation change.
- 30 minutes: second mechanic or new content layer.
- 2 hours: offline cap and mid-session pacing.
- Next day: return summary, prestige or long-term goal.

## Anti-Patterns

- Exponential costs without compounding production.
- First automation later than the player has patience for.
- Hidden blockers with no locked reason.
- Dead producers that never become useful again.
- Offline gains without a cap.
- Prestige that resets too much or gives no meaningful multiplier.
