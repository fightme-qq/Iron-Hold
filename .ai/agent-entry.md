# Any AI coding agent Instructions

This repository is a generated Phaser mobile/desktop game project. It includes a local skill pack. Use those skills before changing code.

## Always-On Context

For every user prompt, treat the current file as the compact context anchor for this agent, with `AGENTS.md` as the root operating contract. The human should be able to ask naturally without repeating "read AGENTS.md" or "load the skill map".

## Immediate Startup

When opening this repository, assume these files are relevant even if the user did not mention them:

1. `AGENTS.md`
2. `AGENT_WORKFLOW.md`
3. `scripts/agent-audit.mjs`
4. `skills/_meta/task-map.md`
5. `skills/README.md`
6. `docs/first-playable-contract.md`
7. `docs/validation-matrix.md`
8. `docs/quality-gates.md`
9. `templates/modules/`
10. `.ai/skill-manifest.json`

## Project Facts

- Engine: Phaser
- Language: TypeScript
- Build tool: Vite
- Primary target: desktop-first browser game
- Idle / Incremental pack: enabled
- Yandex Games pack: disabled

## Skill Rule

Before architecture, scene, input, layout, assets, UI, gamefeel, testing, publishing, or skill-maintenance work:

1. Follow `AGENT_WORKFLOW.md`.
2. Run `npm run agent:audit` when available.
3. Choose the matching skill from `skills/_meta/task-map.md`.
4. Read `skills/<skill-name>/SKILL.md`.
5. Check `templates/modules/` before writing common systems from scratch.
6. State which skill you are using.
7. Follow that skill's workflow.

## Available Skills

- `phaser-game-design-interviewer` at `skills/phaser-game-design-interviewer/SKILL.md`
- `phaser-first-playable-builder` at `skills/phaser-first-playable-builder/SKILL.md`
- `phaser-feature-slicer` at `skills/phaser-feature-slicer/SKILL.md`
- `phaser-refactor-guardian` at `skills/phaser-refactor-guardian/SKILL.md`
- `phaser-error-recovery-debugger` at `skills/phaser-error-recovery-debugger/SKILL.md`
- `phaser-version-docs-sync` at `skills/phaser-version-docs-sync/SKILL.md`
- `phaser-state-machine-patterns` at `skills/phaser-state-machine-patterns/SKILL.md`
- `phaser-physics-collision-designer` at `skills/phaser-physics-collision-designer/SKILL.md`
- `phaser-camera-level-design` at `skills/phaser-camera-level-design/SKILL.md`
- `phaser-content-pipeline` at `skills/phaser-content-pipeline/SKILL.md`
- `phaser-save-schema-migrations` at `skills/phaser-save-schema-migrations/SKILL.md`
- `phaser-progression-economy` at `skills/phaser-progression-economy/SKILL.md`
- `phaser-accessibility-localization` at `skills/phaser-accessibility-localization/SKILL.md`
- `phaser-release-platforms` at `skills/phaser-release-platforms/SKILL.md`
- `phaser-ai-art-asset-brief` at `skills/phaser-ai-art-asset-brief/SKILL.md`
- `phaser-visual-taste` at `skills/phaser-visual-taste/SKILL.md`
- `phaser-ui-redesign-auditor` at `skills/phaser-ui-redesign-auditor/SKILL.md`
- `phaser-brandkit-brief` at `skills/phaser-brandkit-brief/SKILL.md`
- `phaser-project-architect` at `skills/phaser-project-architect/SKILL.md`
- `phaser-scene-workflow` at `skills/phaser-scene-workflow/SKILL.md`
- `phaser-assets-pipeline` at `skills/phaser-assets-pipeline/SKILL.md`
- `phaser-input-mobile-desktop` at `skills/phaser-input-mobile-desktop/SKILL.md`
- `phaser-responsive-layout` at `skills/phaser-responsive-layout/SKILL.md`
- `phaser-game-systems` at `skills/phaser-game-systems/SKILL.md`
- `phaser-ui-hud` at `skills/phaser-ui-hud/SKILL.md`
- `phaser-gamefeel` at `skills/phaser-gamefeel/SKILL.md`
- `phaser-spritesheet-pipeline` at `skills/phaser-spritesheet-pipeline/SKILL.md`
- `phaser-tilemaps-tiled` at `skills/phaser-tilemaps-tiled/SKILL.md`
- `phaser-audio-sfx` at `skills/phaser-audio-sfx/SKILL.md`
- `phaser-debug-performance` at `skills/phaser-debug-performance/SKILL.md`
- `phaser-programmatic-art` at `skills/phaser-programmatic-art/SKILL.md`
- `phaser-testing` at `skills/phaser-testing/SKILL.md`
- `phaser-generator-feedback-reporter` at `skills/phaser-generator-feedback-reporter/SKILL.md`
- `phaser-skill-pack-maintainer` at `skills/phaser-skill-pack-maintainer/SKILL.md`
- `phaser-idle-game-architect` at `skills/phaser-idle-game-architect/SKILL.md`
- `phaser-idle-economy-balancer` at `skills/phaser-idle-economy-balancer/SKILL.md`
- `phaser-idle-ui-feedback` at `skills/phaser-idle-ui-feedback/SKILL.md`
- `phaser-idle-offline-prestige` at `skills/phaser-idle-offline-prestige/SKILL.md`

## Default Routing

- Raw game idea: `phaser-game-design-interviewer`
- First playable loop: `phaser-first-playable-builder`
- Broad feature slicing: `phaser-feature-slicer`
- Refactor guardrails: `phaser-refactor-guardian`
- Build/runtime debugging: `phaser-error-recovery-debugger`
- Phaser version/API sync: `phaser-version-docs-sync`
- Behavior state machines: `phaser-state-machine-patterns`
- Physics/collision design: `phaser-physics-collision-designer`
- Camera and level design: `phaser-camera-level-design`
- Gameplay content as data: `phaser-content-pipeline`
- Save schema migrations: `phaser-save-schema-migrations`
- Progression/economy: `phaser-progression-economy`
- Idle/incremental architecture: `phaser-idle-game-architect`
- Idle balance and cost curves: `phaser-idle-economy-balancer`
- Idle UI and feedback: `phaser-idle-ui-feedback`
- Idle offline progress and prestige: `phaser-idle-offline-prestige`
- Accessibility/localization: `phaser-accessibility-localization`
- Release platforms: `phaser-release-platforms`
- Art asset briefs: `phaser-ai-art-asset-brief`
- Visual taste and screen polish: `phaser-visual-taste`
- Existing UI redesign audit: `phaser-ui-redesign-auditor`
- Brandkit and identity briefs: `phaser-brandkit-brief`
- Architecture: `phaser-project-architect`
- Scenes: `phaser-scene-workflow`
- Assets: `phaser-assets-pipeline`
- Input: `phaser-input-mobile-desktop`
- Responsive layout: `phaser-responsive-layout`
- Systems/state/save/events: `phaser-game-systems`
- HUD/menus/overlays: `phaser-ui-hud`
- Game feel: `phaser-gamefeel`
- Spritesheet cutting/cleanup/atlases/animation states: `phaser-spritesheet-pipeline`
- Tilemaps/Tiled worlds: `phaser-tilemaps-tiled`
- Audio/music/SFX: `phaser-audio-sfx`
- Debug overlays/performance: `phaser-debug-performance`
- Programmatic placeholder art and coded visuals: `phaser-programmatic-art`
- Tests/build validation: `phaser-testing`
- Generator feedback after failed/reworked task: `phaser-generator-feedback-reporter`
- Skills/docs updates: `phaser-skill-pack-maintainer`


Keep the project Phaser-focused. Do not add unrelated frameworks, backend services, wrappers, or publishing SDKs unless the user asks.
