# Load And Create Animations

Load fixed-grid frames:

```ts
this.load.spritesheet('player', '/assets/spritesheets/player.png', {
  frameWidth: 32,
  frameHeight: 32,
});
```

Load an atlas:

```ts
this.load.atlas('player-atlas', '/assets/atlases/player.png', '/assets/atlases/player.json');
```

Create animations once, usually after preload:

```ts
this.anims.create({
  key: 'player-run',
  frames: this.anims.generateFrameNumbers('player', { start: 4, end: 9 }),
  frameRate: 12,
  repeat: -1,
});
```

Rules:

- Check `this.anims.exists(key)` before recreating shared animations.
- Name keys by owner/action: `player-idle`, `enemy-hurt`, `coin-spin`.
- Keep one-shot animations, like attack or hurt, from being interrupted accidentally.
