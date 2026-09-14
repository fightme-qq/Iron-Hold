# AI Work Log

Date: 2026-09-14

## Raw User Prompts

```text
прочитай agents md. В папку арт я приложил ассеты для нашей игры
ТЗ:
**Задание:**
За час (не больше), любыми ИИ-инструментами, спроектируйте один игровой луп — цикл, который игрок проходит за сессию и к которому возвращается. Контекст и сеттинг — любые.
Сдать одной страницей плюс лог:

1\) **Луп**. Шаги цикла: что игрок решает на каждом шаге и что получает за решение.
2\) **Баланс**. Один ключевой ресурс: откуда он приходит, куда уходит, что мешает фармить его бесконечно. Пример чисел на одну сессию и одно предложение, почему числа такие.
3\) **Ретеншн**. Почему игрок вернётся завтра — должен быть механизм внутри самого лупа, а не ежедневная награда и не пуш. И что с этим механизмом происходит через неделю игры.
4\) **Промты**. Приложить полный лог работы с ИИ без чистки.
5\) **Час**. Просьба честно уложиться в час работы. Незаконченный луп, с честным логом — лучше сфабрикованного результата.

го сначала обсудим
```

```text
го сделаем оборону точки, по принципу тавер дефенса. Будут улучшения, внизу навбар перехода по окнам. У танка качаются характеристики, можно прокачивать базу.
```

```text
ок. напиши мд план. всякие коллектебелсы и пр. иконки что нужны для интерфейса сгенерим спрайтшитом ты вырежешь. сделай план пошаговым.
```

```text
делай
```

## AI Tooling And Work Notes

- Read project instructions: `AGENTS.md`, `START_HERE.md`, `AGENT_WORKFLOW.md`, `skills/README.md`, and `skills/_meta/task-map.md`.
- Used local skills: `phaser-game-design-interviewer`, `phaser-first-playable-builder`, `phaser-feature-slicer`, `phaser-ai-art-asset-brief`, `phaser-assets-pipeline`, `phaser-scene-workflow`, `phaser-input-mobile-desktop`, `phaser-game-systems`, `phaser-ui-hud`, and `phaser-gamefeel`.
- Inspected `art/` and found Kenney-style top-down tank, bullet, smoke, environment, and obstacle assets.
- Proposed three loops, then selected active base defense / tower-defense-style tank defense after user choice.
- Wrote step plan in `docs/defense-loop-step-plan.md`.
- Implemented the first playable in Phaser with runtime-only waves, parts, upgrades, bottom navbar, and base defense.
- Installed dependencies with `npm install`.
- Installed Playwright Chromium because smoke tests required the browser binary.
- Verified with `npm run build`, `npm test`, `npm run agent:audit`, `npm run test:smoke`, and an extra Playwright click check for `Start Wave`.
- After feedback, researched differential-drive tank movement and changed player movement from free 2D strafing to two-track steering: W/S drive forward/back, A/D rotate the hull, turret aim remains pointer-driven.
- Generated a 4x4 UI icon spritesheet for parts, base HP, waves, upgrades, tabs, start, and restart. Cut it from chroma `#FF00FF` into `public/assets/spritesheets/ui-defense-icons.png` with `scripts/cut-ui-icons.py`.
- Expanded the battlefield to a scrolling 2200x1500 world, added camera follow, split waves into named stages with short breaks, and added a minimap in the UI corner.

## UI Icon Generation Prompt

```text
Create a clean 4x4 spritesheet of 16 small game UI icons for a toy-like top-down tank defense game, matching Kenney-style simple vector game assets. Each icon centered in its own equal cell with generous spacing. Icons in order left-to-right, top-to-bottom: metal parts bolt, base shield with heart, wave radar rings, bullet damage burst, reload circular arrows, tank armor plate, speed treads, repair wrench, auto turret, sandbag barrier, battle crosshair, tank tab silhouette, base tab bunker, map folded map, play triangle, restart circular arrow. Flat colors, bold dark outline, no text, readable at 32px, consistent palette: dark teal outlines, blue tank accent, warm yellow reward, green repair, red danger accents. Place every sprite on a perfectly flat solid #FF00FF background. No transparency, no checkerboard, no gradient, no background texture. No shadows or glow touching the background. No colored spill around sprite edges. Keep icons inside cells, no icon touching another icon.
```

## Known Unfinished Items

- UI and collectible icons are still text/placeholder-driven; final generated spritesheets are planned but not generated yet.
- Persistent campaign/save progression is deferred.
- Full audio pass is deferred.
- Deep tower placement is deferred; MVP has an unlockable auto-turret.
