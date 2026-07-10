class AudioController {
  private audio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private listeners: Set<(muted: boolean) => void> = new Set();

  init() {
    if (typeof window === "undefined" || this.audio) return;
    this.audio = new Audio("/Audio/CodezillaAudio.mpeg");
    this.audio.preload = "auto";
    this.audio.loop = true; // Automatically play again and again on loop
    this.audio.volume = 0.5; // Comfortable listening volume
    this.audio.load();

    // Global unlocker for iOS / Android mobile browsers where play() requires touch gesture
    const unlock = () => {
      if (this.audio && this.audio.paused && !this.isMuted) {
        this.audio.play().catch(() => {});
      }
      if (typeof window !== "undefined") {
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("click", unlock);
        window.removeEventListener("pointerdown", unlock);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("touchstart", unlock, { passive: true });
      window.addEventListener("click", unlock, { passive: true });
      window.addEventListener("pointerdown", unlock, { passive: true });
    }
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

    if (this.audio.paused || this.isMuted) {
      this.audio.muted = false;
      this.isMuted = false;
      this.audio.play().catch(() => {});
    } else {
      this.isMuted = true;
      this.audio.muted = true;
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
