# Spritesheet vs Texture Atlas

Spritesheet:

- equal-size frames in a grid;
- simple exports from Aseprite, Piskel, or custom scripts;
- good for early characters and effects.

Texture atlas:

- frames may have different sizes and names;
- better packing and fewer texture swaps;
- good for production sprites, UI, and many small effects.

Asset folders:

```text
public/assets/spritesheets/
public/assets/atlases/
public/assets/sprites/
```

Common mistakes:

- wrong `frameWidth` or `frameHeight`;
- forgotten `margin` or `spacing`;
- frame names that differ from atlas JSON;
- visual sprite larger than the physics body;
- transparent padding that makes collisions feel wrong.
