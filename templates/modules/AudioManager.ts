import Phaser from 'phaser';

export class AudioManager {
  private unlocked = false;
  private music?: Phaser.Sound.BaseSound;
  private musicVolume = 0.6;
  private sfxVolume = 0.8;
  private muted = false;

  constructor(private readonly scene: Phaser.Scene) {}

  unlockOnFirstGesture(): void {
    if (this.unlocked) {
      return;
    }

    this.scene.input.once('pointerdown', () => {
      this.unlocked = true;
    });
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.scene.sound.mute = muted;
  }

  playMusic(key: string): void {
    if (this.music?.isPlaying) {
      this.music.stop();
    }

    this.music = this.scene.sound.add(key, { loop: true, volume: this.musicVolume });
    this.music.play();
  }

  playSfx(key: string): void {
    if (this.muted) {
      return;
    }

    this.scene.sound.play(key, { volume: this.sfxVolume });
  }
}
