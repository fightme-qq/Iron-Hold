export type IdleResourceId = string;
export type IdleActionId = string;
export type IdleProducerId = string;
export type IdleUpgradeId = string;
export type IdleAchievementId = string;
export type IdleShinyId = string;

export type IdleCost = {
  resourceId: IdleResourceId;
  amount: number;
};

export type IdleEntityType = 'resource' | 'action' | 'producer' | 'upgrade' | 'achievement' | 'shiny';

export type IdleSelector = {
  id?: string;
  type?: IdleEntityType;
  tags?: string[];
  owned?: boolean;
  all?: boolean;
};

export type IdleNumberExpression =
  | number
  | { kind: 'resourceCurrent'; resourceId: IdleResourceId }
  | { kind: 'resourceEarned'; resourceId: IdleResourceId }
  | { kind: 'resourceMaxSeen'; resourceId: IdleResourceId }
  | { kind: 'producerOwned'; producerId: IdleProducerId }
  | { kind: 'actionClicks'; actionId: IdleActionId }
  | { kind: 'perSecond'; resourceId: IdleResourceId }
  | { kind: 'prestigePoints' }
  | { kind: 'add'; values: IdleNumberExpression[] }
  | { kind: 'multiply'; values: IdleNumberExpression[] }
  | { kind: 'subtract'; left: IdleNumberExpression; right: IdleNumberExpression }
  | { kind: 'divide'; left: IdleNumberExpression; right: IdleNumberExpression }
  | { kind: 'floor'; value: IdleNumberExpression }
  | { kind: 'ceil'; value: IdleNumberExpression }
  | { kind: 'min'; values: IdleNumberExpression[] }
  | { kind: 'max'; values: IdleNumberExpression[] };

export type IdleConditionExpression =
  | { kind: 'gte'; left: IdleNumberExpression; right: IdleNumberExpression }
  | { kind: 'lte'; left: IdleNumberExpression; right: IdleNumberExpression }
  | { kind: 'eq'; left: IdleNumberExpression; right: IdleNumberExpression }
  | { kind: 'and'; conditions: IdleConditionExpression[] }
  | { kind: 'or'; conditions: IdleConditionExpression[] }
  | { kind: 'not'; condition: IdleConditionExpression };

export type IdleEffect =
  | { kind: 'gain'; resourceId: IdleResourceId; amount: IdleNumberExpression }
  | { kind: 'lose'; resourceId: IdleResourceId; amount: IdleNumberExpression }
  | { kind: 'buyProducer'; producerId: IdleProducerId; count?: number }
  | { kind: 'buyUpgrade'; upgradeId: IdleUpgradeId };

export type IdleResourceDefinition = {
  id: IdleResourceId;
  name: string;
  tags?: string[];
  startAmount?: number;
  allowNegative?: boolean;
};

export type IdleActionDefinition = {
  id: IdleActionId;
  name: string;
  tags?: string[];
  resourceId: IdleResourceId;
  baseGain: number;
};

export type IdleRequirement =
  | { kind: 'resourceCurrentAtLeast'; resourceId: IdleResourceId; amount: number }
  | { kind: 'resourceEarnedAtLeast'; resourceId: IdleResourceId; amount: number }
  | { kind: 'producerOwnedAtLeast'; producerId: IdleProducerId; amount: number }
  | { kind: 'actionClicksAtLeast'; actionId: IdleActionId; amount: number }
  | { kind: 'upgradeOwned'; upgradeId: IdleUpgradeId }
  | { kind: 'expression'; condition: IdleConditionExpression };

export type IdleProducerDefinition = {
  id: IdleProducerId;
  name: string;
  tags?: string[];
  requirements?: IdleRequirement[];
  resourceId: IdleResourceId;
  baseCost: number;
  costScale: number;
  baseProductionPerSecond: number;
};

export type IdleUpgradeEffect =
  | { kind: 'multiplyActionGain'; actionId?: IdleActionId; selector?: IdleSelector; multiplier: number }
  | { kind: 'multiplyProducerOutput'; producerId?: IdleProducerId; selector?: IdleSelector; multiplier: number };

export type IdleUpgradeDefinition = {
  id: IdleUpgradeId;
  name: string;
  tags?: string[];
  requirements?: IdleRequirement[];
  cost: IdleCost;
  description: string;
  effects: IdleUpgradeEffect[];
};

export type IdleAchievementDefinition = {
  id: IdleAchievementId;
  name: string;
  tags?: string[];
  description: string;
  requirements: IdleRequirement[];
};

export type IdleShinyDefinition = {
  id: IdleShinyId;
  name: string;
  tags?: string[];
  description: string;
  requirements?: IdleRequirement[];
  spawnEverySeconds: number;
  durationSeconds: number;
  effects: IdleEffect[];
};

export type IdlePrestigeDefinition = {
  id: string;
  name: string;
  currencyName: string;
  requirements: IdleRequirement[];
  pointsExpression?: IdleNumberExpression;
  pointsPerEarnedResource?: {
    resourceId: IdleResourceId;
    divisor: number;
  };
  productionMultiplierPerPoint: number;
  preserveAchievements: boolean;
};

export type IdleContent = {
  resources: IdleResourceDefinition[];
  actions: IdleActionDefinition[];
  producers: IdleProducerDefinition[];
  upgrades: IdleUpgradeDefinition[];
  achievements: IdleAchievementDefinition[];
  shinies: IdleShinyDefinition[];
  prestige?: IdlePrestigeDefinition;
  offlineCapSeconds: number;
};

export type IdleResourceState = {
  current: number;
  earnedTotal: number;
  maxSeen: number;
};

export type IdleSaveData = {
  schemaVersion: number;
  savedAt: number;
  resources: Record<IdleResourceId, IdleResourceState>;
  actions: Record<IdleActionId, { clicks: number }>;
  producers: Record<IdleProducerId, { owned: number; maxSeen: number }>;
  upgrades: Record<IdleUpgradeId, boolean>;
  achievements: Record<IdleAchievementId, boolean>;
  shinies: Record<IdleShinyId, { clicks: number; active: boolean; remainingSeconds: number; spawnElapsedSeconds: number }>;
  prestige: {
    points: number;
    totalResets: number;
  };
};

export type IdleOfflineReport = {
  elapsedSeconds: number;
  simulatedSeconds: number;
  capReached: boolean;
  resourceGains: Record<IdleResourceId, number>;
  unlockedAchievementIds: IdleAchievementId[];
};

export type IdlePrestigePreview = {
  enabled: boolean;
  name: string;
  currencyName: string;
  points: number;
  totalResets: number;
  pendingPoints: number;
  multiplier: number;
  canPrestige: boolean;
  lockedReason: string | undefined;
};

export type IdleUiModel = {
  resources: Array<IdleResourceState & { id: IdleResourceId; name: string; perSecond: number }>;
  actions: Array<{ id: IdleActionId; name: string; gain: number; clicks: number }>;
  producers: Array<{
    id: IdleProducerId;
    name: string;
    owned: number;
    nextCost: number;
    bulk10Cost: number;
    maxAffordable: number;
    affordable: boolean;
    visible: boolean;
    lockedReason: string | undefined;
    productionPerSecond: number;
  }>;
  upgrades: Array<{
    id: IdleUpgradeId;
    name: string;
    description: string;
    owned: boolean;
    affordable: boolean;
    visible: boolean;
    lockedReason: string | undefined;
  }>;
  achievements: Array<{ id: IdleAchievementId; name: string; description: string; unlocked: boolean; visible: boolean }>;
  shinies: Array<{
    id: IdleShinyId;
    name: string;
    description: string;
    active: boolean;
    visible: boolean;
    remainingSeconds: number;
    clicks: number;
  }>;
  prestige: IdlePrestigePreview | undefined;
};
