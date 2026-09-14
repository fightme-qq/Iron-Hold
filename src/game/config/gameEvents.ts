export const GameEvents = {
  ScoreChanged: 'score-changed',
  StatusChanged: 'status-changed',
  BestScoreChanged: 'best-score-changed',
  RunStateChanged: 'run-state-changed',
  GameplayStarted: 'gameplay-started',
  GameplayStopped: 'gameplay-stopped',
  DefenseHudChanged: 'defense-hud-changed',
  UpgradeRequested: 'upgrade-requested',
  StartWaveRequested: 'start-wave-requested',
  RestartRequested: 'restart-requested',
} as const;

export type GameEvent = (typeof GameEvents)[keyof typeof GameEvents];

export type GameEventPayloads = {
  [GameEvents.ScoreChanged]: { score: number; bestScore: number };
  [GameEvents.StatusChanged]: { status: string };
  [GameEvents.BestScoreChanged]: { bestScore: number };
  [GameEvents.RunStateChanged]: { phase: 'ready' | 'playing' | 'won' | 'lost' };
  [GameEvents.GameplayStarted]: { scene: string };
  [GameEvents.GameplayStopped]: { scene: string };
  [GameEvents.DefenseHudChanged]: {
    phase: 'intermission' | 'wave' | 'stageBreak' | 'won' | 'lost';
    activeTab: 'battle' | 'tank' | 'base' | 'map';
    wave: number;
    maxWaves: number;
    baseHp: number;
    maxBaseHp: number;
    parts: number;
    status: string;
    stage: {
      current: number;
      total: number;
      title: string;
    };
    minimap: {
      worldWidth: number;
      worldHeight: number;
      player: { x: number; y: number };
      base: { x: number; y: number };
      enemies: Array<{ x: number; y: number }>;
      camera: { x: number; y: number; width: number; height: number };
    };
    upgrades: Array<{
      id: string;
      target: 'tank' | 'base';
      title: string;
      description: string;
      icon: string;
      level: number;
      maxLevel: number;
      cost: number;
      affordable: boolean;
      maxed: boolean;
    }>;
    nextWave: {
      scouts: number;
      bruisers: number;
      stages: Array<{
        title: string;
        scouts: number;
        bruisers: number;
      }>;
    } | undefined;
  };
  [GameEvents.UpgradeRequested]: { id: string };
  [GameEvents.StartWaveRequested]: {};
  [GameEvents.RestartRequested]: {};
};
