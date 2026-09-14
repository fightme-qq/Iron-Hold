import type {
  IdleAchievementDefinition,
  IdleActionDefinition,
  IdleActionId,
  IdleContent,
  IdleConditionExpression,
  IdleEffect,
  IdleNumberExpression,
  IdleOfflineReport,
  IdlePrestigePreview,
  IdleProducerDefinition,
  IdleProducerId,
  IdleRequirement,
  IdleResourceId,
  IdleResourceState,
  IdleSaveData,
  IdleSelector,
  IdleShinyId,
  IdleUiModel,
  IdleUpgradeDefinition,
} from './idleTypes';

export class IdleEconomy {
  private readonly content: IdleContent;
  private readonly resources = new Map<IdleResourceId, IdleResourceState>();
  private readonly actionClicks = new Map<IdleActionId, number>();
  private readonly producerOwned = new Map<IdleProducerId, number>();
  private readonly producerMaxSeen = new Map<IdleProducerId, number>();
  private readonly upgradesOwned = new Set<string>();
  private readonly achievementsUnlocked = new Set<string>();
  private readonly shinyClicks = new Map<IdleShinyId, number>();
  private readonly activeShinies = new Map<IdleShinyId, number>();
  private readonly shinySpawnElapsed = new Map<IdleShinyId, number>();
  private prestigePoints = 0;
  private prestigeResets = 0;
  private savedAt: number;

  constructor(content: IdleContent, saveData?: IdleSaveData, now = Date.now()) {
    this.content = content;
    this.savedAt = saveData?.savedAt ?? now;

    for (const resource of content.resources) {
      this.resources.set(resource.id, saveData?.resources[resource.id] ?? {
        current: resource.startAmount ?? 0,
        earnedTotal: resource.startAmount ?? 0,
        maxSeen: resource.startAmount ?? 0,
      });
    }

    for (const action of content.actions) {
      this.actionClicks.set(action.id, saveData?.actions[action.id]?.clicks ?? 0);
    }

    for (const producer of content.producers) {
      this.producerOwned.set(producer.id, saveData?.producers[producer.id]?.owned ?? 0);
      this.producerMaxSeen.set(producer.id, saveData?.producers[producer.id]?.maxSeen ?? 0);
    }

    for (const upgrade of content.upgrades) {
      if (saveData?.upgrades[upgrade.id]) {
        this.upgradesOwned.add(upgrade.id);
      }
    }

    for (const achievement of content.achievements) {
      if (saveData?.achievements[achievement.id]) {
        this.achievementsUnlocked.add(achievement.id);
      }
    }

    for (const shiny of content.shinies) {
      const saved = saveData?.shinies[shiny.id];
      this.shinyClicks.set(shiny.id, saved?.clicks ?? 0);
      this.shinySpawnElapsed.set(shiny.id, saved?.spawnElapsedSeconds ?? 0);

      if (saved?.active && saved.remainingSeconds > 0) {
        this.activeShinies.set(shiny.id, saved.remainingSeconds);
      }
    }

    this.prestigePoints = saveData?.prestige?.points ?? 0;
    this.prestigeResets = saveData?.prestige?.totalResets ?? 0;

    this.validateContent();
    this.evaluateAchievements();
  }

  clickAction(actionId: IdleActionId): void {
    const action = this.getAction(actionId);
    this.actionClicks.set(actionId, (this.actionClicks.get(actionId) ?? 0) + 1);
    this.gainResource(action.resourceId, this.getActionGain(action));
    this.evaluateAchievements();
  }

  tick(seconds: number): void {
    if (!Number.isFinite(seconds) || seconds <= 0) {
      return;
    }

    for (const producer of this.content.producers) {
      const owned = this.producerOwned.get(producer.id) ?? 0;

      if (owned > 0) {
        this.gainResource(producer.resourceId, this.getProducerProduction(producer) * seconds);
      }
    }

    this.tickShinies(seconds);
    this.evaluateAchievements();
  }

  applyOfflineProgress(now: number): IdleOfflineReport {
    const elapsedSeconds = Math.max(0, Math.floor((now - this.savedAt) / 1000));
    const simulatedSeconds = Math.min(elapsedSeconds, this.content.offlineCapSeconds);
    const beforeResources = new Map(
      this.content.resources.map((resource) => [resource.id, this.getResource(resource.id).current]),
    );
    const beforeAchievements = new Set(this.achievementsUnlocked);

    this.tick(simulatedSeconds);
    this.savedAt = now;

    return {
      elapsedSeconds,
      simulatedSeconds,
      capReached: elapsedSeconds > simulatedSeconds,
      resourceGains: Object.fromEntries(
        this.content.resources.map((resource) => [
          resource.id,
          this.getResource(resource.id).current - (beforeResources.get(resource.id) ?? 0),
        ]),
      ),
      unlockedAchievementIds: Array.from(this.achievementsUnlocked).filter((id) => !beforeAchievements.has(id)),
    };
  }

  canBuyProducer(producerId: IdleProducerId): boolean {
    const producer = this.getProducer(producerId);
    return this.areRequirementsMet(producer.requirements) && this.getResource(producer.resourceId).current >= this.getProducerCost(producerId);
  }

  buyProducer(producerId: IdleProducerId): boolean {
    return this.buyProducerBulk(producerId, 1) > 0;
  }

  buyProducerBulk(producerId: IdleProducerId, count: number): number {
    const producer = this.getProducer(producerId);
    const safeCount = Math.max(0, Math.floor(count));

    if (safeCount <= 0) {
      return 0;
    }

    if (!this.areRequirementsMet(producer.requirements)) {
      return 0;
    }

    let purchased = 0;

    for (let index = 0; index < safeCount; index += 1) {
      const cost = this.getProducerCost(producerId);

      if (!this.spendResource(producer.resourceId, cost)) {
        break;
      }

      purchased += 1;
      this.producerOwned.set(producerId, (this.producerOwned.get(producerId) ?? 0) + 1);
    }

    const owned = this.producerOwned.get(producerId) ?? 0;
    this.producerOwned.set(producerId, owned);
    this.producerMaxSeen.set(producerId, Math.max(this.producerMaxSeen.get(producerId) ?? 0, owned));
    this.evaluateAchievements();

    return purchased;
  }

  buyMaxProducer(producerId: IdleProducerId): number {
    return this.buyProducerBulk(producerId, this.getMaxAffordableProducerCount(producerId));
  }

  canBuyUpgrade(upgradeId: string): boolean {
    const upgrade = this.getUpgrade(upgradeId);
    return (
      !this.upgradesOwned.has(upgrade.id) &&
      this.areRequirementsMet(upgrade.requirements) &&
      this.getResource(upgrade.cost.resourceId).current >= upgrade.cost.amount
    );
  }

  buyUpgrade(upgradeId: string): boolean {
    const upgrade = this.getUpgrade(upgradeId);

    if (!this.canBuyUpgrade(upgrade.id) || !this.spendResource(upgrade.cost.resourceId, upgrade.cost.amount)) {
      return false;
    }

    this.upgradesOwned.add(upgrade.id);
    this.evaluateAchievements();

    return true;
  }

  triggerShiny(shinyId: IdleShinyId): boolean {
    const shiny = this.getShiny(shinyId);

    if (!this.areRequirementsMet(shiny.requirements)) {
      return false;
    }

    this.activeShinies.set(shiny.id, shiny.durationSeconds);
    this.shinySpawnElapsed.set(shiny.id, 0);
    return true;
  }

  clickShiny(shinyId: IdleShinyId): boolean {
    const shiny = this.getShiny(shinyId);

    if (!this.activeShinies.has(shiny.id)) {
      return false;
    }

    this.shinyClicks.set(shiny.id, (this.shinyClicks.get(shiny.id) ?? 0) + 1);
    this.activeShinies.delete(shiny.id);
    this.applyEffects(shiny.effects);
    return true;
  }

  getPrestigePreview(): IdlePrestigePreview | undefined {
    const prestige = this.content.prestige;

    if (!prestige) {
      return undefined;
    }

    const pendingPoints = Math.max(
      0,
      Math.floor(
        this.evaluateNumber(
          prestige.pointsExpression ??
          {
            kind: 'divide',
            left: { kind: 'resourceEarned', resourceId: prestige.pointsPerEarnedResource?.resourceId ?? '' },
            right: prestige.pointsPerEarnedResource?.divisor ?? 1,
          },
        ),
      ),
    );

    return {
      enabled: true,
      name: prestige.name,
      currencyName: prestige.currencyName,
      points: this.prestigePoints,
      totalResets: this.prestigeResets,
      pendingPoints,
      multiplier: this.getPrestigeMultiplier(),
      canPrestige: pendingPoints > 0 && this.areRequirementsMet(prestige.requirements),
      lockedReason: this.getLockedReason(prestige.requirements),
    };
  }

  prestigeReset(): boolean {
    const prestige = this.content.prestige;
    const preview = this.getPrestigePreview();

    if (!prestige || !preview?.canPrestige) {
      return false;
    }

    const preservedAchievements = prestige.preserveAchievements ? new Set(this.achievementsUnlocked) : new Set<string>();
    this.prestigePoints += preview.pendingPoints;
    this.prestigeResets += 1;
    this.resetRunState();
    this.achievementsUnlocked.clear();

    for (const achievementId of preservedAchievements) {
      this.achievementsUnlocked.add(achievementId);
    }

    this.evaluateAchievements();
    return true;
  }

  getResource(resourceId: IdleResourceId): IdleResourceState {
    const resource = this.resources.get(resourceId);

    if (!resource) {
      throw new Error('Unknown idle resource: ' + resourceId);
    }

    return { ...resource };
  }

  getProducerCost(producerId: IdleProducerId): number {
    const producer = this.getProducer(producerId);
    const owned = this.producerOwned.get(producerId) ?? 0;
    return this.getProducerCostAtOwned(producer, owned);
  }

  getProducerBulkCost(producerId: IdleProducerId, count: number): number {
    const producer = this.getProducer(producerId);
    const owned = this.producerOwned.get(producerId) ?? 0;
    const safeCount = Math.max(0, Math.floor(count));
    let total = 0;

    for (let index = 0; index < safeCount; index += 1) {
      total += this.getProducerCostAtOwned(producer, owned + index);
    }

    return total;
  }

  getMaxAffordableProducerCount(producerId: IdleProducerId): number {
    const producer = this.getProducer(producerId);

    if (!this.areRequirementsMet(producer.requirements)) {
      return 0;
    }

    const available = this.getResource(producer.resourceId).current;
    let spent = 0;
    let count = 0;

    while (count < 1000) {
      const nextCost = this.getProducerCostAtOwned(producer, (this.producerOwned.get(producerId) ?? 0) + count);

      if (spent + nextCost > available) {
        break;
      }

      spent += nextCost;
      count += 1;
    }

    return count;
  }

  applyEffects(effects: IdleEffect[]): void {
    for (const effect of effects) {
      if (effect.kind === 'gain') {
        this.gainResource(effect.resourceId, this.evaluateNumber(effect.amount));
      } else if (effect.kind === 'lose') {
        this.spendResource(effect.resourceId, this.evaluateNumber(effect.amount));
      } else if (effect.kind === 'buyProducer') {
        this.buyProducerBulk(effect.producerId, effect.count ?? 1);
      } else {
        this.buyUpgrade(effect.upgradeId);
      }
    }

    this.evaluateAchievements();
  }

  resolveSelector(selector: IdleSelector): string[] {
    const entries = [
      ...this.content.resources.map((entry) => ({ id: entry.id, type: 'resource' as const, tags: entry.tags ?? [], owned: true })),
      ...this.content.actions.map((entry) => ({ id: entry.id, type: 'action' as const, tags: entry.tags ?? [], owned: true })),
      ...this.content.producers.map((entry) => ({
        id: entry.id,
        type: 'producer' as const,
        tags: entry.tags ?? [],
        owned: (this.producerOwned.get(entry.id) ?? 0) > 0,
      })),
      ...this.content.upgrades.map((entry) => ({
        id: entry.id,
        type: 'upgrade' as const,
        tags: entry.tags ?? [],
        owned: this.upgradesOwned.has(entry.id),
      })),
      ...this.content.achievements.map((entry) => ({
        id: entry.id,
        type: 'achievement' as const,
        tags: entry.tags ?? [],
        owned: this.achievementsUnlocked.has(entry.id),
      })),
      ...this.content.shinies.map((entry) => ({
        id: entry.id,
        type: 'shiny' as const,
        tags: entry.tags ?? [],
        owned: this.activeShinies.has(entry.id),
      })),
    ];

    return entries
      .filter((entry) => selector.all || !selector.id || entry.id === selector.id)
      .filter((entry) => !selector.type || entry.type === selector.type)
      .filter((entry) => selector.owned === undefined || entry.owned === selector.owned)
      .filter((entry) => !selector.tags || selector.tags.every((tag) => entry.tags.includes(tag)))
      .map((entry) => entry.id);
  }

  getUiModel(): IdleUiModel {
    return {
      resources: this.content.resources.map((resource) => ({
        id: resource.id,
        name: resource.name,
        ...this.getResource(resource.id),
        perSecond: this.getPerSecond(resource.id),
      })),
      actions: this.content.actions.map((action) => ({
        id: action.id,
        name: action.name,
        gain: this.getActionGain(action),
        clicks: this.actionClicks.get(action.id) ?? 0,
      })),
      producers: this.content.producers.map((producer) => ({
        id: producer.id,
        name: producer.name,
        owned: this.producerOwned.get(producer.id) ?? 0,
        nextCost: this.getProducerCost(producer.id),
        bulk10Cost: this.getProducerBulkCost(producer.id, 10),
        maxAffordable: this.getMaxAffordableProducerCount(producer.id),
        affordable: this.canBuyProducer(producer.id),
        visible: this.areRequirementsMet(producer.requirements),
        lockedReason: this.getLockedReason(producer.requirements),
        productionPerSecond: this.getProducerProduction(producer),
      })),
      upgrades: this.content.upgrades.map((upgrade) => ({
        id: upgrade.id,
        name: upgrade.name,
        description: upgrade.description,
        owned: this.upgradesOwned.has(upgrade.id),
        affordable: this.canBuyUpgrade(upgrade.id),
        visible: this.upgradesOwned.has(upgrade.id) || this.areRequirementsMet(upgrade.requirements),
        lockedReason: this.getLockedReason(upgrade.requirements),
      })),
      achievements: this.content.achievements.map((achievement) => ({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        unlocked: this.achievementsUnlocked.has(achievement.id),
        visible: this.achievementsUnlocked.has(achievement.id) || this.areRequirementsPartlyMet(achievement.requirements),
      })),
      shinies: this.content.shinies.map((shiny) => ({
        id: shiny.id,
        name: shiny.name,
        description: shiny.description,
        active: this.activeShinies.has(shiny.id),
        visible: this.activeShinies.has(shiny.id) || this.areRequirementsMet(shiny.requirements),
        remainingSeconds: this.activeShinies.get(shiny.id) ?? 0,
        clicks: this.shinyClicks.get(shiny.id) ?? 0,
      })),
      prestige: this.getPrestigePreview(),
    };
  }

  toSaveData(now = Date.now()): IdleSaveData {
    this.savedAt = now;

    return {
      schemaVersion: 1,
      savedAt: now,
      resources: Object.fromEntries(this.resources.entries()),
      actions: Object.fromEntries(Array.from(this.actionClicks.entries()).map(([id, clicks]) => [id, { clicks }])),
      producers: Object.fromEntries(
        this.content.producers.map((producer) => [
          producer.id,
          {
            owned: this.producerOwned.get(producer.id) ?? 0,
            maxSeen: this.producerMaxSeen.get(producer.id) ?? 0,
          },
        ]),
      ),
      upgrades: Object.fromEntries(this.content.upgrades.map((upgrade) => [upgrade.id, this.upgradesOwned.has(upgrade.id)])),
      achievements: Object.fromEntries(
        this.content.achievements.map((achievement) => [achievement.id, this.achievementsUnlocked.has(achievement.id)]),
      ),
      shinies: Object.fromEntries(
        this.content.shinies.map((shiny) => [
          shiny.id,
          {
            clicks: this.shinyClicks.get(shiny.id) ?? 0,
            active: this.activeShinies.has(shiny.id),
            remainingSeconds: this.activeShinies.get(shiny.id) ?? 0,
            spawnElapsedSeconds: this.shinySpawnElapsed.get(shiny.id) ?? 0,
          },
        ]),
      ),
      prestige: {
        points: this.prestigePoints,
        totalResets: this.prestigeResets,
      },
    };
  }

  private gainResource(resourceId: IdleResourceId, amount: number): void {
    const resource = this.resources.get(resourceId);

    if (!resource) {
      throw new Error('Unknown idle resource: ' + resourceId);
    }

    resource.current += amount;
    resource.earnedTotal += Math.max(0, amount);
    resource.maxSeen = Math.max(resource.maxSeen, resource.current);
  }

  private spendResource(resourceId: IdleResourceId, amount: number): boolean {
    const resource = this.resources.get(resourceId);

    if (!resource) {
      throw new Error('Unknown idle resource: ' + resourceId);
    }

    if (resource.current < amount) {
      return false;
    }

    resource.current -= amount;
    return true;
  }

  private getPerSecond(resourceId: IdleResourceId): number {
    return this.content.producers
      .filter((producer) => producer.resourceId === resourceId)
      .reduce((total, producer) => total + (this.producerOwned.get(producer.id) ?? 0) * this.getProducerProduction(producer), 0);
  }

  private getProducerCostAtOwned(producer: IdleProducerDefinition, owned: number): number {
    return Math.ceil(producer.baseCost * producer.costScale ** owned);
  }

  private getActionGain(action: IdleActionDefinition): number {
    return action.baseGain * this.getPrestigeMultiplier() * this.content.upgrades.reduce((multiplier, upgrade) => {
      if (!this.upgradesOwned.has(upgrade.id)) {
        return multiplier;
      }

      return upgrade.effects.reduce((current, effect) => {
        return this.effectTargetsAction(effect, action.id) ? current * effect.multiplier : current;
      }, multiplier);
    }, 1);
  }

  private getProducerProduction(producer: IdleProducerDefinition): number {
    return producer.baseProductionPerSecond * this.getPrestigeMultiplier() * this.content.upgrades.reduce((multiplier, upgrade) => {
      if (!this.upgradesOwned.has(upgrade.id)) {
        return multiplier;
      }

      return upgrade.effects.reduce((current, effect) => {
        return this.effectTargetsProducer(effect, producer.id) ? current * effect.multiplier : current;
      }, multiplier);
    }, 1);
  }

  private evaluateAchievements(): void {
    for (const achievement of this.content.achievements) {
      if (!this.achievementsUnlocked.has(achievement.id) && achievement.requirements.every((requirement) => this.meetsRequirement(requirement))) {
        this.achievementsUnlocked.add(achievement.id);
      }
    }
  }

  private meetsRequirement(requirement: IdleRequirement): boolean {
    if (requirement.kind === 'expression') {
      return this.evaluateCondition(requirement.condition);
    }

    if (requirement.kind === 'resourceCurrentAtLeast') {
      return this.getResource(requirement.resourceId).current >= requirement.amount;
    }

    if (requirement.kind === 'resourceEarnedAtLeast') {
      return this.getResource(requirement.resourceId).earnedTotal >= requirement.amount;
    }

    if (requirement.kind === 'producerOwnedAtLeast') {
      return (this.producerOwned.get(requirement.producerId) ?? 0) >= requirement.amount;
    }

    if (requirement.kind === 'actionClicksAtLeast') {
      return (this.actionClicks.get(requirement.actionId) ?? 0) >= requirement.amount;
    }

    return this.upgradesOwned.has(requirement.upgradeId);
  }

  private evaluateNumber(expression: IdleNumberExpression): number {
    if (typeof expression === 'number') {
      return expression;
    }

    if (expression.kind === 'resourceCurrent') return this.getResource(expression.resourceId).current;
    if (expression.kind === 'resourceEarned') return this.getResource(expression.resourceId).earnedTotal;
    if (expression.kind === 'resourceMaxSeen') return this.getResource(expression.resourceId).maxSeen;
    if (expression.kind === 'producerOwned') return this.producerOwned.get(expression.producerId) ?? 0;
    if (expression.kind === 'actionClicks') return this.actionClicks.get(expression.actionId) ?? 0;
    if (expression.kind === 'perSecond') return this.getPerSecond(expression.resourceId);
    if (expression.kind === 'prestigePoints') return this.prestigePoints;
    if (expression.kind === 'add') return expression.values.reduce<number>((total, value) => total + this.evaluateNumber(value), 0);
    if (expression.kind === 'multiply') return expression.values.reduce<number>((total, value) => total * this.evaluateNumber(value), 1);
    if (expression.kind === 'subtract') return this.evaluateNumber(expression.left) - this.evaluateNumber(expression.right);
    if (expression.kind === 'divide') {
      const divisor = this.evaluateNumber(expression.right);
      return divisor === 0 ? 0 : this.evaluateNumber(expression.left) / divisor;
    }
    if (expression.kind === 'floor') return Math.floor(this.evaluateNumber(expression.value));
    if (expression.kind === 'ceil') return Math.ceil(this.evaluateNumber(expression.value));
    if (expression.kind === 'min') return Math.min(...expression.values.map((value) => this.evaluateNumber(value)));

    return Math.max(...expression.values.map((value) => this.evaluateNumber(value)));
  }

  private evaluateCondition(condition: IdleConditionExpression): boolean {
    if (condition.kind === 'gte') return this.evaluateNumber(condition.left) >= this.evaluateNumber(condition.right);
    if (condition.kind === 'lte') return this.evaluateNumber(condition.left) <= this.evaluateNumber(condition.right);
    if (condition.kind === 'eq') return this.evaluateNumber(condition.left) === this.evaluateNumber(condition.right);
    if (condition.kind === 'and') return condition.conditions.every((entry) => this.evaluateCondition(entry));
    if (condition.kind === 'or') return condition.conditions.some((entry) => this.evaluateCondition(entry));

    return !this.evaluateCondition(condition.condition);
  }

  private areRequirementsMet(requirements: IdleRequirement[] | undefined): boolean {
    return !requirements || requirements.every((requirement) => this.meetsRequirement(requirement));
  }

  private areRequirementsPartlyMet(requirements: IdleRequirement[] | undefined): boolean {
    return !requirements || requirements.length === 0 || requirements.some((requirement) => this.meetsRequirement(requirement));
  }

  private getLockedReason(requirements: IdleRequirement[] | undefined): string | undefined {
    const missing = requirements?.find((requirement) => !this.meetsRequirement(requirement));

    if (!missing) {
      return undefined;
    }

    if (missing.kind === 'resourceCurrentAtLeast') {
      return 'Needs ' + missing.amount + ' current ' + missing.resourceId + '.';
    }

    if (missing.kind === 'expression') {
      return 'Needs formula condition.';
    }

    if (missing.kind === 'resourceEarnedAtLeast') {
      return 'Needs ' + missing.amount + ' earned ' + missing.resourceId + '.';
    }

    if (missing.kind === 'producerOwnedAtLeast') {
      return 'Needs ' + missing.amount + ' ' + missing.producerId + ' owned.';
    }

    if (missing.kind === 'actionClicksAtLeast') {
      return 'Needs ' + missing.amount + ' ' + missing.actionId + ' clicks.';
    }

    return 'Needs upgrade ' + missing.upgradeId + '.';
  }

  private effectTargetsAction(effect: IdleUpgradeDefinition['effects'][number], actionId: IdleActionId): boolean {
    if (effect.kind !== 'multiplyActionGain') {
      return false;
    }

    return effect.actionId === actionId || Boolean(effect.selector && this.resolveSelector(effect.selector).includes(actionId));
  }

  private effectTargetsProducer(effect: IdleUpgradeDefinition['effects'][number], producerId: IdleProducerId): boolean {
    if (effect.kind !== 'multiplyProducerOutput') {
      return false;
    }

    return effect.producerId === producerId || Boolean(effect.selector && this.resolveSelector(effect.selector).includes(producerId));
  }

  private getPrestigeMultiplier(): number {
    const prestige = this.content.prestige;
    return prestige ? 1 + this.prestigePoints * prestige.productionMultiplierPerPoint : 1;
  }

  private resetRunState(): void {
    this.resources.clear();
    this.actionClicks.clear();
    this.producerOwned.clear();
    this.producerMaxSeen.clear();
    this.upgradesOwned.clear();
    this.activeShinies.clear();
    this.shinySpawnElapsed.clear();

    for (const resource of this.content.resources) {
      this.resources.set(resource.id, {
        current: resource.startAmount ?? 0,
        earnedTotal: resource.startAmount ?? 0,
        maxSeen: resource.startAmount ?? 0,
      });
    }

    for (const action of this.content.actions) {
      this.actionClicks.set(action.id, 0);
    }

    for (const producer of this.content.producers) {
      this.producerOwned.set(producer.id, 0);
      this.producerMaxSeen.set(producer.id, 0);
    }

    for (const shiny of this.content.shinies) {
      this.shinySpawnElapsed.set(shiny.id, 0);
    }
  }

  private tickShinies(seconds: number): void {
    for (const shiny of this.content.shinies) {
      if (!this.areRequirementsMet(shiny.requirements)) {
        continue;
      }

      const activeRemaining = this.activeShinies.get(shiny.id);

      if (activeRemaining !== undefined) {
        const nextRemaining = activeRemaining - seconds;

        if (nextRemaining > 0) {
          this.activeShinies.set(shiny.id, nextRemaining);
        } else {
          this.activeShinies.delete(shiny.id);
        }

        continue;
      }

      const elapsed = (this.shinySpawnElapsed.get(shiny.id) ?? 0) + seconds;

      if (elapsed >= shiny.spawnEverySeconds) {
        this.triggerShiny(shiny.id);
      } else {
        this.shinySpawnElapsed.set(shiny.id, elapsed);
      }
    }
  }

  private getAction(actionId: IdleActionId): IdleActionDefinition {
    const action = this.content.actions.find((entry) => entry.id === actionId);

    if (!action) {
      throw new Error('Unknown idle action: ' + actionId);
    }

    return action;
  }

  private getProducer(producerId: IdleProducerId): IdleProducerDefinition {
    const producer = this.content.producers.find((entry) => entry.id === producerId);

    if (!producer) {
      throw new Error('Unknown idle producer: ' + producerId);
    }

    return producer;
  }

  private getUpgrade(upgradeId: string): IdleUpgradeDefinition {
    const upgrade = this.content.upgrades.find((entry) => entry.id === upgradeId);

    if (!upgrade) {
      throw new Error('Unknown idle upgrade: ' + upgradeId);
    }

    return upgrade;
  }

  private getShiny(shinyId: IdleShinyId) {
    const shiny = this.content.shinies.find((entry) => entry.id === shinyId);

    if (!shiny) {
      throw new Error('Unknown idle shiny: ' + shinyId);
    }

    return shiny;
  }

  private validateContent(): void {
    const ids = new Set<string>();
    const addId = (id: string): void => {
      if (ids.has(id)) {
        throw new Error('Duplicate idle content id: ' + id);
      }

      ids.add(id);
    };

    this.content.resources.forEach((entry) => addId(entry.id));
    this.content.actions.forEach((entry) => addId(entry.id));
    this.content.producers.forEach((entry) => addId(entry.id));
    this.content.upgrades.forEach((entry) => addId(entry.id));
    this.content.achievements.forEach((entry) => addId(entry.id));
    this.content.shinies.forEach((entry) => addId(entry.id));
  }
}
