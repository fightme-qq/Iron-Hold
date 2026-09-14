# Accessibility And Localization Checklist

Accessibility:

- Keyboard path exists for core gameplay and menus.
- Touch targets are large enough for mobile.
- Text is readable at phone and desktop sizes.
- Important UI has sufficient contrast.
- Reduced motion can limit shake, flashes, and heavy particles.
- Controls are documented in UI only when the game needs it.
- Error/game-over/restart states are reachable without precision input.

Localization:

- Player-facing strings use keys after the prototype grows.
- Default locale exists.
- Missing string falls back safely.
- Font supports chosen languages.
- Text boxes can fit longer translated strings.
- RTL support is not required unless requested.
