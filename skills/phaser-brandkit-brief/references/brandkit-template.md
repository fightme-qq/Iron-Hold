# Game Brandkit Brief Template

Output:

- Game title:
- Genre and camera:
- Audience and platform:
- Player fantasy:
- Emotional promise:
- Core metaphor:
- Visual language:
- Palette:
  - canvas/background:
  - primary UI:
  - accent:
  - danger:
  - success/reward:
- Typography mood:
- Logo idea:
- UI motifs:
- Runtime asset style:
- Marketing asset style:

Runtime deliverables:

- title_logo.svg or title_logo.png;
- app_icon_512.png;
- hud icons at 32px or 64px;
- button states: normal, hover/focus, pressed, disabled;
- card/panel style if the game uses cards, inventory, upgrades, or shop UI;
- VFX sprites: hit, collect, reward, level-up, fail;
- placeholder fallback names for assets not ready yet.

Marketing deliverables:

- capsule/header image;
- store screenshot direction;
- social banner;
- key art prompt or artist brief;
- favicon if the game ships as a web page.

Implementation notes:

- Prefer PNG/WebP for raster art, SVG only for simple logos/icons that scale cleanly.
- Use lowercase kebab-case filenames.
- Use transparent backgrounds for sprites and UI icons.
- Group growing sprite sets into atlases.
- Keep source/credits in `public/assets/credits.md`.
