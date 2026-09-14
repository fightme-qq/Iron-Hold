# Start Here

You opened a generated Phaser game repository.

If you are a human:

1. Open this folder in Codex, Claude Code, Gemini CLI, or another coding agent.
2. The archive includes auto-loaded context files for common agents. You can ask normally; the agent should already see `AGENTS.md` or the matching agent-specific entry file.
3. If an agent seems lost, paste this fallback:

```text
Read AGENTS.md, then answer my last request using the local skill map.
```

4. The original idea is recorded in `GAME_BRIEF.md`.
5. Run:

```bash
npm install
npm run agent:audit
npm run dev
```

6. Open the local URL printed by Vite.

If you are an AI coding agent:

1. Read `AGENTS.md` first.
2. Read `AGENT_WORKFLOW.md`.
3. Run `npm run agent:audit` if dependencies are installed.
4. Read `skills/_meta/task-map.md` and the selected skill for the task.
5. Pull deeper docs only when the current task needs them.
6. Check `templates/modules/` before inventing common systems from scratch.
7. If you are changing skills or agent docs, use `phaser-skill-pack-maintainer` first.
8. Before changing code, explain which skill you are using and why.
9. Keep this repo Phaser-focused. Do not convert it into a generic web app.

## What This Project Is

- Game title: My Phaser Game
- Engine: Phaser
- Language: TypeScript
- Build tool: Vite
- Primary target: desktop-first browser game
- Idle / Incremental pack: included
- Yandex Games publish pack: not included
- Generated skills: 38
- Initial idea: No specific idea was entered. Ask the human for a one-sentence game idea, then propose three tiny first playable loops.

## First Useful Agent Prompts

```text
Use phaser-project-architect. My game idea is: [describe game]. Turn it into a first playable loop.
```

```text
Use phaser-scene-workflow. Replace the template guide with real gameplay for this idea: [describe game].
```

```text
Use the phaser-input-mobile-desktop and phaser-responsive-layout skills to make this work well on phone and desktop.
```
