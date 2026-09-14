# Decision: Defense Loop First Playable

Date: 2026-09-14

## Context

The project started from a generated Phaser template with idle starter content, while the selected game loop is an active top-down tank base defense game with tower-defense-style upgrades.

## Decision

Use `GameScene` for the playable battle loop and `UIScene` for persistent HUD, bottom navbar, upgrade panels, and wave actions. Keep the first version runtime-only: waves, parts, base HP, and upgrades reset on restart.

## Consequences

This makes the first playable easy to test and tune quickly. Persistent campaign progression, generated icon atlases, and deeper tower placement can be added after the combat and upgrade loop feel stable.
