export class HealthSystem {
  private current: number;
  private invulnerableMs = 0;

  constructor(private readonly maxHealth: number) {
    this.current = maxHealth;
  }

  get health(): number {
    return this.current;
  }

  get isDead(): boolean {
    return this.current <= 0;
  }

  reset(): void {
    this.current = this.maxHealth;
    this.invulnerableMs = 0;
  }

  update(deltaMs: number): void {
    this.invulnerableMs = Math.max(0, this.invulnerableMs - deltaMs);
  }

  damage(amount: number, invulnerabilityMs = 500): boolean {
    if (this.invulnerableMs > 0 || this.isDead) {
      return false;
    }

    this.current = Math.max(0, this.current - amount);
    this.invulnerableMs = invulnerabilityMs;
    return true;
  }

  heal(amount: number): void {
    this.current = Math.min(this.maxHealth, this.current + amount);
  }
}
