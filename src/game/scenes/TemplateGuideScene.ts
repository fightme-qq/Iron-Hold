import Phaser from 'phaser';
import { SceneKeys } from '../config/sceneKeys';
import { fadeInScene, startSceneWithFade } from './sceneTransitions';

const ideaPrompts = [
  'Make a one-button arcade game about dodging falling stars.',
  'Make a cozy card collection game with satisfying pack openings.',
  'Make a top-down arena game where the player survives for 60 seconds.',
  'Make a puzzle game about connecting energy nodes on a grid.',
  'Make an idle clicker where tiny machines build a strange factory.',
  'Make a tilemap adventure with one room, one key, and one locked door.',
];

export class TemplateGuideScene extends Phaser.Scene {
  private currentPrompt = 0;
  private promptText!: Phaser.GameObjects.Text;
  private spinHint!: Phaser.GameObjects.Text;
  private transitioning = false;

  constructor() {
    super(SceneKeys.TemplateGuide);
  }

  create(): void {
    const { width, height } = this.scale;
    fadeInScene(this);
    this.drawBackground(width, height);

    const contentWidth = Math.min(width - 96, 1180);
    const left = (width - contentWidth) / 2;
    const right = left + contentWidth - 360;
    const top = 58;

    this.add.text(left, top, 'My Phaser Game', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '44px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 8, fill: true },
    });

    this.add.text(left, top + 58, 'Idle starter preset with economy, producers, upgrades, offline progress, and tests.', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '19px',
      color: '#b9c7e6',
      wordWrap: { width: 700 },
    });

    this.add.rectangle(left, 178, 760, 300, 0x121a27, 0.96).setOrigin(0, 0).setStrokeStyle(1, 0x314766, 0.95);
    this.add.text(left + 30, 204, 'Prompt seed', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '18px',
      color: '#ffc857',
      fontStyle: 'bold',
    });

    this.promptText = this.add
      .text(left + 30, 254, ideaPrompts[this.currentPrompt], {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '30px',
        color: '#ffffff',
        lineSpacing: 8,
        wordWrap: { width: 690 },
      })
      .setOrigin(0, 0);

    this.spinHint = this.add
      .text(left + 30, 420, 'Click this card, tap anywhere, or press Space to spin ideas.', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '17px',
        color: '#7ee7c8',
        wordWrap: { width: 690 },
      })
      .setOrigin(0, 0);

    this.tweens.add({
      targets: this.spinHint,
      alpha: 0.58,
      yoyo: true,
      repeat: -1,
      duration: 850,
    });

    this.add.rectangle(right, 178, 360, 300, 0x151f2d, 0.96).setOrigin(0, 0).setStrokeStyle(1, 0x314766, 0.95);
    this.add.text(right + 26, 204, 'Next steps', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '18px',
      color: '#ffc857',
      fontStyle: 'bold',
    });
    this.add.text(right + 26, 246, '1. Open the starter scene.\n2. Ask an agent to build the first playable loop.\n3. Use the local Phaser skills and tests.', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '17px',
      color: '#d8e2f8',
      lineSpacing: 10,
      wordWrap: { width: 300 },
    });

    const startButton = this.add.rectangle(right + 26, 390, 308, 58, 0x2bbd91, 1).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    const startText = this.add
      .text(right + 180, 419, 'Open starter scene', {
        fontFamily: 'Trebuchet MS, Arial, sans-serif',
        fontSize: '20px',
        color: '#061713',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add.text(left, 530, 'Keyboard: Space spins ideas, Enter opens the scene. Pointer/touch works on desktop and mobile.', {
      fontFamily: 'Trebuchet MS, Arial, sans-serif',
      fontSize: '16px',
      color: '#8fa2c4',
      wordWrap: { width: contentWidth },
    });

    this.input.on('pointerdown', () => this.spinPrompt());
    startButton.on('pointerdown', (pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.startGame();
    });
    startText.on('pointerdown', (pointer: Phaser.Input.Pointer, _localX: number, _localY: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.startGame();
    });
    this.input.keyboard?.on('keydown-SPACE', () => this.spinPrompt());
    this.input.keyboard?.once('keydown-ENTER', () => this.startGame());
  }

  private spinPrompt(): void {
    if (this.transitioning) {
      return;
    }

    this.currentPrompt = (this.currentPrompt + 1) % ideaPrompts.length;
    this.promptText.setText(ideaPrompts[this.currentPrompt]);

    this.tweens.add({
      targets: this.promptText,
      scale: { from: 0.96, to: 1 },
      alpha: { from: 0.55, to: 1 },
      duration: 160,
      ease: 'Sine.easeOut',
    });
  }

  private startGame(): void {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;
    startSceneWithFade(this, SceneKeys.Game, {
      durationMs: 260,
      loadingText: 'Opening starter scene',
    });
  }

  private drawBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0x0c1017);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x111824, 0.94);
    graphics.fillRect(0, 0, width, height);
    graphics.lineStyle(1, 0x26384f, 0.28);

    for (let x = 0; x <= width; x += 64) {
      graphics.lineBetween(x, 0, x, height);
    }

    for (let y = 0; y <= height; y += 64) {
      graphics.lineBetween(0, y, width, y);
    }

    graphics.fillStyle(0x2bbd91, 0.055);
    graphics.fillCircle(width * 0.18, height * 0.22, 260);
    graphics.fillStyle(0xffc857, 0.052);
    graphics.fillCircle(width * 0.84, height * 0.7, 300);
  }
}
