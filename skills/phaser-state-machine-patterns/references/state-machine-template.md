# State Machine Template

Use this shape for small gameplay state machines:

```ts
type PlayerState = 'idle' | 'move' | 'attack' | 'hurt' | 'dead';

type Transition = {
  from: PlayerState;
  to: PlayerState;
  reason: string;
};
```

Checklist:

- States are mutually exclusive.
- Entry actions are clear: start timer, play animation, set velocity, emit event.
- Exit actions are clear: clear timer, remove tint, reset input lock.
- Transitions are guarded: cannot attack while dead, cannot move during hurt, etc.
- One-shot states transition through completion events or timers.

Common state sets:

- Player: `idle`, `move`, `attack`, `hurt`, `dead`.
- Enemy: `spawn`, `patrol`, `chase`, `attack`, `stunned`, `dead`.
- Game: `menu`, `playing`, `paused`, `won`, `lost`.
- Boss: `intro`, `phase1`, `phase2`, `enraged`, `defeated`.
