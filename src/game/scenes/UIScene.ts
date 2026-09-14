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
      enemies: Array<{ x: number; y: number }>;
      camera: { x: number; y: number; width: number; height: number };
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
  private statusText!: Phaser.GameObjects.Text;
  private waveValue!: Phaser.GameObjects.Text;
  private hpValue!: Phaser.GameObjects.Text;
  private partsValue!: Phaser.GameObjects.Text;
  private stageValue!: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKeys.UI);
  }

  create(data: { title?: string }): void {
    this.hudLayer = this.add.container(0, 0).setDepth(30);
    this.minimapLayer = this.add.container(0, 0).setDepth(38);
    this.panelLayer = this.add.container(0, 0).setDepth(40);
    this.navLayer = this.add.container(0, 0).setDepth(50);
    this.createTopHud(data.title ?? 'Iron Hold');
    this.createNavbar();

    this.input.on('pointerdown', this.handlePointerDown, this);
    eventBus.on(GameEvents.DefenseHudChanged, this.handleHudChanged, this);
    eventBus.on(GameEvents.GameplayStopped, this.handleGameplayStopped, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.removeEventListeners());
  }

  private createTopHud(title: string): void {
    const { width } = this.scale;
    this.hudLayer.removeAll(true);
    this.hudLayer.add(this.roundedRect(0, 0, width, 64, 0x14241b, 0.94, 0, 0x14241b, 0));

    const titleText = this.add.text(24, 18, title, {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.hudLayer.add(titleText);

    this.waveValue = this.createStatChip(226, 12, 166, iconFrames.wave, 'Wave', '#d9f2ff');
    this.hpValue = this.createStatChip(408, 12, 192, iconFrames.baseHp, 'Base', '#f7d95b');
    this.partsValue = this.createStatChip(616, 12, 164, iconFrames.parts, 'Parts', '#b9f27c');
    this.stageValue = this.createStatChip(796, 12, 190, iconFrames.battle, 'Stage', '#f7d95b');
    this.statusText = this.add.text(1010, 15, '', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '14px',
      color: '#d8e2f8',
      wordWrap: { width: width - 1034 },
    });
    this.hudLayer.add(this.statusText);
  }

  private createStatChip(
    x: number,
    y: number,
    width: number,
    frame: number,
    label: string,
    color: string,
  ): Phaser.GameObjects.Text {
    this.hudLayer.add(this.roundedRect(x, y, width, 40, 0x213329, 0.96, 8, 0x3d5948, 0.75));
    const icon = this.add.image(x + 22, y + 20, AssetKeys.UIIcons, frame).setDisplaySize(28, 28);
    const text = this.add.text(x + 44, y + 11, `${label} 0`, {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '16px',
      color,
      fontStyle: 'bold',
    });
    this.hudLayer.add([icon, text]);
    return text;
  }

  private createNavbar(): void {
    const { width, height } = this.scale;
    const dockY = height - 84;
    this.navLayer.removeAll(true);
    this.navLayer.add(this.roundedRect(0, dockY, width, 84, 0x111b1f, 0.97, 0, 0x111b1f, 0));

    let x = 24;
    for (const tab of tabItems) {
      this.createTabButton(x, dockY + 14, tab);
      x += 134;
    }

    this.createActionButton(width - 212, dockY + 14);
  }

  private createTabButton(x: number, y: number, tab: { id: DefenseTab; label: string; frame: number }): void {
    const selected = tab.id === this.activeTab;
    const fill = selected ? 0xf7d95b : 0x20303a;
    const stroke = selected ? 0xffffff : 0x516a78;
    const textColor = selected ? '#101820' : '#e8f1f2';
    this.createButtonSurface(this.navLayer, x, y, 116, 56, fill, stroke, selected ? 1 : 0.72, () => {
      this.activeTab = tab.id;
      this.render();
    });
    const icon = this.add.image(x + 28, y + 28, AssetKeys.UIIcons, tab.frame).setDisplaySize(28, 28);
    const label = this.add
      .text(x + 70, y + 29, tab.label, {
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
    const disabled = phase === 'wave';
    const restarting = phase === 'won' || phase === 'lost';
    const label = disabled ? 'Wave Active' : restarting ? 'Restart' : 'Start Wave';
    const frame = restarting ? iconFrames.restart : iconFrames.play;
    const fill = disabled ? 0x3e4b51 : restarting ? 0xf26f55 : 0x58e070;
    const stroke = disabled ? 0x5c6a70 : 0xdfffe6;
    this.createButtonSurface(this.navLayer, x, y, 188, 56, fill, stroke, disabled ? 0.62 : 1, () => {
      if (disabled) return;
      eventBus.emit(restarting ? GameEvents.RestartRequested : GameEvents.StartWaveRequested, {});
    });
    const icon = this.add.image(x + 34, y + 28, AssetKeys.UIIcons, frame).setDisplaySize(30, 30);
    const text = this.add
      .text(x + 112, y + 29, label, {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '16px',
        color: '#101820',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    text.setAlpha(disabled ? 0.72 : 1);
    icon.setAlpha(disabled ? 0.72 : 1);
    this.navLayer.add([icon, text]);
  }

  private handleHudChanged(model: DefenseHudModel): void {
    this.model = model;
    if (model.phase === 'wave') {
      this.activeTab = 'battle';
    } else if (!this.activeTab) {
      this.activeTab = model.activeTab;
    }

    this.render();
  }

  private render(): void {
    if (!this.model) return;
    this.waveValue.setText(`Wave ${this.model.wave}/${this.model.maxWaves}`);
    this.hpValue.setText(`Base ${this.model.baseHp}/${this.model.maxBaseHp}`);
    this.partsValue.setText(`Parts ${this.model.parts}`);
    this.stageValue.setText(`Stage ${this.model.stage.current}/${this.model.stage.total}`);
    this.statusText.setText(this.model.status);
    this.hotspots = [];
    this.createNavbar();
    this.renderPanel();
    this.renderMinimap();
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
    const { height } = this.scale;
    const y = height - 150;
    const phaseLabel =
      this.model.phase === 'intermission'
        ? 'Intermission'
        : this.model.phase === 'wave'
          ? 'Defending'
          : this.model.phase === 'stageBreak'
            ? 'Reposition'
            : this.model.phase;
    this.panelLayer.add(this.roundedRect(24, y, 720, 54, 0x132022, 0.88, 8, 0x2c4240, 0.78));
    this.panelLayer.add(this.add.image(54, y + 27, AssetKeys.UIIcons, iconFrames.battle).setDisplaySize(28, 28));
    this.panelLayer.add(this.add.text(86, y + 9, phaseLabel, this.textStyle('#f7d95b', 15, 160, true)));
    this.panelLayer.add(
      this.add.text(
        86,
        y + 30,
        'W/S drive, A/D turn. Aim and fire with pointer/touch, or hold Space.',
        this.textStyle('#d8e2f8', 14, 560),
      ),
    );
    this.panelLayer.add(this.roundedRect(764, y, 260, 54, 0x132022, 0.88, 8, 0x2c4240, 0.78));
    this.panelLayer.add(this.add.image(794, y + 27, AssetKeys.UIIcons, iconFrames.baseHp).setDisplaySize(28, 28));
    this.panelLayer.add(this.add.text(826, y + 10, 'Win: survive wave 5', this.textStyle('#b9f27c', 14, 170, true)));
    this.panelLayer.add(this.add.text(826, y + 30, 'Lose: base HP reaches 0', this.textStyle('#ffb49f', 14, 180, true)));
  }

  private renderMapPanel(): void {
    if (!this.model) return;
    const { width, height } = this.scale;
    const y = height - 236;
    this.panelLayer.add(this.roundedRect(24, y, width - 48, 132, 0x132022, 0.93, 8, 0x2c4240, 0.9));
    this.panelLayer.add(this.add.image(60, y + 38, AssetKeys.UIIcons, iconFrames.map).setDisplaySize(44, 44));
    this.panelLayer.add(this.add.text(96, y + 20, 'Wave Intel', this.textStyle('#f7d95b', 17, 180, true)));
    const next = this.model.nextWave;
    const text = next ? `Next wave: ${next.scouts} scouts, ${next.bruisers} bruisers` : 'Sector secured. No more waves in this MVP.';
    this.panelLayer.add(this.add.text(96, y + 54, text, this.textStyle('#d8e2f8', 20, 440)));
    const stages = next?.stages.map((stage, index) => `${index + 1}. ${stage.title}: ${stage.scouts}/${stage.bruisers}`).join('\n') ?? '';
    this.panelLayer.add(this.add.text(600, y + 24, stages, this.textStyle('#d8e2f8', 15, 300)));
    this.panelLayer.add(this.add.text(930, y + 34, 'Scouts / bruisers by stage.', this.textStyle('#9fb2d8', 15, 240)));
  }

  private renderMinimap(): void {
    if (!this.model) return;
    const mapWidth = 186;
    const mapHeight = 128;
    const x = this.scale.width - mapWidth - 24;
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
    const player = toMap(this.model.minimap.player);
    const camera = this.model.minimap.camera;
    const viewX = innerX + (camera.x / this.model.minimap.worldWidth) * innerW;
    const viewY = innerY + (camera.y / this.model.minimap.worldHeight) * innerH;
    const viewW = (camera.width / this.model.minimap.worldWidth) * innerW;
    const viewH = (camera.height / this.model.minimap.worldHeight) * innerH;
    graphics.lineStyle(1, 0xd8e2f8, 0.65);
    graphics.strokeRect(viewX, viewY, viewW, viewH);
    graphics.fillStyle(0xf7d95b, 1);
    graphics.fillCircle(base.x, base.y, 4);
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
    this.panelLayer.add(this.roundedRect(24, y, width - 48, 132, 0x132022, 0.94, 8, 0x2c4240, 0.9));
    this.panelLayer.add(this.add.image(60, y + 38, AssetKeys.UIIcons, tab === 'tank' ? iconFrames.tank : iconFrames.base).setDisplaySize(44, 44));
    this.panelLayer.add(this.add.text(96, y + 19, tab === 'tank' ? 'Tank Bay' : 'Base Workshop', this.textStyle('#f7d95b', 17, 240, true)));
    this.panelLayer.add(this.add.text(96, y + 48, 'Spend parts between waves.', this.textStyle('#9fb2d8', 14, 240)));

    upgrades.forEach((upgrade, index) => {
      const x = 290 + index * 184;
      this.createUpgradeCard(x, y + 22, upgrade);
    });
  }

  private createUpgradeCard(x: number, y: number, upgrade: UpgradeUiModel): void {
    const canBuy = this.model?.phase === 'intermission' && upgrade.affordable && !upgrade.maxed;
    const locked = this.model?.phase === 'wave' || (!upgrade.affordable && !upgrade.maxed);
    const fill = upgrade.maxed ? 0x25333a : canBuy ? 0x244533 : 0x22303a;
    const stroke = canBuy ? 0x58e070 : upgrade.maxed ? 0xf7d95b : 0x516a78;
    this.createButtonSurface(this.panelLayer, x, y, 166, 88, fill, stroke, locked ? 0.72 : 1, () => {
      if (canBuy) {
        eventBus.emit(GameEvents.UpgradeRequested, { id: upgrade.id });
      }
    });
    const icon = this.add.image(x + 26, y + 29, AssetKeys.UIIcons, upgradeIconFrames[upgrade.id] ?? iconFrames.parts).setDisplaySize(34, 34);
    const title = this.add.text(x + 50, y + 13, upgrade.title, this.textStyle('#ffffff', 14, 104, true));
    const level = upgrade.maxed ? 'MAX' : `Lv ${upgrade.level}/${upgrade.maxLevel}`;
    const cost = upgrade.maxed ? 'Complete' : `${upgrade.cost} parts`;
    const metaColor = canBuy ? '#b9f27c' : upgrade.maxed ? '#f7d95b' : '#9fb2d8';
    const meta = this.add.text(x + 50, y + 35, `${level}  ${cost}`, this.textStyle(metaColor, 12, 104, true));
    const desc = this.add.text(x + 14, y + 62, upgrade.description, this.textStyle('#c9d6d8', 11, 138));
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
    eventBus.off(GameEvents.DefenseHudChanged, this.handleHudChanged, this);
    eventBus.off(GameEvents.GameplayStopped, this.handleGameplayStopped, this);
  }
}
