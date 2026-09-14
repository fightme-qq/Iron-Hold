# Default Scene Stack

Recommended base:

- `BootScene`: platform boot, early flags, redirects to preload.
- `PreloadScene`: asset loading and loader progress UI.
- `TemplateGuideScene`: generated onboarding scene; replace with real menu/gameplay once the first loop exists.
- `GameScene`: first playable or sandbox scene.
- `UIScene`: HUD overlay.
- `sceneTransitions.ts`: fade helpers for scene changes that should feel intentional.

Optional:

- `PauseScene`: pause overlay.
- `MenuScene`: real game menu after the first playable is designed.
- `GameOverScene`: post-run summary.
- `SettingsScene`: controls/audio/language.
- `LevelSelectScene`: progression games.

Keep scene names stable because agent routing and tests often refer to them.
