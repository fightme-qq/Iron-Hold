# Recipe: Add Tilemap Level

Use skills:

- `phaser-tilemaps-tiled`
- `phaser-assets-pipeline`
- `phaser-responsive-layout`

Steps:

1. Put Tiled JSON in `public/assets/tilemaps/`.
2. Put tilesets in `public/assets/tilesets/`.
3. Load map and tileset keys from preload/manifest.
4. Create stable layers: ground, decor, collision, objects.
5. Spawn player/items from object layer names.
6. Set world/camera bounds and validate collision debug.
