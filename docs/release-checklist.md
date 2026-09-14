# Release Checklist

This is not required for a first playable, but use it before sharing a public build.

## Build

- `npm run build` passes.
- Production preview has no blank canvas.
- Asset paths work after build.
- No development-only logs or debug overlays are visible.

## Gameplay

- Start, play, win/lose, and restart work.
- Player can understand the goal without chat history.
- Main action has feedback.
- Controls work on the selected target and a fallback target.

## Content And Legal

- `public/assets/credits.md` lists external assets.
- Placeholder assets are clearly original/generated.
- No brand/copyrighted game art was copied.
- Fonts and sounds are licensed for the intended use.

## Agent Handoff

- README commands are current.
- New systems are documented.
- Decisions are recorded when architecture changed.
- Validation notes are included in the final agent response.
