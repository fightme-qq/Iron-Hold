import { describe, expect, it } from 'vitest';
import { idleContent } from '../../src/data/idleContent';
import { IdleEconomy } from '../../src/game/idle/IdleEconomy';

describe('IdleEconomy', () => {
  it('gains resources from active actions and unlocks achievements', () => {
    const economy = new IdleEconomy(idleContent);

    economy.clickAction('bakeCookie');

    expect(economy.getResource('cookies').current).toBe(1);
    expect(economy.getUiModel().achievements.find((entry) => entry.id === 'firstBake')?.unlocked).toBe(true);
  });

  it('buys producers and applies passive production over time', () => {
    const economy = new IdleEconomy(idleContent);

    for (let i = 0; i < 10; i += 1) {
      economy.clickAction('bakeCookie');
    }

    expect(economy.buyProducer('oven')).toBe(true);
    economy.tick(10);

    expect(economy.getResource('cookies').current).toBeCloseTo(2);
    expect(economy.getUiModel().resources.find((entry) => entry.id === 'cookies')?.perSecond).toBeCloseTo(0.2);
  });

  it('calculates and buys producer batches deterministically', () => {
    const economy = new IdleEconomy(idleContent);

    for (let i = 0; i < 120; i += 1) {
      economy.clickAction('bakeCookie');
    }

    expect(economy.getProducerBulkCost('oven', 3)).toBe(36);
    expect(economy.buyProducerBulk('oven', 3)).toBe(3);

    const oven = economy.getUiModel().producers.find((entry) => entry.id === 'oven');
    expect(oven?.owned).toBe(3);
    expect(oven?.nextCost).toBe(16);
    expect(oven?.maxAffordable).toBeGreaterThan(0);
  });

  it('supports typed effects and selectors for future content rules', () => {
    const economy = new IdleEconomy(idleContent);

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 25 }]);
    expect(economy.buyUpgrade('betterHands')).toBe(true);
    expect(economy.resolveSelector({ type: 'upgrade', owned: true })).toEqual(['betterHands']);
    expect(economy.resolveSelector({ type: 'producer', tags: ['bakery'] })).toEqual(['oven']);
  });

  it('gates upgrades behind requirements and exposes locked reasons', () => {
    const economy = new IdleEconomy(idleContent);

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 200 }]);

    expect(economy.buyUpgrade('hotterOvens')).toBe(false);
    expect(economy.getUiModel().upgrades.find((entry) => entry.id === 'hotterOvens')?.lockedReason).toContain('oven');

    economy.buyProducer('oven');

    expect(economy.buyUpgrade('hotterOvens')).toBe(true);
  });

  it('applies selector-based producer modifiers', () => {
    const economy = new IdleEconomy(idleContent);

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 300 }]);
    economy.buyProducerBulk('oven', 3);

    expect(economy.buyUpgrade('bakerySystems')).toBe(true);

    const oven = economy.getUiModel().producers.find((entry) => entry.id === 'oven');
    expect(oven?.productionPerSecond).toBeCloseTo(0.4);
  });

  it('spawns and clicks temporary shiny bonuses', () => {
    const economy = new IdleEconomy(idleContent);

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 10 }]);
    economy.buyProducer('oven');
    economy.tick(20);

    expect(economy.getUiModel().shinies.find((entry) => entry.id === 'goldenCookie')?.active).toBe(true);
    expect(economy.clickShiny('goldenCookie')).toBe(true);
    expect(economy.getResource('cookies').current).toBeCloseTo(29);
    expect(economy.getUiModel().shinies.find((entry) => entry.id === 'goldenCookie')?.clicks).toBe(1);
  });

  it('expires unclicked shiny bonuses and saves shiny state', () => {
    const economy = new IdleEconomy(idleContent, undefined, 1000);

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 10 }]);
    economy.buyProducer('oven');
    economy.triggerShiny('goldenCookie');
    economy.tick(8);

    expect(economy.getUiModel().shinies.find((entry) => entry.id === 'goldenCookie')?.active).toBe(false);

    economy.triggerShiny('goldenCookie');
    const restored = new IdleEconomy(idleContent, economy.toSaveData(2000), 3000);

    expect(restored.getUiModel().shinies.find((entry) => entry.id === 'goldenCookie')?.active).toBe(true);
  });

  it('previews and performs prestige resets while preserving meta progress', () => {
    const economy = new IdleEconomy(idleContent);

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 260 }]);

    expect(economy.getUiModel().prestige?.pendingPoints).toBe(1);
    expect(economy.prestigeReset()).toBe(true);

    const ui = economy.getUiModel();
    expect(ui.prestige?.points).toBe(1);
    expect(ui.prestige?.totalResets).toBe(1);
    expect(economy.getResource('cookies').current).toBe(0);
    expect(ui.actions.find((entry) => entry.id === 'bakeCookie')?.gain).toBeCloseTo(1.1);
  });

  it('round-trips prestige state through saves', () => {
    const economy = new IdleEconomy(idleContent, undefined, 1000);

    economy.applyEffects([{ kind: 'gain', resourceId: 'cookies', amount: 260 }]);
    economy.prestigeReset();

    const restored = new IdleEconomy(idleContent, economy.toSaveData(2000), 3000);

    expect(restored.getUiModel().prestige?.points).toBe(1);
    expect(restored.getUiModel().prestige?.multiplier).toBeCloseTo(1.1);
  });

  it('applies upgrade multipliers', () => {
    const economy = new IdleEconomy(idleContent);

    for (let i = 0; i < 25; i += 1) {
      economy.clickAction('bakeCookie');
    }

    expect(economy.buyUpgrade('betterHands')).toBe(true);
    economy.clickAction('bakeCookie');

    expect(economy.getResource('cookies').current).toBe(2);
  });

  it('caps offline progress', () => {
    const economy = new IdleEconomy(idleContent, undefined, 0);

    for (let i = 0; i < 10; i += 1) {
      economy.clickAction('bakeCookie');
    }

    economy.buyProducer('oven');
    const report = economy.applyOfflineProgress(60 * 60 * 6 * 1000);

    expect(report.elapsedSeconds).toBe(60 * 60 * 6);
    expect(report.simulatedSeconds).toBe(idleContent.offlineCapSeconds);
    expect(report.capReached).toBe(true);
    expect(report.resourceGains.cookies).toBeCloseTo(idleContent.offlineCapSeconds * 0.2);
    expect(report.unlockedAchievementIds).toContain('hundredCookies');
    expect(economy.getResource('cookies').current).toBeCloseTo(idleContent.offlineCapSeconds * 0.2);
  });

  it('round-trips save data', () => {
    const economy = new IdleEconomy(idleContent, undefined, 1000);

    economy.clickAction('bakeCookie');
    const save = economy.toSaveData(2000);
    const restored = new IdleEconomy(idleContent, save, 3000);

    expect(restored.getResource('cookies').current).toBe(1);
    expect(restored.toSaveData().actions.bakeCookie.clicks).toBe(1);
  });
});
