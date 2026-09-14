export type Poolable = {
  active: boolean;
  reset(): void;
};

export class ObjectPool<T extends Poolable> {
  private readonly items: T[] = [];

  constructor(
    private readonly createItem: () => T,
    private readonly maxSize: number,
  ) {}

  acquire(): T | undefined {
    const inactive = this.items.find((item) => !item.active);

    if (inactive) {
      inactive.reset();
      inactive.active = true;
      return inactive;
    }

    if (this.items.length >= this.maxSize) {
      return undefined;
    }

    const item = this.createItem();
    item.active = true;
    this.items.push(item);
    return item;
  }

  release(item: T): void {
    item.active = false;
  }

  get activeCount(): number {
    return this.items.filter((item) => item.active).length;
  }
}
