---
name: phaser-version-docs-sync
description: Use before relying on Phaser APIs, plugins, examples, migration advice, or docs-sensitive behavior; check package.json for the installed Phaser version, prefer local project patterns, use official Phaser docs/examples for exact API, avoid deprecated or Phaser 2/old Phaser 3 patterns, and document version assumptions.
---

# Phaser Version Docs Sync

## Workflow

1. Read `package.json` before using uncertain Phaser APIs.
2. Read `references/version-check.md` before adding plugin or API-specific code.
3. Prefer patterns already used in this repository.
4. Use official Phaser docs/examples for exact API behavior when unsure.
5. Avoid Phaser 2 examples and old Phaser 3 snippets unless verified.
6. Document assumptions when changing Phaser version, plugins, physics engine, or scale mode.

## Rules

- Do not mix Phaser 4-only APIs into a Phaser 3 project.
- Do not add CDN examples from tutorials.
- Check plugin compatibility before installing or copying plugin setup.
- If docs and local patterns conflict, explain the choice and update local docs if needed.

