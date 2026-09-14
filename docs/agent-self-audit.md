# Agent Self Audit

Run this mentally at the start of a new session.

## Repository Facts

- Engine: Phaser
- Language: TypeScript
- Build: Vite
- Target: desktop-first
- Local skills: `skills/`
- Main workflow: `AGENT_WORKFLOW.md`

## Check Before Editing

- What scene currently starts the game?
- Is the sandbox still present?
- Which skill matches the task?
- Are assets real, generated, or missing?
- Is Yandex publishing enabled? No.
- Are Playwright smoke tests enabled? Yes.
- What command validates this change?

## Output

Before editing, state:

```text
Using [skill] because [reason]. I checked [files]. I will validate with [command/check].
```
