---
name: phaser-scene-workflow
description: Use when creating, refactoring, debugging, or connecting Phaser scenes: boot, preload, menu, gameplay, UI overlay, pause, transitions, scene lifecycle, or scene communication.
---

# Phaser Scene Workflow

## Workflow

1. Read `references/scene-lifecycle.md` before changing lifecycle methods.
2. Read `references/default-scene-stack.md` before adding or removing scenes.
3. Read `references/scene-communication.md` before passing data/events across scenes.
4. Keep loading in `PreloadScene` or asset helpers.
5. Keep persistent HUD/overlay UI in a separate scene when it must survive gameplay restarts.
6. Use explicit scene keys and central constants when the project grows.

## Default Scene Stack

- `BootScene`: quick startup decisions.
- `PreloadScene`: asset loading.
- `TemplateGuideScene`: explains how to turn the template into a real game.
- `GameScene`: sandbox placeholder for the first playable loop.
- `UIScene`: HUD/overlay.

