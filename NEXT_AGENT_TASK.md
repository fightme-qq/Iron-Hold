# Next Agent Task

Use `AGENT_WORKFLOW.md`, `GAME_BRIEF.md`, `phaser-game-design-interviewer`, and `phaser-first-playable-builder`.

## Task

Turn this game idea into the smallest verified Phaser first playable:

> No specific idea was entered. Ask the human for a one-sentence game idea, then propose three tiny first playable loops.

## Required Output Before Coding

1. Clarified game concept.
2. MVP scope.
3. First playable loop:
   - player action;
   - challenge;
   - feedback;
   - score/progress;
   - fail/win;
   - restart.
4. Target files and skills to use.
5. Risks or assumptions.

## Implementation Rules

- Build the first playable before adding polish.
- Keep `GameScene` thin.
- Put reusable logic in `systems/`, `entities/`, `input/`, `state/`, `save/`, `ui/`, or `data/`.
- Use placeholder art when real assets are missing.
- Validate with `npm run build`.
- If Playwright browsers are installed, also run `npm run test:smoke`.
