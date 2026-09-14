import type { IdleContent } from '../game/idle/idleTypes';

export const idleContent: IdleContent = {
  offlineCapSeconds: 60 * 60 * 2,
  resources: [
    {
      id: 'cookies',
      name: 'Cookies',
      tags: ['currency', 'bakery'],
      startAmount: 0,
    },
  ],
  actions: [
    {
      id: 'bakeCookie',
      name: 'Bake cookie',
      tags: ['active', 'bakery'],
      resourceId: 'cookies',
      baseGain: 1,
    },
  ],
  producers: [
    {
      id: 'oven',
      name: 'Oven',
      tags: ['producer', 'bakery'],
      resourceId: 'cookies',
      baseCost: 10,
      costScale: 1.15,
      baseProductionPerSecond: 0.2,
    },
  ],
  upgrades: [
    {
      id: 'betterHands',
      name: 'Better hands',
      tags: ['manual', 'bakery'],
      description: 'Doubles manual baking.',
      cost: { resourceId: 'cookies', amount: 25 },
      effects: [{ kind: 'multiplyActionGain', actionId: 'bakeCookie', multiplier: 2 }],
    },
    {
      id: 'hotterOvens',
      name: 'Hotter ovens',
      tags: ['producer', 'bakery'],
      description: 'Doubles oven output.',
      requirements: [{ kind: 'producerOwnedAtLeast', producerId: 'oven', amount: 1 }],
      cost: { resourceId: 'cookies', amount: 60 },
      effects: [{ kind: 'multiplyProducerOutput', producerId: 'oven', multiplier: 2 }],
    },
    {
      id: 'bakerySystems',
      name: 'Bakery systems',
      tags: ['producer', 'bakery', 'automation'],
      description: 'Doubles every bakery producer through a selector-based effect.',
      requirements: [{ kind: 'producerOwnedAtLeast', producerId: 'oven', amount: 3 }],
      cost: { resourceId: 'cookies', amount: 120 },
      effects: [
        {
          kind: 'multiplyProducerOutput',
          selector: { type: 'producer', tags: ['bakery'] },
          multiplier: 2,
        },
      ],
    },
  ],
  achievements: [
    {
      id: 'firstBake',
      name: 'First bake',
      tags: ['starter'],
      description: 'Bake your first cookie.',
      requirements: [{ kind: 'actionClicksAtLeast', actionId: 'bakeCookie', amount: 1 }],
    },
    {
      id: 'hundredCookies',
      name: 'Hundred cookies',
      tags: ['milestone'],
      description: 'Earn 100 cookies total.',
      requirements: [{ kind: 'resourceEarnedAtLeast', resourceId: 'cookies', amount: 100 }],
    },
    {
      id: 'tenOvens',
      name: 'Warm kitchen',
      tags: ['milestone', 'producer'],
      description: 'Own 10 ovens.',
      requirements: [{ kind: 'producerOwnedAtLeast', producerId: 'oven', amount: 10 }],
    },
  ],
  shinies: [
    {
      id: 'goldenCookie',
      name: 'Golden cookie',
      tags: ['bonus', 'bakery'],
      description: 'A temporary bonus. Click it before it fades to gain a cookie burst.',
      requirements: [{ kind: 'producerOwnedAtLeast', producerId: 'oven', amount: 1 }],
      spawnEverySeconds: 20,
      durationSeconds: 7,
      effects: [{ kind: 'gain', resourceId: 'cookies', amount: 25 }],
    },
  ],
  prestige: {
    id: 'bakeryLegacy',
    name: 'Bakery legacy',
    currencyName: 'Legacy crumbs',
    requirements: [{ kind: 'resourceEarnedAtLeast', resourceId: 'cookies', amount: 250 }],
    pointsExpression: {
      kind: 'floor',
      value: {
        kind: 'divide',
        left: { kind: 'resourceEarned', resourceId: 'cookies' },
        right: 250,
      },
    },
    productionMultiplierPerPoint: 0.1,
    preserveAchievements: true,
  },
};
