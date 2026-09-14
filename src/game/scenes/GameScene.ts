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
type Team = 'neutral' | 'player' | 'enemy';
type DropKind = 'parts' | 'repair';
type BulletOwner = 'player' | 'enemy' | 'relic';
type EnemyMode = 'capture' | 'assault' | 'duel';

type EnemyActor = {
  body: Phaser.Physics.Arcade.Image;
  barrel: Phaser.GameObjects.Image;
  hp: number;
  speed: number;
  parts: number;
  mode: EnemyMode;
  targetPointId?: string;
  flankOffset: number;
  fireTimerMs: number;
};

type BulletActor = {
  damage: number;
  owner: BulletOwner;
  previousX: number;
  previousY: number;
};

type DropActor = {
  kind: DropKind;
  value: number;
  expiresAt: number;
};

type RelicPoint = {
  id: string;
  x: number;
  y: number;
  owner: Team;
  progress: number;
  active: boolean;
  hp: number;
  maxHp: number;
  sprite: Phaser.GameObjects.Image;
  ring: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  progressArc: Phaser.GameObjects.Graphics;
  hpBack: Phaser.GameObjects.Rectangle;
  hpFill: Phaser.GameObjects.Rectangle;
  fireTimerMs: number;
};

type BarrelActor = {
  body: Phaser.Physics.Arcade.Image;
  hp: number;
};

export class GameScene extends Phaser.Scene {
  private playerInput!: PlayerInput;
  private player!: Phaser.Physics.Arcade.Image;
  private playerBarrel!: Phaser.GameObjects.Image;
  private baseCore!: Phaser.GameObjects.Rectangle;
  private baseRing!: Phaser.GameObjects.Arc;
  private playerHpBack!: Phaser.GameObjects.Rectangle;
  private playerHpFill!: Phaser.GameObjects.Rectangle;
  private enemyBase!: Phaser.GameObjects.Image;
  private enemyBaseHpBack!: Phaser.GameObjects.Rectangle;
  private enemyBaseHpFill!: Phaser.GameObjects.Rectangle;
  private turretBase?: Phaser.GameObjects.Image;
  private turretBarrel?: Phaser.GameObjects.Image;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private drops!: Phaser.Physics.Arcade.Group;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private barrels!: Phaser.Physics.Arcade.StaticGroup;
  private enemyActors = new Map<Phaser.Physics.Arcade.Image, EnemyActor>();
  private bulletActors = new Map<Phaser.Physics.Arcade.Image, BulletActor>();
  private dropActors = new Map<Phaser.Physics.Arcade.Image, DropActor>();
  private barrelActors = new Map<Phaser.Physics.Arcade.Image, BarrelActor>();
  private relicPoints: RelicPoint[] = [];
  private readonly basePosition = new Phaser.Math.Vector2(
    defenseBalance.world.width / 2,
    defenseBalance.world.height - 520,
  );
  private phase: DefensePhase = 'intermission';
  private activeTab: 'battle' | 'tank' | 'base' | 'map' = 'battle';
  private waveIndex = 0;
  private baseHp: number = defenseBalance.initialBaseHp;
  private maxBaseHp: number = defenseBalance.initialBaseHp;
  private playerHp: number = defenseBalance.player.maxHp;
  private enemyBaseHp: number = defenseBalance.enemyBaseHp;
  private parts: number = defenseBalance.initialParts;
  private upgradeLevels: Record<UpgradeId, number> = {
    'tank-damage': 0,
    'tank-reload': 0,
    'tank-speed': 0,
    'tank-vision': 0,
    'base-max-hp': 0,
    'base-repair': 0,
    'base-turret': 0,
  };
  private enemiesQueued: EnemyKind[] = [];
  private stageIndex = 0;
  private stageBreakTimerMs = 0;
  private intermissionTimerMs = 0;
  private hudPublishTimerMs = 0;
  private spawnTimerMs = 0;
  private fireTimerMs = 0;
  private turretTimerMs = 0;
  private elapsedMs = 0;
  private status = 'Wave 1 is ready. Protect the repair base.';
  private sectorTitle = 'Iron Hold';
  private readonly hudPanelTop = 552;
  private playerForwardSpeed = 0;
  private playerHullRotation = -Math.PI / 2;

  constructor() {
    super(SceneKeys.Game);
  }

  create(data: { sectorTitle?: string } = {}): void {
    this.sectorTitle = data.sectorTitle ?? 'Iron Hold';
    this.resetRuntimeState();
    fadeInScene(this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
    this.createWorld();
    this.createActors();
    this.createPhysics();
    this.createEventHandlers();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    this.scene.launch(SceneKeys.UI, { title: 'Iron Hold' });
    this.startWave();
    this.time.delayedCall(0, () => this.publishHud());

    eventBus.emit(GameEvents.GameplayStarted, { scene: SceneKeys.Game });
    eventBus.emit(GameEvents.RunStateChanged, { phase: 'playing' });
  }

  private resetRuntimeState(): void {
    this.enemyActors = new Map<Phaser.Physics.Arcade.Image, EnemyActor>();
    this.bulletActors = new Map<Phaser.Physics.Arcade.Image, BulletActor>();
    this.dropActors = new Map<Phaser.Physics.Arcade.Image, DropActor>();
    this.barrelActors = new Map<Phaser.Physics.Arcade.Image, BarrelActor>();
    this.relicPoints = [];
    this.phase = 'intermission';
    this.activeTab = 'battle';
    this.waveIndex = 0;
    this.baseHp = defenseBalance.initialBaseHp;
    this.maxBaseHp = defenseBalance.initialBaseHp;
    this.playerHp = defenseBalance.player.maxHp;
    this.enemyBaseHp = defenseBalance.enemyBaseHp;
    this.parts = defenseBalance.initialParts;
    this.upgradeLevels = {
      'tank-damage': 0,
      'tank-reload': 0,
      'tank-speed': 0,
      'tank-vision': 0,
      'base-max-hp': 0,
      'base-repair': 0,
      'base-turret': 0,
    };
    this.enemiesQueued = [];
    this.stageIndex = 0;
    this.stageBreakTimerMs = 0;
    this.intermissionTimerMs = 0;
    this.hudPublishTimerMs = 0;
    this.spawnTimerMs = 0;
    this.fireTimerMs = 0;
    this.turretTimerMs = 0;
    this.elapsedMs = 0;
    this.playerForwardSpeed = 0;
    this.playerHullRotation = -Math.PI / 2;
    this.status = `${this.sectorTitle}: protect the repair base.`;
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
    } else if (this.phase === 'intermission') {
      this.updateIntermission(delta);
    }
    this.updateRelicPoints(delta);

    if (this.hudPublishTimerMs >= 120) {
      this.hudPublishTimerMs = 0;
      this.publishHud();
    }
  }

  getDebugSnapshot(): { elapsedMs: number; phase: string; wave: number; baseHp: number; playerHp: number; parts: number } {
    return {
      elapsedMs: this.elapsedMs,
      phase: this.phase === 'lost' ? 'lost' : this.phase === 'won' ? 'won' : 'playing',
      wave: this.waveIndex + 1,
      baseHp: this.baseHp,
      playerHp: this.playerHp,
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
    graphics.lineBetween(this.basePosition.x, 250, this.basePosition.x, this.basePosition.y);
    graphics.lineBetween(this.basePosition.x - 640, 650, this.basePosition.x + 640, 650);
    graphics.lineBetween(this.basePosition.x - 760, 1320, this.basePosition.x + 760, 1320);
    graphics.lineBetween(this.basePosition.x - 640, 1860, this.basePosition.x + 640, 1860);

    this.obstacles = this.physics.add.staticGroup();
    this.barrels = this.physics.add.staticGroup();

    const decor = [
      { x: 190, y: 160, key: AssetKeys.TreeSmall },
      { x: 3200, y: 260, key: AssetKeys.TreeSmall },
      { x: 260, y: 1190, key: AssetKeys.SandbagBeige },
      { x: 3160, y: 1680, key: AssetKeys.BarrelRed, barrel: true },
      { x: 620, y: 210, key: AssetKeys.SandbagBeige },
      { x: 2360, y: 420, key: AssetKeys.BarrelRed, barrel: true },
      { x: 430, y: 760, key: AssetKeys.TreeSmall },
      { x: 2880, y: 980, key: AssetKeys.TreeSmall },
      { x: 1450, y: 700, key: AssetKeys.BarrelRed, barrel: true },
      { x: 2180, y: 1340, key: AssetKeys.SandbagBeige },
      { x: 1100, y: 1870, key: AssetKeys.BarrelRed, barrel: true },
      { x: 760, y: 1420, key: AssetKeys.SandbagBeige },
      { x: 1700, y: 1010, key: AssetKeys.TreeSmall },
    ];

    for (const item of decor) {
      const obstacle = (item.barrel ? this.barrels : this.obstacles).create(item.x, item.y, item.key) as Phaser.Physics.Arcade.Image;
      obstacle.setScale(1.2).setAlpha(0.92).refreshBody();
      obstacle.body?.setSize(42, 42);
      if (item.barrel) {
        this.barrelActors.set(obstacle, { body: obstacle, hp: 2 });
      }
    }

    this.createEnvironmentProps();
    this.createRelicPoints();
    this.baseRing = this.add.circle(this.basePosition.x, this.basePosition.y, 62, 0x10293b, 0.9);
    this.baseRing.setStrokeStyle(5, 0xf4d35e, 0.92);
    this.add.image(this.basePosition.x, this.basePosition.y, AssetKeys.DefenseObjects, 0).setDisplaySize(104, 104);
    this.baseCore = this.add.rectangle(this.basePosition.x, this.basePosition.y, 74, 74, 0x2d5f73, 0.12);
    this.baseCore.setStrokeStyle(2, 0xd9f2ff, 0.5);
    this.add
      .text(this.basePosition.x, this.basePosition.y + 2, 'BASE', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.enemyBase = this.add
      .image(defenseBalance.world.width / 2, 260, AssetKeys.DefenseObjects, 1)
      .setDisplaySize(124, 124);
    this.enemyBaseHpBack = this.add.rectangle(this.enemyBase.x, this.enemyBase.y - 82, 104, 9, 0x101820, 0.82).setStrokeStyle(1, 0xffd2c8, 0.45);
    this.enemyBaseHpFill = this.add.rectangle(this.enemyBase.x - 52, this.enemyBase.y - 82, 104, 6, 0xff6b4a, 0.96).setOrigin(0, 0.5);
    this.add.text(this.enemyBase.x, this.enemyBase.y + 74, 'ENEMY BASE', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '14px',
      color: '#ffd2c8',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private createRelicPoints(): void {
    const points = [
      { id: 'north-relay', x: 2400, y: 820 },
      { id: 'west-relay', x: 1450, y: 1600 },
      { id: 'east-relay', x: 3350, y: 1600 },
      { id: 'south-relay', x: 2400, y: 2300 },
    ];

    for (const [index, point] of points.entries()) {
      const ring = this.add.circle(point.x, point.y, defenseBalance.relic.captureRadius, 0x9aa4a8, 0.08);
      ring.setStrokeStyle(3, 0xd8e2f8, 0.42);
      const sprite = this.add.image(point.x, point.y, AssetKeys.DefenseObjects, 2).setDisplaySize(82, 82);
      const progressArc = this.add.graphics();
      const label = this.add
        .text(point.x, point.y + 62, `R${index + 1}`, {
          fontFamily: 'Trebuchet MS, Arial, sans-serif',
          fontSize: '14px',
          color: '#d8e2f8',
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      const hpBack = this.add.rectangle(point.x, point.y - 58, 70, 7, 0x101820, 0.78).setStrokeStyle(1, 0xd8e2f8, 0.4);
      const hpFill = this.add.rectangle(point.x - 35, point.y - 58, 70, 5, 0x58e070, 0.96).setOrigin(0, 0.5);
      ring.setDepth(point.y - 5);
      progressArc.setDepth(point.y + 3);
      sprite.setDepth(point.y - 1);
      label.setDepth(point.y + 2);
      hpBack.setDepth(point.y + 4);
      hpFill.setDepth(point.y + 5);
      hpBack.setVisible(false);
      hpFill.setVisible(false);
      this.relicPoints.push({
        ...point,
        owner: 'neutral',
        progress: 0,
        active: false,
        hp: 0,
        maxHp: defenseBalance.relic.bunkerHp,
        sprite,
        ring,
        label,
        progressArc,
        hpBack,
        hpFill,
        fireTimerMs: 0,
      });
    }
  }

  private createEnvironmentProps(): void {
    const props = [
      { x: 900, y: 430, frame: 0, collide: true, scale: 0.95 },
      { x: 2290, y: 600, frame: 1, collide: true, scale: 0.88 },
      { x: 1490, y: 930, frame: 2, scale: 1.15 },
      { x: 2120, y: 950, frame: 3, collide: true, scale: 0.82 },
      { x: 1200, y: 1540, frame: 4, collide: true, scale: 0.9 },
      { x: 2920, y: 1420, frame: 5, collide: true, scale: 1.05 },
      { x: 710, y: 1880, frame: 6, collide: true, scale: 0.9 },
      { x: 2440, y: 1890, frame: 7, collide: true, scale: 0.86 },
      { x: 1760, y: 1320, frame: 8, scale: 1.05 },
      { x: 3080, y: 720, frame: 0, collide: true, scale: 0.8 },
      { x: 520, y: 880, frame: 5, collide: true, scale: 0.86 },
      { x: 1420, y: 2120, frame: 2, scale: 0.9 },
      { x: 2140, y: 2140, frame: 8, scale: 0.95 },
      { x: 2260, y: 1960, frame: 0, collide: true, scale: 0.72 },
      { x: 1480, y: 1840, frame: 3, collide: true, scale: 0.68 },
      { x: 1960, y: 2060, frame: 6, collide: true, scale: 0.7 },
      { x: 3560, y: 2290, frame: 4, collide: true, scale: 0.86 },
      { x: 680, y: 2520, frame: 5, collide: true, scale: 0.96 },
      { x: 3880, y: 720, frame: 6, collide: true, scale: 0.84 },
      { x: 2780, y: 2620, frame: 1, collide: true, scale: 0.78 },
      { x: 1120, y: 690, frame: 8, scale: 0.92 },
    ];

    for (const prop of props) {
      if (prop.collide) {
        const body = this.obstacles.create(prop.x, prop.y, AssetKeys.EnvironmentProps, prop.frame) as Phaser.Physics.Arcade.Image;
        body.setScale(prop.scale).setDepth(prop.y).refreshBody();
        body.body?.setSize(62, 54);
      } else {
        this.add.image(prop.x, prop.y, AssetKeys.EnvironmentProps, prop.frame).setScale(prop.scale).setDepth(prop.y - 2).setAlpha(0.94);
      }
    }
  }

  private createActors(): void {
    this.enemies = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.drops = this.physics.add.group();
    this.playerInput = new PlayerInput(this);
    this.player = this.physics.add.image(this.basePosition.x, this.basePosition.y - 160, AssetKeys.PlayerTank);
    this.player.setDisplaySize(54, 54);
    this.player.setRotation(this.playerHullRotation + Math.PI / 2);
    this.player.setCollideWorldBounds(true);
    this.player.body?.setSize(52, 52);
    this.playerBarrel = this.add
      .image(this.player.x, this.player.y, AssetKeys.PlayerBarrel)
      .setOrigin(0.5, 0.78)
      .setDisplaySize(18, 46);
    this.playerHpBack = this.add.rectangle(this.player.x, this.player.y - 46, 52, 7, 0x101820, 0.82).setStrokeStyle(1, 0xd8e2f8, 0.45);
    this.playerHpFill = this.add.rectangle(this.player.x - 26, this.player.y - 46, 52, 5, 0x58e070, 0.96).setOrigin(0, 0.5);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.updateCameraLayout();
  }

  private handleResize(): void {
    this.updateCameraLayout();
    this.publishHud();
  }

  private updateCameraLayout(): void {
    const deadzoneWidth = Phaser.Math.Clamp(this.scale.width * 0.24, 220, 720);
    const deadzoneHeight = Phaser.Math.Clamp(this.scale.height * 0.2, 150, 420);
    this.cameras.main.setBounds(0, 0, defenseBalance.world.width, defenseBalance.world.height);
    this.cameras.main.setDeadzone(deadzoneWidth, deadzoneHeight);
  }

  private createPhysics(): void {
    this.physics.add.collider(this.player, this.obstacles);
    this.physics.add.collider(this.player, this.barrels);
    this.physics.add.collider(this.enemies, this.obstacles);
    this.physics.add.collider(this.enemies, this.barrels);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(this.player, this.enemies);

    this.physics.add.overlap(this.bullets, this.enemies, (bulletObject, enemyObject) => {
      this.hitEnemy(bulletObject as Phaser.Physics.Arcade.Image, enemyObject as Phaser.Physics.Arcade.Image);
    });

    this.physics.add.overlap(this.bullets, this.player, (bulletObject) => {
      this.hitPlayer(bulletObject as Phaser.Physics.Arcade.Image);
    });

    this.physics.add.overlap(this.bullets, this.barrels, (bulletObject, barrelObject) => {
      this.hitBarrel(bulletObject as Phaser.Physics.Arcade.Image, barrelObject as Phaser.Physics.Arcade.Image);
    });

    this.physics.add.collider(this.bullets, this.obstacles, (bulletObject) => {
      this.destroyBullet(bulletObject as Phaser.Physics.Arcade.Image);
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
    this.updatePlayerHpBar();
    this.keepPlayerInsideBattlefield();

    this.fireTimerMs -= delta;
    const firingInBattlefield = this.playerInput.isFireKeyDown() || this.playerInput.isPointerInScreenArea(this.hudPanelTop);
    if (this.phase === 'wave' && firingInBattlefield && this.fireTimerMs <= 0) {
      this.fireTimerMs = this.getFireCooldown();
      this.fireBullet(this.player.x, this.player.y, angle, this.getPlayerDamage(), 'player');
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

  private updatePlayerHpBar(): void {
    const hpRatio = Phaser.Math.Clamp(this.playerHp / defenseBalance.player.maxHp, 0, 1);
    this.playerHpBack.setPosition(this.player.x, this.player.y - 46);
    this.playerHpFill.setPosition(this.player.x - 26, this.player.y - 46);
    this.playerHpFill.setDisplaySize(52 * hpRatio, 5);
    const color = hpRatio > 0.55 ? 0x58e070 : hpRatio > 0.25 ? 0xf7d95b : 0xff6b4a;
    this.playerHpFill.setFillStyle(color, 0.96);
  }

  private updateEnemies(): void {
    for (const actor of this.enemyActors.values()) {
      const target = this.getEnemyMoveTarget(actor);
      const angle = Phaser.Math.Angle.Between(actor.body.x, actor.body.y, target.x, target.y);
      const avoid = this.getAvoidanceVector(actor.body.x, actor.body.y);
      actor.body.setVelocity(Math.cos(angle) * actor.speed + avoid.x, Math.sin(angle) * actor.speed + avoid.y);
      actor.body.setRotation(angle + Math.PI / 2);
      this.updateEnemyTurret(actor);

      if (actor.mode === 'assault' && Phaser.Math.Distance.Between(actor.body.x, actor.body.y, this.basePosition.x, this.basePosition.y) < 58) {
        this.damageBase(actor);
      }

      actor.body.setDepth(actor.body.y);
      actor.barrel.setDepth(actor.body.y + 1);
    }

    this.baseRing.setScale(1 + Math.sin(this.elapsedMs / 260) * 0.018);
    this.baseCore.setRotation(Math.sin(this.elapsedMs / 480) * 0.015);
    this.updateEnemyBaseHpBar();
    this.player.setDepth(20000);
    this.playerBarrel.setDepth(20001);
    this.playerHpBack.setDepth(20002);
    this.playerHpFill.setDepth(20003);
  }

  private updateEnemyTurret(actor: EnemyActor): void {
    actor.fireTimerMs -= this.game.loop.delta;
    actor.barrel.setPosition(actor.body.x, actor.body.y);
    const target = this.getEnemyFireTarget(actor);

    if (!target) {
      actor.barrel.setRotation(Phaser.Math.Angle.RotateTo(actor.barrel.rotation, actor.body.rotation, 0.05));
      return;
    }

    const angle = Phaser.Math.Angle.Between(actor.body.x, actor.body.y, target.x, target.y);
    actor.barrel.setRotation(Phaser.Math.Angle.RotateTo(actor.barrel.rotation, angle + Math.PI / 2, 0.08));

    if (actor.fireTimerMs <= 0) {
      actor.fireTimerMs = defenseBalance.enemy.fireCooldownMs + Phaser.Math.Between(-180, 180);
      this.fireBullet(actor.body.x, actor.body.y, angle, 1, 'enemy');
    }
  }

  private getEnemyMoveTarget(actor: EnemyActor): Phaser.Math.Vector2 {
    const playerDistance = Phaser.Math.Distance.Between(actor.body.x, actor.body.y, this.player.x, this.player.y);
    if (playerDistance < 360 && this.phase === 'wave') {
      actor.mode = 'duel';
      return new Phaser.Math.Vector2(this.player.x, this.player.y);
    }

    if (actor.targetPointId) {
      const point = this.relicPoints.find((relic) => relic.id === actor.targetPointId);
      if (point && point.owner !== 'enemy') {
        return new Phaser.Math.Vector2(point.x, point.y);
      }
    }

    actor.mode = 'assault';
    const laneY = this.basePosition.y - 520;
    if (actor.body.y < laneY && Math.abs(actor.body.x - (this.basePosition.x + actor.flankOffset)) > 90) {
      return new Phaser.Math.Vector2(this.basePosition.x + actor.flankOffset, laneY);
    }
    return new Phaser.Math.Vector2(this.basePosition.x + actor.flankOffset * 0.22, this.basePosition.y);
  }

  private getAvoidanceVector(x: number, y: number): Phaser.Math.Vector2 {
    const avoid = new Phaser.Math.Vector2(0, 0);
    const bodies = [...this.obstacles.getChildren(), ...this.barrels.getChildren()] as Phaser.Physics.Arcade.Image[];

    for (const body of bodies) {
      const distance = Phaser.Math.Distance.Between(x, y, body.x, body.y);
      if (distance > 0 && distance < 115) {
        const push = (115 - distance) / 115;
        avoid.x += ((x - body.x) / distance) * push * 105;
        avoid.y += ((y - body.y) / distance) * push * 105;
      }
    }

    return avoid;
  }

  private getEnemyFireTarget(actor: EnemyActor): Phaser.Math.Vector2 | undefined {
    const playerDistance = Phaser.Math.Distance.Between(actor.body.x, actor.body.y, this.player.x, this.player.y);
    if (playerDistance <= defenseBalance.enemy.range) {
      return new Phaser.Math.Vector2(this.player.x, this.player.y);
    }

    const playerRelic = this.relicPoints
      .filter((point) => point.owner === 'player' && point.active)
      .sort(
        (a, b) =>
          Phaser.Math.Distance.Between(actor.body.x, actor.body.y, a.x, a.y) -
          Phaser.Math.Distance.Between(actor.body.x, actor.body.y, b.x, b.y),
      )[0];

    if (playerRelic && Phaser.Math.Distance.Between(actor.body.x, actor.body.y, playerRelic.x, playerRelic.y) <= defenseBalance.enemy.range) {
      return new Phaser.Math.Vector2(playerRelic.x, playerRelic.y);
    }

    return undefined;
  }

  private updateBullets(): void {
    for (const bullet of this.bulletActors.keys()) {
      if (this.tryHitPlayerWithBullet(bullet)) {
        continue;
      }

      if (this.tryHitEnemyBase(bullet)) {
        continue;
      }

      if (this.tryHitRelicBunker(bullet)) {
        continue;
      }

      if (
        bullet.x < -40 ||
        bullet.x > defenseBalance.world.width + 40 ||
        bullet.y < -40 ||
        bullet.y > defenseBalance.world.height + 40
      ) {
        this.destroyBullet(bullet);
      } else {
        const actor = this.bulletActors.get(bullet);
        if (actor) {
          actor.previousX = bullet.x;
          actor.previousY = bullet.y;
        }
      }
    }
  }

  private tryHitPlayerWithBullet(bullet: Phaser.Physics.Arcade.Image): boolean {
    const bulletActor = this.bulletActors.get(bullet);
    if (!bulletActor || bulletActor.owner !== 'enemy' || this.phase === 'lost') {
      return false;
    }

    const hitDistance = Phaser.Geom.Intersects.GetLineToCircle(
      new Phaser.Geom.Line(bulletActor.previousX, bulletActor.previousY, bullet.x, bullet.y),
      new Phaser.Geom.Circle(this.player.x, this.player.y, 36),
    );

    if (hitDistance.length > 0 || Phaser.Math.Distance.Between(bullet.x, bullet.y, this.player.x, this.player.y) <= 36) {
      this.hitPlayer(bullet);
      return true;
    }

    return false;
  }

  private tryHitEnemyBase(bullet: Phaser.Physics.Arcade.Image): boolean {
    const bulletActor = this.bulletActors.get(bullet);
    if (!bulletActor || bulletActor.owner === 'enemy' || this.phase === 'won' || this.phase === 'lost') {
      return false;
    }

    const path = new Phaser.Geom.Line(bulletActor.previousX, bulletActor.previousY, bullet.x, bullet.y);
    const hit = Phaser.Geom.Intersects.GetLineToCircle(path, new Phaser.Geom.Circle(this.enemyBase.x, this.enemyBase.y, 68));
    if (hit.length === 0 && Phaser.Math.Distance.Between(bullet.x, bullet.y, this.enemyBase.x, this.enemyBase.y) > 68) {
      return false;
    }

    this.damageEnemyBase(bulletActor.damage);
    this.destroyBullet(bullet);
    return true;
  }

  private damageEnemyBase(damage: number): void {
    this.enemyBaseHp = Math.max(0, this.enemyBaseHp - damage);
    this.flashAt(this.enemyBase.x, this.enemyBase.y, 0xff6b4a, 40);
    this.cameras.main.shake(70, 0.003);
    this.updateEnemyBaseHpBar();

    if (this.enemyBaseHp > 0) {
      this.status = `Enemy base hit: ${this.enemyBaseHp}/${defenseBalance.enemyBaseHp} HP.`;
      this.publishHud();
      return;
    }

    this.phase = 'won';
    this.status = 'Enemy base destroyed. Sector cleared.';
    this.addSmoke(this.enemyBase.x, this.enemyBase.y, true);
    this.enemyBase.setTint(0x4a4a4a).setAlpha(0.72);
    this.clearCombatActors();
    eventBus.emit(GameEvents.RunStateChanged, { phase: 'won' });
    this.publishHud();
  }

  private tryHitRelicBunker(bullet: Phaser.Physics.Arcade.Image): boolean {
    const bulletActor = this.bulletActors.get(bullet);
    if (!bulletActor) {
      return false;
    }

    for (const point of this.relicPoints) {
      if (!point.active || point.owner === 'neutral') {
        continue;
      }

      const hostileToBunker =
        (point.owner === 'player' && bulletActor.owner === 'enemy') ||
        (point.owner === 'enemy' && bulletActor.owner !== 'enemy');
      if (!hostileToBunker) {
        continue;
      }

      if (Phaser.Math.Distance.Between(bullet.x, bullet.y, point.x, point.y) <= 44) {
        this.damageRelicBunker(point, bulletActor.damage);
        this.destroyBullet(bullet);
        return true;
      }
    }

    return false;
  }

  private damageRelicBunker(point: RelicPoint, damage: number): void {
    point.hp = Math.max(0, point.hp - damage);
    this.flashAt(point.x, point.y, point.owner === 'player' ? 0x2fb4ff : 0xff6b4a, 24);

    if (point.hp > 0) {
      return;
    }

    point.active = false;
    point.progress = point.owner === 'player' ? 0.35 : -0.35;
    point.sprite.setFrame(point.owner === 'player' ? 3 : 4);
    point.sprite.setDisplaySize(82, 82);
    point.ring.setStrokeStyle(4, point.owner === 'player' ? 0x2fb4ff : 0xff6b4a, 0.45);
    this.status = `${point.id} bunker destroyed. Rebuild it by holding the point.`;
    this.addSmoke(point.x, point.y, true);
    this.updateRelicHud(point);
    this.publishHud();
  }

  private updateDrops(_time: number): void {
    for (const drop of this.dropActors.keys()) {
      drop.setRotation(drop.rotation + 0.025);
    }
  }

  private updateRelicPoints(delta: number): void {
    for (const point of this.relicPoints) {
      const playerInside =
        Phaser.Math.Distance.Between(this.player.x, this.player.y, point.x, point.y) <= defenseBalance.relic.captureRadius;
      const enemiesInside = Array.from(this.enemyActors.values()).filter(
        (enemy) => Phaser.Math.Distance.Between(enemy.body.x, enemy.body.y, point.x, point.y) <= defenseBalance.relic.captureRadius,
      ).length;
      const direction = playerInside && enemiesInside === 0 ? 1 : enemiesInside > 0 && !playerInside ? -1 : 0;

      if (direction !== 0) {
        point.progress = Phaser.Math.Clamp(point.progress + (direction * delta) / (defenseBalance.relic.captureSeconds * 1000), -1, 1);
      } else if (point.owner === 'neutral') {
        point.progress *= 0.985;
      }

      if (point.progress >= 1 && (point.owner !== 'player' || (!point.active && playerInside && enemiesInside === 0))) {
        point.owner = 'player';
        point.progress = 1;
        point.active = true;
        point.hp = point.maxHp;
        point.sprite.setFrame(0);
        point.sprite.setDisplaySize(74, 74);
        point.ring.setStrokeStyle(4, 0x2fb4ff, 0.9);
        this.status = `${point.id} bunker online. It will fire on enemies nearby.`;
      } else if (point.progress <= -1 && (point.owner !== 'enemy' || (!point.active && enemiesInside > 0 && !playerInside))) {
        point.owner = 'enemy';
        point.progress = -1;
        point.active = true;
        point.hp = point.maxHp;
        point.sprite.setFrame(1);
        point.sprite.setDisplaySize(74, 74);
        point.ring.setStrokeStyle(4, 0xff6b4a, 0.9);
        this.status = `${point.id} enemy bunker online.`;
      } else if (Math.abs(point.progress) < 0.08 && point.owner !== 'neutral') {
        point.owner = 'neutral';
        point.active = false;
        point.hp = 0;
        point.sprite.setFrame(2);
        point.sprite.setDisplaySize(82, 82);
        point.ring.setStrokeStyle(3, 0xd8e2f8, 0.42);
      }

      point.ring.setAlpha(0.16 + Math.abs(point.progress) * 0.16);
      this.updateRelicHud(point);
      this.updateRelicFire(point, delta);
    }
  }

  private updateRelicHud(point: RelicPoint): void {
    point.progressArc.clear();
    const amount = Math.abs(point.progress);
    if (amount > 0.03) {
      const color = point.progress >= 0 ? 0x2fb4ff : 0xff6b4a;
      point.progressArc.lineStyle(7, color, 0.92);
      point.progressArc.beginPath();
      point.progressArc.arc(point.x, point.y, 54, -Math.PI / 2, -Math.PI / 2 + amount * Math.PI * 2, false);
      point.progressArc.strokePath();
    }

    const hpRatio = point.maxHp > 0 ? Phaser.Math.Clamp(point.hp / point.maxHp, 0, 1) : 0;
    point.hpBack.setVisible(point.active);
    point.hpFill.setVisible(point.active);
    point.hpFill.setDisplaySize(70 * hpRatio, 5);
    point.hpFill.setFillStyle(point.owner === 'player' ? 0x58e070 : 0xff6b4a, 0.96);
  }

  private updateRelicFire(point: RelicPoint, delta: number): void {
    if (point.owner === 'neutral' || !point.active) {
      return;
    }

    point.fireTimerMs -= delta;
    if (point.fireTimerMs > 0) {
      return;
    }

    if (point.owner === 'player') {
      const target = this.findNearestEnemy(point.x, point.y, defenseBalance.relic.attackRadius);
      if (target) {
        const angle = Phaser.Math.Angle.Between(point.x, point.y, target.body.x, target.body.y);
        point.fireTimerMs = defenseBalance.relic.fireCooldownMs;
        this.fireBullet(point.x, point.y, angle, 1, 'relic');
      }
    } else if (Phaser.Math.Distance.Between(point.x, point.y, this.player.x, this.player.y) <= defenseBalance.relic.attackRadius) {
      const angle = Phaser.Math.Angle.Between(point.x, point.y, this.player.x, this.player.y);
      point.fireTimerMs = defenseBalance.relic.fireCooldownMs;
      this.fireBullet(point.x, point.y, angle, 1, 'enemy');
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

  private updateIntermission(delta: number): void {
    this.intermissionTimerMs -= delta;
    if (this.intermissionTimerMs <= 0) {
      this.startWave();
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
      this.fireBullet(this.basePosition.x, this.basePosition.y, angle, defenseBalance.turret.damage, 'relic');
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
      this.intermissionTimerMs = defenseBalance.stages.intermissionMs;
      this.status = `Wave cleared. Base bonus: +${bonus} parts. Auto-deploying wave ${this.waveIndex + 1}.`;
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
      mode: Phaser.Math.FloatBetween(0, 1) < (isBruiser ? 0.38 : 0.72) ? 'capture' : 'assault',
      targetPointId: undefined,
      fireTimerMs: Phaser.Math.Between(350, 1000),
      flankOffset: Phaser.Math.RND.pick([-620, -360, -180, 180, 360, 620]),
    });
    const actor = this.enemyActors.get(enemy);
    if (actor && actor.mode === 'capture') {
      actor.targetPointId = this.pickEnemyCaptureTarget(enemy.x, enemy.y)?.id;
      if (!actor.targetPointId) {
        actor.mode = 'assault';
      }
    }
  }

  private fireBullet(x: number, y: number, angle: number, damage: number, owner: BulletOwner): void {
    const muzzleDistance = 45;
    const bullet = this.physics.add.image(
      x + Math.cos(angle) * muzzleDistance,
      y + Math.sin(angle) * muzzleDistance,
      AssetKeys.PlayerBullet,
    );
    this.bullets.add(bullet);
    bullet.setDisplaySize(owner === 'enemy' ? 16 : 18, owner === 'enemy' ? 26 : 28);
    if (owner === 'enemy') {
      bullet.setTint(0xff6b4a);
    }
    bullet.setRotation(angle + Math.PI / 2);
    bullet.setDepth(900);
    const speed = owner === 'enemy' ? defenseBalance.enemy.bulletSpeed : defenseBalance.player.bulletSpeed;
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    bullet.body?.setSize(owner === 'enemy' ? 20 : 14, owner === 'enemy' ? 28 : 22);
    bullet.body?.setAllowGravity(false);
    this.bulletActors.set(bullet, { damage, owner, previousX: bullet.x, previousY: bullet.y });
  }

  private hitEnemy(bullet: Phaser.Physics.Arcade.Image, enemy: Phaser.Physics.Arcade.Image): void {
    const bulletActor = this.bulletActors.get(bullet);
    const enemyActor = this.enemyActors.get(enemy);
    if (!bulletActor || !enemyActor || bulletActor.owner === 'enemy') {
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

  private hitPlayer(bullet: Phaser.Physics.Arcade.Image): void {
    const bulletActor = this.bulletActors.get(bullet);
    if (!bulletActor || bulletActor.owner !== 'enemy' || this.phase === 'lost') {
      return;
    }

    this.playerHp = Math.max(0, this.playerHp - bulletActor.damage);
    this.destroyBullet(bullet);
    this.flashAt(this.player.x, this.player.y, 0xff6b4a, 32);
    this.cameras.main.shake(80, 0.004);

    if (this.playerHp <= 0) {
      this.phase = 'lost';
      this.status = 'Your tank is knocked out. Five hits is enough to end the run.';
      this.clearCombatActors();
      eventBus.emit(GameEvents.RunStateChanged, { phase: 'lost' });
    } else {
      this.status = `Tank hit. ${this.playerHp}/${defenseBalance.player.maxHp} armor remains.`;
    }

    this.publishHud();
  }

  private hitBarrel(bullet: Phaser.Physics.Arcade.Image, barrel: Phaser.Physics.Arcade.Image): void {
    const bulletActor = this.bulletActors.get(bullet);
    const barrelActor = this.barrelActors.get(barrel);
    if (!bulletActor || !barrelActor) {
      return;
    }

    barrelActor.hp -= bulletActor.damage;
    this.destroyBullet(bullet);

    if (barrelActor.hp <= 0) {
      this.explodeBarrel(barrelActor);
    } else {
      this.flashAt(barrel.x, barrel.y, 0xffffff, 16);
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

    if (actor.kind === 'repair') {
      if (this.playerHp < defenseBalance.player.maxHp) {
        this.playerHp = Math.min(defenseBalance.player.maxHp, this.playerHp + actor.value);
        this.status = `Repair kit restored armor: ${this.playerHp}/${defenseBalance.player.maxHp}.`;
      } else {
        this.baseHp = Math.min(this.maxBaseHp, this.baseHp + actor.value * 8);
        this.status = `Repair kit patched the base: ${this.baseHp}/${this.maxBaseHp}.`;
      }
      this.flashAt(drop.x, drop.y, 0x58e070, 22);
    } else {
      const gained = actor.value * defenseBalance.partsPerCollectible;
      this.parts += gained;
      this.status = `Collected ${gained} parts.`;
      this.flashAt(drop.x, drop.y, 0xf4d35e, 20);
    }
    this.destroyDrop(drop);
    this.publishHud();
  }

  private destroyEnemy(actor: EnemyActor, reward: boolean): void {
    if (reward) {
      this.spawnDrop(actor.body.x, actor.body.y, 'parts', actor.parts);
      if (Phaser.Math.FloatBetween(0, 1) < 0.12) {
        this.spawnDrop(actor.body.x + Phaser.Math.Between(-18, 18), actor.body.y + Phaser.Math.Between(-18, 18), 'repair', 1);
      }
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

  private explodeBarrel(actor: BarrelActor): void {
    const x = actor.body.x;
    const y = actor.body.y;
    this.addSmoke(x, y, true);
    this.flashAt(x, y, 0xffc857, 56);
    this.cameras.main.shake(120, 0.005);

    for (const enemy of Array.from(this.enemyActors.values())) {
      if (Phaser.Math.Distance.Between(x, y, enemy.body.x, enemy.body.y) <= 150) {
        enemy.hp -= 3;
        if (enemy.hp <= 0) {
          this.destroyEnemy(enemy, true);
        }
      }
    }

    if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) <= 120) {
      this.playerHp = Math.max(0, this.playerHp - 1);
      if (this.playerHp <= 0) {
        this.phase = 'lost';
        this.status = 'Your tank was destroyed by the barrel blast.';
        this.clearCombatActors();
        eventBus.emit(GameEvents.RunStateChanged, { phase: 'lost' });
      }
    }

    this.spawnDrop(x - 18, y, 'parts', 3);
    if (Phaser.Math.FloatBetween(0, 1) < 0.35) {
      this.spawnDrop(x + 18, y, 'repair', 1);
    }

    this.barrelActors.delete(actor.body);
    this.barrels.remove(actor.body, true, true);
    this.publishHud();
  }

  private spawnDrop(x: number, y: number, kind: DropKind, value: number): void {
    const frame = kind === 'repair' ? 5 : 6;
    const drop = this.physics.add.image(x, y, AssetKeys.DefenseObjects, frame);
    drop.setDisplaySize(value >= 4 ? 28 : 22, value >= 4 ? 28 : 22);
    drop.body?.setCircle(12);
    drop.setVelocity(Phaser.Math.Between(-18, 18), Phaser.Math.Between(-18, 18));
    this.drops.add(drop);
    this.dropActors.set(drop, {
      kind,
      value,
      expiresAt: Number.POSITIVE_INFINITY,
    });
  }

  private updateEnemyBaseHpBar(): void {
    const hpRatio = Phaser.Math.Clamp(this.enemyBaseHp / defenseBalance.enemyBaseHp, 0, 1);
    this.enemyBaseHpBack.setVisible(this.enemyBaseHp > 0);
    this.enemyBaseHpFill.setVisible(this.enemyBaseHp > 0);
    this.enemyBaseHpFill.setDisplaySize(104 * hpRatio, 6);
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
    return new Phaser.Math.Vector2(
      this.enemyBase.x + Phaser.Math.Between(-72, 72),
      this.enemyBase.y + Phaser.Math.Between(72, 156),
    );
  }

  private pickEnemyCaptureTarget(x: number, y: number): RelicPoint | undefined {
    return this.relicPoints
      .filter((point) => point.owner !== 'enemy')
      .sort(
        (a, b) =>
          Phaser.Math.Distance.Between(x, y, a.x, a.y) -
          Phaser.Math.Distance.Between(x, y, b.x, b.y),
      )[0];
  }

  private getVisionRadius(): number {
    return defenseBalance.player.vision + this.upgradeLevels['tank-vision'] * 140;
  }

  private isVisibleToPlayer(x: number, y: number, radius = this.getVisionRadius()): boolean {
    if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) <= radius) {
      return true;
    }

    if (Phaser.Math.Distance.Between(x, y, this.basePosition.x, this.basePosition.y) <= radius * 0.55) {
      return true;
    }

    return this.relicPoints.some(
      (point) => point.owner === 'player' && Phaser.Math.Distance.Between(x, y, point.x, point.y) <= radius * 0.72,
    );
  }

  private publishHud(): void {
    const nextWave = waves[this.waveIndex];
    const currentStage = this.getCurrentStage();
    const visionRadius = this.getVisionRadius();
    eventBus.emit(GameEvents.DefenseHudChanged, {
      phase: this.phase,
      activeTab: this.activeTab,
      wave: Math.min(this.waveIndex + 1, defenseBalance.maxWaves),
      maxWaves: defenseBalance.maxWaves,
      baseHp: this.baseHp,
      maxBaseHp: this.maxBaseHp,
      playerHp: this.playerHp,
      maxPlayerHp: defenseBalance.player.maxHp,
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
        enemyBase: { x: this.enemyBase.x, y: this.enemyBase.y },
        enemies: Array.from(this.enemyActors.values()).map((enemy) => ({
          x: enemy.body.x,
          y: enemy.body.y,
        })),
        relics: this.relicPoints.map((point) => ({
          x: point.x,
          y: point.y,
          owner: point.owner,
          visible: true,
        })),
        camera: {
          x: this.cameras.main.scrollX,
          y: this.cameras.main.scrollY,
          width: this.cameras.main.width,
          height: this.cameras.main.height,
        },
        visionRadius,
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
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    eventBus.off(GameEvents.StartWaveRequested, this.handleStartWaveRequested, this);
    eventBus.off(GameEvents.RestartRequested, this.handleRestartRequested, this);
    eventBus.off(GameEvents.UpgradeRequested, this.handleUpgradeRequested, this);
    this.scene.stop(SceneKeys.UI);
    eventBus.emit(GameEvents.GameplayStopped, { scene: SceneKeys.Game });
  }
}
