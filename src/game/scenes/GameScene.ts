import Phaser from 'phaser';
import {
  defenseBalance,
  getUpgradeCost,
  upgradeDefinitions,
  waves,
  type EnemyStage,
  type UpgradeId,
} from '../../data/defenseContent';
import { AssetKeys } from '../assets/assetManifest';
import { GameEvents } from '../config/gameEvents';
import { SceneKeys } from '../config/sceneKeys';
import { eventBus } from '../events/EventBus';
import { PlayerInput } from '../input/PlayerInput';
import { fadeInScene } from './sceneTransitions';

type DefensePhase = 'intermission' | 'wave' | 'stageBreak' | 'won' | 'lost';
type EnemyKind = 'scout' | 'bruiser';

type EnemyActor = {
  body: Phaser.Physics.Arcade.Image;
  barrel: Phaser.GameObjects.Image;
  hp: number;
  speed: number;
  parts: number;
};

type BulletActor = {
  damage: number;
};

type DropActor = {
  value: number;
  expiresAt: number;
};

export class GameScene extends Phaser.Scene {
  private playerInput!: PlayerInput;
  private player!: Phaser.Physics.Arcade.Image;
  private playerBarrel!: Phaser.GameObjects.Image;
  private baseCore!: Phaser.GameObjects.Rectangle;
  private baseRing!: Phaser.GameObjects.Arc;
  private turretBase?: Phaser.GameObjects.Image;
  private turretBarrel?: Phaser.GameObjects.Image;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private drops!: Phaser.Physics.Arcade.Group;
  private enemyActors = new Map<Phaser.Physics.Arcade.Image, EnemyActor>();
  private bulletActors = new Map<Phaser.Physics.Arcade.Image, BulletActor>();
  private dropActors = new Map<Phaser.Physics.Arcade.Image, DropActor>();
  private readonly basePosition = new Phaser.Math.Vector2(
    defenseBalance.world.width / 2,
    defenseBalance.world.height / 2,
  );
  private phase: DefensePhase = 'intermission';
  private activeTab: 'battle' | 'tank' | 'base' | 'map' = 'battle';
  private waveIndex = 0;
  private baseHp: number = defenseBalance.initialBaseHp;
  private maxBaseHp: number = defenseBalance.initialBaseHp;
  private parts: number = defenseBalance.initialParts;
  private upgradeLevels: Record<UpgradeId, number> = {
    'tank-damage': 0,
    'tank-reload': 0,
    'tank-speed': 0,
    'base-max-hp': 0,
    'base-repair': 0,
    'base-turret': 0,
  };
  private enemiesQueued: EnemyKind[] = [];
  private stageIndex = 0;
  private stageBreakTimerMs = 0;
  private hudPublishTimerMs = 0;
  private spawnTimerMs = 0;
  private fireTimerMs = 0;
  private turretTimerMs = 0;
  private elapsedMs = 0;
  private status = 'Wave 1 is ready. Protect the repair base.';
  private readonly hudPanelTop = 552;
  private playerForwardSpeed = 0;
  private playerHullRotation = -Math.PI / 2;

  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    this.resetRuntimeState();
    fadeInScene(this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
    this.createWorld();
    this.createActors();
    this.createPhysics();
    this.createEventHandlers();
    this.scene.launch(SceneKeys.UI, { title: 'Iron Hold' });
    this.publishHud();
    this.time.delayedCall(0, () => this.publishHud());

    eventBus.emit(GameEvents.GameplayStarted, { scene: SceneKeys.Game });
    eventBus.emit(GameEvents.RunStateChanged, { phase: 'playing' });
  }

  private resetRuntimeState(): void {
    this.enemyActors = new Map<Phaser.Physics.Arcade.Image, EnemyActor>();
    this.bulletActors = new Map<Phaser.Physics.Arcade.Image, BulletActor>();
    this.dropActors = new Map<Phaser.Physics.Arcade.Image, DropActor>();
    this.phase = 'intermission';
    this.activeTab = 'battle';
    this.waveIndex = 0;
    this.baseHp = defenseBalance.initialBaseHp;
    this.maxBaseHp = defenseBalance.initialBaseHp;
    this.parts = defenseBalance.initialParts;
    this.upgradeLevels = {
      'tank-damage': 0,
      'tank-reload': 0,
      'tank-speed': 0,
      'base-max-hp': 0,
      'base-repair': 0,
      'base-turret': 0,
    };
    this.enemiesQueued = [];
    this.stageIndex = 0;
    this.stageBreakTimerMs = 0;
    this.hudPublishTimerMs = 0;
    this.spawnTimerMs = 0;
    this.fireTimerMs = 0;
    this.turretTimerMs = 0;
    this.elapsedMs = 0;
    this.playerForwardSpeed = 0;
    this.playerHullRotation = -Math.PI / 2;
    this.status = 'Wave 1 is ready. Protect the repair base.';
  }

  update(time: number, delta: number): void {
    this.elapsedMs += delta;
    this.hudPublishTimerMs += delta;
    this.updatePlayer(delta);
    this.updateEnemies();
    this.updateBullets();
    this.updateDrops(time);

    if (this.phase === 'wave') {
      this.updateWave(delta);
      this.updateTurret(delta);
    } else if (this.phase === 'stageBreak') {
      this.updateStageBreak(delta);
    }

    if (this.hudPublishTimerMs >= 120) {
      this.hudPublishTimerMs = 0;
      this.publishHud();
    }
  }

  getDebugSnapshot(): { elapsedMs: number; phase: string; wave: number; baseHp: number; parts: number } {
    return {
      elapsedMs: this.elapsedMs,
      phase: this.phase === 'lost' ? 'lost' : this.phase === 'won' ? 'won' : 'playing',
      wave: this.waveIndex + 1,
      baseHp: this.baseHp,
      parts: this.parts,
    };
  }

  private createWorld(): void {
    const { width, height } = this.scale;
    this.physics.world.setBounds(0, 0, defenseBalance.world.width, defenseBalance.world.height);
    this.cameras.main.setBounds(0, 0, defenseBalance.world.width, defenseBalance.world.height);
    this.cameras.main.setBackgroundColor('#4c8f45');

    for (let x = 0; x < defenseBalance.world.width; x += 64) {
      for (let y = 0; y < defenseBalance.world.height; y += 64) {
        this.add.image(x + 32, y + 32, AssetKeys.Grass).setAlpha(0.74).setDisplaySize(64, 64);
      }
    }

    const graphics = this.add.graphics();
    graphics.fillStyle(0xb38b52, 0.35);
    graphics.fillRoundedRect(80, 86, defenseBalance.world.width - 160, defenseBalance.world.height - 172, 20);
    graphics.lineStyle(3, 0x6d623f, 0.45);
    graphics.strokeRoundedRect(80, 86, defenseBalance.world.width - 160, defenseBalance.world.height - 172, 20);
    graphics.lineStyle(2, 0x6d623f, 0.22);
    graphics.lineBetween(this.basePosition.x - 700, this.basePosition.y, this.basePosition.x + 700, this.basePosition.y);
    graphics.lineBetween(this.basePosition.x, this.basePosition.y - 500, this.basePosition.x, this.basePosition.y + 500);

    const decor = [
      { x: 190, y: 160, key: AssetKeys.TreeSmall },
      { x: 1940, y: 210, key: AssetKeys.TreeSmall },
      { x: 260, y: 1190, key: AssetKeys.SandbagBeige },
      { x: 1880, y: 1210, key: AssetKeys.BarrelRed },
      { x: 620, y: 210, key: AssetKeys.SandbagBeige },
      { x: 1500, y: 190, key: AssetKeys.BarrelRed },
      { x: 430, y: 760, key: AssetKeys.TreeSmall },
      { x: 1760, y: 770, key: AssetKeys.TreeSmall },
      { x: 1040, y: 290, key: AssetKeys.BarrelRed },
      { x: 1180, y: 1240, key: AssetKeys.SandbagBeige },
    ];

    for (const item of decor) {
      this.add.image(item.x, item.y, item.key).setScale(1.2).setAlpha(0.92);
    }

    this.baseRing = this.add.circle(this.basePosition.x, this.basePosition.y, 62, 0x10293b, 0.9);
    this.baseRing.setStrokeStyle(5, 0xf4d35e, 0.92);
    this.baseCore = this.add.rectangle(this.basePosition.x, this.basePosition.y, 74, 74, 0x2d5f73, 1);
    this.baseCore.setStrokeStyle(4, 0xd9f2ff, 1);
    this.add
      .text(this.basePosition.x, this.basePosition.y + 2, 'BASE', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
  }

  private createActors(): void {
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.drops = this.physics.add.group();
    this.playerInput = new PlayerInput(this);
    this.player = this.physics.add.image(this.basePosition.x, this.basePosition.y + 160, AssetKeys.PlayerTank);
    this.player.setDisplaySize(54, 54);
    this.player.setRotation(this.playerHullRotation + Math.PI / 2);
    this.player.setCollideWorldBounds(true);
    this.player.body?.setSize(42, 42);
    this.playerBarrel = this.add
      .image(this.player.x, this.player.y, AssetKeys.PlayerBarrel)
      .setOrigin(0.5, 0.78)
      .setDisplaySize(18, 46);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setDeadzone(this.scale.width * 0.24, this.scale.height * 0.2);
  }

  private createPhysics(): void {
    this.physics.add.overlap(this.bullets, this.enemies, (bulletObject, enemyObject) => {
      this.hitEnemy(bulletObject as Phaser.Physics.Arcade.Image, enemyObject as Phaser.Physics.Arcade.Image);
    });

    this.physics.add.overlap(this.player, this.drops, (_playerObject, dropObject) => {
      this.collectDrop(dropObject as Phaser.Physics.Arcade.Image);
    });
  }

  private createEventHandlers(): void {
    eventBus.on(GameEvents.StartWaveRequested, this.handleStartWaveRequested, this);
    eventBus.on(GameEvents.RestartRequested, this.handleRestartRequested, this);
    eventBus.on(GameEvents.UpgradeRequested, this.handleUpgradeRequested, this);
  }

  private updatePlayer(delta: number): void {
    const drive = this.playerInput.getTankDriveIntent();
    const deltaSeconds = delta / 1000;
    const forwardIntent = (drive.leftTrack + drive.rightTrack) / 2;
    const turnIntent = (drive.leftTrack - drive.rightTrack) / 2;
    const maxForwardSpeed = forwardIntent >= 0 ? this.getPlayerSpeed() : defenseBalance.player.reverseSpeed;
    const targetSpeed = forwardIntent * maxForwardSpeed;
    this.playerForwardSpeed = Phaser.Math.Linear(
      this.playerForwardSpeed,
      targetSpeed,
      Math.min(1, defenseBalance.player.acceleration * deltaSeconds / Math.max(this.getPlayerSpeed(), 1)),
    );

    const turnBoost = Math.abs(forwardIntent) < 0.15 ? 1 : 0.72;
    this.playerHullRotation += Phaser.Math.DegToRad(defenseBalance.player.turnSpeedDeg) * turnIntent * turnBoost * deltaSeconds;
    this.player.setRotation(this.playerHullRotation + Math.PI / 2);
    this.player.setVelocity(Math.cos(this.playerHullRotation) * this.playerForwardSpeed, Math.sin(this.playerHullRotation) * this.playerForwardSpeed);

    const aim = this.playerInput.getAimWorldPosition(this.player.x, this.player.y);
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, aim.x, aim.y);
    this.playerBarrel.setPosition(this.player.x, this.player.y);
    this.playerBarrel.setRotation(angle + Math.PI / 2);
    this.keepPlayerInsideBattlefield();

    this.fireTimerMs -= delta;
    const firingInBattlefield = this.playerInput.isFireKeyDown() || this.playerInput.isPointerInScreenArea(this.hudPanelTop);
    if (this.phase === 'wave' && firingInBattlefield && this.fireTimerMs <= 0) {
      this.fireTimerMs = this.getFireCooldown();
      this.fireBullet(this.player.x, this.player.y, angle, this.getPlayerDamage());
    }
  }

  private keepPlayerInsideBattlefield(): void {
    const clampedX = Phaser.Math.Clamp(this.player.x, 72, defenseBalance.world.width - 72);
    const clampedY = Phaser.Math.Clamp(this.player.y, 72, defenseBalance.world.height - 72);

    if (clampedX !== this.player.x) {
      this.player.x = clampedX;
      this.player.setVelocityX(0);
    }

    if (clampedY !== this.player.y) {
      this.player.y = clampedY;
      this.player.setVelocityY(0);
    }
  }

  private updateEnemies(): void {
    for (const actor of this.enemyActors.values()) {
      const angle = Phaser.Math.Angle.Between(actor.body.x, actor.body.y, this.basePosition.x, this.basePosition.y);
      actor.body.setVelocity(Math.cos(angle) * actor.speed, Math.sin(angle) * actor.speed);
      actor.body.setRotation(angle + Math.PI / 2);
      actor.barrel.setPosition(actor.body.x, actor.body.y);
      actor.barrel.setRotation(angle + Math.PI / 2);

      if (Phaser.Math.Distance.Between(actor.body.x, actor.body.y, this.basePosition.x, this.basePosition.y) < 58) {
        this.damageBase(actor);
      }

      actor.body.setDepth(actor.body.y);
      actor.barrel.setDepth(actor.body.y + 1);
    }

    this.baseRing.setScale(1 + Math.sin(this.elapsedMs / 260) * 0.018);
    this.baseCore.setRotation(Math.sin(this.elapsedMs / 480) * 0.015);
    this.player.setDepth(this.player.y);
    this.playerBarrel.setDepth(this.player.y + 1);
  }

  private updateBullets(): void {
    for (const bullet of this.bulletActors.keys()) {
      if (
        bullet.x < -40 ||
        bullet.x > defenseBalance.world.width + 40 ||
        bullet.y < -40 ||
        bullet.y > defenseBalance.world.height + 40
      ) {
        this.destroyBullet(bullet);
      }
    }
  }

  private updateDrops(time: number): void {
    for (const [drop, actor] of this.dropActors) {
      drop.setRotation(drop.rotation + 0.05);
      if (time > actor.expiresAt) {
        this.destroyDrop(drop);
      }
    }
  }

  private updateWave(delta: number): void {
    if (this.baseHp <= 0) {
      return;
    }

    this.spawnTimerMs -= delta;

    if (this.enemiesQueued.length > 0 && this.spawnTimerMs <= 0) {
      const next = this.enemiesQueued.shift();
      if (next) {
        this.spawnEnemy(next);
        this.spawnTimerMs = this.getCurrentStage()?.spawnEveryMs ?? 900;
      }
    }

    if (this.enemiesQueued.length === 0 && this.enemyActors.size === 0) {
      this.finishStage();
    }
  }

  private updateStageBreak(delta: number): void {
    this.stageBreakTimerMs -= delta;
    if (this.stageBreakTimerMs <= 0) {
      this.startStage();
    }
  }

  private updateTurret(delta: number): void {
    if (this.upgradeLevels['base-turret'] <= 0 || !this.turretBarrel) {
      return;
    }

    this.turretTimerMs -= delta;
    const target = this.findNearestEnemy(this.basePosition.x, this.basePosition.y, defenseBalance.turret.range);
    if (!target) {
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.basePosition.x, this.basePosition.y, target.body.x, target.body.y);
    this.turretBarrel.setRotation(angle + Math.PI / 2);

    if (this.turretTimerMs <= 0) {
      this.turretTimerMs = defenseBalance.turret.cooldownMs;
      this.fireBullet(this.basePosition.x, this.basePosition.y, angle, defenseBalance.turret.damage);
    }
  }

  private handleStartWaveRequested(): void {
    if (this.phase === 'intermission') {
      this.startWave();
    }
  }

  private handleRestartRequested(): void {
    this.scene.restart();
  }

  private handleUpgradeRequested(payload: { id: string }): void {
    if (this.phase !== 'intermission') {
      this.status = 'Upgrades are available between waves.';
      this.publishHud();
      return;
    }

    const definition = upgradeDefinitions.find((upgrade) => upgrade.id === payload.id);
    if (!definition) {
      return;
    }

    const level = this.upgradeLevels[definition.id];
    const cost = getUpgradeCost(definition, level);

    if (level >= definition.maxLevel) {
      this.status = `${definition.title} is already maxed.`;
      this.publishHud();
      return;
    }

    if (this.parts < cost) {
      this.status = `Need ${cost} parts for ${definition.title}.`;
      this.publishHud();
      return;
    }

    this.parts -= cost;
    this.upgradeLevels[definition.id] += 1;
    this.applyUpgrade(definition.id);
    this.status = `${definition.title} upgraded.`;
    this.publishHud();
  }

  private startWave(): void {
    this.phase = 'wave';
    this.activeTab = 'battle';
    this.stageIndex = 0;
    this.stageBreakTimerMs = 0;
    this.startStage();
  }

  private startStage(): void {
    const stage = this.getCurrentStage();
    if (!stage) {
      this.finishWave();
      return;
    }

    this.phase = 'wave';
    this.spawnTimerMs = 250;
    this.enemiesQueued = [
      ...Array.from<EnemyKind>({ length: stage.scouts }).fill('scout'),
      ...Array.from<EnemyKind>({ length: stage.bruisers }).fill('bruiser'),
    ];
    Phaser.Utils.Array.Shuffle(this.enemiesQueued);
    this.status = `Stage ${this.stageIndex + 1}/${waves[this.waveIndex].stages.length}: ${stage.title}.`;
    this.publishHud();
  }

  private finishStage(): void {
    this.stageIndex += 1;

    if (this.stageIndex >= waves[this.waveIndex].stages.length) {
      this.finishWave();
      return;
    }

    this.phase = 'stageBreak';
    this.stageBreakTimerMs = defenseBalance.stages.breakMs;
    this.status = `Stage clear. Reposition before ${waves[this.waveIndex].stages[this.stageIndex].title}.`;
    this.publishHud();
  }

  private finishWave(): void {
    const bonus = Math.floor(this.baseHp / defenseBalance.baseHpBonusStep) * defenseBalance.baseHpBonusParts;
    this.parts += bonus;
    this.waveIndex += 1;

    if (this.waveIndex >= defenseBalance.maxWaves) {
      this.phase = 'won';
      this.status = `Sector secured. Base bonus: +${bonus} parts.`;
      eventBus.emit(GameEvents.RunStateChanged, { phase: 'won' });
    } else {
      this.phase = 'intermission';
      this.status = `Wave cleared. Base bonus: +${bonus} parts. Upgrade before wave ${this.waveIndex + 1}.`;
    }

    this.publishHud();
  }

  private spawnEnemy(kind: EnemyKind): void {
    const spawn = this.pickSpawnPoint();
    const enemy = this.physics.add.image(spawn.x, spawn.y, AssetKeys.EnemyTank);
    const isBruiser = kind === 'bruiser';
    enemy.setDisplaySize(isBruiser ? 60 : 50, isBruiser ? 60 : 50);
    enemy.body?.setSize(isBruiser ? 48 : 40, isBruiser ? 48 : 40);
    this.enemies.add(enemy);

    const barrel = this.add
      .image(spawn.x, spawn.y, AssetKeys.EnemyBarrel)
      .setOrigin(0.5, 0.78)
      .setDisplaySize(16, 44);
    this.enemyActors.set(enemy, {
      body: enemy,
      barrel,
      hp: isBruiser ? 4 : 2,
      speed: isBruiser ? 58 : 84,
      parts: isBruiser ? 4 : 2,
    });
  }

  private fireBullet(x: number, y: number, angle: number, damage: number): void {
    const muzzleDistance = 45;
    const bullet = this.physics.add.image(
      x + Math.cos(angle) * muzzleDistance,
      y + Math.sin(angle) * muzzleDistance,
      AssetKeys.PlayerBullet,
    );
    this.bullets.add(bullet);
    bullet.setDisplaySize(18, 28);
    bullet.setRotation(angle + Math.PI / 2);
    bullet.setDepth(900);
    bullet.setVelocity(Math.cos(angle) * defenseBalance.player.bulletSpeed, Math.sin(angle) * defenseBalance.player.bulletSpeed);
    bullet.body?.setSize(12, 20);
    bullet.body?.setAllowGravity(false);
    this.bulletActors.set(bullet, { damage });
  }

  private hitEnemy(bullet: Phaser.Physics.Arcade.Image, enemy: Phaser.Physics.Arcade.Image): void {
    const bulletActor = this.bulletActors.get(bullet);
    const enemyActor = this.enemyActors.get(enemy);
    if (!bulletActor || !enemyActor) {
      return;
    }

    enemyActor.hp -= bulletActor.damage;
    this.flashAt(enemy.x, enemy.y, 0xffffff, 18);
    this.destroyBullet(bullet);

    if (enemyActor.hp <= 0) {
      this.destroyEnemy(enemyActor, true);
    } else {
      this.tweens.add({ targets: enemy, alpha: { from: 0.55, to: 1 }, duration: 80 });
    }
  }

  private damageBase(actor: EnemyActor): void {
    this.baseHp = Math.max(0, this.baseHp - defenseBalance.enemyReachDamage);
    this.cameras.main.shake(110, 0.006);
    this.flashAt(this.basePosition.x, this.basePosition.y, 0xff5a3d, 46);
    this.destroyEnemy(actor, false);

    if (this.baseHp <= 0) {
      this.phase = 'lost';
      this.status = 'The repair base is down. Restart and try a different upgrade path.';
      this.clearCombatActors();
      eventBus.emit(GameEvents.RunStateChanged, { phase: 'lost' });
    } else {
      this.status = `Base hit. ${this.baseHp}/${this.maxBaseHp} HP remains.`;
    }

    this.publishHud();
  }

  private collectDrop(drop: Phaser.Physics.Arcade.Image): void {
    const actor = this.dropActors.get(drop);
    if (!actor) {
      return;
    }

    this.parts += actor.value;
    this.flashAt(drop.x, drop.y, 0xf4d35e, 20);
    this.destroyDrop(drop);
    this.publishHud();
  }

  private destroyEnemy(actor: EnemyActor, reward: boolean): void {
    if (reward) {
      this.spawnDrop(actor.body.x, actor.body.y, actor.parts);
      this.addSmoke(actor.body.x, actor.body.y, true);
    } else {
      this.addSmoke(actor.body.x, actor.body.y, false);
    }

    this.enemyActors.delete(actor.body);
    this.enemies.remove(actor.body, true, true);
    actor.barrel.destroy();
  }

  private destroyBullet(bullet: Phaser.Physics.Arcade.Image): void {
    this.bulletActors.delete(bullet);
    this.bullets.remove(bullet, true, true);
  }

  private destroyDrop(drop: Phaser.Physics.Arcade.Image): void {
    this.dropActors.delete(drop);
    this.drops.remove(drop, true, true);
  }

  private clearCombatActors(): void {
    this.enemiesQueued = [];
    for (const actor of this.enemyActors.values()) {
      actor.barrel.destroy();
      actor.body.destroy();
    }
    for (const bullet of this.bulletActors.keys()) {
      bullet.destroy();
    }
    this.enemyActors.clear();
    this.bulletActors.clear();
  }

  private spawnDrop(x: number, y: number, value: number): void {
    const drop = this.physics.add.image(x, y, AssetKeys.Dirt);
    drop.setTint(0xf4d35e);
    drop.setDisplaySize(value >= 4 ? 28 : 22, value >= 4 ? 28 : 22);
    drop.body?.setCircle(12);
    drop.setVelocity(Phaser.Math.Between(-18, 18), Phaser.Math.Between(-18, 18));
    this.drops.add(drop);
    this.dropActors.set(drop, {
      value,
      expiresAt: this.time.now + defenseBalance.partDespawnMs,
    });
  }

  private addSmoke(x: number, y: number, orange: boolean): void {
    const smoke = this.add.image(x, y, orange ? AssetKeys.SmokeOrange : AssetKeys.SmokeGrey);
    smoke.setAlpha(0.88).setScale(0.75);
    this.tweens.add({
      targets: smoke,
      scale: 1.45,
      alpha: 0,
      duration: 360,
      ease: 'Sine.easeOut',
      onComplete: () => smoke.destroy(),
    });
  }

  private flashAt(x: number, y: number, color: number, radius: number): void {
    const flash = this.add.circle(x, y, radius, color, 0.45);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 1.8,
      duration: 180,
      onComplete: () => flash.destroy(),
    });
  }

  private applyUpgrade(id: UpgradeId): void {
    if (id === 'base-max-hp') {
      this.maxBaseHp += 25;
      this.baseHp += 25;
    }

    if (id === 'base-repair') {
      this.baseHp = Math.min(this.maxBaseHp, this.baseHp + 20);
    }

    if (id === 'base-turret' && !this.turretBase) {
      this.turretBase = this.add.image(this.basePosition.x + 92, this.basePosition.y - 18, AssetKeys.TurretBase);
      this.turretBase.setDisplaySize(44, 44);
      this.turretBarrel = this.add.image(this.turretBase.x, this.turretBase.y, AssetKeys.TurretBarrel);
      this.turretBarrel.setOrigin(0.5, 0.78);
      this.turretBarrel.setDisplaySize(12, 34);
    }
  }

  private getPlayerDamage(): number {
    return defenseBalance.player.damage + this.upgradeLevels['tank-damage'];
  }

  private getFireCooldown(): number {
    return defenseBalance.player.fireCooldownMs * Math.pow(0.82, this.upgradeLevels['tank-reload']);
  }

  private getPlayerSpeed(): number {
    return defenseBalance.player.speed * (1 + this.upgradeLevels['tank-speed'] * 0.12);
  }

  private findNearestEnemy(x: number, y: number, range: number): EnemyActor | undefined {
    let best: EnemyActor | undefined;
    let bestDistance = range;

    for (const enemy of this.enemyActors.values()) {
      const distance = Phaser.Math.Distance.Between(x, y, enemy.body.x, enemy.body.y);
      if (distance < bestDistance) {
        best = enemy;
        bestDistance = distance;
      }
    }

    return best;
  }

  private pickSpawnPoint(): Phaser.Math.Vector2 {
    const side = (this.stageIndex + Phaser.Math.Between(0, 2)) % 4;
    const top = 96;
    const bottom = defenseBalance.world.height - 96;
    const left = 96;
    const right = defenseBalance.world.width - 96;

    if (side === 0) return new Phaser.Math.Vector2(Phaser.Math.Between(left, right), top);
    if (side === 1) return new Phaser.Math.Vector2(right, Phaser.Math.Between(top, bottom));
    if (side === 2) return new Phaser.Math.Vector2(Phaser.Math.Between(left, right), bottom);
    return new Phaser.Math.Vector2(left, Phaser.Math.Between(top, bottom));
  }

  private publishHud(): void {
    const nextWave = waves[this.waveIndex];
    const currentStage = this.getCurrentStage();
    eventBus.emit(GameEvents.DefenseHudChanged, {
      phase: this.phase,
      activeTab: this.activeTab,
      wave: Math.min(this.waveIndex + 1, defenseBalance.maxWaves),
      maxWaves: defenseBalance.maxWaves,
      baseHp: this.baseHp,
      maxBaseHp: this.maxBaseHp,
      parts: this.parts,
      status: this.status,
      stage: {
        current: Math.min(this.stageIndex + 1, nextWave?.stages.length ?? 1),
        total: nextWave?.stages.length ?? 1,
        title: currentStage?.title ?? 'Complete',
      },
      minimap: {
        worldWidth: defenseBalance.world.width,
        worldHeight: defenseBalance.world.height,
        player: {
          x: this.player?.x ?? this.basePosition.x,
          y: this.player?.y ?? this.basePosition.y,
        },
        base: { x: this.basePosition.x, y: this.basePosition.y },
        enemies: Array.from(this.enemyActors.values()).map((enemy) => ({
          x: enemy.body.x,
          y: enemy.body.y,
        })),
        camera: {
          x: this.cameras.main.scrollX,
          y: this.cameras.main.scrollY,
          width: this.cameras.main.width,
          height: this.cameras.main.height,
        },
      },
      upgrades: upgradeDefinitions.map((definition) => {
        const level = this.upgradeLevels[definition.id];
        const cost = getUpgradeCost(definition, level);
        return {
          id: definition.id,
          target: definition.target,
          title: definition.title,
          description: definition.description,
          icon: definition.icon,
          level,
          maxLevel: definition.maxLevel,
          cost,
          affordable: this.parts >= cost,
          maxed: level >= definition.maxLevel,
        };
      }),
      nextWave: nextWave
        ? {
            scouts: nextWave.stages.reduce((total, stage) => total + stage.scouts, 0),
            bruisers: nextWave.stages.reduce((total, stage) => total + stage.bruisers, 0),
            stages: nextWave.stages.map((stage) => ({
              title: stage.title,
              scouts: stage.scouts,
              bruisers: stage.bruisers,
            })),
          }
        : undefined,
    });
  }

  private getCurrentStage(): EnemyStage | undefined {
    return waves[this.waveIndex]?.stages[this.stageIndex];
  }

  private shutdown(): void {
    eventBus.off(GameEvents.StartWaveRequested, this.handleStartWaveRequested, this);
    eventBus.off(GameEvents.RestartRequested, this.handleRestartRequested, this);
    eventBus.off(GameEvents.UpgradeRequested, this.handleUpgradeRequested, this);
    this.scene.stop(SceneKeys.UI);
    eventBus.emit(GameEvents.GameplayStopped, { scene: SceneKeys.Game });
  }
}
