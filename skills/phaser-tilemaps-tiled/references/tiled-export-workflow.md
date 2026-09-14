# Tiled Export Workflow

Recommended Tiled names:

- Layers: `ground`, `decor`, `collision`, `objects`.
- Objects: `player-spawn`, `enemy-spawn`, `coin`, `door`, `checkpoint`, `trigger`.
- Custom properties: keep names lowercase and predictable.

Export:

- JSON map format.
- Tileset images stored in `public/assets/tilesets/`.
- Map JSON stored in `public/assets/tilemaps/`.

Avoid absolute local image paths in exported JSON. They break after build or on another machine.
