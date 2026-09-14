# Agent Instructions For My Phaser Game

This repository is a Phaser mobile/desktop game project. Treat Phaser game development as the primary domain.

## Always-On Context

For every user prompt in this repository, treat this `AGENTS.md` file as the always-on context anchor. The user should not need to say "read the docs" or "load the context"; this file, `AGENT_WORKFLOW.md`, and the local skill map define the default operating context.

Use deeper docs only when the current task needs them, but never ignore this project context.

## First Read Order

1. `AGENTS.md`
2. `START_HERE.md`
3. `AGENT_WORKFLOW.md`
4. `npm run agent:audit` if dependencies are installed
5. `skills/_meta/task-map.md`
6. The specific `skills/<skill-name>/SKILL.md` for the task
7. Relevant docs for the task, such as `docs/first-playable-contract.md`, `docs/validation-matrix.md`, and `docs/quality-gates.md`
8. Relevant source files under `src/game/`

## Core Rule

Follow `AGENT_WORKFLOW.md` before coding. Use the project-local skills before making architecture, scene, input, layout, UI, asset, gamefeel, or testing changes.

When starting a task, say which skill you are using:

```text
Using phaser-scene-workflow because this changes scene lifecycle and transitions.
```

## Skill Authoring Rule

This repository generates project-local Phaser skills. When adding, editing, renaming, or reorganizing generated skills, use `phaser-skill-pack-maintainer` first.

Keep each skill concise and task-triggered:

- put trigger conditions in the skill description/frontmatter;
- move detailed notes into `references/`;
- keep scripts deterministic when a repeatable action is needed;
- update `skills/README.md`, `skills/_meta/task-map.md`, the skill name list, and the skill pack together;
- validate a fresh generated project after skill changes.

## Skill Routing

- Raw or vague game idea before coding: `phaser-game-design-interviewer`
- Approved concept into the smallest playable loop: `phaser-first-playable-builder`
- Large feature request into safe implementation steps: `phaser-feature-slicer`
- Refactor or risky edit planning before changing files: `phaser-refactor-guardian`
- Build/runtime/blank-canvas debugging: `phaser-error-recovery-debugger`
- Phaser API/plugin/version-sensitive work: `phaser-version-docs-sync`
- Player/enemy/game/boss behavior modes and boolean-flag cleanup: `phaser-state-machine-patterns`
- Physics engine, hitboxes, overlaps, colliders, and collision model selection: `phaser-physics-collision-designer`
- Camera follow, bounds, zoom, level shape, spawns, and restart positions: `phaser-camera-level-design`
- Enemies, items, waves, levels, upgrades, cards, and other gameplay content as data: `phaser-content-pipeline`
- Versioned save data, migrations, defaults, corrupted save fallback, settings/progress split: `phaser-save-schema-migrations`
- XP, levels, coins, shops, unlocks, difficulty curves, and reward pacing: `phaser-progression-economy`
- Idle, incremental, clicker, factory, tycoon, automation, offline progress, and prestige economy: `phaser-idle-game-architect`
- Idle cost curves, producer output, upgrades, bulk buy, milestones, and time-band tuning: `phaser-idle-economy-balancer`
- Idle resource panels, producer cards, upgrade grids, achievements, temporary bonuses, and dense economy UI: `phaser-idle-ui-feedback`
- Offline progress, return summaries, save migrations, reset loops, and prestige: `phaser-idle-offline-prestige`
- Keyboard/touch accessibility, reduced motion, readable UI, string tables, localization: `phaser-accessibility-localization`
- Release targets, static hosting, portals, SDK boundaries, fullscreen/orientation/storage: `phaser-release-platforms`
- Sprite lists, animation frames, palette, atlas plan, naming, placeholder art briefs: `phaser-ai-art-asset-brief`
- Visual direction, polished HUD/menu style, screen hierarchy, and anti-generic UI checks: `phaser-visual-taste`
- Existing HUD/menu/overlay redesign without changing gameplay logic: `phaser-ui-redesign-auditor`
- Game logo, palette, UI motif, key art, capsule, icon, and brandkit planning: `phaser-brandkit-brief`
- Architecture or folder boundaries: `phaser-project-architect`
- Boot/preload/menu/gameplay/UI scenes: `phaser-scene-workflow`
- Asset keys, loaders, manifests, atlases, audio: `phaser-assets-pipeline`
- Touch, pointer, keyboard, mouse, gamepad: `phaser-input-mobile-desktop`
- Mobile/desktop scaling, safe areas, orientation: `phaser-responsive-layout`
- Systems/entities/state/events/save: `phaser-game-systems`
- HUD, menu, dialogs, overlays: `phaser-ui-hud`
- Tweens, camera, particles, juice, audio feedback: `phaser-gamefeel`
- Spritesheet cutting, chroma cleanup, optimization, atlases, frame animation, animation states: `phaser-spritesheet-pipeline`
- Tiled maps, tile layers, object layers, tile collisions: `phaser-tilemaps-tiled`
- Music, SFX, mute, mobile audio unlock, volume settings: `phaser-audio-sfx`
- Debug overlays, FPS, pools, low-end mobile performance: `phaser-debug-performance`
- Placeholder sprites, coded UI visuals, SVG/canvas art direction: `phaser-programmatic-art`
- Vite, Playwright, canvas smoke tests, Vitest: `phaser-testing`
- Reporting generator-level learnings after a failed/reworked task: `phaser-generator-feedback-reporter`
- Updating or adding skills: `phaser-skill-pack-maintainer`

- Turning a new idea into the first playable: start with `phaser-game-design-interviewer`, then `phaser-first-playable-builder`
- Vague idea intake: `docs/game-design-intake.md`
- First playable definition of done: `docs/first-playable-contract.md`
- Common feature implementation: `docs/feature-recipes/`
- Genre starting point: `docs/genre-blueprints/`
- Verification before final answer: `docs/validation-matrix.md`
- Quality gates before calling work done: `docs/quality-gates.md`
- Reusable module starting points: `templates/modules/`

## Project Boundaries

- Keep Phaser runtime code under `src/game/`.
- Keep pure game rules independent from Phaser when practical, so they can be unit-tested.
- Use pointer input as the cross-platform baseline.
- Prioritize keyboard/mouse ergonomics, readable wide layouts, and desktop viewport checks.
- Add keyboard shortcuts for desktop ergonomics.
- Keep mobile layout readable and touch targets large enough.
- Do not add backend, multiplayer, React, Electron, Capacitor, or ECS unless the human explicitly asks.


## Change Workflow

1. Follow `AGENT_WORKFLOW.md`.
2. Identify the task category.
3. Read the matching skill.
4. Check `templates/modules/` if the task needs a common system.
5. Inspect existing files before editing.
6. Make the smallest coherent change.
7. Run the most relevant verification:
   - `npm run build`
   - `npm run dev`
   - `npm run agent:audit`
   - `npm run test:smoke` if Playwright is enabled
8. Update `docs/decisions/` if architecture, scene flow, input strategy, scale mode, assets, publishing, or core rules changed.
9. Report what changed and what was verified.

## Skill Maintenance

Use `skills/_meta/update-skills.md` before editing skills. Skills should stay concise, task-triggered, and Phaser-specific.
