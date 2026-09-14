# Iron Hold: лог работы с ИИ

Дата работы: 2026-09-14.

Этот лог оставлен как рабочий, а не рекламный: в нём есть смена направления, баги, правки после скриншотов и уточнения требований.

## Исходное ТЗ

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

## Промты пользователя

```text
го сделаем оборону точки, по принципу тавер дефенса. Будут улучшения, внизу навбар перехода по окнам. У танка качаются характеристики, можно прокачивать базу.
```

```text
ок. напиши мд план. всякие коллектебелсы и пр. иконки что нужны для интерфейса сгенерим спрайтшитом ты вырежешь. сделай план пошаговым.
```

```text
делай
```

```text
пули не летят и ты неправильно собрал танк. просмотри семпл который приложен в арте
```

```text
танк двигается не по физике танка. у него две гусеницы. поресерчи поправь
```

```text
ок теперь го воправим интерфейс. сделай аккуратные кнопки, сгенерь иконки спрайтшщитом
```

```text
ок го сделаем мапу больше, добавим минимапу в угол
сделаем бой интереснее, разделим их на стейджи
```

```text
https://github.com/fightme-qq/Iron-Hold
залей на гитхаб пейджс
```

```text
1. карта слишком маленькая
2. сделай обстаклы с коллизиями
3. бочки должны взрываться при попадании
4. враги тупые. сделаем им логику поваорта башни и тд. по балансу игрок умирает после 5 попаданий примерно
5. сделай коллектблс репейра
6. сделай реликтовые точки на карте и базу врага
7. реликтовые точки можно захватить и они будут сражаться в определенном радиусе
8. враги выезжают из своей базы ит тоже собирают точки.
9. сделай туман войны на миникарте и обзор который можно прокачивать
10. сгенерь спрайтшитом базу, реликтовые точки, коллектблсы репейра и денег
```

```text
убери старт волны игра начинается сразу при входе. отображай на карте реликтовые точки. добавь им прогресс бар при захвате 

сделай карту интереснее сгенерь ееще что-то для окружения
сделай карту где базы стоят друг на против друга вертикально
```

```text
я не могу выбрать вкладку ни одну попап сразу закрывается. смотри на скрин игрок рисуется снизу реликтовой точки и окружения такого быть не должно

прогресс бар сделай круговой вокруг реликтовой точки и он должен работать так что посдле захвата игрок может уезать от него. и должен появляться не флаг а бункер 2 скрин который стреляет в врагов пока его не захваттят

врагас корострельнсоти уменьши. и у игрока нет хп отобрапжай хп бар над игроком пули сквозь него проодятю отображай хп бар над бункерами если его уничтожат то появляется флаг как раз нужно снова прийти чтобы бункер появился
```

```text
убери туман войны отображай все на миникарте

сделай карту еще больше. а врагов не таими тупыми они просто по прямой на мою базу едут. и враги до сих пор стреляют СКВОЗЬ ИГРОКА у него нет хъитбокса и голлийзий
```

```text
ок го теперь сделаем меню игры. сделаем в космо стиде сгенерь планеты программно из повесь в воздухе сделай эффект паралакса падающие звезды и тдл д это выбор мапы.
```

```text
сделай так чтобы коллектбелсы не пропадали и вращение им сделай в 2 раза медленнее

так же сделай то что дает гайки коллексблс 1 дает 10 гаек

и базе врага дай хп  чтобы игрок мог уничтожить ее и пройти мапу
```

```text
при выборе в мейн меню у меня игра падает работает только кнопка лаунч дефенс. поправь баг

И СГЕНЕРЬ ПЛАНЕТЫ И ВЫРЕЖИ ИХ
так же сделай красивее UI нажимаешь на планету на нее наводится камера типа того
```

```text
ок создай 2 отдельных мд файла 1 с ответами на вопросы 
2 с логами чата по тз
```

## Лог действий ИИ

```text
1. Прочитаны проектные инструкции AGENTS.md, START_HERE.md, AGENT_WORKFLOW.md и карта локальных skills.
2. Определён жанр: top-down tank defense / tower defense hybrid.
3. Сформирован пошаговый план в Markdown: docs/defense-loop-step-plan.md.
4. Реализован первый playable loop: танк, база, волны, враги, детали, апгрейды, нижний navbar.
5. После фидбэка исправлена стрельба и сборка танка по приложенному sample.
6. По запросу "две гусеницы" добавлено tank-like differential drive: W/S движение, A/D поворот корпуса, башня целится отдельно.
7. Сгенерирован UI spritesheet для иконок интерфейса, вырезан скриптом и подключён в HUD.
8. Карта увеличена, добавлена камера, миникарта и стадии внутри волн.
9. Проект опубликован на GitHub Pages.
10. Добавлены obstacles с коллизиями, взрывающиеся бочки, repair collectibles, enemy base, реликтовые точки, enemy turret aiming и player HP.
11. Сгенерирован spritesheet базы, enemy base, реликтов, ремонта, денег/гаек и взрыва.
12. По фидбэку убран ручной Start Wave: игра стала стартовать сразу.
13. Базы переставлены вертикально друг напротив друга.
14. Сгенерирован и подключён spritesheet окружения: камни, плиты, кратер, шины, лом, кусты, баррикада, антенна, лужа.
15. Исправлен баг, где вкладки HUD закрывались сразу во время волны.
16. Реликтовые точки получили круговой прогресс захвата.
17. После захвата реликт создаёт бункер, который стреляет в радиусе. При разрушении бункера остаётся флаг, точку можно восстановить.
18. Добавлены HP bars над игроком, enemy base и активными бункерами.
19. Вражеская скорострельность уменьшена.
20. Убран fog-of-war на миникарте по фидбэку: теперь видны все враги, базы и точки.
21. Карта увеличена до 4800x3200.
22. Улучшен AI врагов: враги выбирают реликты, боковые lanes, перехватывают игрока рядом и объезжают препятствия.
23. Исправлены попадания по игроку: добавлена проверка траектории пули между кадрами, чтобы быстрые снаряды не пролетали сквозь танк.
24. Добавлено космическое меню выбора карты с параллаксом, звёздами, метеорами и карточками секторов.
25. Исправлен баг меню: выбор карты больше не вызывает scene.restart во время pointer event.
26. Сгенерирован spritesheet планет меню, вырезан в public/assets/spritesheets/menu-planets.png и подключён в Phaser.
27. UI меню улучшен: большая выбранная планета, подсветка карточки, tween-фокус слоя планет при выборе.
28. Collectibles сделаны постоянными, вращение замедлено в 2 раза.
29. Один parts collectible теперь даёт 10 гаек.
30. Enemy base получила 36 HP; уничтожение enemy base завершает карту победой.
31. Созданы текущие сдаваемые документы: docs/iron-hold-loop-one-page.md и docs/iron-hold-ai-chat-log.md.
```

## Промты для генерации ассетов

### UI icons

```text
Create a clean 4x4 spritesheet of 16 small game UI icons for a toy-like top-down tank defense game, matching Kenney-style simple vector game assets. Each icon centered in its own equal cell with generous spacing. Icons in order left-to-right, top-to-bottom: metal parts bolt, base shield with heart, wave radar rings, bullet damage burst, reload circular arrows, tank armor plate, speed treads, repair wrench, auto turret, sandbag barrier, battle crosshair, tank tab silhouette, base tab bunker, map folded map, play triangle, restart circular arrow. Flat colors, bold dark outline, no text, readable at 32px, consistent palette: dark teal outlines, blue tank accent, warm yellow reward, green repair, red danger accents. Place every sprite on a perfectly flat solid #FF00FF background. No transparency, no checkerboard, no gradient, no background texture. No shadows or glow touching the background. No colored spill around sprite edges. Keep icons inside cells, no icon touching another icon.
```

### Defense objects

```text
Use case: stylized-concept
Asset type: transparent Phaser defense object spritesheet
Primary request: create a 3x3 spritesheet for a top-down tank defense game.
Subject: friendly repair base bunker, enemy base bunker red, neutral relic circular platform, friendly captured relic blue flag, enemy captured red flag, repair kit collectible, money/parts crate collectible, vision radar dish, small explosion burst.
Style/medium: polished 2D game sprites, readable top-down/isometric-lite, clean outline, arcade military field style.
Composition/framing: square 3 by 3 grid, each object centered in its own equal cell.
Constraints: transparent background, no text, no labels, no watermark.
```

### Environment props

```text
Use case: stylized-concept
Asset type: transparent top-down Phaser game environment spritesheet
Primary request: create a 3x3 spritesheet of environment props for a top-down arcade tank defense game.
Subject: nine separate objects: 1 rock cluster, 2 broken concrete slab, 3 shallow crater, 4 tire stack, 5 rusty scrap pile, 6 small pine shrub cluster, 7 road barricade, 8 metal antenna wreck, 9 muddy puddle.
Style/medium: polished 2D game sprites, readable top-down/isometric-lite, thick clean outline, slightly cartoon military field style matching bright tank sprites.
Composition/framing: square 3 by 3 grid, each object centered in its own equal cell, no overlap between cells.
Lighting/mood: neutral game asset lighting.
Color palette: greens, greys, rusty red, muted yellow accents; avoid monochrome.
Constraints: transparent background, no text, no labels, no watermark, no shadows that bleed between cells.
```

### Menu planets

```text
Use case: stylized-concept
Asset type: transparent Phaser menu planet spritesheet
Primary request: create a horizontal 3-frame spritesheet of three large sci-fi planets for a space map selection menu.
Subject: frame 1 green/yellow frontier planet with thin gold ring; frame 2 red volcanic orbit planet with orange ring and glowing cracks; frame 3 blue rift planet with cyan atmosphere and small purple ring.
Style/medium: polished 2D game menu art, clean readable shapes, rich color, soft rim glow, premium mobile game quality.
Composition/framing: exact 3 columns by 1 row, each planet centered in its equal cell, each with transparent background, no overlap between cells, enough padding for glow.
Lighting/mood: deep-space rim lighting, luminous but readable.
Constraints: transparent background, no text, no labels, no watermark, no stars, no UI panels, only the three planets.
```

## Проверки

```text
npm run build
npm test
npm run test:smoke
ручные Playwright-проверки меню, выбора карты, старта игры, миникарты и HUD
```

## Коммиты по ходу работы

```text
d4c28bf  initial GitHub Pages deployment / early playable
854f728  Expand defense loop with relic control
deed475  Start battle immediately and enrich map
60c2fbb  Fix relic capture and combat HUD
f7ae25b  Improve enemy routing and remove minimap fog
ab5c24a  Add space map selection menu
43c241e  Add enemy base objective and persistent drops
a823b2d  Polish space map menu with generated planets
```
