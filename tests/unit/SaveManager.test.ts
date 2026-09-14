import { beforeEach, describe, expect, it } from 'vitest';
import { SaveManager, type SaveData } from '../../src/game/save/SaveManager';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe('SaveManager', () => {
  let storage: MemoryStorage;
  let saves: SaveManager;

  beforeEach(() => {
    storage = new MemoryStorage();
    saves = new SaveManager('test-game', storage);
  });

  it('returns safe defaults for empty and corrupted saves', () => {
    expect(saves.load()).toEqual({
      version: 1,
      bestScore: 0,
      settings: {
        musicVolume: 0.8,
        sfxVolume: 0.8,
        reducedMotion: false,
      },
    });

    storage.setItem('test-game:save:slot-1', '{bad json');
    expect(saves.load().bestScore).toBe(0);
  });

  it('saves and lists independent slots', () => {
    const data: SaveData = {
      version: 1,
      bestScore: 42,
      settings: {
        musicVolume: 0.5,
        sfxVolume: 0.25,
        reducedMotion: true,
      },
    };

    saves.save(data, 'slot-2');

    expect(saves.load('slot-1').bestScore).toBe(0);
    expect(saves.load('slot-2')).toEqual(data);
    expect(saves.listSlots().find((entry) => entry.slot === 'slot-2')?.updatedAt).toBeDefined();
  });

  it('migrates old plain save data and fills missing settings', () => {
    storage.setItem('test-game:save:slot-1', JSON.stringify({ version: 0, bestScore: 7 }));

    expect(saves.load()).toEqual({
      version: 1,
      bestScore: 7,
      settings: {
        musicVolume: 0.8,
        sfxVolume: 0.8,
        reducedMotion: false,
      },
    });
  });

  it('can reset a slot', () => {
    saves.save(saves.load());
    expect(storage.length).toBe(1);

    saves.reset();
    expect(storage.length).toBe(0);
  });
});
