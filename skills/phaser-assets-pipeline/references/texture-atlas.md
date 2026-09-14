# Texture Atlases And Spritesheets

Use spritesheets for simple fixed-frame animation.
Use atlases for packed assets, UI pieces, and many sprites.

Suggested folders:

```text
public/assets/sprites/
public/assets/atlases/
public/assets/images/
```

Rules:

- Keep atlas JSON and image together.
- Keep frame names stable.
- Prefer TexturePacker/Aseprite export settings that are easy to reproduce.
- Document export settings if another tool must regenerate assets.
- For fixed-grid spritesheets, update PNG dimensions and manifest frame dimensions in the same change.
- If a resized sheet shows wrong frames, inspect `frameWidth`, `frameHeight`, `margin`, and `spacing` first.
