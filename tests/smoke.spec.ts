import { expect, test } from '@playwright/test';

test('game canvas renders', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const size = await canvas.evaluate((node) => ({
    width: (node as HTMLCanvasElement).width,
    height: (node as HTMLCanvasElement).height,
  }));
  expect(size.width).toBeGreaterThan(0);
  expect(size.height).toBeGreaterThan(0);
  await expect.poll(() => page.evaluate(() => Boolean(window.__phaserGame)), { timeout: 15_000 }).toBe(true);
  await expect
    .poll(() => page.evaluate(() => window.__phaserGame?.scene.isActive('MenuScene') ?? false), {
      timeout: 15_000,
    })
    .toBe(true);

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    await page.mouse.click(box.x + box.width * 0.828, box.y + box.height * 0.947);
  }

  await expect
    .poll(() => page.evaluate(() => window.__phaserGame?.scene.isActive('GameScene') ?? false), {
      timeout: 15_000,
    })
    .toBe(true);

  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene = window.__phaserGame?.scene.getScene('GameScene') as unknown as
          | { getDebugSnapshot?: () => { elapsedMs: number; phase: string } }
          | undefined;

        return scene?.getDebugSnapshot?.().elapsedMs ?? 0;
      }),
      { timeout: 15_000 },
    )
    .toBeGreaterThan(0);

  const gameState = await page.evaluate(() => {
    const scene = window.__phaserGame?.scene.getScene('GameScene') as unknown as
      | { getDebugSnapshot?: () => { elapsedMs: number; phase: string } }
      | undefined;

    return scene?.getDebugSnapshot?.();
  });

  expect(gameState?.phase).toBe('playing');
  expect(gameState?.elapsedMs).toBeGreaterThan(0);
});

test('tank fires from lower gameplay area on resized canvas', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__phaserGame?.scene.isActive('MenuScene') ?? false), {
      timeout: 15_000,
    })
    .toBe(true);

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * 0.828, box.y + box.height * 0.947);
  await expect
    .poll(() => page.evaluate(() => window.__phaserGame?.scene.isActive('GameScene') ?? false), {
      timeout: 15_000,
    })
    .toBe(true);

  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.7);
  await page.mouse.down();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene = window.__phaserGame?.scene.getScene('GameScene') as unknown as
          | { getDebugSnapshot?: () => { bulletCount: number } }
          | undefined;

        return scene?.getDebugSnapshot?.().bulletCount ?? 0;
      }),
      { timeout: 3_000 },
    )
    .toBeGreaterThan(0);
  await page.mouse.up();
});

test('collected parts can buy upgrades during a wave', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__phaserGame?.scene.isActive('MenuScene') ?? false), {
      timeout: 15_000,
    })
    .toBe(true);

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * 0.828, box.y + box.height * 0.947);
  await expect
    .poll(() => page.evaluate(() => window.__phaserGame?.scene.isActive('GameScene') ?? false), {
      timeout: 15_000,
    })
    .toBe(true);

  const upgradeButton = await page.evaluate(() => {
    const gameScene = window.__phaserGame?.scene.getScene('GameScene') as unknown as
      | {
          parts: number;
          publishHud?: () => void;
        }
      | undefined;
    const uiScene = window.__phaserGame?.scene.getScene('UIScene') as unknown as
      | {
          activeTab: string;
          render?: () => void;
          hotspots?: Array<{ rect: { x: number; y: number; width: number; height: number } }>;
        }
      | undefined;

    if (!gameScene || !uiScene) return undefined;
    gameScene.parts = 20;
    gameScene.publishHud?.();
    uiScene.activeTab = 'tank';
    uiScene.render?.();

    return uiScene.hotspots?.find((hotspot) => hotspot.rect.height === 88)?.rect;
  });

  expect(upgradeButton).toBeTruthy();
  if (!upgradeButton) return;

  await page.mouse.click(upgradeButton.x + upgradeButton.width / 2, upgradeButton.y + upgradeButton.height / 2);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const scene = window.__phaserGame?.scene.getScene('GameScene') as unknown as
          | {
              getDebugSnapshot?: () => {
                parts: number;
                upgrades: Record<string, number>;
              };
            }
          | undefined;

        return scene?.getDebugSnapshot?.();
      }),
      { timeout: 3_000 },
    )
    .toMatchObject({
      parts: 10,
      upgrades: { 'tank-damage': 1 },
    });
});

test('death screen can return to main menu', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.__phaserGame?.scene.isActive('MenuScene') ?? false), {
      timeout: 15_000,
    })
    .toBe(true);

  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.click(box.x + box.width * 0.828, box.y + box.height * 0.947);
  await expect
    .poll(() => page.evaluate(() => window.__phaserGame?.scene.isActive('GameScene') ?? false), {
      timeout: 15_000,
    })
    .toBe(true);

  await page.evaluate(() => {
    const scene = window.__phaserGame?.scene.getScene('GameScene') as unknown as
      | {
          phase: string;
          status: string;
          playerHp: number;
          publishHud?: () => void;
        }
      | undefined;

    if (scene) {
      scene.phase = 'lost';
      scene.status = 'Test defeat';
      scene.playerHp = 0;
      scene.publishHud?.();
    }
  });

  await expect
    .poll(() =>
      page.evaluate(() => {
        const uiScene = window.__phaserGame?.scene.getScene('UIScene') as unknown as
          | {
              resultLayer?: {
                list?: Array<{ type: string; text?: string }>;
              };
            }
          | undefined;

        return uiScene?.resultLayer?.list?.some((object) => object.type === 'Text' && object.text === 'Main Menu') ?? false;
      }),
    )
    .toBe(true);

  await page.mouse.click(box.x + box.width * 0.4, box.y + box.height * 0.586);
  await expect
    .poll(() => page.evaluate(() => window.__phaserGame?.scene.isActive('MenuScene') ?? false), {
      timeout: 15_000,
    })
    .toBe(true);
  await expect.poll(() => page.evaluate(() => window.__phaserGame?.scene.isActive('GameScene') ?? false)).toBe(false);
});
