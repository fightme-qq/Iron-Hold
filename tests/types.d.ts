import type Phaser from 'phaser';

declare global {
  interface Window {
    __phaserGame?: Phaser.Game;
  }
}

export {};
