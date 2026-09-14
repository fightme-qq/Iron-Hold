# Asset Brief Template

Output:

- Style: pixel-inspired, clean vector, toy-like, tactical, paper/card, etc.
- Palette: 4-8 core colors plus UI neutrals.
- Camera/view: top-down, side-view, isometric-like, fixed board, card table.
- Sprite list:
  - `player_idle_32x32.png`
  - `player_run_32x32_6frames.png`
  - `slime_idle_32x32_4frames.png`
  - `coin_spin_16x16_6frames.png`
- UI list:
  - buttons, hearts, coin icon, upgrade icons, pause/restart icons.
- VFX list:
  - hit spark, pickup burst, level-up burst, dust puff.
- Tiles/backgrounds:
  - tile size, tileset dimensions, collision readability.
- Export:
  - PNG spritesheets or texture atlas JSON.
  - Lowercase kebab-case filenames.
  - Transparent background for sprites/UI.
  - For image-generator sheets that need automatic background removal: generate on flat `#FF00FF` chroma, or `#00FF00` when sprites contain purple. Keep generous spacing and do not let shadow/glow touch the background.
- Placeholder fallback:
  - generated geometric textures or simple coded sprites until final art exists.
