# IGM Handbook Derived Model

Source: https://orteil.dashnet.org/igm/help.html

This reference adapts Idle Game Maker concepts to Phaser + TypeScript. Do not copy the IGM text DSL into this project unless the human explicitly asks for a DSL.

## Core Model

Idle games are systems of things and effects:

- resources: current amount, total earned, max seen, per-second flow;
- actions/buttons: active clicks or commands that trigger effects;
- buildings/producers: buyable passive production with scaling costs;
- upgrades: one-time purchases with passive modifiers or unlocks;
- achievements: milestones, optionally with passive effects;
- items: multiple owned instances, useful for equipment, cards, relics, workers;
- shinies: temporary random clickable bonuses;
- effects: typed operations such as gain, lose, multiply, show, hide, log, toast;
- conditions: requirements and if/else style gates;
- selectors: target one entity, all of a type, owned/unowned things, tags, or chained filters;
- expressions: amounts, earned totals, owned counts, max values, comparisons, math, randomness;
- layout: panels that display filtered groups with names, icons, costs, rates, owned counts, and tooltips.

## Phaser Translation

- Use TypeScript data and types, not scene-local counters.
- Keep content in `src/data/idleContent.ts`.
- Keep deterministic economy rules in `src/game/idle/`.
- Keep Phaser scenes responsible for rendering and input only.
- Use IDs as save keys. Never rename IDs after players have saves.
- Unit-test economy math because manual testing misses scaling bugs.

## Required Idle Loop

Every generated idle design should answer:

1. What is the first resource?
2. What active action creates early agency?
3. What producer automates growth?
4. What upgrade changes the economy rule?
5. What milestone proves progress?
6. What offline behavior is allowed?
7. What UI numbers must always be visible?
