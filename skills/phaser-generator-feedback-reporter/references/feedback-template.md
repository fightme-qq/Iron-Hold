# Generator Feedback Template

Use this exact structure when reporting a generator-level learning.

```md
## Generator Feedback

### Trigger

- Original user task:
- First failed or weak result:
- Final working solution:

### Evidence From This Game

- Game folder:
- Relevant files:
- Commands/checks run:
- Error, symptom, or before/after behavior:

### Root Cause

What was missing or misleading in the generated archive?

Choose one or more:

- skill guidance missing or too vague;
- task-map routing missing;
- generated source default was weak;
- template module should exist;
- validation/test did not catch it;
- docs/quality gate missed it;
- dependency/config default was wrong;
- visual/gamefeel standard was too low;
- platform requirement was not encoded.

### Proposed Generator Fix

- Area to improve:
- Smallest useful change:
- Why this helps future generated games:

### Validation For Next Archive

- Generate a fresh archive with:
- Run:
- Manual check:
- Expected pass condition:

### Do Not Change

Anything that is specific to this one game and should not become a generator default.
```

Good feedback is specific enough that the generator repository can be improved without reopening the whole game history.
