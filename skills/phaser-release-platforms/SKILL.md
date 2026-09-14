---
name: phaser-release-platforms
description: Use when preparing a Phaser web game for release or platform targeting: itch.io, GitHub Pages, Netlify, Vercel, Yandex Games, CrazyGames, Poki-style portals, Telegram Mini Apps, PWA, fullscreen, orientation, safe area, asset paths, save storage, analytics placeholders, SDK boundaries, and build constraints.
---

# Phaser Release Platforms

## Workflow

1. Read `references/platform-targets.md` before adding platform code or release config.
2. Identify the target platform and whether a project-specific integration pack exists.
3. Keep SDK calls behind `src/game/platform/` adapters.
4. Verify asset paths, fullscreen/orientation, safe areas, storage, and audio policies.
5. Build static output and test it locally before packaging.
6. Treat unsupported platforms as optional targets, not guaranteed integrations.

## Rules

- Do not scatter platform SDK calls through scenes.
- Do not promise a portal integration unless the SDK boundary is implemented.
- Avoid runtime CDNs unless the platform explicitly requires its own SDK path.
- Keep release notes clear about what is configured and what remains a placeholder.

