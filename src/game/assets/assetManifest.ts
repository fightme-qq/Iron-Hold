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

export const imageAssets: ImageAsset[] = [
  { key: AssetKeys.PlayerTank, url: '/assets/images/tanks/player-tank.png' },
  { key: AssetKeys.PlayerBarrel, url: '/assets/images/tanks/player-barrel.png' },
  { key: AssetKeys.EnemyTank, url: '/assets/images/tanks/enemy-tank.png' },
  { key: AssetKeys.EnemyBarrel, url: '/assets/images/tanks/enemy-barrel.png' },
  { key: AssetKeys.TurretBase, url: '/assets/images/tanks/turret-base.png' },
  { key: AssetKeys.TurretBarrel, url: '/assets/images/tanks/turret-barrel.png' },
  { key: AssetKeys.PlayerBullet, url: '/assets/images/bullets/player-bullet.png' },
  { key: AssetKeys.Grass, url: '/assets/images/environment/grass.png' },
  { key: AssetKeys.Dirt, url: '/assets/images/environment/dirt.png' },
  { key: AssetKeys.TreeSmall, url: '/assets/images/environment/tree-small.png' },
  { key: AssetKeys.BarrelRed, url: '/assets/images/obstacles/barrel-red.png' },
  { key: AssetKeys.SandbagBeige, url: '/assets/images/obstacles/sandbag-beige.png' },
  { key: AssetKeys.SmokeGrey, url: '/assets/images/smoke/smoke-grey-0.png' },
  { key: AssetKeys.SmokeOrange, url: '/assets/images/smoke/smoke-orange-0.png' },
];
export const spritesheetAssets: SpritesheetAsset[] = [
  {
    key: AssetKeys.UIIcons,
    url: '/assets/spritesheets/ui-defense-icons.png?v=1',
    frameWidth: 64,
    frameHeight: 64,
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
