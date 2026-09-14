import { describe, expect, it } from 'vitest';
import { GameState } from '../../src/game/state/GameState';

describe('GameState', () => {
  it('starts with saved best score and resets run score', () => {
    const state = new GameState(12);

    expect(state.value).toEqual({
      phase: 'ready',
      score: 0,
      bestScore: 12,
      elapsedMs: 0,
    });

    expect(state.start()).toEqual({
      phase: 'playing',
      score: 0,
      bestScore: 12,
      elapsedMs: 0,
    });
  });

  it('tracks elapsed time only while playing', () => {
    const state = new GameState();

    state.update(1000);
    expect(state.value.elapsedMs).toBe(0);

    state.start();
    state.update(250);
    state.update(750);

    expect(state.value.elapsedMs).toBe(1000);
  });

  it('reports score and best score changes', () => {
    const state = new GameState(2);
    state.start();

    expect(state.addScore(1)).toEqual({ score: 1, bestScore: 2, bestChanged: false });
    expect(state.addScore(2)).toEqual({ score: 3, bestScore: 3, bestChanged: true });
  });
});
