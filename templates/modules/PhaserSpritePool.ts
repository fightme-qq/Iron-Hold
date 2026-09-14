import Phaser from 'phaser';

export type PhaserSpritePoolConfig = {
  defaultKey: string;
  maxSize: number;
  classType?: typeof Phaser.GameObjects.Sprite;
  runChildUpdate?: boolean;
};

export class PhaserSpritePool<TSprite extends Phaser.GameObjects.Sprite = Phaser.GameObjects.Sprite> {
  private readonly group: Phaser.GameObjects.Group;

  constructor(
    scene: Phaser.Scene,
    private readonly config: PhaserSpritePoolConfig,
  ) {
    this.group = scene.add.group({
      classType: config.classType ?? Phaser.GameObjects.Sprite,
      defaultKey: config.defaultKey,
      maxSize: config.maxSize,
      runChildUpdate: config.runChildUpdate ?? false,
    });
  }

  prewarm(count = this.config.maxSize): void {
    const repeat = Math.max(0, Math.min(count, this.config.maxSize) - 1);

    if (repeat < 0) {
      return;
    }

    this.group.createMultiple({
      key: this.config.defaultKey,
      repeat,
      active: false,
      visible: false,
    });
  }

  acquire(x: number, y: number, frame?: string | number): TSprite | undefined {
    const sprite = this.group.get(x, y, this.config.defaultKey, frame) as TSprite | null;

    if (!sprite) {
      return undefined;
    }

    sprite.setActive(true);
    sprite.setVisible(true);
    sprite.setPosition(x, y);

    return sprite;
  }

  release(sprite: TSprite): void {
    this.group.killAndHide(sprite);
  }

  get children(): TSprite[] {
    return this.group.getChildren() as TSprite[];
  }

  get activeCount(): number {
    return this.group.countActive(true);
  }

  get freeCount(): number {
    return this.group.getTotalFree();
  }
}
