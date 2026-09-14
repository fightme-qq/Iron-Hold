import Phaser from 'phaser';
import { AssetKeys } from '../assets/assetManifest';
import { GameEvents } from '../config/gameEvents';
import { SceneKeys } from '../config/sceneKeys';
import { eventBus } from '../events/EventBus';

type DefenseTab = 'battle' | 'tank' | 'base' | 'map';
type DefensePhase = 'intermission' | 'wave' | 'stageBreak' | 'won' | 'lost';

type UpgradeUiModel = {
  id: string;
  target: 'tank' | 'base';
  title: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  cost: number;
  affordable: boolean;
  maxed: boolean;
};

type DefenseHudModel = {
  phase: DefensePhase;
  activeTab: DefenseTab;
  wave: number;
  maxWaves: number;
  baseHp: number;
  maxBaseHp: number;
  playerHp: number;
  maxPlayerHp: number;
  parts: number;
  status: string;
  stage: {
    current: number;
    total: number;
    title: string;
  };
  minimap: {
    worldWidth: number;
    worldHeight: number;
    player: { x: number; y: number };
    base: { x: number; y: number };
    enemyBase: { x: number; y: number };
    enemies: Array<{ x: number; y: number }>;
    relics: Array<{ x: number; y: number; owner: 'neutral' | 'player' | 'enemy'; visible: boolean }>;
    camera: { x: number; y: number; width: number; height: number };
    visionRadius: number;
  };
  upgrades: UpgradeUiModel[];
  nextWave:
    | {
      scouts: number;
      bruisers: number;
      stages: Array<{
        title: string;
        scouts: number;
        bruisers: number;
      }>;
    }
    | undefined;
};

const iconFrames = {
  parts: 0,
  baseHp: 1,
  wave: 2,
  damage: 3,
  reload: 4,
  armor: 5,
  speed: 6,
  repair: 7,
  turret: 8,
  barrier: 9,
  battle: 10,
  tank: 11,
  base: 12,
  map: 13,
  play: 14,
  restart: 15,
} as const;

const upgradeIconFrames: Record<string, number> = {
  'tank-damage': iconFrames.damage,
  'tank-reload': iconFrames.reload,
  'tank-speed': iconFrames.speed,
  'tank-vision': iconFrames.wave,
  'base-max-hp': iconFrames.baseHp,
  'base-repair': iconFrames.repair,
  'base-turret': iconFrames.turret,
};

const tabItems: Array<{ id: DefenseTab; label: string; frame: number }> = [
  { id: 'battle', label: 'Battle', frame: iconFrames.battle },
  { id: 'tank', label: 'Tank', frame: iconFrames.tank },
  { id: 'base', label: 'Base', frame: iconFrames.base },
  { id: 'map', label: 'Map', frame: iconFrames.map },
];

export class UIScene extends Phaser.Scene {
  private model?: DefenseHudModel;
  private activeTab: DefenseTab = 'battle';
  private hotspots: Array<{ rect: Phaser.Geom.Rectangle; onClick: () => void }> = [];
  private hudLayer!: Phaser.GameObjects.Container;
  private minimapLayer!: Phaser.GameObjects.Container;
  private panelLayer!: Phaser.GameObjects.Container;
  private navLayer!: Phaser.GameObjects.Container;
  private resultLayer!: Phaser.GameObjects.Container;
  private statusText!: Phaser.GameObjects.Text;
  private waveValue!: Phaser.GameObjects.Text;
  private hpValue!: Phaser.GameObjects.Text;
  private tankHpValue!: Phaser.GameObjects.Text;
  private partsValue!: Phaser.GameObjects.Text;
  private stageValue!: Phaser.GameObjects.Text;
  private title = 'Iron Hold';

  constructor() {
    super(SceneKeys.UI);
  }

  create(data: { title?: string }): void {
    this.title = data.title ?? 'Iron Hold';
    this.hudLayer = this.add.container(0, 0).setDepth(30);
    this.minimapLayer = this.add.container(0, 0).setDepth(38);
    this.panelLayer = this.add.container(0, 0).setDepth(40);
    this.navLayer = this.add.container(0, 0).setDepth(50);
    this.resultLayer = this.add.container(0, 0).setDepth(70);
    this.createTopHud(this.title);
    this.createNavbar();

    this.input.on('pointerdown', this.handlePointerDown, this);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    eventBus.on(GameEvents.DefenseHudChanged, this.handleHudChanged, this);
    eventBus.on(GameEvents.GameplayStopped, this.handleGameplayStopped, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.removeEventListeners());
  }

  private createTopHud(title: string): void {
    const { width } = this.scale;
    const margin = Phaser.Math.Clamp(width * 0.018, 18, 34);
    const compact = width < 1180;
    const titleSize = compact ? 22 : 26;
    const chipGap = compact ? 8 : 12;
    const titleWidth = compact ? 150 : 238;
    const statusWidth = width >= 1180 ? Phaser.Math.Clamp(width * 0.18, 220, 380) : 0;
    const availableChipWidth = width - margin * 2 - titleWidth - statusWidth - chipGap * 5;
    const chipWidth = Phaser.Math.Clamp(availableChipWidth / 5, compact ? 112 : 136, 210);
    const chipY = 12;
    this.hudLayer.removeAll(true);
    this.hudLayer.add(this.roundedRect(0, 0, width, 64, 0x14241b, 0.94, 0, 0x14241b, 0));

    const titleText = this.add.text(margin, 18, title, {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: `${titleSize}px`,
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.hudLayer.add(titleText);

    let x = margin + titleWidth;
    this.waveValue = this.createStatChip(x, chipY, chipWidth, iconFrames.wave, 'Wave', '#d9f2ff', compact);
    x += chipWidth + chipGap;
    this.hpValue = this.createStatChip(x, chipY, chipWidth, iconFrames.baseHp, 'Base', '#f7d95b', compact);
    x += chipWidth + chipGap;
    this.tankHpValue = this.createStatChip(x, chipY, chipWidth, iconFrames.armor, 'Tank', '#ffb49f', compact);
    x += chipWidth + chipGap;
    this.partsValue = this.createStatChip(x, chipY, chipWidth, iconFrames.parts, 'Parts', '#b9f27c', compact);
    x += chipWidth + chipGap;
    this.stageValue = this.createStatChip(x, chipY, chipWidth, iconFrames.battle, 'Stage', '#f7d95b', compact);
    this.statusText = this.add.text(width - margin - statusWidth, 12, '', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '14px',
      color: '#d8e2f8',
      wordWrap: { width: Math.max(120, statusWidth) },
    });
    this.statusText.setVisible(statusWidth > 0);
    this.hudLayer.add(this.statusText);
  }

  private createStatChip(
    x: number,
    y: number,
    width: number,
    frame: number,
    label: string,
    color: string,
    compact = false,
  ): Phaser.GameObjects.Text {
    this.hudLayer.add(this.roundedRect(x, y, width, 40, 0x213329, 0.96, 8, 0x3d5948, 0.75));
    const iconSize = compact ? 24 : 28;
    const icon = this.add.image(x + 20, y + 20, AssetKeys.UIIcons, frame).setDisplaySize(iconSize, iconSize);
    const text = this.add.text(x + (compact ? 38 : 44), y + 11, `${label} 0`, {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: compact ? '14px' : '16px',
      color,
      fontStyle: 'bold',
      wordWrap: { width: Math.max(68, width - (compact ? 44 : 52)) },
    });
    this.hudLayer.add([icon, text]);
    return text;
  }

  private createNavbar(): void {
    const { width, height } = this.scale;
    const dockY = height - 84;
    const margin = Phaser.Math.Clamp(width * 0.018, 18, 34);
    const tabGap = width < 860 ? 8 : 16;
    const tabWidth = Phaser.Math.Clamp((width - margin * 2 - tabGap * (tabItems.length - 1) - 220) / 4, 104, 150);
    this.navLayer.removeAll(true);
    this.navLayer.add(this.roundedRect(0, dockY, width, 84, 0x111b1f, 0.97, 0, 0x111b1f, 0));

    let x = margin;
    for (const tab of tabItems) {
      this.createTabButton(x, dockY + 14, tab, tabWidth);
      x += tabWidth + tabGap;
    }

    this.createActionButton(width - margin - 188, dockY + 14);
  }

  private createTabButton(x: number, y: number, tab: { id: DefenseTab; label: string; frame: number }, width: number): void {
    const selected = tab.id === this.activeTab;
    const fill = selected ? 0xf7d95b : 0x20303a;
    const stroke = selected ? 0xffffff : 0x516a78;
    const textColor = selected ? '#101820' : '#e8f1f2';
    this.createButtonSurface(this.navLayer, x, y, width, 56, fill, stroke, selected ? 1 : 0.72, () => {
      this.activeTab = tab.id;
      this.render();
    });
    const icon = this.add.image(x + 28, y + 28, AssetKeys.UIIcons, tab.frame).setDisplaySize(28, 28);
    const showLabel = width >= 118;
    const label = this.add
      .text(x + (showLabel ? width * 0.62 : width / 2), y + 29, showLabel ? tab.label : '', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '15px',
        color: textColor,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.navLayer.add([icon, label]);
  }

  private createActionButton(x: number, y: number): void {
    const phase = this.model?.phase ?? 'intermission';
    const restarting = phase === 'won' || phase === 'lost';
    if (!restarting) {
      return;
    }

    this.createButtonSurface(this.navLayer, x, y, 188, 56, 0xf26f55, 0xdfffe6, 1, () => {
      eventBus.emit(GameEvents.RestartRequested, {});
    });
    const icon = this.add.image(x + 34, y + 28, AssetKeys.UIIcons, iconFrames.restart).setDisplaySize(30, 30);
    const text = this.add
      .text(x + 112, y + 29, 'Restart', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '16px',
        color: '#101820',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.navLayer.add([icon, text]);
  }

  private handleHudChanged(model: DefenseHudModel): void {
    this.model = model;
    if (!this.activeTab) {
      this.activeTab = model.activeTab;
    }

    this.render();
  }

  private render(): void {
    if (!this.model) return;
    this.waveValue.setText(`Wave ${this.model.wave}/${this.model.maxWaves}`);
    this.hpValue.setText(`Base ${this.model.baseHp}/${this.model.maxBaseHp}`);
    this.tankHpValue.setText(`Tank ${this.model.playerHp}/${this.model.maxPlayerHp}`);
    this.partsValue.setText(`Parts ${this.model.parts}`);
    this.stageValue.setText(`Stage ${this.model.stage.current}/${this.model.stage.total}`);
    this.statusText.setText(this.model.status);
    this.hotspots = [];
    this.createNavbar();
    this.renderPanel();
    this.renderMinimap();
    this.renderResultOverlay();
  }

  private renderPanel(): void {
    if (!this.model) return;
    this.panelLayer.removeAll(true);

    if (this.activeTab === 'battle') {
      this.renderBattlePanel();
      return;
    }

    if (this.activeTab === 'map') {
      this.renderMapPanel();
      return;
    }

    this.renderUpgradePanel(this.activeTab);
  }

  private renderBattlePanel(): void {
    if (!this.model) return;
    const { width, height } = this.scale;
    const margin = Phaser.Math.Clamp(width * 0.018, 18, 34);
    const y = height - 150;
    const gap = 18;
    const objectiveWidth = Phaser.Math.Clamp(width * 0.22, 250, 360);
    const infoWidth = Math.max(360, width - margin * 2 - objectiveWidth - gap);
    const phaseLabel =
      this.model.phase === 'intermission'
        ? 'Intermission'
        : this.model.phase === 'wave'
          ? 'Defending'
          : this.model.phase === 'stageBreak'
            ? 'Reposition'
            : this.model.phase;
    this.panelLayer.add(this.roundedRect(margin, y, infoWidth, 54, 0x132022, 0.88, 8, 0x2c4240, 0.78));
    this.panelLayer.add(this.add.image(margin + 30, y + 27, AssetKeys.UIIcons, iconFrames.battle).setDisplaySize(28, 28));
    this.panelLayer.add(this.add.text(margin + 62, y + 9, phaseLabel, this.textStyle('#f7d95b', 15, 160, true)));
    this.panelLayer.add(
      this.add.text(
        margin + 62,
        y + 30,
        'W/S drive, A/D turn. Capture relics, break barrels, collect repairs.',
        this.textStyle('#d8e2f8', 14, Math.max(240, infoWidth - 86)),
      ),
    );
    const objectiveX = margin + infoWidth + gap;
    this.panelLayer.add(this.roundedRect(objectiveX, y, objectiveWidth, 54, 0x132022, 0.88, 8, 0x2c4240, 0.78));
    this.panelLayer.add(this.add.image(objectiveX + 30, y + 27, AssetKeys.UIIcons, iconFrames.baseHp).setDisplaySize(28, 28));
    this.panelLayer.add(this.add.text(objectiveX + 62, y + 10, 'Win: destroy enemy base', this.textStyle('#b9f27c', 14, objectiveWidth - 78, true)));
    this.panelLayer.add(this.add.text(objectiveX + 62, y + 30, 'Lose: base or tank falls', this.textStyle('#ffb49f', 14, objectiveWidth - 78, true)));
  }

  private renderMapPanel(): void {
    if (!this.model) return;
    const { width, height } = this.scale;
    const y = height - 236;
    const margin = Phaser.Math.Clamp(width * 0.018, 18, 34);
    this.panelLayer.add(this.roundedRect(margin, y, width - margin * 2, 132, 0x132022, 0.93, 8, 0x2c4240, 0.9));
    this.panelLayer.add(this.add.image(margin + 36, y + 38, AssetKeys.UIIcons, iconFrames.map).setDisplaySize(44, 44));
    this.panelLayer.add(this.add.text(margin + 72, y + 20, 'Wave Intel', this.textStyle('#f7d95b', 17, 180, true)));
    const next = this.model.nextWave;
    const text = next ? `Next wave: ${next.scouts} scouts, ${next.bruisers} bruisers` : 'Sector secured. No more waves in this MVP.';
    this.panelLayer.add(this.add.text(margin + 72, y + 54, text, this.textStyle('#d8e2f8', 20, Math.min(440, width * 0.36))));
    const stages = next?.stages.map((stage, index) => `${index + 1}. ${stage.title}: ${stage.scouts}/${stage.bruisers}`).join('\n') ?? '';
    this.panelLayer.add(this.add.text(width * 0.46, y + 24, stages, this.textStyle('#d8e2f8', 15, Math.max(240, width * 0.2))));
    this.panelLayer.add(this.add.text(width * 0.72, y + 24, 'Relics hold fire lanes and shoot for their owner.', this.textStyle('#9fb2d8', 15, Math.max(220, width * 0.18))));
    this.panelLayer.add(this.add.text(width * 0.72, y + 62, 'Optics expands tactical awareness.', this.textStyle('#b9f27c', 15, Math.max(220, width * 0.18), true)));
  }

  private renderMinimap(): void {
    if (!this.model) return;
    const mapWidth = Phaser.Math.Clamp(this.scale.width * 0.14, 176, 280);
    const mapHeight = Phaser.Math.Clamp(mapWidth * 0.68, 120, 190);
    const margin = Phaser.Math.Clamp(this.scale.width * 0.018, 18, 34);
    const x = this.scale.width - mapWidth - margin;
    const y = 82;
    this.minimapLayer.removeAll(true);
    this.minimapLayer.add(this.roundedRect(x, y, mapWidth, mapHeight, 0x101820, 0.86, 8, 0xd8e2f8, 0.35));
    this.minimapLayer.add(this.add.text(x + 12, y + 8, 'Minimap', this.textStyle('#d8e2f8', 12, 80, true)));

    const innerX = x + 12;
    const innerY = y + 28;
    const innerW = mapWidth - 24;
    const innerH = mapHeight - 40;
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x7d9364, 0.75);
    graphics.strokeRect(innerX, innerY, innerW, innerH);
    graphics.fillStyle(0x2b4f30, 0.45);
    graphics.fillRect(innerX, innerY, innerW, innerH);

    const toMap = (point: { x: number; y: number }) => ({
      x: innerX + (point.x / this.model!.minimap.worldWidth) * innerW,
      y: innerY + (point.y / this.model!.minimap.worldHeight) * innerH,
    });

    const base = toMap(this.model.minimap.base);
    const enemyBase = toMap(this.model.minimap.enemyBase);
    const player = toMap(this.model.minimap.player);
    const camera = this.model.minimap.camera;
    const viewX = innerX + (camera.x / this.model.minimap.worldWidth) * innerW;
    const viewY = innerY + (camera.y / this.model.minimap.worldHeight) * innerH;
    const viewW = (camera.width / this.model.minimap.worldWidth) * innerW;
    const viewH = (camera.height / this.model.minimap.worldHeight) * innerH;
    graphics.lineStyle(1, 0xd8e2f8, 0.65);
    graphics.strokeRect(viewX, viewY, viewW, viewH);

    for (const relic of this.model.minimap.relics) {
      const dot = toMap(relic);
      const color = relic.owner === 'player' ? 0x2fb4ff : relic.owner === 'enemy' ? 0xff6b4a : 0xd8e2f8;
      graphics.lineStyle(1, color, 0.9);
      graphics.strokeCircle(dot.x, dot.y, 4);
      if (relic.owner === 'player') {
        graphics.fillStyle(0x2fb4ff, 0.09);
        graphics.fillCircle(dot.x, dot.y, 7);
      }
    }

    graphics.fillStyle(0xf7d95b, 1);
    graphics.fillCircle(base.x, base.y, 4);
    graphics.fillStyle(0xff6b4a, 1);
    graphics.fillRect(enemyBase.x - 3, enemyBase.y - 3, 6, 6);
    graphics.fillStyle(0x2fb4ff, 1);
    graphics.fillTriangle(player.x, player.y - 5, player.x - 4, player.y + 4, player.x + 4, player.y + 4);
    graphics.fillStyle(0xff6b4a, 0.95);
    for (const enemy of this.model.minimap.enemies) {
      const dot = toMap(enemy);
      graphics.fillCircle(dot.x, dot.y, 2.6);
    }

    this.minimapLayer.add(graphics);
  }

  private renderUpgradePanel(tab: 'tank' | 'base'): void {
    if (!this.model) return;
    const { width, height } = this.scale;
    const y = height - 236;
    const upgrades = this.model.upgrades.filter((upgrade) => upgrade.target === tab);
    const margin = Phaser.Math.Clamp(width * 0.018, 18, 34);
    this.panelLayer.add(this.roundedRect(margin, y, width - margin * 2, 132, 0x132022, 0.94, 8, 0x2c4240, 0.9));
    this.panelLayer.add(this.add.image(margin + 36, y + 38, AssetKeys.UIIcons, tab === 'tank' ? iconFrames.tank : iconFrames.base).setDisplaySize(44, 44));
    this.panelLayer.add(this.add.text(margin + 72, y + 19, tab === 'tank' ? 'Tank Bay' : 'Base Workshop', this.textStyle('#f7d95b', 17, 240, true)));
    this.panelLayer.add(this.add.text(margin + 72, y + 48, 'Spend parts between waves.', this.textStyle('#9fb2d8', 14, 240)));

    const startX = margin + 266;
    const gap = 14;
    const cardWidth = Phaser.Math.Clamp((width - startX - margin - gap * Math.max(0, upgrades.length - 1)) / Math.max(1, upgrades.length), 150, 190);
    upgrades.forEach((upgrade, index) => {
      const x = startX + index * (cardWidth + gap);
      this.createUpgradeCard(x, y + 22, upgrade, cardWidth);
    });
  }

  private renderResultOverlay(): void {
    this.resultLayer.removeAll(true);
    if (!this.model || (this.model.phase !== 'lost' && this.model.phase !== 'won')) {
      return;
    }

    const { width, height } = this.scale;
    const isWon = this.model.phase === 'won';
    const panelWidth = Phaser.Math.Clamp(width * 0.42, 430, 620);
    const panelHeight = 246;
    const x = width / 2 - panelWidth / 2;
    const y = height / 2 - panelHeight / 2;
    const accent = isWon ? 0x58e070 : 0xff6b4a;
    const title = isWon ? 'Sector Secured' : 'Tank Destroyed';
    const subtitle = isWon
      ? 'Enemy base is down. Choose another sector or replay this route.'
      : 'The run is over. Return to the sector map or restart the defense.';

    this.resultLayer.add(this.add.rectangle(width / 2, height / 2, width, height, 0x050713, 0.58));
    this.resultLayer.add(this.roundedRect(x, y, panelWidth, panelHeight, 0x132022, 0.97, 8, accent, 0.9));
    this.resultLayer.add(this.add.image(x + 58, y + 64, AssetKeys.UIIcons, isWon ? iconFrames.baseHp : iconFrames.battle).setDisplaySize(44, 44));
    this.resultLayer.add(this.add.text(x + 96, y + 38, title, this.textStyle(isWon ? '#b9f27c' : '#ffb49f', 28, panelWidth - 132, true)));
    this.resultLayer.add(this.add.text(x + 96, y + 82, subtitle, this.textStyle('#d8e2f8', 16, panelWidth - 132)));
    this.resultLayer.add(this.add.text(x + 34, y + 132, this.model.status, this.textStyle('#9fb2d8', 14, panelWidth - 68)));

    const buttonY = y + panelHeight - 72;
    const buttonGap = 16;
    const buttonWidth = (panelWidth - 68 - buttonGap) / 2;
    this.createButtonSurface(this.resultLayer, x + 34, buttonY, buttonWidth, 52, 0x20303a, 0x7d93a3, 1, () => {
      eventBus.emit(GameEvents.MainMenuRequested, {});
    });
    this.resultLayer.add(this.add.image(x + 62, buttonY + 26, AssetKeys.UIIcons, iconFrames.map).setDisplaySize(28, 28));
    this.resultLayer.add(this.add.text(x + 94, buttonY + 17, 'Main Menu', this.textStyle('#e8f1f2', 16, buttonWidth - 74, true)));

    const restartX = x + 34 + buttonWidth + buttonGap;
    this.createButtonSurface(this.resultLayer, restartX, buttonY, buttonWidth, 52, isWon ? 0x58e070 : 0xf26f55, 0xdfffe6, 1, () => {
      eventBus.emit(GameEvents.RestartRequested, {});
    });
    this.resultLayer.add(this.add.image(restartX + 28, buttonY + 26, AssetKeys.UIIcons, iconFrames.restart).setDisplaySize(28, 28));
    this.resultLayer.add(this.add.text(restartX + 60, buttonY + 17, 'Restart', this.textStyle('#101820', 16, buttonWidth - 76, true)));
  }

  private createUpgradeCard(x: number, y: number, upgrade: UpgradeUiModel, width = 166): void {
    const canBuy = this.model?.phase === 'intermission' && upgrade.affordable && !upgrade.maxed;
    const locked = this.model?.phase === 'wave' || (!upgrade.affordable && !upgrade.maxed);
    const fill = upgrade.maxed ? 0x25333a : canBuy ? 0x244533 : 0x22303a;
    const stroke = canBuy ? 0x58e070 : upgrade.maxed ? 0xf7d95b : 0x516a78;
    this.createButtonSurface(this.panelLayer, x, y, width, 88, fill, stroke, locked ? 0.72 : 1, () => {
      if (canBuy) {
        eventBus.emit(GameEvents.UpgradeRequested, { id: upgrade.id });
      }
    });
    const icon = this.add.image(x + 26, y + 29, AssetKeys.UIIcons, upgradeIconFrames[upgrade.id] ?? iconFrames.parts).setDisplaySize(34, 34);
    const textWidth = Math.max(92, width - 62);
    const title = this.add.text(x + 50, y + 13, upgrade.title, this.textStyle('#ffffff', 14, textWidth, true));
    const level = upgrade.maxed ? 'MAX' : `Lv ${upgrade.level}/${upgrade.maxLevel}`;
    const cost = upgrade.maxed ? 'Complete' : `${upgrade.cost} parts`;
    const metaColor = canBuy ? '#b9f27c' : upgrade.maxed ? '#f7d95b' : '#9fb2d8';
    const meta = this.add.text(x + 50, y + 35, `${level}  ${cost}`, this.textStyle(metaColor, 12, textWidth, true));
    const desc = this.add.text(x + 14, y + 62, upgrade.description, this.textStyle('#c9d6d8', 11, width - 28));
    this.panelLayer.add([icon, title, meta, desc]);
  }

  private createButtonSurface(
    layer: Phaser.GameObjects.Container,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: number,
    stroke: number,
    alpha: number,
    onClick: () => void,
  ): Phaser.GameObjects.Graphics {
    const graphics = this.roundedRect(x, y, width, height, fill, alpha, 8, stroke, 0.92);
    this.hotspots.push({
      rect: new Phaser.Geom.Rectangle(x, y, width, height),
      onClick,
    });
    layer.add(graphics);
    return graphics;
  }

  private roundedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: number,
    alpha: number,
    radius: number,
    stroke: number,
    strokeAlpha: number,
  ): Phaser.GameObjects.Graphics {
    const graphics = this.add.graphics();
    graphics.fillStyle(fill, alpha);
    graphics.fillRoundedRect(x, y, width, height, radius);
    if (strokeAlpha > 0) {
      graphics.lineStyle(2, stroke, strokeAlpha);
      graphics.strokeRoundedRect(x, y, width, height, radius);
    }
    return graphics;
  }

  private textStyle(
    color: string,
    fontSize: number,
    width?: number,
    bold = false,
  ): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: `${fontSize}px`,
      color,
      fontStyle: bold ? 'bold' : undefined,
      wordWrap: width ? { width } : undefined,
    };
  }

  private handleGameplayStopped(): void {
    this.removeEventListeners();
  }

  private handleResize(): void {
    this.createTopHud(this.title);
    if (this.model) {
      this.render();
    } else {
      this.hotspots = [];
      this.createNavbar();
      this.resultLayer.removeAll(true);
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    for (let index = this.hotspots.length - 1; index >= 0; index -= 1) {
      const hotspot = this.hotspots[index];
      if (Phaser.Geom.Rectangle.Contains(hotspot.rect, pointer.x, pointer.y)) {
        hotspot.onClick();
        return;
      }
    }
  }

  private removeEventListeners(): void {
    this.input.off('pointerdown', this.handlePointerDown, this);
    this.scale.off(Phaser.Scale.Events.RESIZE, this.handleResize, this);
    eventBus.off(GameEvents.DefenseHudChanged, this.handleHudChanged, this);
    eventBus.off(GameEvents.GameplayStopped, this.handleGameplayStopped, this);
  }
}
