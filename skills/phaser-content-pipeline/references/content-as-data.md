# Content As Data

Suggested folders:

```text
src/game/data/enemies.ts
src/game/data/items.ts
src/game/data/levels.ts
src/game/data/waves.ts
src/game/data/upgrades.ts
src/game/data/dialogues.ts
```

Example:

```ts
export const enemyDefinitions = {
  slime: {
    hp: 3,
    speed: 70,
    damage: 1,
    rewardXp: 5,
  },
} as const;
```

Rules:

- Systems consume definitions by id.
- Scenes wire content into the world.
- Entities build visuals/bodies from definitions.
- Save files store ids/progress, not full live objects.
- Add validation or fallback for unknown ids once content grows.
