# Spritesheet Optimization

Use this before resizing, replacing, or debugging spritesheet PNGs.

## Memory Rule

Runtime VRAM is approximately:

```text
width * height * 4 bytes
```

PNG compression on disk does not reduce the decoded RGBA texture cost in Phaser. If a sprite displays at 44px, a 128px frame is usually enough for 2x-3x DPR. A 627px frame for a 44px icon wastes texture memory.

## Resize Pipeline

When shrinking fixed-grid spritesheets:

1. Crop the original sheet into frames before resizing.
2. Process each frame separately.
3. Preserve alpha with PNG32/RGBA output.
4. Resize each frame.
5. Optionally threshold alpha after resize to remove faint halos.
6. Append frames back into one sheet.
7. Reset page geometry after append.
8. Update `frameWidth` and `frameHeight` in `src/game/assets/assetManifest.ts` in the same change.

ImageMagick sketch:

```bash
convert "$SRC" -crop ${FRAME_SRC}x${FRAME_SRC} +repage PNG32:/tmp/frame_%d.png

for f in /tmp/frame_*.png; do
  convert "$f"     -alpha set -background "rgba(0,0,0,0)"     -filter Lanczos -resize ${FRAME_DST}x${FRAME_DST}     -channel A -threshold 30% +channel     -strip     PNG32:"/tmp/out_$(basename "$f")"
done

convert /tmp/out_frame_*.png +append +repage PNG32:"$OUT"
```

If the source has a white matte, try `-fuzz 35% -transparent white` before resize. Do not use that blindly on mostly-white sprites.

## Validation Checklist

- `identify out.png` reports full canvas geometry, not one-frame page geometry.
- Cropping the final sheet with the new frame size produces the expected frame count.
- Corner pixels that should be transparent read as `srgba(0,0,0,0)`.
- `frameWidth` and `frameHeight` match the new PNG frame size.
- Asset URL cache-buster is bumped, for example `/assets/spritesheets/player.png?v=2`.
- Browser hard reload was used after replacing a file under `public/assets/`.

## Alignment Strategies

- Static single frame: shrink directly.
- UI state sheet such as locked/available/claimed: crop each state and uniform-fill a common canvas so states look like the same object.
- Walk/jump animation: bottom-align frames and use `sprite.setOrigin(0.5, 1)`; drive jump arcs with tweens/code, not frame Y drift.
- Stationary looping animation: start with per-frame bounding boxes on a common centered canvas.
- If a stationary animation still jitters, align non-transparent pixel centroids across frames.

Avoid solving animation jitter by changing physics bodies every frame. Keep the body stable and adjust art alignment or sprite origin.
