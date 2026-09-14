import Phaser from 'phaser';

export const AssetKeys = {
  PlayerTank: 'player-tank',
  PlayerBarrel: 'player-barrel',
  EnemyTank: 'enemy-tank',
  EnemyBarrel: 'enemy-barrel',
  TurretBase: 'turret-base',
  TurretBarrel: 'turret-barrel',
  PlayerBullet: 'player-bullet',
  Grass: 'grass',
  Dirt: 'dirt',
  TreeSmall: 'tree-small',
  BarrelRed: 'barrel-red',
  SandbagBeige: 'sandbag-beige',
  SmokeGrey: 'smoke-grey-0',
  SmokeOrange: 'smoke-orange-0',
  UIIcons: 'ui-defense-icons',
  DefenseObjects: 'defense-objects',
  EnvironmentProps: 'environment-props',
  MenuPlanets: 'menu-planets',
} as const;

export type ImageAsset = {
  key: string;
  url: string;
};

export type SpritesheetAsset = {
  key: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
  margin?: number;
  spacing?: number;
};

function assetUrl(path: string): string {
  const baseUrl = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';
  return `${baseUrl}${path}`;
}

export const imageAssets: ImageAsset[] = [
  { key: AssetKeys.PlayerTank, url: assetUrl('assets/images/tanks/player-tank.png') },
  { key: AssetKeys.PlayerBarrel, url: assetUrl('assets/images/tanks/player-barrel.png') },
  { key: AssetKeys.EnemyTank, url: assetUrl('assets/images/tanks/enemy-tank.png') },
  { key: AssetKeys.EnemyBarrel, url: assetUrl('assets/images/tanks/enemy-barrel.png') },
  { key: AssetKeys.TurretBase, url: assetUrl('assets/images/tanks/turret-base.png') },
  { key: AssetKeys.TurretBarrel, url: assetUrl('assets/images/tanks/turret-barrel.png') },
  { key: AssetKeys.PlayerBullet, url: assetUrl('assets/images/bullets/player-bullet.png') },
  { key: AssetKeys.Grass, url: assetUrl('assets/images/environment/grass.png') },
  { key: AssetKeys.Dirt, url: assetUrl('assets/images/environment/dirt.png') },
  { key: AssetKeys.TreeSmall, url: assetUrl('assets/images/environment/tree-small.png') },
  { key: AssetKeys.BarrelRed, url: assetUrl('assets/images/obstacles/barrel-red.png') },
  { key: AssetKeys.SandbagBeige, url: assetUrl('assets/images/obstacles/sandbag-beige.png') },
  { key: AssetKeys.SmokeGrey, url: assetUrl('assets/images/smoke/smoke-grey-0.png') },
  { key: AssetKeys.SmokeOrange, url: assetUrl('assets/images/smoke/smoke-orange-0.png') },
];
export const spritesheetAssets: SpritesheetAsset[] = [
  {
    key: AssetKeys.UIIcons,
    url: assetUrl('assets/spritesheets/ui-defense-icons.png?v=1'),
    frameWidth: 64,
    frameHeight: 64,
  },
  {
    key: AssetKeys.DefenseObjects,
    url: assetUrl('assets/spritesheets/defense-objects.png?v=1'),
    frameWidth: 96,
    frameHeight: 96,
  },
  {
    key: AssetKeys.EnvironmentProps,
    url: assetUrl('assets/spritesheets/environment-props.png?v=1'),
    frameWidth: 128,
    frameHeight: 128,
  },
  {
    key: AssetKeys.MenuPlanets,
    url: assetUrl('assets/spritesheets/menu-planets.png?v=1'),
    frameWidth: 384,
    frameHeight: 384,
  },
];

export function loadAssetManifest(scene: Phaser.Scene): void {
  for (const asset of imageAssets) {
    scene.load.image(asset.key, asset.url);
  }

  for (const asset of spritesheetAssets) {
    scene.load.spritesheet(asset.key, asset.url, {
      frameWidth: asset.frameWidth,
      frameHeight: asset.frameHeight,
      margin: asset.margin,
      spacing: asset.spacing,
    });
  }
}
