# Asset Manifest

Use a manifest so asset keys are discoverable:

```ts
export const ImageKeys = {
  player: 'player',
} as const;

export const imageAssets = [
  { key: ImageKeys.player, url: '/assets/images/player.png' },
];

export const spritesheetAssets = [
  {
    key: 'player',
    url: '/assets/spritesheets/player.png?v=1',
    frameWidth: 128,
    frameHeight: 128,
  },
];
```

Rules:

- Keep keys stable.
- Do not duplicate string keys across scenes.
- Group by asset type: images, spritesheets, atlases, audio, fonts, tilemaps.
- Keep filenames lowercase and hyphenated.
- Keep spritesheet `frameWidth` and `frameHeight` beside the URL in the manifest.
- Bump a temporary `?v=N` cache-buster when replacing binary files under `public/assets/` during development.
- Add comments only for non-obvious export settings or ownership.
