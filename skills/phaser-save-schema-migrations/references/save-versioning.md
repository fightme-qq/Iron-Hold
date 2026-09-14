# Save Versioning

Example:

```ts
type SaveV2 = {
  version: 2;
  coins: number;
  unlockedLevels: string[];
  settings: {
    musicVolume: number;
    sfxVolume: number;
    reducedMotion: boolean;
  };
};
```

Safe load flow:

1. Read raw string from storage.
2. If missing, return default save.
3. Parse in try/catch.
4. Check `version`.
5. Migrate known older versions.
6. If unknown or corrupted, return default save and keep the game playable.

Separate:

- Settings: audio volume, language, controls, reduced motion.
- Progress: coins, unlocks, best score, completed levels.
- Runtime: hp, position, active enemies, current temporary upgrades.
