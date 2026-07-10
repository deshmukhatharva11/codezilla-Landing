class AudioController {
  private audio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private listeners: Set<(muted: boolean) => void> = new Set();

  init() {
    if (typeof window === "undefined" || this.audio) return;
    this.audio = new Audio("/audio/CodezillaAudio.mpeg");
    this.audio.loop = true; // Automatically play again and again on loop
    this.audio.volume = 0.5; // Comfortable listening volume
  }

  play() {
    this.init();
    if (this.audio) {
      this.audio.muted = false;
      this.isMuted = false;
      this.audio.play().catch((err) => {
        console.warn("Audio autoplay prevented by browser:", err);
      });
      this.notifyListeners();
    }
  }

  toggleMute() {
    this.init();
    if (!this.audio) return;

    if (this.audio.paused) {
      this.audio.muted = false;
      this.isMuted = false;
      this.audio.play().catch(() => {});
    } else {
      this.isMuted = !this.isMuted;
      this.audio.muted = this.isMuted;
    }
    this.notifyListeners();
  }

  getMuted() {
    return this.isMuted;
  }

  subscribe(callback: (muted: boolean) => void) {
    this.listeners.add(callback);
    callback(this.isMuted);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.isMuted));
  }
}

export const audioController = new AudioController();
