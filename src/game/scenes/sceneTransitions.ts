import Phaser from 'phaser';
import type { SceneKey } from '../config/sceneKeys';

export type FadeOptions = {
  durationMs?: number;
  color?: number;
};

export type SceneTransitionOptions = FadeOptions & {
  data?: object;
  loadingText?: string;
};

const defaultFadeMs = 260;
const defaultFadeColor = 0x000000;
const transitionFlag = 'scene-transition-active';

export function fadeInScene(scene: Phaser.Scene, options: FadeOptions = {}): void {
  const { r, g, b } = Phaser.Display.Color.IntegerToRGB(options.color ?? defaultFadeColor);
  scene.cameras.main.fadeIn(options.durationMs ?? defaultFadeMs, r, g, b);
}

export function startSceneWithFade(
  scene: Phaser.Scene,
  targetScene: SceneKey,
  options: SceneTransitionOptions = {},
): void {
  if (scene.registry.get(transitionFlag)) {
    return;
  }

  scene.registry.set(transitionFlag, true);
  scene.input.enabled = false;

  const durationMs = options.durationMs ?? defaultFadeMs;
  const { r, g, b } = Phaser.Display.Color.IntegerToRGB(options.color ?? defaultFadeColor);

  if (options.loadingText) {
    scene.add
      .text(scene.scale.width / 2, scene.scale.height / 2, options.loadingText, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        color: '#d8e2f8',
      })
      .setOrigin(0.5)
      .setDepth(10000);
  }

  scene.cameras.main.fadeOut(durationMs, r, g, b);
  scene.time.delayedCall(durationMs, () => {
    scene.registry.set(transitionFlag, false);
    scene.scene.start(targetScene, options.data);
  });
}
