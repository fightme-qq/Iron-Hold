# Camera And Level Checklist

Level shape:

- Arena: bounded rectangle, camera often fixed or light follow, enemies spawn around edges.
- Platformer: side-view world, camera follows player, deadzone helps avoid jitter.
- Runner: camera often fixed; world or obstacles move.
- Room-based: camera snaps or transitions between rooms.
- Puzzle board: fixed camera; UI must not cover board.

Camera setup:

- Physics world bounds match intended level.
- Camera bounds match visible world limits.
- Follow target exists before follow starts.
- Deadzone and lerp are tuned after movement.
- Zoom preserves readability on mobile and desktop.
- Shake/fade does not affect HUD unless intentional.

Level data:

- Player spawn exists.
- Restart spawn is deterministic.
- Enemy/item spawn points are named.
- Object layers use stable names.
- Debug overlay can show camera scroll/zoom and spawn points.
