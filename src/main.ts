import Phaser from 'phaser';
import './style.css';
import { gameConfig } from './game/config/gameConfig';


declare global {
  interface Window {
    __phaserGame?: Phaser.Game;
  }
}

const game = new Phaser.Game(gameConfig);
window.__phaserGame = game;
