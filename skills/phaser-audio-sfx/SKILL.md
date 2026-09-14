---
name: phaser-audio-sfx
description: Use when adding browser-safe audio to a Phaser game: music, SFX, procedural sounds, mute and volume settings, mobile audio unlock, pause/resume behavior, or platform ad audio handling.
---

# Phaser Audio And SFX

## Workflow

1. Read `references/browser-audio-unlock.md` before adding sound that plays on startup.
2. Read `references/audio-manager.md` before scattering sound calls across scenes.
3. Read `references/volume-settings.md` before adding mute, music, or SFX controls.
4. Read `references/sfx-pooling.md` before adding repeated sounds like shots, pickups, or hits.
5. Verify audio on mobile and desktop after the first user gesture.

## Rules

- Browser audio usually needs a user gesture before playback.
- Keep music and SFX volumes separate.
- Persist mute/volume settings through the save/settings system.
- Pause or mute audio during ads/platform pause.
- Prefer short, readable cues over constant noise.

