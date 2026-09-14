# My Phaser Game

Generated with Phaser Game Creator.

This repo is built to be opened by a coding agent. Common agents should auto-load the root instructions; `AGENTS.md` is the context anchor and operating contract for every prompt.

## Run

```bash
npm install
npm run agent:audit
npm run dev
```

## Build

```bash
npm run build
```

## Smoke Tests

If this project includes Playwright smoke tests, install the browser once before running them:

```bash
npx playwright install
npm run test:smoke
```

On Linux CI, use `npx playwright install --with-deps` if the environment is missing browser dependencies.

## Project Shape

```text
src/game/
  config/     Phaser configuration and constants
  scenes/     Boot, Preload, TemplateGuide, Game, UI scenes
  systems/    Gameplay systems with explicit boundaries
  entities/   Game objects and entity factories
  input/      Mobile/desktop input abstraction
  ui/         HUD and menu helpers
  state/      Runtime state and events
  assets/     Asset manifest and loader helpers
  save/       Local save/load helpers
  utils/      Small shared utilities
skills/       Project-local AI skills
```

## Agent Entry Points

- `AGENTS.md`: operating instructions for AI agents.
- `AGENT_WORKFLOW.md`: required agent operating loop.
- `CLAUDE.md`: Claude Code entry instructions.
- `GEMINI.md`: Gemini CLI entry instructions.
- `.github/copilot-instructions.md`: GitHub Copilot instructions.
- `.cursor/rules/phaser-game-creator.mdc`: Cursor auto-applied rule.
- `.ai/agent-entry.md`: generic AI agent entry instructions.
- `.ai/skill-manifest.json`: machine-readable skill map.
- `skills/README.md`: what skills exist and when to use them.
- `skills/_meta/task-map.md`: task-to-skill routing table.
- `skills/_meta/update-skills.md`: how to keep skills current.
- `docs/game-design-intake.md`: how to parse vague game ideas.
- `docs/first-playable-contract.md`: what must be true before the first loop is done.
- `docs/validation-matrix.md`: checks before finishing work.
- `docs/quality-gates.md`: first playable, architecture, visual taste, asset, mobile, and runtime gates.
- `docs/release-checklist.md`: public build readiness checklist.
- `docs/IDLE_GAME_DESIGN.md`: idle/incremental architecture and Phaser integration notes.
- `docs/mobile-checklist.md`: phone and touch validation checklist.
- `docs/asset-credits-policy.md`: asset sourcing and copyright rules.
- `docs/feature-recipes/`: common implementation recipes.
- `docs/genre-blueprints/`: first playable blueprints by genre.
- `docs/decisions/`: short architecture and product decisions.
- `templates/modules/`: reusable TypeScript starting points for common game systems.
- `scripts/agent-audit.mjs`: prints a machine-friendly project snapshot for agents.
- `docs/game-creator-guide.md`: how to turn an idea into the first playable.
- `docs/first-playable-loop.md`: what "first playable" means.
- `docs/idea-to-architecture.md`: idea-to-module hints.
