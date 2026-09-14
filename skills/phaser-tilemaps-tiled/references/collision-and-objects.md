# Collision And Object Layers

Collision:

```ts
collision?.setCollisionByProperty({ collides: true });
this.physics.add.collider(player, collision);
```

Object layers:

- Read spawn points from `map.getObjectLayer('objects')`.
- Convert object coordinates into entity factories.
- Keep object type/name conventions documented.
- Validate important objects, such as `player-spawn`, at scene start.

Debug:

- Draw collision tiles during development.
- Hide debug overlays in production builds.
