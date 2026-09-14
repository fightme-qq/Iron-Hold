import { describe, expect, it } from 'vitest';
import { idleContent } from '../../src/data/idleContent';
import { IdleEconomy } from '../../src/game/idle/IdleEconomy';

describe('Idle formula examples', () => {
  it('documents producer cost scaling with ceil-per-purchase rounding', () => {
    const baseCost = 10;
    const costScale = 1.15;

    expect(Math.ceil(baseCost * costScale ** 0)).toBe(10);
    expect(Math.ceil(baseCost * costScale ** 1)).toBe(12);
    expect(Math.ceil(baseCost * costScale ** 2)).toBe(14);
  });

  it('documents bulk cost as the sum of rounded individual purchases', () => {
    const economy = new IdleEconomy(idleContent);

    expect(economy.getProducerBulkCost('oven', 3)).toBe(10 + 12 + 14);
  });

  it('documents production as owned count times output times multipliers', () => {
    const economy = new IdleEconomy(idleContent);

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 100 }]);
    economy.buyProducerBulk('oven', 2);

    expect(economy.getUiModel().resources.find((entry) => entry.id === 'cookies')?.perSecond).toBeCloseTo(0.4);
  });

  it('documents offline cap math', () => {
    const economy = new IdleEconomy(idleContent, undefined, 0);

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 10 }]);
    economy.buyProducer('oven');
    const report = economy.applyOfflineProgress(6 * 60 * 60 * 1000);

    expect(report.elapsedSeconds).toBe(6 * 60 * 60);
    expect(report.simulatedSeconds).toBe(idleContent.offlineCapSeconds);
    expect(report.capReached).toBe(true);
  });

  it('documents prestige multiplier math', () => {
    const economy = new IdleEconomy(idleContent);

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 250 }]);
    economy.prestigeReset();

    expect(economy.getUiModel().prestige?.multiplier).toBeCloseTo(1.1);
    expect(economy.getUiModel().actions.find((entry) => entry.id === 'bakeCookie')?.gain).toBeCloseTo(1.1);
  });

  it('documents typed number expressions in effects', () => {
    const economy = new IdleEconomy(idleContent);

    economy.applyEffects([
      {
        kind: 'gain',
        resourceId: 'cookies',
        amount: {
          kind: 'multiply',
          values: [2, { kind: 'resourceEarned', resourceId: 'cookies' }],
        },
      },
    ]);
    expect(economy.getResource('cookies').current).toBe(0);

    economy.clickAction('bakeCookie');
    economy.applyEffects([
      {
        kind: 'gain',
        resourceId: 'cookies',
        amount: {
          kind: 'multiply',
          values: [2, { kind: 'resourceEarned', resourceId: 'cookies' }],
        },
      },
    ]);

    expect(economy.getResource('cookies').current).toBe(3);
  });

  it('documents typed condition expressions in requirements', () => {
    const economy = new IdleEconomy({
      ...idleContent,
      upgrades: [
        ...idleContent.upgrades,
        {
          id: 'formulaGate',
          name: 'Formula gate',
          description: 'Unlocks from a typed condition expression.',
          cost: { resourceId: 'cookies', amount: 1 },
          requirements: [
            {
              kind: 'expression',
              condition: {
                kind: 'gte',
                left: { kind: 'resourceEarned', resourceId: 'cookies' },
                right: 5,
              },
            },
          ],
          effects: [{ kind: 'multiplyActionGain', actionId: 'bakeCookie', multiplier: 2 }],
        },
      ],
    });

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 5 }]);

    expect(economy.buyUpgrade('formulaGate')).toBe(true);
  });
});
