import Phaser from 'phaser';

export class PlayerInput {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private wasd: Record<string, Phaser.Input.Keyboard.Key> | undefined;
  private fireKey: Phaser.Input.Keyboard.Key | undefined;
  private pointerTarget = new Phaser.Math.Vector2(0, 0);
  private pointerDown = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard?.createCursorKeys();
    this.wasd = scene.input.keyboard?.addKeys('W,A,S,D') as
      | Record<string, Phaser.Input.Keyboard.Key>
      | undefined;
    this.fireKey = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.pointerDown = true;
      this.pointerTarget.set(pointer.x, pointer.y);
    });

    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointerTarget.set(pointer.x, pointer.y);
    });

    scene.input.on('pointerup', () => {
      this.pointerDown = false;
    });
  }

  getMovementVector(): Phaser.Math.Vector2 {
    const vector = new Phaser.Math.Vector2(0, 0);

    if (this.cursors?.left.isDown || this.wasd?.A.isDown) vector.x -= 1;
    if (this.cursors?.right.isDown || this.wasd?.D.isDown) vector.x += 1;
    if (this.cursors?.up.isDown || this.wasd?.W.isDown) vector.y -= 1;
    if (this.cursors?.down.isDown || this.wasd?.S.isDown) vector.y += 1;

    if (vector.lengthSq() > 0) {
      return vector.normalize();
    }

    return vector;
  }

  getTankDriveIntent(): { leftTrack: number; rightTrack: number; throttle: number; steer: number } {
    const forward = this.cursors?.up.isDown || this.wasd?.W.isDown ? 1 : 0;
    const backward = this.cursors?.down.isDown || this.wasd?.S.isDown ? 1 : 0;
    const turnLeft = this.cursors?.left.isDown || this.wasd?.A.isDown ? 1 : 0;
    const turnRight = this.cursors?.right.isDown || this.wasd?.D.isDown ? 1 : 0;

    const throttle = forward - backward;
    const steer = turnRight - turnLeft;
    const leftTrack = Phaser.Math.Clamp(throttle + steer, -1, 1);
    const rightTrack = Phaser.Math.Clamp(throttle - steer, -1, 1);

    return { leftTrack, rightTrack, throttle, steer };
  }

  getAimWorldPosition(fallbackX: number, fallbackY: number): Phaser.Math.Vector2 {
    const camera = this.scene.cameras.main;
    if (this.pointerTarget.lengthSq() <= 0) {
      return new Phaser.Math.Vector2(fallbackX, fallbackY - 1);
    }

    return new Phaser.Math.Vector2(this.pointerTarget.x + camera.scrollX, this.pointerTarget.y + camera.scrollY);
  }

  isFiring(): boolean {
    return this.pointerDown || Boolean(this.fireKey?.isDown);
  }

  isPointerInScreenArea(maxY: number): boolean {
    return this.pointerDown && this.pointerTarget.y <= maxY;
  }

  isFireKeyDown(): boolean {
    return Boolean(this.fireKey?.isDown);
  }
}
