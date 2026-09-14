# No CDN And Self-Hosting

For game portals, mobile browsers, and Yandex Games, avoid external dependencies at runtime.

Rules:

- Do not use Google Fonts links.
- Do not load libraries from CDN.
- Self-host fonts under `public/assets/fonts/` or `public/fonts/`.
- Use npm dependencies bundled by Vite instead of runtime CDN scripts.
- Yandex allows its own SDK path `/sdk.js`; do not treat that as a generic CDN exception.

This reduces blank-page failures, moderation issues, and regional network failures.
