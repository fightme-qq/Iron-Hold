# Chroma Spritesheet Cutting

Use this for image-generator sprite sheets that need background removal, per-cell cleanup, resize, preview, and final PNG optimization.

## Generation Prompt

Always request a flat chroma background:

```text
Place every sprite on a perfectly flat solid #FF00FF background.
No transparency, no checkerboard, no gradient, no background texture.
No shadows or glow touching the background.
No colored spill around sprite edges.
Leave generous spacing between sprites.
```

If sprites contain purple elements, use `#00FF00`. The background color must not appear inside objects.

## File Layout

```text
art/
  source/    Original generated PNGs. Never modify in place.
  working/   Temporary cleanup files.
  previews/  White, black, and contrast-background checks.
public/assets/
  ...        Final runtime sheet only.
```

Do not keep source PNGs, cut frames, full-size sheets, previews, or intermediate cleanup files under `public/assets/`.

## Processing Pipeline

1. Read the original from `art/source/` without modifying it.
2. Detect cells from an explicit grid, separators, or requested cell size.
3. Process each cell independently.
4. Infer the local background color from cell corners.
5. Remove background by color distance, not hard-coded gray, purple, or green rules.
6. Remove background outside the sprite and inside holes such as rings, arcs, handles, and frames.
7. Preserve dark outlines even when they are close to the background.
8. Apply unmatte to remove chroma spill from edge pixels.
9. Feather the alpha edge by 1-2 px.
10. Keep the object's large connected components and remove isolated noise specks.
11. Crop transparent bounds and add 2 px padding.
12. Generate previews on white, black, and a strong contrast background.
13. Review previews before resizing.
14. Resize each cleaned frame with Lanczos to the runtime cell size.
15. Rebuild the final fixed-grid PNG sheet.
16. Run lossless optimization:

```bash
oxipng -o 4 --strip safe public/assets/ui/rarity-gems.png
```

17. Verify the alpha channel and inspect optimized previews again.
18. Update the Phaser manifest so the game loads the final sheet and correct frame dimensions.

## Script Interface

Prefer a reusable script such as `scripts/extract-chroma-sprites.py` with:

```text
--mode auto
--mode solid-bg
--mode chroma
--mode checker
--grid 7x1
--cell-size 128
--padding 2
--edge-feather 2
--preview-dir art/previews
--optimize
--output public/assets/ui/rarity-gems.png
```

Use `--mode solid-bg` for new image generations.

Example:

```powershell
python scripts/extract-chroma-sprites.py art/source/rarity-gems.png `
  --grid 7x1 `
  --mode solid-bg `
  --cell-size 128 `
  --padding 2 `
  --edge-feather 2 `
  --preview-dir art/previews `
  --optimize `
  --output public/assets/ui/rarity-gems.png
```

## Runtime Size Example

For seven rarity gems:

- use `128x128` per cell by default;
- output `896x128`;
- reduce to `96x96` cells only when displayed icons are much smaller.

## Final Check

- Background is removed outside sprites and inside holes.
- Edges are not jagged.
- No chroma fringe remains.
- Dark outlines remain intact.
- Gray and low-saturation details remain intact.
- No sprite is clipped.
- White, black, and contrast previews were inspected.
- Only the final optimized runtime sheet exists under `public/assets/`.
- Game code loads that final file.
