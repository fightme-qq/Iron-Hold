# Collision Model Selection

Use Arcade Physics when:

- movement is arcade/simple;
- bodies are mostly rectangles/circles;
- you need fast overlap/collider checks;
- the game is top-down, arena, runner, shooter, or simple platformer.

Use Matter.js when:

- stable complex bodies matter;
- shapes are rotated or compound;
- physics simulation is the gameplay.

Use manual hitboxes when:

- attacks need precise active frames;
- collisions are event-like, not physical pushes;
- you need deterministic simple rectangles/circles.

Use grid movement when:

- the game is tile/turn based;
- collision is by cell occupancy.

Rules by object:

- Pickups: overlap-only.
- Walls/floors: collider.
- Projectiles: overlap or collider depending on whether they bounce/block.
- Characters: stable body size independent from animation frames.
- Tilemaps: collision layer plus object layer for spawns/triggers.
