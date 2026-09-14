export class TimerSystem {
  private remainingMs: number;
  private finished = false;

  constructor(durationMs: number) {
    this.remainingMs = durationMs;
  }

  get remaining(): number {
    return Math.max(0, this.remainingMs);
  }

  get isFinished(): boolean {
    return this.finished;
  }

  reset(durationMs: number): void {
    this.remainingMs = durationMs;
    this.finished = false;
  }

  update(deltaMs: number): boolean {
    if (this.finished) {
      return false;
    }

    this.remainingMs -= deltaMs;

    if (this.remainingMs <= 0) {
      this.remainingMs = 0;
      this.finished = true;
      return true;
    }

    return false;
  }
}
