# Idle Balancing Workflow

Use this process when changing rates, costs, upgrades, unlocks, offline progress, or prestige.

## Step 1: Name The Loop

Write the loop in one line:

```text
Click -> earn cookies -> buy ovens -> unlock upgrades -> collect bonuses -> prestige for permanent speed.
```

If the loop cannot be written simply, do not tune numbers yet.

## Step 2: Define Time-Band Targets

Create a table before editing numbers:

| Band | Expected player state |
| --- | --- |
| 10 sec | understands first resource and action |
| 1 min | can buy first producer |
| 5 min | sees first upgrade and passive income |
| 30 min | has a new unlock, bonus, or decision |
| 2 hr | offline cap matters |
| next day | prestige or long-term goal is visible |

## Step 3: Simulate, Then Adjust

Prefer unit tests or small helper simulations over manual clicking.

Check:

- time to first producer;
- time to first upgrade;
- output after each upgrade;
- cost of buy 1, buy 10, buy max;
- offline gain after cap;
- pending prestige points after target session lengths.

## Step 4: Keep UI Truthful

Every purchasable item should expose:

- owned count;
- next cost;
- affordability;
- max affordable;
- production impact;
- locked reason if requirements are not met.

## Step 5: Preserve Design Intent In Tests

When changing formulas, add tests that encode intent:

- "first oven is reachable with 10 clicks";
- "buying 3 ovens costs 36 with ceil-per-purchase rounding";
- "offline progress caps at 2 hours";
- "prestige point gives +10% output".

## Step 6: Avoid Spreadsheet Drift

If a formula exists in a spreadsheet, mirror it in code comments or tests. The game is the source of truth at runtime.
