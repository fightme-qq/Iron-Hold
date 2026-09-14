import Phaser from 'phaser';
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

type Planet = {
  container: Phaser.GameObjects.Container;
  baseX: number;
  baseY: number;
  factor: number;
  drift: number;
};

const mapCards = [
  {
    id: 'iron-hold',
    title: 'Iron Hold',
    subtitle: 'Vertical frontline',
    color: 0x58e070,
    accent: 0xf7d95b,
  },
  {
    id: 'red-orbit',
    title: 'Red Orbit',
    subtitle: 'Asteroid siege',
    color: 0xff6b4a,
    accent: 0x7ee7c8,
  },
  {
    id: 'blue-rift',
    title: 'Blue Rift',
    subtitle: 'Relay warzone',
    color: 0x2fb4ff,
    accent: 0xffd166,
  },
] as const;

type MapId = (typeof mapCards)[number]['id'];

export class MenuScene extends Phaser.Scene {
  private stars: Star[] = [];
  private meteors: Meteor[] = [];
  private planets: Planet[] = [];
  private selectedMap: MapId = mapCards[0].id;
  private transitioning = false;

  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    this.selectedMap = (this.registry.get('selected-map') as MapId | undefined) ?? mapCards[0].id;
    fadeInScene(this, { durationMs: 360, color: 0x02040d });
    this.drawSpace();
    this.createMapSelect();

    this.input.keyboard?.on('keydown-ENTER', () => this.startSelectedMap());
    this.input.keyboard?.on('keydown-SPACE', () => this.startSelectedMap());
  }

  update(time: number, delta: number): void {
    const pointer = this.input.activePointer;
    const parallaxX = (pointer.x / this.scale.width - 0.5) * 32;
    const parallaxY = (pointer.y / this.scale.height - 0.5) * 24;

    for (const star of this.stars) {
      star.shape.x -= star.speed * (delta / 1000);
      star.shape.y += star.speed * 0.14 * (delta / 1000);
      star.shape.setPosition(star.shape.x + parallaxX * star.factor * 0.002, star.shape.y + parallaxY * star.factor * 0.002);
      if (star.shape.x < -8 || star.shape.y > this.scale.height + 8) {
        star.shape.setPosition(this.scale.width + Phaser.Math.Between(0, 120), Phaser.Math.Between(0, this.scale.height));
      }
    }

    for (const planet of this.planets) {
      planet.container.setPosition(
        planet.baseX + Math.sin(time / planet.drift) * 8 + parallaxX * planet.factor,
        planet.baseY + Math.cos(time / (planet.drift * 1.25)) * 6 + parallaxY * planet.factor,
      );
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

  private drawSpace(): void {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x050713);

    const nebula = this.add.graphics();
    nebula.fillStyle(0x1a315f, 0.22);
    nebula.fillEllipse(width * 0.24, height * 0.3, 620, 260);
    nebula.fillStyle(0x4f2b7f, 0.16);
    nebula.fillEllipse(width * 0.72, height * 0.58, 780, 320);
    nebula.fillStyle(0x0b7067, 0.12);
    nebula.fillEllipse(width * 0.52, height * 0.18, 520, 170);

    for (let i = 0; i < 130; i += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.8, 2.1),
        Phaser.Math.RND.pick([0xffffff, 0x9fdcff, 0xfff1b8]),
        Phaser.Math.FloatBetween(0.48, 0.95),
      );
      this.stars.push({ shape: star, factor: Phaser.Math.FloatBetween(0.08, 0.42), speed: Phaser.Math.FloatBetween(8, 26) });
    }

    this.planets.push(this.createPlanet(width * 0.18, height * 0.2, 76, 0x2e6e93, 0x8ff3ff, 0.25));
    this.planets.push(this.createPlanet(width * 0.86, height * 0.24, 118, 0xb84a5b, 0xffd166, 0.12, true));
    this.planets.push(this.createPlanet(width * 0.72, height * 0.82, 92, 0x6656b8, 0xb9f27c, 0.2));

    for (let i = 0; i < 7; i += 1) {
      const meteor = {
        body: this.add.rectangle(0, 0, 5, 5, 0xffffff, 0.9).setRotation(-0.62),
        trail: this.add.line(0, 0, 0, 0, 90, -40, 0x9fdcff, 0.34).setOrigin(0, 0),
        speed: Phaser.Math.Between(170, 320),
      };
      this.resetMeteor(meteor);
      this.meteors.push(meteor);
    }
  }

  private createPlanet(
    x: number,
    y: number,
    radius: number,
    bodyColor: number,
    accentColor: number,
    factor: number,
    ring = false,
  ): Planet {
    const container = this.add.container(x, y);
    const glow = this.add.circle(0, 0, radius * 1.38, accentColor, 0.08);
    const planet = this.add.circle(0, 0, radius, bodyColor, 1);
    const shade = this.add.circle(radius * -0.2, radius * -0.16, radius * 0.84, 0xffffff, 0.1);
    const terminator = this.add.circle(radius * 0.34, radius * 0.24, radius * 0.78, 0x030511, 0.22);
    container.add([glow, planet, shade, terminator]);

    const stripes = this.add.graphics();
    stripes.lineStyle(3, accentColor, 0.34);
    for (let i = -2; i <= 2; i += 1) {
      stripes.beginPath();
      stripes.arc(0, i * radius * 0.19, radius * (0.72 - Math.abs(i) * 0.08), Math.PI * 0.05, Math.PI * 0.95);
      stripes.strokePath();
    }
    container.add(stripes);

    if (ring) {
      const ringGraphics = this.add.graphics();
      ringGraphics.lineStyle(9, accentColor, 0.4);
      ringGraphics.strokeEllipse(0, 0, radius * 2.7, radius * 0.72);
      ringGraphics.setRotation(-0.32);
      container.addAt(ringGraphics, 1);
    }

    return {
      container,
      baseX: x,
      baseY: y,
      factor,
      drift: Phaser.Math.Between(2800, 5200),
    };
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
    const top = 66;

    this.add.text(left, top, 'IRON HOLD', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '44px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 10, fill: true },
    });
    this.add.text(left, top + 56, 'Sector map', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '24px',
      color: '#9fdcff',
      fontStyle: 'bold',
    });

    const panelX = 70;
    const panelY = height - 238;
    this.add.rectangle(width / 2, panelY + 88, width - 140, 176, 0x08111d, 0.74).setStrokeStyle(1, 0x4b7faf, 0.78);

    mapCards.forEach((card, index) => {
      const x = panelX + index * 360;
      this.createMapCard(x, panelY + 28, card);
    });

    const start = this.add.rectangle(width - 220, height - 84, 238, 58, 0x58e070, 1).setStrokeStyle(2, 0xdfffe6, 0.95);
    start.setInteractive({ useHandCursor: true });
    const startText = this.add.text(width - 220, height - 84, 'Launch Defense', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '18px',
      color: '#07130e',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    start.on('pointerdown', () => this.startSelectedMap());
    startText.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.startSelectedMap());
  }

  private createMapCard(
    x: number,
    y: number,
    card: (typeof mapCards)[number],
  ): void {
    const selected = this.selectedMap === card.id;
    const surface = this.add.rectangle(x, y, 316, 104, selected ? 0x173126 : 0x111a27, 0.94).setOrigin(0, 0);
    surface.setStrokeStyle(2, selected ? card.color : 0x4b6078, selected ? 1 : 0.66);
    surface.setInteractive({ useHandCursor: true });

    const planet = this.add.circle(x + 48, y + 52, 25, card.color, 1).setStrokeStyle(3, card.accent, 0.7);
    const orbit = this.add.ellipse(x + 48, y + 52, 78, 24).setStrokeStyle(2, card.accent, 0.54).setRotation(-0.26);
    const title = this.add.text(x + 92, y + 24, card.title, {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '21px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    const subtitle = this.add.text(x + 92, y + 56, card.subtitle, {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '15px',
      color: '#b9c7e6',
    });
    const select = () => {
      this.selectedMap = card.id;
      this.registry.set('selected-map', card.id);
      this.scene.restart();
    };
    surface.on('pointerdown', select);
    planet.setInteractive({ useHandCursor: true }).on('pointerdown', select);
    orbit.setInteractive({ useHandCursor: true }).on('pointerdown', select);
    title.setInteractive({ useHandCursor: true }).on('pointerdown', select);
    subtitle.setInteractive({ useHandCursor: true }).on('pointerdown', select);
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
