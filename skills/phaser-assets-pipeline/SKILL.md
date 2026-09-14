---
name: phaser-assets-pipeline
description: Use when adding or changing Phaser assets: image keys, spritesheets, atlases, audio, fonts, tilemaps, preload order, asset manifests, no-CDN rules, or missing asset debugging.
---

# Phaser Assets Pipeline

## Workflow

1. Read `references/asset-manifest.md` before adding keys.
2. Read `references/loader-patterns.md` before changing preload behavior.
3. Read `references/texture-atlas.md` before adding atlases/spritesheets.
4. Read `references/tilemaps.md` before adding Tiled maps.
5. Read `references/no-cdn-self-hosting.md` before adding fonts or external assets.
6. Add assets under `public/assets/`.
7. Reference assets by constants or manifest keys, not scattered strings.

## Rules

- Use predictable folders: `images/`, `sprites/`, `audio/`, `fonts/`, `tilemaps/`, `atlases/`.
- Keep asset names lowercase and hyphenated.
- Do not load large assets inside gameplay scenes unless there is a deliberate streaming strategy.

