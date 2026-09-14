import Phaser from 'phaser';
import { AssetKeys } from '../assets/assetManifest';
import { SceneKeys } from '../config/sceneKeys';
import { fadeInScene, startSceneWithFade } from './sceneTransitions';

type Star = {
  shape: Phaser.GameObjects.Arc;
  factor: number;
  speed: number;
};

type Meteor = {
  body: Phaser.GameObjects.Rectangle;
  trail: Phaser.GameObjects.Line;
  speed: number;
};

type FocusPlanet = {
  image: Phaser.GameObjects.Image;
  ring: Phaser.GameObjects.Ellipse;
  glow: Phaser.GameObjects.Arc;
  baseX: number;
  baseY: number;
  selectedScale: number;
  idleScale: number;
};

type CardView = {
  id: MapId;
  surface: Phaser.GameObjects.Rectangle;
  planet: Phaser.GameObjects.Image;
  title: Phaser.GameObjects.Text;
  subtitle: Phaser.GameObjects.Text;
};

const mapCards = [
  {
    id: 'iron-hold',
    title: 'Iron Hold',
    subtitle: 'Vertical frontline',
    color: 0x58e070,
    accent: 0xf7d95b,
    planetFrame: 0,
    x: 268,
    y: 206,
    scale: 0.74,
  },
  {
    id: 'red-orbit',
    title: 'Red Orbit',
    subtitle: 'Asteroid siege',
    color: 0xff6b4a,
    accent: 0xffd166,
    planetFrame: 1,
    x: 1030,
    y: 212,
    scale: 0.86,
  },
  {
    id: 'blue-rift',
    title: 'Blue Rift',
    subtitle: 'Relay warzone',
    color: 0x2fb4ff,
    accent: 0xb28cff,
    planetFrame: 2,
    x: 922,
    y: 618,
    scale: 0.64,
  },
] as const;

type MapId = (typeof mapCards)[number]['id'];

export class MenuScene extends Phaser.Scene {
  private stars: Star[] = [];
  private meteors: Meteor[] = [];
  private focusPlanets: FocusPlanet[] = [];
  private cards: CardView[] = [];
  private selectedMap: MapId = mapCards[0].id;
  private transitioning = false;
  private spaceLayer!: Phaser.GameObjects.Container;
  private planetLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;
  private launchButton!: Phaser.GameObjects.Rectangle;
  private launchText!: Phaser.GameObjects.Text;

  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    this.selectedMap = this.getStoredSelection();
    fadeInScene(this, { durationMs: 360, color: 0x02040d });
    this.spaceLayer = this.add.container(0, 0);
    this.planetLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0).setDepth(100);

    this.drawSpace();
    this.createPlanets();
    this.createMapSelect();
    this.applySelection(this.selectedMap, false);

    this.input.keyboard?.on('keydown-ENTER', () => this.startSelectedMap());
    this.input.keyboard?.on('keydown-SPACE', () => this.startSelectedMap());
    this.input.keyboard?.on('keydown-LEFT', () => this.selectAdjacent(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.selectAdjacent(1));
  }

  update(time: number, delta: number): void {
    const pointer = this.input.activePointer;
    const parallaxX = (pointer.x / this.scale.width - 0.5) * 24;
    const parallaxY = (pointer.y / this.scale.height - 0.5) * 18;
    this.spaceLayer.setPosition(parallaxX * 0.12, parallaxY * 0.12);

    for (const star of this.stars) {
      star.shape.x -= star.speed * (delta / 1000);
      star.shape.y += star.speed * 0.14 * (delta / 1000);
      if (star.shape.x < -8 || star.shape.y > this.scale.height + 8) {
        star.shape.setPosition(this.scale.width + Phaser.Math.Between(0, 120), Phaser.Math.Between(0, this.scale.height));
      }
    }

    for (const planet of this.focusPlanets) {
      planet.image.rotation = Math.sin(time / 3600 + planet.baseX) * 0.018;
      planet.ring.rotation = -0.18 + Math.sin(time / 2600 + planet.baseY) * 0.025;
      planet.glow.alpha = 0.16 + Math.sin(time / 900 + planet.baseX) * 0.035;
    }

    for (const meteor of this.meteors) {
      meteor.body.x -= meteor.speed * (delta / 1000);
      meteor.body.y += meteor.speed * 0.38 * (delta / 1000);
      meteor.trail.setTo(meteor.body.x + 8, meteor.body.y - 8, meteor.body.x + 92, meteor.body.y - 48);
      if (meteor.body.x < -120 || meteor.body.y > this.scale.height + 80) {
        this.resetMeteor(meteor);
      }
    }
  }

  private getStoredSelection(): MapId {
    const stored = this.registry.get('selected-map');
    return mapCards.some((card) => card.id === stored) ? (stored as MapId) : mapCards[0].id;
  }

  private drawSpace(): void {
    const { width, height } = this.scale;
    this.spaceLayer.add(this.add.rectangle(width / 2, height / 2, width, height, 0x050713));

    const nebula = this.add.graphics();
    nebula.fillStyle(0x10284a, 0.28);
    nebula.fillEllipse(width * 0.22, height * 0.32, 690, 240);
    nebula.fillStyle(0x4f2b7f, 0.17);
    nebula.fillEllipse(width * 0.78, height * 0.56, 800, 330);
    nebula.fillStyle(0x0b7067, 0.13);
    nebula.fillEllipse(width * 0.52, height * 0.2, 560, 180);
    this.spaceLayer.add(nebula);

    for (let i = 0; i < 150; i += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.7, 2.2),
        Phaser.Math.RND.pick([0xffffff, 0x9fdcff, 0xfff1b8]),
        Phaser.Math.FloatBetween(0.45, 0.95),
      );
      this.spaceLayer.add(star);
      this.stars.push({ shape: star, factor: Phaser.Math.FloatBetween(0.08, 0.42), speed: Phaser.Math.FloatBetween(8, 28) });
    }

    for (let i = 0; i < 8; i += 1) {
      const meteor = {
        body: this.add.rectangle(0, 0, 5, 5, 0xffffff, 0.9).setRotation(-0.62),
        trail: this.add.line(0, 0, 0, 0, 90, -40, 0x9fdcff, 0.34).setOrigin(0, 0),
        speed: Phaser.Math.Between(170, 320),
      };
      this.spaceLayer.add([meteor.trail, meteor.body]);
      this.resetMeteor(meteor);
      this.meteors.push(meteor);
    }
  }

  private createPlanets(): void {
    for (const card of mapCards) {
      const glow = this.add.circle(card.x, card.y, 176, card.accent, 0.14);
      const ring = this.add.ellipse(card.x, card.y + 8, 368, 112).setStrokeStyle(8, card.accent, 0.24).setRotation(-0.18);
      const image = this.add
        .image(card.x, card.y, AssetKeys.MenuPlanets, card.planetFrame)
        .setScale(card.scale)
        .setInteractive({ useHandCursor: true });
      image.on('pointerdown', () => this.applySelection(card.id, true));
      this.planetLayer.add([glow, ring, image]);
      this.focusPlanets.push({
        image,
        ring,
        glow,
        baseX: card.x,
        baseY: card.y,
        selectedScale: card.scale * 1.12,
        idleScale: card.scale * 0.82,
      });
    }
  }

  private resetMeteor(meteor: Meteor): void {
    const x = Phaser.Math.Between(Math.floor(this.scale.width * 0.25), this.scale.width + 320);
    const y = Phaser.Math.Between(-220, Math.floor(this.scale.height * 0.55));
    meteor.body.setPosition(x, y);
    meteor.trail.setTo(x + 8, y - 8, x + 92, y - 48);
    meteor.speed = Phaser.Math.Between(180, 340);
  }

  private createMapSelect(): void {
    const { width, height } = this.scale;
    const left = 72;
    const top = 72;

    this.uiLayer.add(
      this.add.text(left, top, 'IRON HOLD', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '44px',
        color: '#ffffff',
        fontStyle: 'bold',
        shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 10, fill: true },
      }),
    );
    this.uiLayer.add(
      this.add.text(left, top + 56, 'Sector map', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '24px',
        color: '#9fdcff',
        fontStyle: 'bold',
      }),
    );

    const panelY = height - 222;
    this.uiLayer.add(this.add.rectangle(width / 2, panelY + 80, width - 140, 160, 0x08111d, 0.78).setStrokeStyle(1, 0x4b7faf, 0.78));

    mapCards.forEach((card, index) => {
      this.createMapCard(80 + index * 374, panelY + 28, card);
    });

    this.launchButton = this.add.rectangle(width - 210, height - 38, 238, 54, 0x58e070, 1).setStrokeStyle(2, 0xdfffe6, 0.95);
    this.launchButton.setInteractive({ useHandCursor: true });
    this.launchText = this.add
      .text(width - 210, height - 38, 'Launch Defense', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '18px',
        color: '#07130e',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    this.launchButton.on('pointerdown', () => this.startSelectedMap());
    this.launchText.on('pointerdown', () => this.startSelectedMap());
    this.uiLayer.add([this.launchButton, this.launchText]);
  }

  private createMapCard(x: number, y: number, card: (typeof mapCards)[number]): void {
    const surface = this.add.rectangle(x, y, 330, 104, 0x111a27, 0.94).setOrigin(0, 0);
    surface.setInteractive({ useHandCursor: true });
    const planet = this.add.image(x + 48, y + 52, AssetKeys.MenuPlanets, card.planetFrame).setDisplaySize(72, 72);
    const title = this.add.text(x + 96, y + 25, card.title, {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '21px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    const subtitle = this.add.text(x + 96, y + 58, card.subtitle, {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '15px',
      color: '#b9c7e6',
    });

    const select = () => this.applySelection(card.id, true);
    surface.on('pointerdown', select);
    planet.setInteractive({ useHandCursor: true }).on('pointerdown', select);
    title.setInteractive({ useHandCursor: true }).on('pointerdown', select);
    subtitle.setInteractive({ useHandCursor: true }).on('pointerdown', select);
    this.uiLayer.add([surface, planet, title, subtitle]);
    this.cards.push({ id: card.id, surface, planet, title, subtitle });
  }

  private applySelection(id: MapId, animate: boolean): void {
    this.selectedMap = id;
    this.registry.set('selected-map', id);
    const selectedIndex = mapCards.findIndex((card) => card.id === id);
    const selected = mapCards[selectedIndex] ?? mapCards[0];

    for (const [index, planet] of this.focusPlanets.entries()) {
      const isSelected = index === selectedIndex;
      const targetScale = isSelected ? planet.selectedScale : planet.idleScale;
      const targetAlpha = isSelected ? 1 : 0.46;
      this.tweens.add({
        targets: [planet.image, planet.ring, planet.glow],
        alpha: targetAlpha,
        duration: animate ? 220 : 0,
        ease: 'Sine.easeOut',
      });
      this.tweens.add({
        targets: planet.image,
        scale: targetScale,
        duration: animate ? 260 : 0,
        ease: 'Back.easeOut',
      });
    }

    for (const card of this.cards) {
      const meta = mapCards.find((item) => item.id === card.id) ?? mapCards[0];
      const selectedCard = card.id === id;
      card.surface.setFillStyle(selectedCard ? 0x173126 : 0x111a27, selectedCard ? 0.98 : 0.86);
      card.surface.setStrokeStyle(2, selectedCard ? meta.color : 0x4b6078, selectedCard ? 1 : 0.66);
      card.title.setColor(selectedCard ? '#ffffff' : '#d8e2f8');
      card.planet.setAlpha(selectedCard ? 1 : 0.68);
    }

    const focusX = this.scale.width / 2 - selected.x;
    const focusY = this.scale.height * 0.42 - selected.y;
    this.tweens.add({
      targets: this.planetLayer,
      x: focusX * 0.55,
      y: focusY * 0.55,
      duration: animate ? 360 : 0,
      ease: 'Sine.easeInOut',
    });
  }

  private selectAdjacent(direction: number): void {
    const current = mapCards.findIndex((card) => card.id === this.selectedMap);
    const next = Phaser.Math.Wrap(current + direction, 0, mapCards.length);
    this.applySelection(mapCards[next].id, true);
  }

  private startSelectedMap(): void {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;
    const selected = mapCards.find((card) => card.id === this.selectedMap) ?? mapCards[0];
    startSceneWithFade(this, SceneKeys.Game, {
      durationMs: 360,
      color: 0x02040d,
      loadingText: `Deploying: ${selected.title}`,
      data: { sectorTitle: selected.title },
    });
  }
}
