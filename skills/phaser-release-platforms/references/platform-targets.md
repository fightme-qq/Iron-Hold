# Platform Targets

Generic static hosting:

- GitHub Pages, Netlify, Vercel, itch.io.
- Check base path, asset URLs, HTTPS, and static output.

Game portals:

- Yandex Games: use the optional Yandex pack when enabled.
- CrazyGames/Poki-style portals: treat SDK as optional until adapter exists.
- Ads, pause/resume, leaderboard, and analytics need platform boundaries.

Telegram Mini Apps:

- Requires viewport/safe-area attention and SDK boundary.
- Save strategy may differ from plain localStorage.

PWA:

- Requires manifest, icons, service worker, offline strategy.
- Do not add by default for the first playable.

Release checklist:

- Build command passes.
- Game works from built `dist/`.
- No broken asset paths.
- Orientation and fullscreen behavior are intentional.
- Save/settings work after reload.
- Audio starts only after user gesture.
- Analytics calls are no-op placeholders unless configured.
