export type UpgradeId =
  | 'tank-damage'
  | 'tank-reload'
  | 'tank-speed'
  | 'tank-vision'
  | 'base-max-hp'
  | 'base-repair'
  | 'base-turret';

export type UpgradeTarget = 'tank' | 'base';

export type UpgradeDefinition = {
  id: UpgradeId;
  target: UpgradeTarget;
  title: string;
  description: string;
  icon: string;
  baseCost: number;
  maxLevel: number;
};

export type EnemyWave = {
  stages: EnemyStage[];
};

export type EnemyStage = {
  title: string;
  scouts: number;
  bruisers: number;
  spawnEveryMs: number;
};

export const defenseBalance = {
  maxWaves: 5,
  initialBaseHp: 100,
  initialParts: 0,
  enemyReachDamage: 12,
  baseHpBonusStep: 20,
  baseHpBonusParts: 1,
  partDespawnMs: 9000,
  player: {
    maxHp: 5,
    speed: 230,
    reverseSpeed: 145,
    acceleration: 640,
    turnSpeedDeg: 165,
    vision: 520,
    bulletSpeed: 620,
    fireCooldownMs: 360,
    damage: 1,
  },
  enemy: {
    bulletSpeed: 430,
    fireCooldownMs: 1250,
    range: 520,
  },
  world: {
    width: 3600,
    height: 2400,
  },
  stages: {
    breakMs: 1800,
    intermissionMs: 6000,
  },
  turret: {
    range: 280,
    cooldownMs: 950,
    damage: 1,
  },
  relic: {
    captureRadius: 105,
    captureSeconds: 3.2,
    attackRadius: 430,
    fireCooldownMs: 850,
  },
} as const;

export const waves: EnemyWave[] = [
  {
    stages: [
      { title: 'Probe', scouts: 4, bruisers: 0, spawnEveryMs: 1050 },
      { title: 'Push', scouts: 3, bruisers: 1, spawnEveryMs: 950 },
    ],
  },
  {
    stages: [
      { title: 'North Probe', scouts: 5, bruisers: 0, spawnEveryMs: 950 },
      { title: 'Armor Test', scouts: 4, bruisers: 2, spawnEveryMs: 900 },
    ],
  },
  {
    stages: [
      { title: 'Split Attack', scouts: 5, bruisers: 1, spawnEveryMs: 880 },
      { title: 'Flankers', scouts: 6, bruisers: 1, spawnEveryMs: 780 },
      { title: 'Heavy Push', scouts: 2, bruisers: 3, spawnEveryMs: 850 },
    ],
  },
  {
    stages: [
      { title: 'Fast Contact', scouts: 8, bruisers: 1, spawnEveryMs: 760 },
      { title: 'Armor Column', scouts: 4, bruisers: 4, spawnEveryMs: 820 },
      { title: 'Last Rush', scouts: 7, bruisers: 2, spawnEveryMs: 680 },
    ],
  },
  {
    stages: [
      { title: 'Encirclement', scouts: 8, bruisers: 2, spawnEveryMs: 680 },
      { title: 'Siege Group', scouts: 5, bruisers: 5, spawnEveryMs: 760 },
      { title: 'Final Breaker', scouts: 10, bruisers: 4, spawnEveryMs: 620 },
    ],
  },
];

export const upgradeDefinitions: UpgradeDefinition[] = [
  {
    id: 'tank-damage',
    target: 'tank',
    title: 'Damage',
    description: '+1 bullet damage',
    icon: 'DMG',
    baseCost: 10,
    maxLevel: 3,
  },
  {
    id: 'tank-reload',
    target: 'tank',
    title: 'Reload',
    description: '-18% fire cooldown',
    icon: 'RLD',
    baseCost: 12,
    maxLevel: 3,
  },
  {
    id: 'tank-speed',
    target: 'tank',
    title: 'Engine',
    description: '+12% move speed',
    icon: 'SPD',
    baseCost: 10,
    maxLevel: 2,
  },
  {
    id: 'tank-vision',
    target: 'tank',
    title: 'Optics',
    description: '+140 vision radius',
    icon: 'VIS',
    baseCost: 10,
    maxLevel: 3,
  },
  {
    id: 'base-max-hp',
    target: 'base',
    title: 'Plating',
    description: '+25 max base HP',
    icon: 'HP',
    baseCost: 12,
    maxLevel: 3,
  },
  {
    id: 'base-repair',
    target: 'base',
    title: 'Repair',
    description: 'Restore 20 base HP',
    icon: 'FIX',
    baseCost: 8,
    maxLevel: 99,
  },
  {
    id: 'base-turret',
    target: 'base',
    title: 'Turret',
    description: 'Unlock auto defense',
    icon: 'TRT',
    baseCost: 18,
    maxLevel: 1,
  },
];

export function getUpgradeCost(definition: UpgradeDefinition, level: number): number {
  if (definition.id === 'base-repair') {
    return definition.baseCost;
  }

  return Math.round(definition.baseCost * (1 + level * 0.65));
}
