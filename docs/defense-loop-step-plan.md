# Defense Loop Step Plan

Date: 2026-09-14

## Goal

Build one playable loop for a top-down tank base defense game: the player protects a repair base through short waves, earns parts, then chooses upgrades for either the tank or the base before the next wave.

## Core Loop

1. **Prepare**
   - Player sees the next wave preview and current base HP.
   - Player decides whether to spend parts on tank stats, base durability, repair, or a turret.
   - Reward for the decision: the next wave feels easier in the chosen direction.

2. **Defend**
   - Enemies drive toward the base from lane spawn points.
   - Player moves the tank, aims, shoots, and intercepts priority targets.
   - Reward for the decision: destroyed enemies drop parts and reduce pressure on the base.

3. **Survive Damage**
   - Enemies that reach the base deal damage and disappear.
   - Player decides whether to chase distant enemies or stay near the base.
   - Reward for the decision: saved base HP becomes an end-wave bonus.

4. **Collect And Upgrade**
   - Parts are collected from enemy wrecks and wave bonuses.
   - Player spends parts through the bottom navbar windows.
   - Reward for the decision: visible stat increases and new defense behavior.

5. **Escalate**
   - The next wave adds more enemies, faster enemies, or tougher enemies.
   - Win: survive wave 5 in the first playable.
   - Lose: base HP reaches 0.
   - Restart: reset the run, keep the plan simple until save progression is added.

## Resource And Balance

**Key resource:** parts.

- Comes from destroyed enemy tanks, destructible barrels, and a base-HP bonus after each wave.
- Goes into tank upgrades, base upgrades, and emergency repair.
- Anti-farm rule: each wave has a fixed enemy count, parts despawn after a short delay, and repair costs eat profit when defense is sloppy.

Example first-session numbers:

- Wave 1: 6 scouts, 2 parts each, max enemy reward 12.
- Base HP bonus: +1 part per 20 HP remaining, max +5.
- Emergency repair: 4 parts for 10 base HP.
- Tank damage level 1: 10 parts.
- Tank reload level 1: 12 parts.
- Tank armor level 1: 10 parts.
- Base HP level 1: 12 parts.
- Auto-turret unlock: 18 parts.

Why these numbers: wave 1 lets the player afford one small upgrade, but not enough to upgrade tank and base at the same time.

## Retention Hook

The player returns because the defense layout and upgrade path create an unfinished tactical problem. Each session pushes the base one wave deeper into the campaign, revealing stronger enemy mixes and making yesterday's upgrade choice matter.

After one week, the loop should support build identity:

- mobile interceptor tank with speed and reload upgrades;
- fortress base with HP, repairs, and turret upgrades;
- glass-cannon tank that clears waves fast but risks base damage;
- hybrid build that survives steadily but earns fewer perfect-defense bonuses.

No daily login reward is needed. The reason to return is curiosity about whether the current build can handle the next enemy pattern.

## Interface Plan

Bottom navbar tabs:

- **Battle:** live combat view, wave counter, base HP, parts, pause/restart.
- **Tank:** upgrade cards for damage, reload, armor, speed.
- **Base:** upgrade cards for max HP, repair, turret, barrier.
- **Map:** wave preview, enemy types, current campaign node.

First playable navbar behavior:

- Tabs are always visible at the bottom.
- During an active wave, `Tank`, `Base`, and `Map` can open read-only or be locked with a clear disabled state.
- Between waves, upgrade tabs become interactive.
- Battle remains the default tab after starting a wave.

## Collectibles

Runtime collectibles:

- `parts-small`: 1 part, common drop from scout enemies.
- `parts-crate`: 3 parts, rare drop or destructible barrel reward.
- `repair-kit`: restores 5 base HP immediately, rare wave drop.
- `overcharge-cell`: temporary faster reload for 6 seconds, optional after MVP.

MVP collectibles:

- Start with `parts-small` only.
- Add `parts-crate` when destructible barrels are in.
- Delay `repair-kit` and `overcharge-cell` until the wave loop is stable.

## Upgrade Data

Tank upgrades:

- `tank-damage`: increases bullet damage.
- `tank-reload`: reduces fire cooldown.
- `tank-armor`: reduces collision or projectile damage to the player tank if player HP is added.
- `tank-speed`: improves repositioning.

Base upgrades:

- `base-max-hp`: increases max base HP.
- `base-repair`: restores base HP between waves.
- `base-turret`: unlocks one auto-firing turret near the base.
- `base-barrier`: adds a destructible blocker on one lane.

MVP upgrade set:

- `tank-damage`
- `tank-reload`
- `base-max-hp`
- `base-repair`
- `base-turret`

Keep upgrade definitions in data/config, not scattered inside scenes.

## Asset Plan

Existing art source:

- Use `art/PNG/Tanks/` for player and enemy tanks.
- Use `art/PNG/Bullets/` for shots.
- Use `art/PNG/Environment/` for ground and trees.
- Use `art/PNG/Obstacles/` for barrels and cover.
- Use `art/PNG/Smoke/` for hit and explosion feedback.
- Prefer the existing `art/Spritesheet/sheet_tanks.png` plus XML if converting to a Phaser atlas is faster.

Generated UI spritesheet:

- File target: `public/assets/atlases/ui-defense-icons.png`
- Metadata target: `public/assets/atlases/ui-defense-icons.json`
- Style: clean toy-like tactical icons, readable at 24-48 px.
- Background for generation before cutting: flat `#FF00FF` chroma, no gradients, no transparency, no shadow touching the background.
- Export after cutting: transparent PNG atlas with stable frame names.

Required UI icons:

- `icon-parts`
- `icon-base-hp`
- `icon-wave`
- `icon-damage`
- `icon-reload`
- `icon-armor`
- `icon-speed`
- `icon-repair`
- `icon-turret`
- `icon-barrier`
- `icon-play`
- `icon-pause`
- `icon-restart`
- `icon-locked`
- `icon-upgrade`
- `icon-map`
- `icon-tank-tab`
- `icon-base-tab`
- `icon-battle-tab`

Generated collectible spritesheet:

- File target: `public/assets/atlases/defense-collectibles.png`
- Metadata target: `public/assets/atlases/defense-collectibles.json`
- Style: same palette and line weight as the tank assets.
- Chroma background: `#FF00FF`.
- Frame size target after cutting: 32x32 or 48x48.

Required collectible frames:

- `parts-small`
- `parts-crate`
- `repair-kit`
- `overcharge-cell`
- `scrap-spark-0`
- `scrap-spark-1`
- `scrap-spark-2`

Placeholder fallback:

- Use simple Phaser graphics circles/rectangles for icons and drops until generated sheets are ready.
- Keep placeholder asset keys identical to final keys where practical.

## Implementation Steps

### Step 1: Audit Current Template

- Inspect current scenes, asset manifest, input module, state module, and save module.
- Confirm whether existing idle modules should stay unused or be removed from the active loop later.
- Validation: project still builds after no-op inspection.

### Step 2: Add Combat State And Balance Data

- Add wave, base HP, parts, tank stats, base stats, and upgrade definitions.
- Keep pure balance data outside Phaser scenes.
- Validation: unit-level sanity if tests exist, otherwise log state transitions in dev.

### Step 3: Build Battle MVP

- Create player tank movement with two-track steering and separate turret aiming.
- Spawn one enemy type that moves toward the base.
- Add bullets, enemy HP, base damage, parts reward.
- Validation: player can complete wave 1 and lose if enemies reach the base.

### Step 4: Add Wave Flow

- Add wave start, wave clear, intermission, victory at wave 5, and defeat.
- Show base HP, parts, and wave count.
- Validation: restart works from victory and defeat.

### Step 5: Add Bottom Navbar Shell

- Add persistent bottom tabs: Battle, Tank, Base, Map.
- Keep Battle usable while tabs reserve fixed layout space.
- Validation: no overlap on desktop and mobile fallback viewports.

### Step 6: Add Upgrade Windows

- Implement Tank and Base upgrade panels.
- Spending parts immediately changes stats.
- Disable unaffordable upgrades.
- Validation: upgrades affect the next wave and cannot create negative parts.

### Step 7: Add Base Turret

- Unlock turret through base upgrade.
- Turret auto-targets nearest enemy within range.
- Validation: turret helps but cannot clear the whole wave alone at level 1.

### Step 8: Import Existing Tank Art

- Copy selected existing assets into `public/assets/`.
- Register asset keys in `src/game/assets/assetManifest.ts`.
- Replace placeholder tank, bullet, ground, smoke, and obstacle visuals.
- Add `public/assets/credits.md` entry for asset ownership/license.
- Validation: no missing texture warnings.

### Step 9: Generate And Cut UI/Collectible Sheets

- Generate icon and collectible sheets using the brief above.
- Cut into transparent PNG atlas frames.
- Register atlas keys in the asset manifest.
- Replace placeholder UI icons and drops.
- Validation: every frame name loads and displays in a debug/icon preview row.

### Step 10: Tune The One-Session Balance

- Tune enemy count, speed, HP, part drops, repair costs, and upgrade costs.
- Target session: 5 waves in 3-5 minutes.
- Validation: wave 1 gives one upgrade, wave 3 pressures the base, wave 5 is beatable with sensible spending.

### Step 10a: Expand Battlefield And Stage Flow

- Increase the battlefield beyond the viewport and let the camera follow the tank.
- Split waves into named stages such as probe, push, flank, and siege.
- Add a short reposition break between stages.
- Add a minimap with world bounds, viewport, base, player, and enemies.
- Validation: enemies can spawn outside the current camera view, minimap shows pressure, and the player can navigate back to the base.

### Step 11: Polish Feedback

- Add muzzle flash, hit smoke, pickup tween, base damage pulse, turret shot feedback, and upgrade confirmation.
- Keep effects readable and lightweight.
- Validation: combat feedback is visible without obscuring enemies.

### Step 12: Prepare Submission Page And Log

- Write the one-page loop document: loop, balance, retention, prompts/log.
- Keep the raw AI prompt log uncleaned.
- Validation: document matches the implemented MVP and honestly notes anything unfinished.

## Target Files

- `src/game/assets/assetManifest.ts`
- `src/game/config/gameEvents.ts`
- `src/game/scenes/PreloadScene.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/scenes/UIScene.ts`
- `src/game/state/GameState.ts`
- `src/game/systems/`
- `src/game/entities/`
- `src/game/ui/`
- `public/assets/`
- `public/assets/credits.md`
- `docs/first-playable-loop.md`
- `docs/decisions/`

## Boundaries

- Scenes own Phaser display, input wiring, timers, and transitions.
- Systems own wave spawning, combat resolution, upgrades, and rewards.
- State owns current run values and selected upgrades.
- Save is delayed until the loop works unless persistence becomes a hard requirement.
- UI owns navbar, panels, HUD, and disabled/affordable states.
- Assets are loaded through the manifest, not direct scattered strings.

## Deferred

- Persistent campaign save.
- Multiple maps.
- Many enemy factions.
- Deep tower placement.
- Mobile-specific virtual joystick.
- Full audio pass.
- Boss waves.
- Meta-progression beyond the first playable.

## Manual Validation Checklist

- Player can move, aim, and shoot.
- Enemy reaches base and damages it.
- Destroyed enemy gives parts.
- Wave can be cleared.
- Base can be destroyed.
- Upgrade can be bought between waves.
- Bought upgrade changes gameplay.
- Bottom navbar does not cover critical combat information.
- Desktop layout is readable.
- Mobile fallback layout remains touch-safe.
- `npm run build` passes after implementation.
