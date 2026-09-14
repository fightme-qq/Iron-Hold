import Phaser from 'phaser';

export type AnimationState = {
  key: string;
  priority: number;
  interruptible: boolean;
};

export class AnimationStateMachine {
  private current?: AnimationState;

  constructor(private readonly sprite: Phaser.GameObjects.Sprite) {}

  play(next: AnimationState): void {
    if (this.current?.key === next.key) {
      return;
    }

    if (this.current && !this.current.interruptible && next.priority < this.current.priority) {
      return;
    }

    this.current = next;
    this.sprite.play(next.key, true);
  }

  clearIf(key: string): void {
    if (this.current?.key === key) {
      this.current = undefined;
    }
  }
}
