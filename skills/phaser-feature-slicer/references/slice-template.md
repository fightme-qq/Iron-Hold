# Feature Slice Template

Output:

- Goal: one sentence.
- Smallest proof: what the player can do after step 1.
- Target files: likely files or folders.
- Boundaries: what belongs in scene, system, entity, UI, state, save, or data.
- Steps:
  1. Add state/data fields.
  2. Add gameplay event or pickup/action.
  3. Add consequence and feedback.
  4. Add UI display or selection.
  5. Add persistence only if needed.
  6. Add smoke/manual test.
- Deferred: content, tuning, polish, extra screens, platform integrations.

Example for upgrades:

1. Add `xp` and `level` runtime state.
2. Add XP pickup or enemy reward.
3. Emit level-up event at threshold.
4. Show one upgrade choice.
5. Save persistent unlocks later, not per-run temporary upgrades.
6. Validate level-up can happen once and restart resets run state.
