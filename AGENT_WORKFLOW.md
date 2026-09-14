# Agent Operating Workflow

This is the main operating loop for any AI agent working in this repository.

Do not start by coding. Start by turning the user's idea into the smallest verified Phaser game loop.

## Required Loop

1. Read `AGENTS.md`, this file, `skills/README.md`, and `skills/_meta/task-map.md`.
2. Run `npm run agent:audit` when dependencies are available.
3. Use `docs/game-design-intake.md` to extract or infer the game idea.
4. Use `docs/first-playable-contract.md` to define the first playable.
5. Choose the relevant skills from `skills/_meta/task-map.md`.
6. Inspect the current scenes, systems, input, assets, templates, and tests.
7. Implement the smallest coherent change.
8. Validate against `docs/validation-matrix.md` and `docs/quality-gates.md`.
9. Update docs, recipes, templates, or decisions if the project shape changed.
10. Report what changed, which skills were used, and what was verified.

## If The User Gives Only A Vague Idea

Do not block. Propose three tiny first playable loops and recommend the smallest one.

Each proposal must include:

- core action;
- goal;
- failure or pressure;
- feedback moment;
- primary input;
- scenes/modules touched;
- validation path.

## If The User Asks For A Feature

1. Find the closest recipe in `docs/feature-recipes/`.
2. Pick the matching skill.
3. Check `templates/modules/` for a reusable starting point.
4. Add only the minimum architecture needed.
5. Keep the feature playable and testable before polishing it.

## If The User Asks For A Genre

1. Find the closest blueprint in `docs/genre-blueprints/`.
2. Build the first playable loop from that blueprint.
3. Do not build the full game design document before the loop works.

## Decisions

When a change affects architecture, scene flow, input strategy, scale mode, asset pipeline, publishing, or core gameplay rules, add a short note under `docs/decisions/`.

Use this format:

```md
# Decision: short title

Date: YYYY-MM-DD

## Context

What problem was being solved.

## Decision

What was chosen.

## Consequences

What this makes easier or harder.
```
